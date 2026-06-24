# World Monitor — Audit Remediation Plan

**Date:** June 24, 2026
**Source:** `CODEBASE_AUDIT.md` (June 24, 2026)
**Goal:** Convert every finding in the audit into a concrete, reviewable set of code changes — no architectural reinvention, just focused refactors that compound.

Each task below is scoped to a **single concern**, lists the **files touched**, gives an **acceptance check**, and estimates effort in **S/M/L** (S ≤ 1h, M = half day, L = 1+ day). Tasks are grouped into 4 phases. Within a phase, tasks can mostly be parallelized across worktrees; between phases, later phases depend on the abstractions introduced in earlier ones.

> Conventions
> - "Lint clean" means `npm run lint` reports 0 errors / 0 warnings.
> - "Build clean" means `npm run build` succeeds and the bundle delta in `Map` chunk is ≤ 5 KB.
> - All new code must use the existing path aliases (`@features`, `@hooks`, `@config`, `@context`, `@utils`, `@app`, `@i18n`).
> - All new code must remain ESLint-clean with the current ruleset — no new `eslint-disable` unless explicitly called out in the task.

---

## Phase 1 — Quick Wins (1–2 days)

These are the high-ROI, low-risk changes from the audit's Phase 1. Each is independent and can be merged individually.

### 1.1 Memoize `RefreshContext` provider value
- **Audit ref:** Issue 5 (RefreshContext)
- **File:** `client/src/context/RefreshContext.jsx`
- **Change:** Wrap the value object in `useMemo(() => ({ refreshKey, triggerRefresh }), [refreshKey])`. `triggerRefresh` is already `useCallback`-stable, so only `refreshKey` needs to be in deps.
- **Acceptance:** Lint clean. Re-render frequency of `useFeedData` consumers after a refresh event no longer propagates to components that only consume the actions object (verified by adding a `console.log` in a non-feed consumer before/after, then removed).
- **Effort:** S

### 1.2 Memoize `ThemeContext` provider value
- **Audit ref:** Issue 5 (ThemeContext)
- **File:** `client/src/context/ThemeContext.jsx`
- **Change:** Wrap the value object in `useMemo(() => ({ currentTheme, setCurrentTheme, themes: THEMES }), [currentTheme])`. Lift `THEMES` reference stability: ensure it is a module-level `const` (already is in `client/src/config/themes.js`).
- **Acceptance:** Lint clean. `SettingsModal` (the only known heavy consumer) no longer re-renders on unrelated state changes.
- **Effort:** S

### 1.3 Add `error` to `useFeedData` return
- **Audit ref:** Issue 4
- **Files:**
  - `client/src/hooks/useFeedData.js` — add `error` state, populate it in the `catch` block, return `{ data, loading, error }`.
  - `client/src/features/news/NewsPanel.jsx` — migrate to `useFeedData` (see 1.4); drop the inline `useState`/`useEffect`/error scaffolding.
  - `client/src/features/crypto/CryptoPanel.jsx` — only the chain-data `useEffect` (lines ~26–86) needs migration; the news half already uses `useFeedData`.
- **Change:** Add `const [error, setError] = useState(null)` and set it on fetch failure (preserving the last successful `data` so the UI does not blank out). Reset to `null` on each successful fetch.
- **Acceptance:** Lint clean. `NewsPanel` JSX shrinks by ~30 lines; `error` is rendered identically to the current implementation.
- **Effort:** S

### 1.4 Migrate `NewsPanel` to `useFeedData`
- **Audit ref:** Issue 4
- **File:** `client/src/features/news/NewsPanel.jsx`
- **Change:** Replace the custom `useEffect` (lines 14–46) with a `useFeedData(() => BaseFeedService.fetchFeeds(feeds, { maxItems: 50 }), 5 * 60 * 1000)` call. Pass a stable `fetchFn` via a ref or by hoisting the function (the `feeds` prop changes per panel, so an inline function is acceptable; `useFeedData` already wraps it in a ref).
- **Side effect:** Removes the only `// eslint-disable-next-line react-hooks/exhaustive-deps` in the production source.
- **Acceptance:** Lint clean (no `eslint-disable` remaining in `client/src/features/news/`). `NewsPanel` still polls every 5 min, still reacts to `RefreshContext.refreshKey`, still shows the same loading/error/empty states.
- **Effort:** S

### 1.5 Migrate `CryptoPanel` chain data to a hook
- **Audit ref:** Issue 4
- **File:** `client/src/features/crypto/CryptoPanel.jsx`
- **Change:** Extract the inline `useEffect`/state machine (lines ~26–86, 6 parallel `try/catch` fetches + interval) into a new `client/src/hooks/useChainData.js` hook that returns `{ hashRate, ethGas, tvl, lastUpdated, error }`. Polling stays at 2 min. The hook should use `Promise.allSettled` and tolerate any subset of endpoints failing.
- **Acceptance:** Lint clean. `CryptoPanel` body shrinks; one fewer inline polling block in the codebase. All current visible metrics behave identically.
- **Effort:** M

