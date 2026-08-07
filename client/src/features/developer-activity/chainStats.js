import { API } from '@config/api'
import { getGitHubHeaders, createCache } from '@utils/githubUtils'
import { formatNumber } from '@utils'
import { fetchWithProxy } from '@utils/fetchUtils'

const cache = createCache(15 * 60 * 1000) // 15-minute TTL

const safeFetch = async (url, options = {}) => {
  const key = url + JSON.stringify(options.body ?? '')
  if (cache.has(key)) return cache.get(key)
  const res = await fetch(url, { headers: { Accept: 'application/json' }, ...options })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
  const data = await res.json()
  cache.set(key, data)
  return data
}

/* ==================== TVL (DefiLlama) ==================== */
const fetchChainTVL = async (slug) => {
  try {
    const res = await fetch(`${API.defiLlamaTvl}/${slug}`)
    if (res.ok) {
      const tvl = parseFloat(await res.text())
      if (!isNaN(tvl)) return tvl
    }
  } catch {}
  const chains = await safeFetch(API.defiLlamaChains)
  const match = chains.find(c => c.name?.toLowerCase() === slug.toLowerCase())
  return match?.tvl ?? null
}

/* ==================== Node/Validator Counts ==================== */
const fetchAvaxValidators = async () => {
  console.debug('[validators] Fetching Avalanche validators from', API.avaxPChain)
  try {
    const data = await safeFetch(API.avaxPChain, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'platform.getCurrentValidators', params: {} }),
    })
    console.debug('[validators] Avalanche raw response:', data)
    const count = data?.result?.validators?.length ?? null
    console.debug('[validators] Avalanche validator count:', count)
    return count
  } catch (err) {
    console.error('[validators] Avalanche fetch failed:', err.message)
    throw err
  }
}

const KOIOS_POOL_PAGE_SIZE = 1000
const KOIOS_MAX_PAGES = 10

/**
 * Parse Koios PostgREST `Content-Range` (e.g. `0-999/2983`) for the total row count.
 * @param {string | null} contentRange
 * @returns {number | null}
 */
