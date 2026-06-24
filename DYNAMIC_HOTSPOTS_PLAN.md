# Dynamic Hotspots Feature Plan

## Overview

Replace hardcoded hotspot positions with event-driven markers that appear, update in intensity, and disappear based on real-world news events — without requiring a backend.

The app currently has two layers of dynamism that are easy to conflate:

- **Severity** is dynamic — `useDynamicRegions` updates it every 10 minutes based on RSS volume
- **Location** is completely static — every lat/lon lives in `client/src/config/regions.js` and never changes

This feature adds a third layer: **emerging hotspots** — markers that appear when news events happen in places not covered by `client/src/config/regions.js`, and disappear when coverage drops off.

---

## Data Source: GDELT Project

GDELT (Global Database of Events, Language, and Tone) monitors global news every 15 minutes, processes each story into a structured event, and publishes the results as bulk CSV files at predictable URLs. There is no queryable REST API — filtering happens client-side after download. Each CSV record includes:

| Field | Description |
|---|---|
| `ActionGeo_Lat` / `ActionGeo_Long` | Exact coordinates |
| `ActionGeo_FullName` | Human-readable location (e.g., "Khartoum, Sudan") |
| `GoldsteinScale` | Conflict intensity (-10 most destabilising, +10 stabilising) |
| `QuadClass` | Event category (3 = Verbal Conflict, 4 = Material Conflict) |
| `NumMentions` | How many news sources reported it |
| `Actor1Name` / `Actor2Name` | Who's involved |

**Access model**: GDELT publishes tab-separated CSV files every 15 minutes at `http://data.gdeltproject.org/gdeltv2/YYYYMMDDHHMMSS.export.CSV.zip`. For 24 hours of data, ~96 files must be downloaded, unzipped, parsed, and filtered in the browser. The files are small (~1-2 MB compressed each), and the 15-minute cache means this bulk fetch only happens once per cycle. The existing `fetchWithProxy` utility handles CORS — no backend needed.

---

## Implementation Phases

### Phase 1 — GDELT Service
**File:** `client/src/features/map/gdeltService.js` *(create)*

A pure service module (no React) that:

- Generates the list of 15-minute chunk filenames for the last 24 hours (`YYYYMMDDHHMMSS.export.CSV.zip`) — ~96 files
- Downloads each chunk from `http://data.gdeltproject.org/gdeltv2/` via `fetchWithProxy`, unzips, and parses the tab-separated CSV
- Filters rows client-side to `QuadClass ≥ 3`, `GoldsteinScale < -3`, and `NumMentions ≥ 3`
- Normalises each record into the app's existing hotspot schema: `{ id, lat, lon, name, severity, description, actors, mentionCount }`
- Maps GoldsteinScale to severity: below -7 = critical, below -4 = high, below 0 = elevated
- Caps the response at 150 events (by mention count, descending) so client-side processing stays fast
- Caches results for 15 minutes using the existing `createCache` factory from `client/src/utils/githubUtils.js`

The GDELT base URL constant is added to `client/src/config/api.js`. A lightweight CSV parser is included in the same module (the GDELT format is tab-separated with no quoted fields, so a simple `split('\t')` per line suffices — no library needed).

---

### Phase 2 — Geographic Clustering
**File:** `client/src/utils/geoUtils.js` *(create)*

A standalone utility module with two functions:

**`haversineDistance(lat1, lon1, lat2, lon2)`** — returns distance in km. Reusable for future features.

**`clusterPoints(points, radiusKm)`** — greedy clustering algorithm:
- Iterates points in descending mention-count order
- Groups any unassigned point within `radiusKm` (~150 km) of the current seed into the same cluster
- Returns one object per cluster: weighted centroid lat/lon, dominant severity, combined mention count, and the most prominent actor names

**Deduplication rule** — before returning clusters, each one is compared against every static hotspot in `client/src/config/regions.js` (all exported arrays: `INTEL_HOTSPOTS`, `HOTSPOTS`, `US_HOTSPOTS`, `CONFLICT_ZONES`, `MILITARY_BASES`, `NUCLEAR_FACILITIES`, `UNDERSEA_CABLES`, and `CYBER_REGIONS`). If the centroid is within 250 km of an existing static hotspot, the cluster is dropped. That area is already covered; GDELT data there will continue to influence severity via `useDynamicRegions`. Only genuinely new geographic areas produce new markers.

---

### Phase 3 — React Hook
**File:** `client/src/hooks/useDynamicHotspots.js` *(create)*

Wraps the GDELT service for use in the component tree:

- Calls `gdeltService` on mount and on a 15-minute interval (matching GDELT's update cadence)
- Returns `{ emergingHotspots, loading, lastUpdated }`
- Each item in `emergingHotspots` carries `source: 'gdelt'` and `emerging: true` flags so downstream code can distinguish them from static hotspots
- Falls back to an empty array on any fetch/parse failure — the existing static layer is unaffected

This hook is intentionally separate from `useDynamicRegions`. They manage orthogonal concerns: one handles severity of fixed points, the other manages the existence and location of new points.

---

### Phase 4 — Map Rendering
**File:** `client/src/features/map/GlobalMap.jsx` *(modify)*

A new D3 layer is drawn after the intel hotspots layer (currently the last rendered layer, at the top of the z-order), so emerging markers appear on top of all existing layers.

**Marker design** — visually distinct from static hotspots:
- Same base circle geometry, but **orange** (use the existing `var(--orange)` CSS variable, `#ff6b35`, which is already defined in the codebase) instead of red/amber/green
- Faster pulse animation (`hotspot-fast-pulse`, ~1.2s vs the current 2s) to convey recency
- Label prefixed with `⚡` to signal it's an emerging event
- A small `NEW` badge that fades out after 30 minutes (using the marker's `firstSeen` timestamp)

**Interaction** — consistent with existing hotspots:
- Hover shows a tooltip with mention count and dominant actors
- Click opens the existing `HotspotModal` populated with GDELT data

**Visibility** — respects the same 3D hemisphere clipping as existing markers.

---

### Phase 5 — Layer Toggle
**File:** `client/src/features/map/MapLayerControls.jsx` *(modify)*

Add an `EMERGING` button to the Layers grid alongside INTEL, WATCH, CONFLICT, etc. Styled in orange to match the marker colour. Controls a new `layerVisibility.emergingHotspots` boolean — the pattern is identical to every other layer toggle.

---

### Phase 6 — CSS + i18n

**`client/tailwind.config.js`** — add a `hotspot-fast-pulse` keyframe under `theme.extend.keyframes` (faster timing variant of the existing `pulse-ring` keyframe), and a corresponding animation utility under `theme.extend.animation`.

**`client/src/app/index.css`** — add a `.hotspot-fast-pulse` CSS class that uses the new animation (following the same pattern as the existing `.hotspot-pulse` class which references `pulse-ring`).

**`client/src/i18n/translations.js`** — add `map.emerging` key for the layer button label. Must be added to the `shared` base object and propagated to all 6 supported languages (`en`, `es`, `pt`, `fr`, `it`, `de`).

---

## Files Changed

| File | Action | Reason |
|---|---|---|
| `client/src/features/map/gdeltService.js` | **Create** | GDELT CSV download, parse, filter, and normalise |
| `client/src/utils/geoUtils.js` | **Create** | Haversine distance + greedy clustering |
| `client/src/hooks/useDynamicHotspots.js` | **Create** | React hook managing fetch/refresh cycle |
| `client/src/config/api.js` | Modify | Add GDELT base URL constant |
| `client/src/features/map/GlobalMap.jsx` | Modify | Render the new emerging hotspot layer |
| `client/src/features/map/MapLayerControls.jsx` | Modify | Add EMERGING layer toggle button |
| `client/src/app/index.css` | Modify | Add `hotspot-fast-pulse` keyframe animation |
| `client/src/i18n/translations.js` | Modify | Add `map.emerging` i18n key (6 languages) |

---

## Severity Mapping

| GoldsteinScale | Severity |
|---|---|
| < -7 | critical |
| -7 to -4 | high |
| -4 to 0 | elevated |
| ≥ 0 | filtered out (not destabilising) |

---

## Tradeoffs

**GDELT noise** — GDELT captures minor local incidents alongside major geopolitical events. The `GoldsteinScale < -3`, `NumMentions ≥ 3`, and 150 km clustering filters reduce noise substantially but won't eliminate it entirely. The 250 km deduplication radius keeps areas already in `client/src/config/regions.js` clean.

**No backend** — All GDELT processing happens in the browser: downloading ~96 small CSV files, parsing, filtering, and clustering. With a 150-event cap and a 15-minute cache, the computational overhead is acceptable (~5 ms for clustering; network cost depends on GDELT chunk sizes, typically 1-2 MB compressed per file).

**CORS proxy dependency** — Same tradeoff the existing RSS feeds already accept. If `corsproxy.io` is down, emerging hotspots degrade gracefully to zero rather than breaking the map. The `fetchWithProxy` utility in `client/src/utils/fetchUtils.js` centralises this, so the same fallback applies.