### 1.6 Parallelize `BaseFeedService.fetchFeeds`
- **Audit ref:** Issue 6
- **File:** `client/src/features/news/baseFeedService.js`
- **Change:** Replace the `for (const feed of feeds)` sequential loop (lines 20–34) with `Promise.allSettled(feeds.map(...))`, matching `MapFeedService.fetchMapNews` (line 21 of `client/src/features/map/mapFeedService.js`). Preserve: success count check, per-feed error logging, `item.source` injection, sort by date, optional `maxItems` slice.
- **Acceptance:** Lint clean. `fetchFeeds` returns the same shape in the same order. On a 5-feed panel, network latency drops from sum-of-latencies to max-of-latencies.
- **Effort:** S

### 1.7 Batch + deduplicate `TickerStrip` fetches
- **Audit ref:** Issue 3
- **File:** `client/src/features/markets/TickerStrip.jsx`
- **Change:**
  - Build `const uniqueSymbols = Array.from(new Set(ALL_ITEMS.map(i => i.symbol)))` so duplicates (e.g. `CL=F`, `NG=F`, `GC=F`, `ZW=F`, `BTC-USD` in both `COMMODITY_ITEMS` and `GEO_ITEMS`) only fire one request each.
  - Replace the `for (const item of ALL_ITEMS)` sequential loop (lines 78–85) with `await Promise.allSettled(uniqueSymbols.map(...))` running the fetch in parallel.
  - Then map back: `data = Object.fromEntries(ALL_ITEMS.map(item => [item.symbol, results[item.symbol]]))` so the rest of the component is unchanged.
  - Remove the `Math.random()` mock-prices branch on error (lines 117–119) — keep the existing `error: true` object that the UI already handles.
- **Acceptance:** Lint clean. Network request count drops from 42 to ~30 (the actual dedup count). On a 30-symbol request, latency drops from sum to max. UI output is byte-identical for the success case; on failure, the UI shows the existing "no data" styling instead of random numbers.
- **Effort:** M

### 1.8 Extract a shared `Clock` component
- **Audit ref:** Issue 15
- **Files:**
  - `client/src/features/navigation/Navbar.jsx` — remove the `currentTime` state and the `setInterval` effect (lines 15–18). Render `<Clock />` in the three places that currently read `currentTime` (lines 38, 39, 98, 99).
  - `client/src/features/navigation/Clock.jsx` — **create**. Tiny component that owns the `setInterval(1000ms)` and renders `formatDate` / `formatTime` via `useI18n()`. Wrap its export in `React.memo`.
- **Acceptance:** Lint clean. Manual verification: clicking the Settings button no longer triggers a re-render of the date/time block (visible by adding a temporary `console.log` to the parent, then removed). Total Navbar LOC drops by ~25.
- **Effort:** S

### 1.9 Remove dead code
- **Audit ref:** Issue 7
- **Files & changes:**
  - `client/src/features/vc-activity/VCPanel.jsx` — delete the `RECENT_FUNDS` array (lines 7–18). It is never rendered.
  - `client/src/features/news/baseFeedService.js` — delete the `filterByKeywords` static method (lines 73–77). No callers exist.
  - `client/src/utils/helpers.js` — delete `formatPercent` (lines 8–11). Also remove the re-export from `client/src/utils/index.js` (line 2).
  - `client/src/hooks/usePanelSettings.js` — either remove `togglePanel` / `isPanelEnabled` (lines 7–19) and have the file export only `{ panelSettings, setPanelSettings }`, **or** add a real settings-UI toggle (Phase 3 follow-up). Recommendation: take the deletion path for now to ship the audit's hygiene fix quickly; reintroduce with the UI in Phase 3.
  - `client/src/features/*/index.js` (12 files) and `client/src/hooks/index.js`, `client/src/config/index.js` — delete. `grep` confirms zero imports from these barrels.
  - `client/src/features/map/mapFeedService.js` — `MapFeedService.fetchMapNews` (lines 13–60) is defined but never called. Delete it; keep `fetchGoogleNews` and `fetchNewsForHotspot` which are called from `GlobalMap.jsx:822, 1073, 1089`.
- **Acceptance:** Lint clean. Build clean. `grep -r "filterByKeywords\|formatPercent\|RECENT_FUNDS\|fetchMapNews"` returns no matches. `grep -r "from '@hooks'\|from '@config'\|from '@features/"` returns no matches (barrel imports gone).
- **Effort:** S

