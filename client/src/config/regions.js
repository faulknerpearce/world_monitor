// Barrel for the regions dataset. Splits the original 853-line `regions.js`
// into focused modules under `./regions/` so that each concern (US cities,
// infrastructure, military bases, cyber regions, dynamic hotspots) lives
// on its own. The path `@config/regions` (and its sub-paths used by
// `GlobalMap`, `useDynamicRegions`, and `WarWatchPanel`) continues to work
// unchanged because Vite resolves `@config/regions` → this file.

export { REGIONS } from './regions/regions'
export { INTEL_HOTSPOTS } from './regions/hotspots'
export { US_CITIES } from './regions/us'
export {
  SHIPPING_CHOKEPOINTS,
  NUCLEAR_FACILITIES,
  UNDERSEA_CABLES,
} from './regions/infrastructure'
export { MILITARY_BASES } from './regions/military'
export { CYBER_REGIONS } from './regions/cyber'
export {
  HOTSPOTS,
  US_HOTSPOTS,
  CONFLICT_ZONES,
} from './regions/dynamic'
