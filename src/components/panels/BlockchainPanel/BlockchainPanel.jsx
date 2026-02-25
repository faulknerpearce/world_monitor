import { useEffect, useState } from 'react'
import { fetchWithProxy } from '@utils/fetchUtils.js'
import { BlockchainFeedService } from '@services/feeds'
import { getTimeAgo } from '@utils/dateHelpers'
import './BlockchainPanel.css'

// Mock on-chain data
const MOCK_CHAIN_DATA = {
    btcHashrate: '512 EH/s',
    ethGas: '15 gwei',
    defiTvl: '$48.2B',
    nftVolume: '$12.4M',
}

const BlockchainPanel = () => {
    const [news, setNews] = useState([])
    const [chainData, setChainData] = useState(MOCK_CHAIN_DATA)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCryptoNews()
        fetchChainData()
        const newsInterval = setInterval(fetchCryptoNews, 5 * 60 * 1000)
        const dataInterval = setInterval(fetchChainData, 2 * 60 * 1000) // Update chain data every 2 minutes
        return () => {
            clearInterval(newsInterval)
            clearInterval(dataInterval)
        }
    }, [])

    const fetchChainData = async () => {
        try {
            const data = { ...MOCK_CHAIN_DATA }

            // BTC Hashrate from BTC.com API
            try {
                const btcResponse = await fetchWithProxy('https://chain.api.btc.com/v3/block/latest')
                const btcData = JSON.parse(btcResponse)
                if (btcData.data && btcData.data.extras && btcData.data.extras.avg_hashrate) {
                    const hashrate = btcData.data.extras.avg_hashrate / 1e18 // Convert to EH/s
                    data.btcHashrate = `${hashrate.toFixed(1)} EH/s`
                }
            } catch (e) {
                console.error('BTC hashrate fetch error:', e)
                data.btcHashrate = MOCK_CHAIN_DATA.btcHashrate
            }

            // ETH Gas from Etherscan (no API key needed for basic requests)
            try {
                const ethResponse = await fetchWithProxy('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
                const ethData = JSON.parse(ethResponse)
                if (ethData.result && ethData.result.ProposeGasPrice) {
                    data.ethGas = `${ethData.result.ProposeGasPrice} gwei`
                }
            } catch (e) {
                console.error('ETH gas fetch error:', e)
                data.ethGas = MOCK_CHAIN_DATA.ethGas
            }

            // DeFi TVL from DeFi Llama
            try {
                const defiResponse = await fetchWithProxy('https://api.llama.fi/tvl')
                const defiData = JSON.parse(defiResponse)
                const totalTvl = Object.values(defiData).reduce((sum, val) => sum + val, 0)
                data.defiTvl = `$${(totalTvl / 1e9).toFixed(1)}B`
            } catch (e) {
                console.error('DeFi TVL fetch error:', e)
                data.defiTvl = MOCK_CHAIN_DATA.defiTvl
            }

            // NFT Volume - using mock data (OpenSea API requires key)
            // TODO: Integrate with OpenSea API or similar for real NFT volume data
            data.nftVolume = MOCK_CHAIN_DATA.nftVolume

            setChainData(data)
        } catch (e) {
            console.error('Chain data fetch error:', e)
            setChainData(MOCK_CHAIN_DATA)
        }
    }

    const fetchCryptoNews = async () => {
        try {
            setLoading(true)
            const items = await BlockchainFeedService.fetchCryptoNews(15)
            setNews(items)
        } catch (e) {
            console.error('Crypto news fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    if (loading && news.length === 0) {
        return <div className="loading-msg">Loading blockchain data...</div>
    }

    return (
        <div className="blockchain-panel">
            <div className="chain-stats">
                <div className="chain-stat">
                    <span className="chain-stat-label">BTC Hashrate</span>
                    <span className="chain-stat-value">{chainData.btcHashrate}</span>
                </div>
                <div className="chain-stat">
                    <span className="chain-stat-label">ETH Gas</span>
                    <span className="chain-stat-value">{chainData.ethGas}</span>
                </div>
                <div className="chain-stat">
                    <span className="chain-stat-label">DeFi TVL</span>
                    <span className="chain-stat-value green">{chainData.defiTvl}</span>
                </div>
                <div className="chain-stat">
                    <span className="chain-stat-label">NFT 24h</span>
                    <span className="chain-stat-value">{chainData.nftVolume}</span>
                </div>
            </div>

            <div className="crypto-news">
                {news.map((item, idx) => (
                    <div key={idx} className="crypto-item">
                        <div className="crypto-source">{item.source}</div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="crypto-title">
                            {item.title}
                        </a>
                        <div className="crypto-time">{getTimeAgo(item.date)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BlockchainPanel