### 1.10 Rename `.js`-suffixed imports — pick one style
- **Audit ref:** Issue 8
- **Files:** every file under `client/src/` that imports a same-directory or relative-path file with `.js`.
- **Change:** Strip the `.js` suffix from all relative imports to match the majority pattern. Concretely, the following 8 files have inconsistent suffix usage and need to be aligned:
  - `client/src/hooks/useDynamicRegions.js` (e.g. line 3 import)
  - `client/src/features/war-watch/WarWatchPanel.jsx`
  - `client/src/features/developer-activity/githubActivity.js`
  - `client/src/features/developer-activity/chainStats.js`
  - `client/src/features/map/mapFeedService.js`
  - `client/src/features/map/GlobalMap.jsx`
  - `client/src/features/news/baseFeedService.js`
  - `client/src/features/crypto/CryptoPanel.jsx`
- **Acceptance:** Lint clean. `grep -rE "from '\./[^']+\.js'"` returns 0 matches (relative imports only; aliased imports are fine either way and out of scope).
- **Effort:** S

### 1.11 Unify `getTimeAgo` import path
- **Audit ref:** Issue 8
- **Files:** all consumers of `getTimeAgo`.
- **Change:** Add `getTimeAgo` as a re-export in `client/src/utils/index.js` (alongside `formatAmount`, `formatNumber`), then update the 3 callers that currently use the deeper path (`NewsPanel.jsx:5`, `CryptoPanel.jsx:7`, `WarWatchPanel.jsx:4`) to use `from '@utils'`. **Do not** touch `client/src/utils/chainStats.js` — it does not import `getTimeAgo` (the audit verification corrected this).
- **Acceptance:** Lint clean. `grep -r "from '@utils/dateHelpers'"` returns 0 matches; `grep -r "getTimeAgo" --include="*.jsx" --include="*.js"` shows it imported only from `@utils` going forward.
- **Effort:** S

### 1.12 Normalize localStorage keys
- **Audit ref:** Issue 9
- **Files:**
  - `client/src/hooks/usePanelSettings.js` line 5 — change `'situationMonitorPanels'` → `'world_monitor_panels'`.
  - `client/src/features/dashboard/Dashboard.jsx` lines 25, 57 — change `'situationMonitorPanelOrder'` → `'world_monitor_panel_order'`.
  - `client/src/utils/useLocalStorage.js` — add a **one-shot migration**: if either of the old keys is present in localStorage on first read, copy the value to the new key and delete the old one. This prevents users from losing their saved panel order/visibility.
- **Acceptance:** Lint clean. `grep -r "situationMonitor" client/src/` returns 0 matches outside the migration block in `useLocalStorage.js`. Manual check: an existing user with `situationMonitorPanels` in localStorage sees their settings preserved after the upgrade.
- **Effort:** S

### 1.13 Update legacy document title
- **Audit ref:** Issue 9 (extension)
- **File:** `client/index.html` line 10
- **Change:** Replace `<title>Situation Monitor</title>` with `<title>World Monitor</title>`.
- **Acceptance:** Browser tab title reads "World Monitor" in dev and built output.
- **Effort:** S (sub-minute)

### 1.14 Delete orphan root `dist/` and `node_modules/`
- **Audit ref:** Issue 16
- **Change:** `rm -rf world_monitor/dist world_monitor/node_modules`. Verify the root `.gitignore` already excludes `dist/` (it does) and that the root `node_modules/` is not needed by any tooling. If a script anywhere in CI references the root `node_modules/`, add a `postinstall` warning to the audit notes instead.
- **Acceptance:** `ls world_monitor/` shows only `client/`, `CODEBASE_AUDIT.md`, `DYNAMIC_HOTSPOTS_PLAN.md`, `IMPLEMENTATION_PLAN.md` (this file), `README.md`, and `.git` / `.gitignore` / `.claude` / etc. Build still works from `client/`.
- **Effort:** S

### 1.15 Add ESLint rule for dead-export detection
- **Audit ref:** Issues 7, 17 (prevention)
- **File:** `client/eslint.config.js`
- **Change:** Add `eslint-plugin-unused-imports` (devDependency). Enable `unused-imports/no-unused-imports` and `unused-imports/no-unused-vars` as errors. The plugins are small, well-maintained, and match the existing flat-config style.
- **Acceptance:** Lint clean. A new `export const foo = 1` with no consumers triggers a build-time error. (Manual test: add a fake export, see the error, remove the export.)
- **Effort:** S (once the plugin is installed)

**Phase 1 total: ~15 tasks, ~2 days with one engineer. All are independent and reviewable as separate PRs.**

---

## Phase 2 — Performance (3–5 days)

The high-leverage refactors: shared feed cache, `GlobalMap` rotation, `TickerStrip` dedup (already in Phase 1 as 1.7), memoization of panel components, and structural split of `GlobalMap.jsx`.

