# World Monitor — Codebase Audit

**Date:** June 24, 2026  
**Scope:** `world_monitor/client/src` (~6,300 LOC across 60 source files)  
**Goal:** Identify redundancies, dependency issues, re-render risks, and structural improvements toward an industry-standard, maintainable codebase.

---

## Executive Summary

World Monitor is a well-organized React 18 + Vite SPA with clear feature-based folders, path aliases, lazy-loaded routes, and a solid foundation for RSS/data panels. **No circular dependencies were detected** (verified with `madge`).

The main risks are **performance and duplication**, not architecture:

1. **Massive duplicate network fetching** — `useDynamicRegions` re-fetches every RSS feed that individual panels also fetch.
2. **`GlobalMap.jsx` is a 1,184-line god component** that fully re-renders the D3 map on every rotation tick (~20 fps).
3. **Inconsistent abstractions** — `useFeedData` exists but `NewsPanel` and `CryptoPanel` re-implement the same pattern; feed services are split across three styles.
4. **Context providers lack memoization**, causing avoidable subtree re-renders.
5. **Project hygiene gaps** — duplicate `dist/` and `node_modules/`, inconsistent localStorage keys, no tests, no TypeScript.

Overall grade: **B−** — good structure and conventions, but needs consolidation and performance hardening before it scales.

---

## What's Working Well

| Area | Notes |
|------|-------|
| **Folder layout** | Feature-based `src/features/*` with shared `config/`, `context/`, `hooks/`, `utils/` is industry-standard for React apps. |
| **Path aliases** | `@features`, `@hooks`, `@config`, etc. in `vite.config.js` and `jsconfig.json` keep imports clean. |
| **Code splitting** | `Dashboard` and `Map` are lazy-loaded in `App.jsx` — good bundle separation (Map chunk: 122.57 KB raw / 39.5 KB gzipped). |
| **Feed abstraction (partial)** | `BaseFeedService`, `createFeedFetcher`, and `useFeedData` show intentional DRY work. |
| **i18n** | `I18nContext` correctly memoizes its value with `useMemo`. |
| **Error boundaries** | Panels wrapped in `ErrorBoundary` in `Dashboard.jsx`. |
| **Centralized config** | `api.js`, `panels.js`, `feedConfig.js`, `regions.js` keep magic strings out of components. |
| **Linting** | ESLint passes with only 2 warnings (both in `GlobalMap.jsx`). |

---

## Circular Dependencies

**Result: None found.**

```
madge --circular --extensions js,jsx src/
✔ No circular dependency found!
```

Import graph is acyclic. The main coupling risk is **logical** (not circular): `hooks/useDynamicRegions` imports from `@features/news/feedConfig`, which inverts the typical "features depend on hooks, not vice versa" layering. This does not create a cycle today but makes the dependency direction harder to reason about.

---

## Critical Issues

### 1. Duplicate RSS fetching across the app

`useDynamicRegions` fetches **all** feeds in `NEWS_FEEDS` (31 URLs across politics, tech, finance, gov, intel):

```89:102:client/src/hooks/useDynamicRegions.js
      const allFeeds = Object.values(NEWS_FEEDS).flat()
      const newsPromises = allFeeds.map(async (feed) => {
        try {
          const rssText = await fetchWithProxy(feed.url)
          const parsed = parseRSS(rssText)
          return parsed || []
        } catch (error) {
          // ...
        }
      })
```

Meanwhile, visible dashboard panels independently fetch overlapping feeds:

| Panel | Feeds fetched | Overlap with `useDynamicRegions` |
|-------|---------------|----------------------------------|
| Politics `NewsPanel` | 4 | ✅ All 4 |
| Tech `NewsPanel` | 6 | ✅ All 6 |
| Finance `NewsPanel` | 5 | ✅ All 5 |
| `WarWatchPanel` | 5 | ✅ 4 of 5 overlap `intel` feeds |
| `VCPanel` | 6 | Partial overlap with `startups` |
| `StartupsPanel` | 4 | — |
| `CryptoPanel` | 3 | — |
| `LayoffsPanel` | 1 | — |

