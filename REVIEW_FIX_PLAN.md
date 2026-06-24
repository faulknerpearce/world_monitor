# Review Fix Plan

Fixes for all issues found in the local code review of `world_monitor` (main branch).

## Progress

- [x] Plan written
- [x] Phase 1 — Map correctness (P0)
- [x] Phase 2 — GDELT pipeline
- [x] Phase 3 — Reliability & data quality
- [x] Phase 4 — Repo hygiene
- [x] Phase 5 — Test coverage & verification

---

## Phase 1 — Map correctness (P0 bugs)

### 1.1 `setError` undefined in `GlobalMap`

- [x] Add `renderError` / `setRenderError` local state in `GlobalMap.jsx`
- [x] Replace four bare `setError(...)` calls with `setRenderError(...)`
- [x] Clear `renderError` at the start of a successful `renderMap`
- [x] Show `renderError` as an overlay on the map (keep `error` early-return for data-load failures)

**Files:** `client/src/features/map/GlobalMap.jsx`

### 1.2 Globe rotation no longer redraws

- [x] Auto-rotation RAF: update `rotationRef` and call `renderMapRef.current?.()` (no `setRotation` per frame)
- [x] `createGlobeDrag`: add `onRotate` callback; invoke redraw after drag
- [x] Keyboard rotation/reset: call `renderMapRef.current?.()` after updating `rotationRef`
- [x] Update `mapHelpers.js` comment to match behavior

**Files:** `client/src/features/map/GlobalMap.jsx`, `client/src/features/map/mapHelpers.js`

### 1.5 Spanish locale duplicate keys

- [x] Remove Portuguese `svgLabel` / `keyboardHint` from the `es` locale block
- [x] Verify other locales have no duplicate `map` keys

**Files:** `client/src/i18n/translations.js`

### Phase 1 verification

- [x] `npm test` passes
- [ ] Map auto-rotates and responds to drag/keyboard (manual smoke test)
- [ ] Render failures show error overlay (manual smoke test)
- [ ] Spanish map `aria-label` is Spanish text (manual smoke test)

---

## Phase 2 — GDELT pipeline

### 2.1 ZIP decompression (Issue 3)

- [x] Add `fflate` dependency
- [x] Rewrite `unzipBlob` to parse real ZIP archives via `unzipSync`
- [x] Add test with real ZIP fixture bytes

**Files:** `client/src/features/map/gdeltService.js`, `gdeltService.test.js`, `package.json`

### 2.2 CORS / mixed content (Issue 4)

- [x] Add `/api/gdelt` Vite dev proxy
- [x] Set `gdeltBaseUrl` to `/api/gdelt/gdeltv2` in dev, absolute URL in prod
- [x] Add `fetchBinaryWithProxy` in `fetchUtils.js` for production fetches
- [x] Route `fetchChunk` through dev proxy or binary proxy helper
- [x] Surface GDELT failures in `useDynamicHotspots` / map UI

**Files:** `api.ts`, `gdeltService.js`, `fetchUtils.js`, `vite.config.js`, `useDynamicHotspots.js`, `GlobalMap.jsx`

### Phase 2 verification

- [x] `npm test` passes (including ZIP fixture test)
- [ ] Emerging hotspots load in dev (manual smoke test)

---

## Phase 3 — Reliability & data quality

### 3.1 Feed concurrency (Issue 6)

- [x] Add `mapWithConcurrency` helper (limit 6)
- [x] Throttle `useDynamicRegions` feed fetches

**Files:** `client/src/utils/concurrency.js`, `client/src/hooks/useDynamicRegions.js`

### 3.2 Ticker validation (Issue 7)

- [x] Check `response.ok` and validate `price` / `prevClose` before math
- [x] Extract `parseYahooQuote` and add `useTickerData.test.js`

**Files:** `client/src/features/markets/useTickerData.js`, `useTickerData.test.js`

### 3.3 News list keys (Issue 8)

- [x] Use composite stable key in `NewsPanel`
- [x] Add `guid` to `parseRSS` output when present

**Files:** `client/src/features/news/NewsPanel.jsx`, `client/src/utils/fetchUtils.js`

### 3.4 Telemetry Content-Type (Issue 9)

- [x] Send `Blob` with `application/json` type via `sendBeacon`
- [x] Add `Content-Type` header on `fetch` fallback

**Files:** `client/src/utils/telemetry.js`

### Phase 3 verification

- [x] `npm test` passes
- [ ] No `NaN` tickers on bad Yahoo responses (manual smoke test)

---

## Phase 4 — Repo hygiene

### 4.1 Ignore Playwright artifacts (Issue 10)

- [x] Add `test-results/` and `playwright-report/` to `.gitignore` files
- [x] `client/test-results/` was never committed (untracked only)

**Files:** `.gitignore`, `client/.gitignore`

---

## Phase 5 — Test coverage & verification

### 5.1 Automated regression tests

- [x] `useTickerData.test.js` — `parseYahooQuote` validation (zero/NaN/Infinity guards)
- [x] `concurrency.test.js` — `mapWithConcurrency` order + in-flight limit
- [x] `telemetry.test.js` — JSON Blob beacon + fetch Content-Type
- [x] `translations.test.js` — Spanish `svgLabel`/`keyboardHint`, no duplicate map keys
- [x] `mapHelpers.test.js` — `safeClick`, drag behavior factory
- [x] `gdeltService.test.js` — `fetchGdeltEvents` throws when all chunks fail
- [x] `fetchUtils.test.js` — RSS `guid` extraction

### Phase 5 verification

- [x] `npm test` — 100/100 passing
- [x] `npm run verify` (lint + typecheck + test + build)

---

## Final verification (all phases)

- [x] `npm test` — 100/100 passing
- [x] `npm run typecheck`
- [x] `npm run verify` (full lint + build)
- [ ] Manual map smoke test in dev
- [x] `git status` shows no committed `test-results/` files