### 2.1 Introduce a shared `FeedCache` / request-deduplication layer
- **Audit ref:** Issue 1
- **Files:**
  - `client/src/utils/fetchUtils.js` — already has a per-URL response cache (`feedCache` Map, 5-min TTL). Extend it from "cache the response text" to "cache the **parsed result**" by adding a parallel `parsedFeedCache` keyed by URL. Provide `getCachedParsedFeed(url)` and `setCachedParsedFeed(url, items)` helpers.
  - `client/src/hooks/useSharedFeed.js` — **create**. A new hook with signature `useSharedFeed(url, fetcher)` that:
    1. Returns the cached parsed array immediately if present.
    2. Otherwise, registers a single in-flight `Promise` for the URL (request coalescing — concurrent callers share the same in-flight fetch).
    3. On resolve, writes the parsed result to `parsedFeedCache` and resolves all waiting callers.
  - `client/src/features/news/baseFeedService.js` — `fetchFeeds` consults `getCachedParsedFeed(url)` for each feed before issuing a network request. On hit, skip the `fetchWithProxy` + `parseRSS` cost entirely.
  - `client/src/hooks/useDynamicRegions.js` — line 90 (`const allFeeds = Object.values(NEWS_FEEDS).flat()`) reads from the same parsed cache, so it gets free results from any panel that has already fetched the feed in the last 5 minutes.
- **Acceptance:**
  - On a dashboard load: open DevTools Network tab, count `/proxy/?url=...` requests. After 5 minutes of normal use, the same URLs are not re-fetched.
  - Panels whose feeds are already cached render the data on the very first paint (no loading state) — measurable by adding a temporary `performance.mark` in the panel's render path, then removed.
  - Lint clean.
- **Effort:** M

### 2.2 Make `GlobalMap` rotation D3-only
- **Audit ref:** Issue 2
- **File:** `client/src/features/map/GlobalMap.jsx`
- **Change:**
  - Keep `rotation` React state for "synced with user interaction", but stop including it in the `renderMap` effect's dependency array (line 172). Add a `// eslint-disable-next-line react-hooks/exhaustive-deps` only at this one site, with a comment explaining the deliberate decoupling.
  - In the auto-rotation effect (lines 142–158), drive D3 directly: call `rotationRef.current` to compute the new projection, then call a lightweight `applyTransform()` helper that re-runs only `svg.select('.graticule, .countries, .hotspots').attr('transform', ...)` — **not** the full `d3.select(svg).selectAll('*').remove()` rebuild.
  - Switch from `setInterval(50)` to `requestAnimationFrame` for the rotation loop. The interval-based approach fires while the tab is backgrounded; RAF does not, which is the right behavior for an "ambient spin".
  - Add `projectionMode` to the renderMap effect deps (line 172) so the flat/3D toggle cannot desync.
- **Acceptance:** CPU profile during auto-rotation shows a flat baseline under 5% of one core (vs. the current 20–40% spikes from the full SVG rebuild). Visual rotation is identical.
- **Effort:** L

### 2.3 Split `GlobalMap.jsx` into submodules
- **Audit ref:** Issue 2 (file size)
- **Files (all new except the orchestrator):**
  - `client/src/features/map/hooks/useMapProjection.js` — projection, zoom, rotation state.
  - `client/src/features/map/hooks/useMapLayers.js` — D3 layer rendering (countries, hotspots, conflict zones, etc.).
  - `client/src/features/map/hooks/useMapInteraction.js` — drag, zoom, click handlers, auto-rotation.
  - `client/src/features/map/MapCanvas.jsx` — the `<svg>` element, applies transforms from the hooks above.
  - `client/src/features/map/MapControls.jsx` — layer toggles, view toggles, hotspot modal trigger.
  - `client/src/features/map/GlobalMap.jsx` — slim orchestrator (target < 200 lines) that composes the hooks and renders `<MapCanvas>` + `<MapControls>` + `<HotspotModal>`.
- **Acceptance:** `GlobalMap.jsx` ≤ 200 lines. Build clean. Map chunk bundle delta ≤ 5 KB (each new module is small, but a regression here signals accidental duplication). No new ESLint warnings. Lint clean. Behavior is byte-identical to before the split (manual smoke test: rotate, click hotspots, switch between global/US view, toggle layers).
- **Effort:** L

### 2.4 Lift ticker fetching above route level + dedup module-level
- **Audit ref:** Issue 3
- **Files:**
  - `client/src/features/markets/useTickerData.js` — **create**. Module-level `Map<symbol, { data, fetchedAt }>` cache (5-min TTL, matching the RSS cache). The hook subscribes to the cache and triggers a fetch if any visible symbol is stale.
  - `client/src/features/markets/TickerStrip.jsx` — switch from local fetch to `useTickerData()`. Remove the local `useEffect`/`setInterval`.
  - `client/src/app/App.jsx` (or a new `client/src/context/MarketDataContext.jsx`) — mount `useTickerData` at the route level so Dashboard and Map both read from the same cache instead of double-fetching.