On a fully loaded dashboard, **40+ RSS requests** fire for ~20 unique URLs. The map route mounts another `useDynamicRegions` instance, duplicating the 31-feed fetch again.

**Recommendation:** Introduce a shared `FeedCacheProvider` or module-level request deduplication layer. Panels and `useDynamicRegions` should read from the same cache keyed by feed URL. `fetchWithProxy` already caches responses for 5 minutes, but each caller still pays parsing/aggregation cost and triggers redundant state updates.

---

### 2. `GlobalMap.jsx` — full D3 rebuild on every frame

At **1,184 lines**, `GlobalMap.jsx` combines data loading, projection math, layer rendering, drag/zoom, auto-rotation, modals, and ticker integration.

The auto-rotation effect updates `rotation` state every **50 ms**:

```148:155:client/src/features/map/GlobalMap.jsx
    const rotationSpeed = 0.15 // degrees per frame
    const interval = setInterval(() => {
      setRotation(prev => {
        const newRotation = [prev[0] + rotationSpeed, prev[1]]
        rotationRef.current = newRotation
        return newRotation
      })
    }, 50)
```

`rotation` is in the `renderMap` effect dependency array, which calls `d3.select(svgRef.current).selectAll('*').remove()` and rebuilds the entire SVG (~20 full map re-renders per second during auto-rotate).

**Recommendation:**
- Split into `useMapProjection`, `useMapLayers`, `MapCanvas`, `MapControls` submodules.
- During auto-rotation, update D3 transforms directly via `rotationRef` without React state — only sync state on interaction end.
- Add `projectionMode` to the render effect deps (currently missing; flat/3D toggle can desync).
- Consider `requestAnimationFrame` instead of `setInterval(50)`.

---

### 3. `TickerStrip` — sequential fetch of 42 symbols

`TickerStrip` iterates `ALL_ITEMS` (42 symbols: 11 market + 8 commodity + 10 crypto + 13 geo) **sequentially** in a `for` loop, issuing one Yahoo API request per symbol. On mount this blocks for the sum of all latencies, and the component is mounted on **both** Dashboard and Map (geo mode fetches the same data again on route change).

```78:85:client/src/features/markets/TickerStrip.jsx
            for (const item of ALL_ITEMS) {
                try {
                    const response = await fetch(
                        `/api/yahoo/v8/finance/chart/${item.symbol}?interval=1d&range=1d`
                    )
```

**Recommendation:** Batch with `Promise.allSettled`, deduplicate symbols (e.g. `CL=F` appears in both `COMMODITY_ITEMS` and `GEO_ITEMS`), extract a `useTickerData` hook with shared cache, and lift data fetching above route level.

---

## High Priority Issues

### 4. Inconsistent feed-fetching patterns

Three coexisting approaches:

| Pattern | Used by |
|---------|---------|
| `useFeedData` + `createFeedFetcher` | VC, WarWatch, Crypto (news), Startups, Layoffs |
| Custom `useEffect` + `RefreshContext` | `NewsPanel`, `CryptoPanel` (chain data) |
| Inline fetch in hook | `useDynamicRegions` |
| Standalone class (`MapFeedService`) | `GlobalMap` |

`NewsPanel` duplicates `useFeedData` logic almost line-for-line:

```14:46:client/src/features/news/NewsPanel.jsx
  useEffect(() => {
    let cancelled = false
    const fetchNews = async () => {
      try {
        setLoading(true)
        const items = await BaseFeedService.fetchFeeds(feeds, { maxItems: 50 })
        // ...
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [feeds, refreshKey])
```

**Recommendation:** Migrate `NewsPanel` (and the parallel chain-data `useEffect` in `CryptoPanel`, which reimplements the same pattern) to `useFeedData`. Extend `useFeedData` to support error state (currently absent — `NewsPanel` adds its own `error` state to work around this). Delete `MapFeedService` fetch boilerplate in favor of `BaseFeedService`.

---

### 5. Context providers causing avoidable re-renders

