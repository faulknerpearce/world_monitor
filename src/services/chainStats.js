const DEFI_LLAMA_CHAINS = 'https://api.llama.fi/v2/chains'
const BEACON_VALIDATORS = 'https://beaconcha.in/api/v1/epoch/latest'
const KOIOS_POOL_LIST = 'https://api.koios.rest/api/v1/pool_list'
const AVAX_P_CHAIN = 'https://api.avax.network/ext/bc/P'

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
    // Koios pool_list returns all pools; count them
    const data = await safeFetch(KOIOS_POOL_LIST)
    return Array.isArray(data) ? data.length : null
}

export const fetchChainStats = async () => {
    const [llama, beacon, cardano, avax] = await Promise.allSettled([
        safeFetch(DEFI_LLAMA_CHAINS),
        safeFetch(BEACON_VALIDATORS),
        fetchCardanoPools(),
        fetchAvaxValidators(),
    ])

    const tvlByName = {}
    if (llama.status === 'fulfilled' && Array.isArray(llama.value)) {
        for (const chain of llama.value) {
            if (chain.name && typeof chain.tvl === 'number') {
                tvlByName[chain.name] = chain.tvl
            }
        }
    }

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
            tvl: tvlByName['Ethereum'] ?? null,
            validators: ethValidators,
            validatorLabel: 'validators',
        },
        cardano: {
            tvl: tvlByName['Cardano'] ?? null,
            validators: cardanoPools,
            validatorLabel: 'stake pools',
        },
        avalanche: {
            tvl: tvlByName['Avalanche'] ?? null,
            validators: avaxValidators,
            validatorLabel: 'validators',
        },
    }
}

export const formatTVL = (tvl) => {
    if (tvl == null) return null
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    return `$${tvl.toLocaleString()}`
}

export const formatCount = (n) => {
    if (n == null) return null
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return n.toLocaleString()
}
