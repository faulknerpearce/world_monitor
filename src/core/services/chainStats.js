// https://beaconcha.in/api/v1/epoch/latest  →  data.validatorscount
const BEACON_EPOCH_LATEST = 'https://beaconcha.in/api/v1/epoch/latest'
const DEFI_LLAMA_CHAINS = 'https://api.llama.fi/v2/chains'
const KOIOS_POOL_LIST = 'https://api.koios.rest/api/v1/pool_list'
const AVAX_P_CHAIN = 'https://api.avax.network/ext/P'

const cache = new Map()
const TTL = 15 * 60 * 1000 // 15 minutes

const safeFetch = async (url, options = {}) => {
    const key = url + JSON.stringify(options.body ?? '')
    const hit = cache.get(key)
    if (hit && Date.now() - hit.ts < TTL) return hit.data
    const res = await fetch(url, { headers: { Accept: 'application/json' }, ...options })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    cache.set(key, { data, ts: Date.now() })
    return data
}

/**
 * Fetch TVL for a single chain. Tries the per-chain endpoint first
 * (returns a plain-text number), then falls back to the /v2/chains
 * bulk endpoint if needed.
 */
const fetchChainTVL = async (slug) => {
    try {
        const res = await fetch(`https://api.llama.fi/tvl/${slug}`)
        if (res.ok) {
            const tvl = parseFloat(await res.text())
            if (!isNaN(tvl)) return tvl
        }
    } catch {
        // fall through to bulk endpoint
    }
    // Fallback: pull from the bulk /v2/chains response
    const chains = await safeFetch(DEFI_LLAMA_CHAINS)
    if (Array.isArray(chains)) {
        const match = chains.find(
            c => c.name?.toLowerCase() === slug.toLowerCase()
        )
        if (match && typeof match.tvl === 'number') return match.tvl
    }
    return null
}

const fetchAvaxValidators = async () => {
    const data = await safeFetch(AVAX_P_CHAIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'platform.getCurrentValidators',
            params: {},
        }),
    })
    return data?.result?.validators?.length ?? null
}

const fetchCardanoPools = async () => {
    const data = await safeFetch(KOIOS_POOL_LIST)
    if (!Array.isArray(data)) return null
    // pool_status is "active" | "retiring" | "retired"; count only active pools
    const active = data.filter(p => p.pool_status === 'active')
    return active.length
}

export const fetchChainStats = async () => {
    const [ethTvl, adaTvl, avaxTvl, beacon, cardano, avax] = await Promise.allSettled([
        fetchChainTVL('ethereum'),
        fetchChainTVL('cardano'),
        fetchChainTVL('avalanche'),
        safeFetch(BEACON_EPOCH_LATEST),
        fetchCardanoPools(),
        fetchAvaxValidators(),
    ])

    const ethValidators =
        beacon.status === 'fulfilled'
            ? (beacon.value?.data?.validatorscount ?? null)
            : null

    const cardanoPools =
        cardano.status === 'fulfilled' ? cardano.value : null

    const avaxValidators =
        avax.status === 'fulfilled' ? avax.value : null

    return {
        ethereum: {
            tvl: ethTvl.status === 'fulfilled' ? ethTvl.value : null,
            validators: ethValidators,
            validatorLabel: 'validators',
        },
        cardano: {
            tvl: adaTvl.status === 'fulfilled' ? adaTvl.value : null,
            validators: cardanoPools,
            validatorLabel: 'stake pools',
        },
        avalanche: {
            tvl: avaxTvl.status === 'fulfilled' ? avaxTvl.value : null,
            validators: avaxValidators,
            validatorLabel: 'validators',
        },
    }
}

export const formatTVL = (tvl) => {
    if (tvl === null || tvl === undefined) return null
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    return `$${tvl.toLocaleString()}`
}

export const formatCount = (n) => {
    if (n === null || n === undefined) return null
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return n.toLocaleString()
}