| Context | Issue |
|---------|-------|
| `RefreshContext` | Provider value `{ refreshKey, triggerRefresh }` is a new object every render. When `refreshKey` increments, **all** consumers re-render and re-fetch simultaneously. |
| `ThemeContext` | Value object not memoized; `themes: THEMES` re-attached on every render. |
| `I18nContext` | ✅ Properly memoized — good reference. |

**Recommendation:**
- Memoize provider values with `useMemo`.
- Split `RefreshContext` into `RefreshKeyContext` + `RefreshActionsContext`, or use a ref-based event emitter so only fetch effects respond to refresh without re-rendering UI shells.
- Wrap heavy panel children in `React.memo`.

---

### 6. `BaseFeedService.fetchFeeds` fetches sequentially

```20:34:client/src/features/news/baseFeedService.js
    for (const feed of feeds) {
      try {
        const xmlText = await fetchWithProxy(feed.url)
        const items = parseRSS(xmlText)
        // ...
      } catch (e) { /* ... */ }
    }
```

`MapFeedService` correctly uses `Promise.allSettled`. The base service should do the same for parity and speed.

---

### 7. Dead code and unused exports

| Item | Location | Notes |
|------|----------|-------|
| `RECENT_FUNDS` array | `VCPanel.jsx` | Defined, never rendered |
| `togglePanel` / `isPanelEnabled` | `usePanelSettings.js` | Exported but never consumed; no settings UI for panel toggles |
| `filterByKeywords` | `baseFeedService.js` | Defined, never called |
| `formatPercent` | `utils/helpers.js` | Exported, never imported |
| Feature `index.js` barrels | `features/*/index.js` | Exist but unused — `Dashboard` imports components directly |
| `hooks/index.js` barrel | `hooks/index.js` | Exports `useDynamicRegions`, `useFeedData`, `useLocalStorage`, `usePanelSettings` — no file imports from the bare `@hooks` alias |
| `config/index.js` barrel | `config/index.js` | Exports `API`, `PANELS`, `CATEGORIES`, `COMMAND_MODES`, `THEMES`, regions re-exports — no file imports from the bare `@config` alias |

---

### 8. Inconsistent import paths

`getTimeAgo` is imported two different ways:

- `from '@utils'` — Startups, VC, Layoffs
- `from '@utils/dateHelpers'` — News, Crypto, WarWatch

(`chainStats.js` imports from `@utils` but only for `formatNumber` / `githubUtils` — it does not import `getTimeAgo`.)

Similarly, some files use `.js` suffix in imports, others do not. Not broken (Vite resolves both), but inconsistent for maintainability.

**Recommendation:** Pick one style per alias and enforce via ESLint `import/no-unresolved` + `eslint-plugin-import` or a simple grep CI check.

---

## Medium Priority Issues

### 9. localStorage key naming inconsistency

| Key | Used for |
|-----|----------|
| `situationMonitorPanels` | Panel visibility |
| `situationMonitorPanelOrder` | Panel drag order |
| `world_monitor_theme` | Theme |
| `world_monitor_language` | Language |

The `situationMonitor*` prefix appears to be legacy naming from a prior project name. `usePanelSettings` and `Dashboard` also use different storage patterns — one via `useLocalStorage` hook, one via raw `localStorage` calls. The same legacy name also surfaces in `client/index.html:10` (`<title>Situation Monitor</title>`), so the rename was clearly incomplete.

**Recommendation:** Namespace all keys under `world_monitor_*`, route all access through `useLocalStorage`, and update the document title in `client/index.html`.

---

### 10. Static mock data presented as live metrics

Several panels display hardcoded stats as if they were real-time:

- `VCPanel` — `VC_STATS`, unused `RECENT_FUNDS`
- `StartupsPanel` — `RECENT_FUNDING` drives the header totals
- `LayoffsPanel` — `LAYOFF_STATS`
- `CryptoPanel` — `MOCK_CHAIN_DATA` fallback for NFT volume
- `TickerStrip` — random mock prices on API failure

This is fine for demos but should be labeled or sourced from APIs to avoid misleading users.

---

### 11. `config/regions.js` is 853 lines

