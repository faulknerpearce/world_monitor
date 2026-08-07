/**
 * Centralised API endpoint configuration.
 * All external URLs live here so they are easy to audit and swap.
 */
export const API: Record<string, string> = {
  github: 'https://api.github.com',

  // Blockchain / on-chain data
  btcLatestBlock: 'https://chain.api.btc.com/v3/block/latest',
  ethGasOracle: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
  defiLlamaTvl: 'https://api.llama.fi/tvl',
  defiLlamaChains: 'https://api.llama.fi/v2/chains',

  // Chain validator / node APIs
  beaconEpochLatest: 'https://beaconcha.in/api/v1/epoch/latest',
  // Dev/preview: Vite proxies `/api/koios` → api.koios.rest (avoids browser CORS).
  koiosPoolList: '/api/koios/api/v1/pool_list',
  /** PostgREST filter for live stake pools (Koios uses `registered`, not `active`). */
  koiosRegisteredPools: '/api/koios/api/v1/pool_list?pool_status=eq.registered',
  /** Direct Koios URL used when the same-origin proxy is unavailable (static hosting). */
  koiosRegisteredPoolsDirect: 'https://api.koios.rest/api/v1/pool_list?pool_status=eq.registered',
  avaxPChain: 'https://api.avax.network/ext/P',

  // Topojson map data
  worldAtlas: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
  usAtlas: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',

  // GDELT (Global Database of Events, Language, and Tone)
  // Dev: Vite proxy at /api/gdelt avoids mixed-content + CORS.
  // Prod: absolute URL fetched via fetchBinaryWithProxy in gdeltService.
  gdeltBaseUrl: import.meta.env.DEV
    ? '/api/gdelt/gdeltv2'
    : 'http://data.gdeltproject.org/gdeltv2',
}

// Tuning knobs for the GDELT client. Kept here so they are easy to find
// and change in one place.
export const GDELT_REFRESH_MS = 15 * 60 * 1000
export const GDELT_MAX_EVENTS = 150
export const GDELT_CLUSTER_RADIUS_KM = 150
export const GDELT_DEDUP_RADIUS_KM = 250