export const parseKoiosContentRangeTotal = (contentRange) => {
  if (!contentRange) return null
  const match = contentRange.match(/\/(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * @param {Array<unknown>} page
 * @returns {number}
 */
export const countKoiosPoolPage = (page) => {
  if (!Array.isArray(page)) return 0
  return page.length
}

const buildKoiosPoolUrl = (base, offset = 0) => (
  offset > 0 ? `${base}&limit=${KOIOS_POOL_PAGE_SIZE}&offset=${offset}` : base
)

const parseKoiosPoolPage = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Unexpected Koios response')
  }
  return countKoiosPoolPage(data)
}

const fetchKoiosRegisteredPoolPage = async (offset = 0) => {
  const proxiedUrl = buildKoiosPoolUrl(API.koiosRegisteredPools, offset)

  try {
    const res = await fetch(proxiedUrl, {
      headers: {
        Accept: 'application/json',
        Prefer: 'count=exact',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${proxiedUrl}`)

    const data = await res.json()
    return {
      pageCount: parseKoiosPoolPage(data),
      total: parseKoiosContentRangeTotal(res.headers.get('content-range')),
    }
  } catch (proxyErr) {
    const directUrl = buildKoiosPoolUrl(API.koiosRegisteredPoolsDirect, offset)
    console.debug('[validators] Koios proxy fetch failed, using CORS proxy:', proxyErr.message)
    const text = await fetchWithProxy(directUrl)
    const data = JSON.parse(text)
    return {
      pageCount: parseKoiosPoolPage(data),
      total: null,
    }
  }
}

const fetchCardanoPools = async () => {
  console.debug('[validators] Fetching Cardano stake pools from', API.koiosRegisteredPools)
  try {
    const firstPage = await fetchKoiosRegisteredPoolPage(0)
    if (firstPage.total != null) {
      console.debug('[validators] Cardano registered stake pools:', firstPage.total)
      return firstPage.total
    }

    let total = firstPage.pageCount
    for (let page = 1; page < KOIOS_MAX_PAGES; page += 1) {
      const offset = page * KOIOS_POOL_PAGE_SIZE
      const { pageCount } = await fetchKoiosRegisteredPoolPage(offset)
      if (pageCount === 0) break
      total += pageCount
      console.debug('[validators] Cardano stake pools page', page + 1, ':', pageCount)
      if (pageCount < KOIOS_POOL_PAGE_SIZE) break
    }

    console.debug('[validators] Cardano registered stake pools:', total)
    return total > 0 ? total : null
  } catch (err) {
    console.error('[validators] Cardano fetch failed:', err.message)
    throw err
  }
}

const fetchEthereumValidators = async () => {
  console.debug('[validators] Fetching Ethereum validators from', API.beaconEpochLatest)
  try {
    const data = await safeFetch(API.beaconEpochLatest)
    console.debug('[validators] Ethereum raw response:', data)
    const count = data?.data?.validatorscount ?? null
    console.debug('[validators] Ethereum validator count:', count)
    if (count === null) {
      console.warn('[validators] Ethereum: validatorscount missing — response shape:', JSON.stringify(data).slice(0, 300))
    }
    return count
  } catch (err) {
    console.error('[validators] Ethereum fetch failed:', err.message)
    throw err
  }
}

/* ==================== Total Commits ==================== */
const fetchRepoTotalCommits = async (owner, name) => {
  const url = `${API.github}/repos/${owner}/${name}/commits?per_page=1`
  const res = await fetch(url, { headers: getGitHubHeaders() })
  if (!res.ok) {
    console.warn(`GitHub commits HTTP ${res.status} for ${owner}/${name}`)
    return 0
  }
  const link = res.headers.get('Link')
  if (!link) {
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  }
  const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
  return match ? parseInt(match[1], 10) : 0
}

const fetchTotalCommits = async (repos) => {
  if (!Array.isArray(repos) || repos.length === 0) return null

  let total = 0
  for (const repoStr of repos) {
    const [owner, name] = repoStr.split('/')
    if (!owner || !name) continue
    try {
      total += await fetchRepoTotalCommits(owner, name)
    } catch (err) {
      console.warn(`GitHub commits failed for ${repoStr}:`, err.message)
    }
  }
  return total > 0 ? total : null
}

/* ==================== Chain Config ==================== */
export const CHAIN_CONFIG = {
  ethereum: {
    tvlSlug: 'ethereum',
    repos: [
      'ethereum/go-ethereum',   // Official execution client
      'sigp/lighthouse',        // Leading consensus client (~50% of validators)
      'prysmaticlabs/prysm'     // Major consensus client
    ],
    validatorLabel: 'validators',
    validatorFetcher: fetchEthereumValidators
  },
  cardano: {
    tvlSlug: 'cardano',
    repos: [
      'IntersectMBO/cardano-node',
      'IntersectMBO/cardano-ledger'
    ],
    validatorLabel: 'stake pools',
    validatorFetcher: fetchCardanoPools
  },
  avalanche: {
    tvlSlug: 'avalanche',
    repos: ['ava-labs/avalanchego'],
    validatorLabel: 'validators',
    validatorFetcher: fetchAvaxValidators
  }
}

/* ==================== Main Export ==================== */
export const fetchChainStats = async () => {
  const results = {}

  for (const [key, config] of Object.entries(CHAIN_CONFIG)) {
    console.log(`Fetching chain stats for ${key}...`)

    const [tvlRes, validatorsRes, commitsRes] = await Promise.allSettled([
      fetchChainTVL(config.tvlSlug),
      config.validatorFetcher(),
      fetchTotalCommits(config.repos)
    ])

    results[key] = {
      tvl: tvlRes.status === 'fulfilled' ? tvlRes.value : null,
      validators: validatorsRes.status === 'fulfilled' ? validatorsRes.value : null,
      totalCommits: commitsRes.status === 'fulfilled' ? commitsRes.value : null,
      validatorLabel: config.validatorLabel
    }
  }

  return results
}

/* ==================== Formatting ==================== */
export const formatTVL = (tvl) => {
  if (tvl === null || tvl === undefined) return null
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
  return `$${tvl.toLocaleString()}`
}

export const formatCount = (n) => {
  if (n === null || n === undefined) return null
  if (n >= 1e3) return formatNumber(n)
  return n.toLocaleString()
}