All hotspot, conflict zone, cable, and military base data lives in one file. It is imported by both `GlobalMap` and `useDynamicRegions`, bloating the Dashboard chunk indirectly via the hook's feed coupling.

**Recommendation:** Split into `regions/hotspots.js`, `regions/conflictZones.js`, `regions/infrastructure.js`, with a thin `regions/index.js` re-export.

---

### 12. `feedConfig.js` feed overlap

Shared feeds appear in multiple config keys:

- **VentureBeat, Crunchbase, Sifted** — in both `startups` and `vc`
- **Defense One, War on Rocks, Breaking Defense, The War Zone** — in both `intel` and `warWatch`

**Recommendation:** Define canonical feed objects once and compose arrays by reference:

```js
const DEFENSE_FEEDS = [/* ... */]
FEED_CONFIG.news.intel = [...OTHER_INTEL, ...DEFENSE_FEEDS]
FEED_CONFIG.warWatch = DEFENSE_FEEDS
```

---

### 13. `DeveloperActivity.jsx` naming mismatch

The file is named `DeveloperActivity.jsx` but the default export is `ChainActivity`. `Dashboard` imports it as `DeveloperActivity`. Works, but confusing for navigation and search.

---

### 14. List keys use array index

All feed panels use `key={idx}` instead of stable IDs (e.g. `item.link`). Reordering or polling can cause unnecessary DOM reconciliation and lost scroll position.

---

### 15. `Navbar` clock triggers re-renders every second

```15:18:client/src/features/navigation/Navbar.jsx
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])
```

The entire `Navbar` (including nav links and buttons) re-renders every second. Low impact today, but easy to fix by extracting a `Clock` subcomponent.

---

## Low Priority / Hygiene

### 16. Duplicate build artifacts and dependencies

```
world_monitor/
├── dist/              ← root-level build output (orphan?)
├── node_modules/      ← no root package.json exists
└── client/
    ├── dist/          ← actual Vite output
    └── node_modules/
```

The root `node_modules/` has no corresponding `package.json`. Both `dist/` folders should be gitignored (they are in `.gitignore` but appear present locally).

---

### 17. No automated tests

Zero `*.test.js` or `*.spec.js` files. For a data-heavy dashboard, high-value test targets:

- `parseRSS` / `getTimeAgo` / `formatAmount` (pure functions)
- `createFeedFetcher` factory
- `calculateEnhancedSeverity` in `useDynamicRegions`
- `ErrorBoundary` fallback rendering

---

### 18. No TypeScript

For a project with complex region/hotspot data shapes and feed item structures, TypeScript (even partial `checkJs`) would catch a class of bugs at build time. Not required, but industry-standard for new React apps of this complexity.

---

### 19. `StartupsFeedService` as a class extending `BaseFeedService`

Only adds `extractFunding` and `fetchStartupNews`. A plain function (like `fetchLayoffsNews`) would be simpler and consistent with the `createFeedFetcher` direction.

---

### 20. `DYNAMIC_HOTSPOTS_PLAN.md` in repo root

Planning doc is fine during development, but should be moved to `docs/` or closed as an issue/ADR once implemented to keep root clean.

---

## File & Folder Structure Assessment

### Current layout

```
world_monitor/
├── client/                    ← actual application (correct)
│   ├── src/
│   │   ├── app/               ✅ Entry, global styles
│   │   ├── config/            ✅ Static configuration
│   │   ├── context/           ✅ React providers
│   │   ├── features/          ✅ Domain modules
│   │   │   ├── crypto/
│   │   │   ├── dashboard/
│   │   │   ├── developer-activity/
│   │   │   ├── layoffs/
│   │   │   ├── map/           ⚠️  GlobalMap.jsx too large
│   │   │   ├── markets/
│   │   │   ├── navigation/
│   │   │   ├── news/          ✅ Shared feed infrastructure
│   │   │   ├── startups/
│   │   │   ├── vc-activity/
│   │   │   └── war-watch/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   └── utils/
│   ├── public/
│   └── dist/
├── dist/                      ❌ Remove (orphan)
├── node_modules/              ❌ Remove (no root package.json)
├── DYNAMIC_HOTSPOTS_PLAN.md
└── README.md
```

