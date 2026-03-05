import { fetchWithProxy } from '@utils/fetchUtils'

// Chain configurations with API endpoints and repository info
export const CHAIN_CONFIG = {
    ethereum: {
        name: 'Ethereum',
        color: '#627eea',
        slug: 'ethereum',
        githubRepos: [
            { owner: 'ethereum', repo: 'go-ethereum' },
            { owner: 'ethereum', repo: 'solidity' },
            { owner: 'ethereum', repo: 'ethereum-org-website' },
        ],
        tvlApi: 'https://api.llama.fi/tvl/ethereum',
        validatorsApi: 'https://beaconcha.in/api/v1/validators/count',
    },
    cardano: {
        name: 'Cardano',
        color: '#0033ad',
        slug: 'cardano',
        githubRepos: [
            { owner: 'IntersectMBO', repo: 'cardano-node' },
            { owner: 'input-output-hk', repo: 'plutus' },
            { owner: 'input-output-hk', repo: 'ouroboros-network' },
        ],
        tvlApi: 'https://api.llama.fi/tvl/cardano',
        koiosApi: 'https://api.koios.rest/api/v1/pool_list',
    },
    avalanche: {
        name: 'Avalanche',
        color: '#e84142',
        slug: 'avalanche',
        githubRepos: [
            { owner: 'ava-labs', repo: 'avalanchego' },
            { owner: 'ava-labs', repo: 'subnet-evm' },
            { owner: 'ava-labs', repo: 'avalanche-docs' },
        ],
        tvlApi: 'https://api.llama.fi/tvl/avalanche',
        rpcApi: 'https://api.avax.network/ext/P',
    },
}

/**
 * Fetch TVL from DefiLlama API
 * Returns TVL in USD
 */
export const fetchChainTVL = async (chainSlug) => {
    try {
        const response = await fetchWithProxy(`https://api.llama.fi/tvl/${chainSlug}`)
        const tvl = parseFloat(response)
        return isNaN(tvl) ? 0 : tvl
    } catch (error) {
        console.error(`Error fetching TVL for ${chainSlug}:`, error)
        return 0
    }
}

/**
 * Fetch GitHub commit activity for a repository
 * Returns total commits in the last year
 */
export const fetchRepoCommits = async (owner, repo) => {
    try {
        const response = await fetchWithProxy(
            `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`
        )
        const data = JSON.parse(response)
        
        if (!Array.isArray(data)) return 0
        
        // Sum all commits from the last 52 weeks
        const totalCommits = data.reduce((sum, week) => sum + (week.total || 0), 0)
        return totalCommits
    } catch (error) {
        console.error(`Error fetching commits for ${owner}/${repo}:`, error)
        return 0
    }
}

/**
 * Fetch total commits across all configured repos for a chain
 */
export const fetchChainCommits = async (chainKey) => {
    const config = CHAIN_CONFIG[chainKey]
    if (!config) return 0
    
    const commitPromises = config.githubRepos.map(({ owner, repo }) => 
        fetchRepoCommits(owner, repo)
    )
    
    const results = await Promise.all(commitPromises)
    return results.reduce((sum, commits) => sum + commits, 0)
}

/**
 * Fetch Ethereum validator count from Beaconcha.in
 */
export const fetchEthereumValidators = async () => {
    try {
        const response = await fetchWithProxy('https://beaconcha.in/api/v1/validators/count')
        const data = JSON.parse(response)
        
        if (data.status === 'OK' && data.data) {
            return data.data.total || 0
        }
        return 0
    } catch (error) {
        console.error('Error fetching Ethereum validators:', error)
        return 0
    }
}

/**
 * Fetch Cardano stake pool count from Koios API
 */
export const fetchCardanoPools = async () => {
    try {
        const response = await fetchWithProxy('https://api.koios.rest/api/v1/pool_list')
        const data = JSON.parse(response)
        
        if (Array.isArray(data)) {
            // Filter out retired pools
            const activePools = data.filter(pool => pool.retiring_epoch === null)
            return activePools.length
        }
        return 0
    } catch (error) {
        console.error('Error fetching Cardano pools:', error)
        return 0
    }
}

/**
 * Fetch Avalanche validator count from P-Chain RPC
 */
export const fetchAvalancheValidators = async () => {
    try {
        const response = await fetchWithProxy('https://api.avax.network/ext/P', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'platform.getCurrentValidators',
                params: {},
            }),
        })
        
        const data = JSON.parse(response)
        
        if (data.result && Array.isArray(data.result.validators)) {
            return data.result.validators.length
        }
        return 0
    } catch (error) {
        console.error('Error fetching Avalanche validators:', error)
        return 0
    }
}

/**
 * Fetch node/validator count for a specific chain
 */
export const fetchChainValidators = async (chainKey) => {
    switch (chainKey) {
        case 'ethereum':
            return fetchEthereumValidators()
        case 'cardano':
            return fetchCardanoPools()
        case 'avalanche':
            return fetchAvalancheValidators()
        default:
            return 0
    }
}

/**
 * Fetch all metrics for a chain
 */
export const fetchChainMetrics = async (chainKey) => {
    const config = CHAIN_CONFIG[chainKey]
    if (!config) return null
    
    const [tvl, commits, validators] = await Promise.all([
        fetchChainTVL(config.slug),
        fetchChainCommits(chainKey),
        fetchChainValidators(chainKey),
    ])
    
    return {
        tvl,
        commits,
        validators,
    }
}

/**
 * Fetch metrics for all configured chains
 */
export const fetchAllChainMetrics = async () => {
    const chainKeys = Object.keys(CHAIN_CONFIG)
    const metricsPromises = chainKeys.map(key => fetchChainMetrics(key))
    const results = await Promise.all(metricsPromises)
    
    return chainKeys.reduce((acc, key, index) => {
        acc[key] = results[index]
        return acc
    }, {})
}

export default {
    CHAIN_CONFIG,
    fetchChainTVL,
    fetchChainCommits,
    fetchChainValidators,
    fetchChainMetrics,
    fetchAllChainMetrics,
}