- **Acceptance:** Open Dashboard for 30 s, then navigate to /map. The /map view shows already-fetched ticker data on the first frame, not a loading state. Lint clean.
- **Effort:** M

### 2.5 Wrap panels in `React.memo` + fix inline closures in `Dashboard`
- **Audit ref:** Issue 5, re-render matrix
- **Files:**
  - `client/src/features/dashboard/Panel.jsx` — wrap the default export in `React.memo`. Add `displayName`.
  - `client/src/features/dashboard/Dashboard.jsx` — replace the inline `onDragStart={() => handleDragStart(panelId)}` and `onDrop={() => handleDrop(panelId)}` (lines 141, 144) with two pre-bound factories created once per render. The simplest fix: pre-compute `const dragHandlers = useMemo(() => Object.fromEntries(panelOrder.map(id => [id, { onDragStart: () => handleDragStart(id), onDrop: () => handleDrop(id) }])), [panelOrder, handleDragStart, handleDragEnd, handleDrop])` and look up `dragHandlers[panelId]` in the JSX.
  - All panel children (`NewsPanel`, `StartupsPanel`, `VCPanel`, `CryptoPanel`, `WarWatchPanel`, `LayoffsPanel`) — wrap their default exports in `React.memo` and set `displayName`. The data they consume comes from `useFeedData` and only changes on refresh; re-renders triggered by `Dashboard`'s drag state should be skipped.
- **Acceptance:** Adding a `console.log('Panel render', id)` to `Panel.jsx` shows no re-renders during a drag operation (only on actual data changes). Lint clean.
- **Effort:** M

### 2.6 Use stable list keys in feed panels
- **Audit ref:** Issue 14
- **Files & changes** (replace `key={idx}` with `key={item.link}` or `key={item.guid || item.link}` — `parseRSS` already returns `link` for every item):
  - `client/src/features/news/NewsPanel.jsx:86`
  - `client/src/features/startups/StartupsPanel.jsx:48`
  - `client/src/features/vc-activity/VCPanel.jsx:49`
  - `client/src/features/crypto/CryptoPanel.jsx:115`
  - `client/src/features/layoffs/LayoffsPanel.jsx:36`
  - `client/src/features/war-watch/WarWatchPanel.jsx:27, 37`
  - `client/src/features/developer-activity/DeveloperActivity.jsx:232`
  - `client/src/features/markets/TickerStrip.jsx:155` — replace `key={`${item.symbol}-${idx}`}` with `key={item.symbol}` (now that the symbol list is deduplicated by 1.7, the symbol is unique).
- **Acceptance:** Lint clean. Manual check: scrolling a panel and triggering a refresh no longer resets the scroll position.
- **Effort:** S

**Phase 2 total: ~6 tasks, ~5 days with one engineer. Tasks 2.1 and 2.3 are the most consequential — they unblock most of the remaining performance wins.**

---

## Phase 3 — Maintainability (1–2 weeks)