### Recommended target layout

```
client/src/
├── app/
├── config/
├── context/
├── features/
│   └── map/
│       ├── components/        MapControls, HotspotModal, MapCanvas
│       ├── hooks/             useMapProjection, useMapLayers
│       ├── services/          mapFeedService
│       └── GlobalMap.jsx      Thin orchestrator (<200 lines)
├── hooks/
├── i18n/
├── services/                  ← NEW: shared feed/cache layer
│   ├── feedService.js         BaseFeedService + createFeedFetcher
│   └── feedCache.js           Request deduplication
└── utils/
```

### Barrel export strategy

Either **use** the existing `index.js` barrels consistently:

```js
import { VCPanel } from '@features/vc-activity'
```

Or **remove** unused barrels to avoid false affordances. Current state is the worst of both — files exist but are ignored.

---

## Re-render Risk Matrix

| Trigger | Components affected | Severity |
|---------|---------------------|----------|
| `refreshKey++` (manual refresh) | All `useFeedData` panels, `NewsPanel`, `CryptoPanel` chain fetch | 🔴 High — cascading fetches |
| `useDynamicRegions` poll (10 min) | `GlobalMap` full subtree | 🟠 Medium |
| Auto-rotation `setRotation` (50 ms) | `GlobalMap` + full D3 rebuild | 🔴 Critical |
| `Navbar` clock (1 s) | `Navbar` only | 🟢 Low |
| `ThemeContext` parent re-render | `SettingsModal` | 🟡 Medium — unmemoized value |
| `language` change | All `useI18n` consumers | ✅ Expected |
| Inline `onDragStart={() => ...}` in Dashboard | All `Panel` children | 🟡 Medium — new refs each render |

---

## Prioritized Remediation Plan

### Phase 1 — Quick wins (1–2 days)

1. Memoize `ThemeContext` and `RefreshContext` provider values.
2. Migrate `NewsPanel` to `useFeedData`.
3. Parallelize `BaseFeedService.fetchFeeds` with `Promise.allSettled`.
4. Remove dead code (`RECENT_FUNDS`, `filterByKeywords`, unused barrel exports or wire them up).
5. Normalize `getTimeAgo` imports and localStorage keys.
6. Delete orphan root `dist/` and `node_modules/`.

### Phase 2 — Performance (3–5 days)

1. Add shared feed request cache / deduplication layer.
2. Refactor `GlobalMap` auto-rotation to avoid React-state-driven D3 rebuilds.
3. Batch `TickerStrip` fetches; deduplicate symbols.
4. Split `GlobalMap.jsx` into submodules.
5. Add `React.memo` to panel components and `Panel`.

### Phase 3 — Maintainability (1–2 weeks)

1. Add Vitest tests for pure utils and feed parsing.
2. Split `regions.js` into focused modules.
3. Consolidate feed config with shared references.
4. Introduce TypeScript (incremental, start with `config/` and `utils/`).
5. Add panel toggle UI or remove `togglePanel` dead API.
6. Extract shared `FeedList` / `PanelFeedItem` component from duplicated panel JSX.

---

## Tooling Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ 0 errors, 2 warnings (`GlobalMap.jsx` missing deps) |
| `npm run build` | ✅ Builds in ~2s |
| `madge --circular` | ✅ No circular dependencies |
| Tests | ❌ None present |

### Bundle sizes (production)

| Chunk | Size (gzip) |
|-------|-------------|
| `index` (main) | 90.3 KB |
| `Map` | 39.5 KB |
| `TickerStrip` | 15.4 KB |
| `Dashboard` | 9.8 KB |

---

## Conclusion

The codebase has a **solid architectural skeleton** — feature folders, shared hooks, centralized config, lazy routes, and i18n/theming are all done thoughtfully. The gap between current state and industry standard is primarily in **execution consistency**: the same problems (feed fetching, polling, panel layout) are solved multiple different ways, and the map/ticker paths have serious performance characteristics that will surface under real usage.

Addressing Phase 1 and the `GlobalMap` rotation issue alone would yield the highest ROI for cleanliness and maintainability.