### 3.1 Add Vitest + tests for the pure layer
- **Audit ref:** Issue 17
- **Files:**
  - `client/package.json` — add `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react` (devDeps). Add `"test": "vitest"`, `"test:run": "vitest run"`, `"test:ui": "vitest --ui"` scripts.
  - `client/vitest.config.js` — **create**. Extends Vite config, adds `jsdom` environment, `globals: true`, alias resolution matching `vite.config.js`.
  - `client/src/utils/dateHelpers.test.js` — `getTimeAgo` covers: "just now", "1m ago", "1h ago", "1d ago", "1w ago", invalid date fallback.
  - `client/src/utils/helpers.test.js` — `formatAmount`, `formatNumber`.
  - `client/src/utils/fetchUtils.test.js` — `parseRSS` covers: `<item>`, `<entry>`, missing `link`, missing `pubDate`, malformed XML.
  - `client/src/features/news/createFeedFetcher.test.js` — factory returns a function; the function calls `BaseFeedService.fetchFeeds` with the right `feedKey` and `maxItems`.
  - `client/src/hooks/useDynamicRegions.test.js` — `calculateEnhancedSeverity` (extracted to a pure helper first if it isn't already) covers: empty news, single event, many events, decay over time.
  - `client/src/features/dashboard/ErrorBoundary.test.jsx` — fallback renders on thrown render, children render normally otherwise.
- **Acceptance:** `npm run test:run` reports 100% pass on the listed files. CI ready.
- **Effort:** M

### 3.2 Split `client/src/config/regions.js` (853 lines) into focused modules
- **Audit ref:** Issue 11
- **Files (all new except the existing `regions.js` which is rewritten as a barrel):**
  - `client/src/config/regions/hotspots.js` — `HOTSPOTS`, `US_HOTSPOTS`, `INTEL_HOTSPOTS`.
  - `client/src/config/regions/conflictZones.js` — `CONFLICT_ZONES`.
  - `client/src/config/regions/infrastructure.js` — `UNDERSEA_CABLES`, `SHIPPING_CHOKEPOINTS`, `CYBER_REGIONS`, `NUCLEAR_FACILITIES`.
  - `client/src/config/regions/military.js` — `MILITARY_BASES`.
  - `client/src/config/regions/us.js` — `US_CITIES`.
  - `client/src/config/regions/index.js` — **rewrite**. Re-exports everything plus the `REGIONS` aggregate and `NEWS_FEEDS` re-export. All current consumers (`GlobalMap.jsx`, `useDynamicRegions.js`) keep working because they import from `@config/regions` (the path resolves to `index.js`).
- **Acceptance:** Lint clean. Build clean. Bundle sizes unchanged (this is a code-organization change, not a bundle-shape change). `wc -l` on the largest new file is ≤ 250.
- **Effort:** M

### 3.3 Consolidate `feedConfig.js` with shared feed references
- **Audit ref:** Issue 12
- **File:** `client/src/features/news/feedConfig.js`
- **Change:** Define canonical feed objects once, then compose. Example:

  ```js
  const DEFENSE_FEEDS = [
    { name: 'Defense One', url: '...' },
    { name: 'War on Rocks', url: '...' },
    { name: 'Breaking Defense', url: '...' },
    { name: 'The War Zone', url: '...' },
  ]

  const STARTUP_FEEDS = [
    { name: 'TechCrunch', url: '...' },
    { name: 'VentureBeat', url: '...' },
    { name: 'Crunchbase', url: '...' },
    { name: 'Sifted', url: '...' },
  ]

  export const FEED_CONFIG = {
    news: { /* ... */ },
    startups: STARTUP_FEEDS,
    vc: [...STARTUP_FEEDS, /* ... VC-only feeds ... */],
    warWatch: [...DEFENSE_FEEDS, { name: 'Janes', url: '...' }],
    // intel: [...OTHER_INTEL, ...DEFENSE_FEEDS],
  }
  ```

  This makes the overlap explicit and lets the dedup logic in 2.1 + 2.4 detect cross-panel duplicates.
- **Acceptance:** Lint clean. `FEED_CONFIG.vc` and `FEED_CONFIG.startups` share references to the same 4 `STARTUP_FEEDS` objects (verified by `console.log(FEED_CONFIG.vc[0] === FEED_CONFIG.startups[0])`). Bundle sizes unchanged.
- **Effort:** S

### 3.4 Add a real panel-toggle settings UI
- **Audit ref:** Issue 7 (replacement path for `togglePanel`)
- **Files:**
  - `client/src/hooks/usePanelSettings.js` — restore the `togglePanel` and `isPanelEnabled` exports (they were deleted in 1.9's recommended path).
  - `client/src/features/dashboard/SettingsModal.jsx` — add a "Panels" tab that lists every key in `PANELS` with a toggle bound to `togglePanel(panelId)`. Persist via the existing `useLocalStorage` from 1.12.
  - `client/src/features/dashboard/Dashboard.jsx` — apply the `panelSettings` filter (it already does on line 62).
- **Acceptance:** Toggling a panel off in Settings hides it; reloading preserves the choice. Lint clean.
- **Effort:** M

### 3.5 Extract a shared `FeedList` / `PanelFeedItem` component
- **Audit ref:** Issue 4 (panel JSX duplication)
- **Files:**
  - `client/src/features/dashboard/PanelFeedItem.jsx` — **create**. Renders one feed item (source label, time-ago, link, title) with the standard hover styling. Accepts `{ item, locale, accentColor }` props. Wrapped in `React.memo`.
  - `client/src/features/news/NewsPanel.jsx`, `client/src/features/startups/StartupsPanel.jsx`, `client/src/features/vc-activity/VCPanel.jsx`, `client/src/features/crypto/CryptoPanel.jsx`, `client/src/features/layoffs/LayoffsPanel.jsx`, `client/src/features/war-watch/WarWatchPanel.jsx` — replace the inline `<a className="panel-feed-item">…</a>` blocks with `<PanelFeedItem item={item} locale={locale} accentColor={config.accentColor} />`. Where the per-panel accent is a class (e.g. `text-[var(--purple)]`), pass it as a prop or pick from a small map.
- **Acceptance:** Each panel's source-list rendering shrinks to a single `feedItems.map(item => <PanelFeedItem ... />)`. Lint clean. Visual output is identical (manual check on at least Politics and VC panels).
- **Effort:** M

### 3.6 Remove remaining useEffect eslint-disables
- **Audit ref:** Issue 4 side effect
- **Files:** any file that still has a `// eslint-disable-next-line react-hooks/exhaustive-deps` after Phase 1 + 2. Likely candidates: `NewsPanel` (handled by 1.4), and `useFeedData.js` itself (the `// eslint-disable-next-line` on the `fetchFnRef` exclusion, lines 45–46) — that one stays because it's intentional and well-commented.
- **Acceptance:** `grep -r "eslint-disable" client/src/` shows only the one remaining well-commented instance in `useFeedData.js`.
- **Effort:** S

### 3.7 Introduce TypeScript incrementally
- **Audit ref:** Issue 18
- **Files:**
  - `client/package.json` — add `typescript`, `@types/react`, `@types/react-dom`, `@types/d3`, `@types/topojson-client` (devDeps).
  - `client/tsconfig.json` — **create**. `allowJs: true`, `checkJs: true`, `strict: true` in core directories, `noEmit: true`. `include` covers `src/**/*.{js,jsx}` so JSDoc-style type hints in existing files are picked up.
  - `client/vite.config.js` — no change needed; Vite handles `.ts`/`.tsx` natively.
  - **Strategy** (do not convert everything at once):
    1. Rename `client/src/config/api.js` → `.ts`. Add types for the `API` export.
    2. Rename `client/src/config/panels.js` → `.ts`. Type the `PANELS` map.
    3. Rename `client/src/features/news/feedConfig.js` → `.ts`. Type the `FEED_CONFIG` shape.
    4. Rename `client/src/utils/dateHelpers.js`, `client/src/utils/helpers.js`, `client/src/utils/fetchUtils.js` → `.ts`.
    5. Type the new files from Phase 2 (`useSharedFeed`, `useTickerData`, `useChainData`) in TS from the start.
- **Acceptance:** `tsc --noEmit` passes. `npm run build` produces identical output (or smaller, since the type annotations are erased). Lint clean.
- **Effort:** L (mostly mechanical, but the file-rename cascade touches many imports)

**Phase 3 total: ~7 tasks, ~1.5 weeks with one engineer.**

---

## Phase 4 — Structural / "industry standard" (1 week+)

These are the changes from the audit that require the most thought. They are deliberately last so that the codebase is test-covered and well-organized before the work begins.

### 4.1 Decide on the barrel export strategy
- **Audit ref:** "Barrel export strategy" section
- **Decision:** Adopt the **"use barrels consistently"** path. Re-create the `index.js` barrels with explicit re-exports:

  ```js
  // client/src/features/news/index.js
  export { default as NewsPanel } from './NewsPanel'
  export { default as BaseFeedService } from './baseFeedService'
  export { createFeedFetcher } from './createFeedFetcher'
  export { FEED_CONFIG, NEWS_FEEDS } from './feedConfig'
  ```

  Update all consumers (currently 1 file per feature in `Dashboard.jsx`) to use the barrel imports. This buys the future ability to add new exports without editing every importer.
- **Acceptance:** `import { NewsPanel } from '@features/news'` works in `Dashboard.jsx`. Lint clean. Build clean.
- **Effort:** S

### 4.2 Replace static mock data with real (or clearly-labeled) data
- **Audit ref:** Issue 10
- **Files & changes:**
  - `client/src/features/vc-activity/VCPanel.jsx` — `VC_STATS` is rendered as if live. Options:
    - (a) Compute the totals from the same feeds the panel reads (`VC_STATS.totalRaised = sum(items where extractFunding(...) !== null)`).
    - (b) Move the constant to a clearly-labeled `MOCK_VC_STATS_2026` constant, render with a "DEMO" badge.
    - Recommend (a) for credibility; (b) is a half-day stopgap.
  - `client/src/features/startups/StartupsPanel.jsx` — `RECENT_FUNDING` header totals: same options as above. (a) is feasible because `StartupsFeedService.extractFunding` already returns a value.
  - `client/src/features/layoffs/LayoffsPanel.jsx` — `LAYOFF_STATS`: same options.
  - `client/src/features/crypto/CryptoPanel.jsx` — `MOCK_CHAIN_DATA.nftVolume` fallback: replace with a call to a public NFT volume endpoint (e.g. `https://api.coingecko.com/api/v3/nfts/list?order=volume_usd_desc&limit=1`) wrapped in the same `useChainData` hook from 1.5. Fall back to "—" on error instead of mock data.
- **Acceptance:** No panel displays a hardcoded number that is not clearly marked as such. Lint clean.
- **Effort:** L (because each panel needs a real source or a labeled fallback)

### 4.3 Adopt a strict project-hygiene contract
- **Audit ref:** Issues 5, 7, 9, 16, 17
- **Files:**
  - `client/.editorconfig` — **create**. 2-space indent, LF line endings, trim trailing whitespace, final newline. (Audit noted inconsistent indentation; EditorConfig enforces it editor-side without breaking existing files.)
  - `client/package.json` — add `"engines": { "node": ">=20" }` to prevent CI drift.
  - `world_monitor/.gitignore` — verify `dist`, `node_modules`, `.DS_Store` are covered; add `*.log`, `.env.local`, `.vite/`, `coverage/`.
  - `world_monitor/README.md` — add a "Contributing" section pointing at this plan and the audit. Document the Phase-1 ESLint rule, the `world_monitor_*` localStorage namespace, and the barrel-import convention (whichever path is chosen in 4.1).
- **Acceptance:** A fresh clone, after `npm install` and `npm run dev`, passes `npm run lint`, `npm run build`, and `npm run test:run` with zero warnings.
- **Effort:** S

### 4.4 Add a CI workflow
- **Audit ref:** Issues 17 (test runner), 18 (typecheck — once added)
- **Files:**
  - `.github/workflows/ci.yml` — **create**. Runs on `push` and `pull_request` to `main`. Steps: `npm ci` in `client/`, `npm run lint`, `npm run test:run`, `npm run build`. Add `npm run typecheck` (which runs `tsc --noEmit`) once 3.7 lands.
- **Acceptance:** Opening a PR triggers the workflow. A red build fails the merge.
- **Effort:** S

**Phase 4 total: ~4 tasks, ~1 week with one engineer.**

---

## Acceptance — what "done" looks like

After all four phases, the audit's re-grade should be **A−**:

- All 20 numbered issues are resolved or explicitly downgraded with a justification.
- New regressions are caught by CI (lint + test + build) before merge.
- `npm run build` time stays under 5 s, `Map` chunk stays under 130 KB raw / 45 KB gzipped.
- No `eslint-disable` comments in production source outside the one well-commented instance in `useFeedData.js`.
- No hardcoded mock data is rendered without a "DEMO" badge or a real source.
- All localStorage keys are namespaced under `world_monitor_*` with a one-shot migration for existing users.
- The document title in `client/index.html` is "World Monitor".
- The `world_monitor/dist/` and `world_monitor/node_modules/` orphan directories are gone.

## Out of scope (intentionally)

These were considered and explicitly deferred:

- **GDELT dynamic hotspots** — already covered by `DYNAMIC_HOTSPOTS_PLAN.md`. Independent from the audit remediation and can ship in parallel.
- **Server-side rendering / Next.js migration** — out of scope; the project is a Vite SPA by design.
- **State management library (Redux / Zustand)** — the current context + hooks approach is sufficient for the current surface area. Revisit if Phase 2 reveals prop-drilling pain that context can't fix.
- **A11y audit** — no current findings, but no systematic check. Add `eslint-plugin-jsx-a11y` to the lint config in a future sprint.
- **Visual regression tests** — no current baseline. Consider Percy/Chromatic once the panel split (3.5) stabilizes.

---

## Suggested PR sequence (for clean code review)

If merging as a series of PRs, this order minimizes cross-PR conflicts:

| PR | Tasks | Lines changed (est.) |
|---|---|---|
| 1 | 1.9 (dead code) + 1.10 (import suffix) + 1.11 (`getTimeAgo`) | −200 |
| 2 | 1.1 + 1.2 (memoize contexts) | +10 |
| 3 | 1.3 + 1.4 (`useFeedData` error + NewsPanel migration) | ±0 |
| 4 | 1.5 (`useChainData` hook + CryptoPanel migration) | −30 |
| 5 | 1.6 (parallelize `BaseFeedService`) | ±0 |
| 6 | 1.7 (TickerStrip dedup + parallelize) | ±0 |
| 7 | 1.8 (`Clock` component) | −25 |
| 8 | 1.12 (localStorage rename + migration) + 1.13 (title) | +20 |
| 9 | 1.14 (orphan dirs) + 1.15 (unused-imports lint) | +5 |
| 10 | 2.1 (`FeedCache` + `useSharedFeed`) | +80 |
| 11 | 2.6 (stable list keys) | −10 |
| 12 | 2.5 (`React.memo` panels + Dashboard closures) | +30 |
| 13 | 2.2 + 2.3 (`GlobalMap` rotation + split) | +150 / −1000 |
| 14 | 2.4 (TickerStrip cache + route-level fetch) | +60 |
| 15 | 3.1 (Vitest + tests) | +300 |
| 16 | 3.2 (split `regions.js`) | +20 / −850 |
| 17 | 3.3 (consolidate `feedConfig.js`) | +10 |
| 18 | 3.4 (panel toggle UI) | +80 |
| 19 | 3.5 (shared `PanelFeedItem`) | +60 / −150 |
| 20 | 3.6 (remove remaining `eslint-disable`) | ±0 |
| 21 | 3.7 (TypeScript) | +200 / −50 |
| 22 | 4.1 (barrel strategy) | +30 / −10 |
| 23 | 4.2 (real/mock data labels) | +60 |
| 24 | 4.3 (hygiene contract) + 4.4 (CI) | +80 |
