import { useEffect, useState, useContext } from 'react'
import { fetchWithProxy } from '@utils/fetchUtils.js'
import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useFeedData } from '@hooks/useFeedData'
import { RefreshContext } from '@context/RefreshContext'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo } from '@utils/dateHelpers'

// Mock on-chain data
const MOCK_CHAIN_DATA = {
    btcHashrate: '512 EH/s',
    ethGas: '15 gwei',
    defiTvl: '$48.2B',
    nftVolume: '$12.4M',
}

const fetchCryptoNews = createFeedFetcher('blockchain', 15)

const CryptoPanel = () => {
    const { data: news, loading } = useFeedData(fetchCryptoNews, 5 * 60 * 1000)
    const [chainData, setChainData] = useState(MOCK_CHAIN_DATA)
    const { refreshKey } = useContext(RefreshContext)
    const { t, locale } = useI18n()

    useEffect(() => {
        let cancelled = false

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
                }

                // DeFi TVL from DeFi Llama
                try {
                    const defiResponse = await fetchWithProxy('https://api.llama.fi/tvl')
                    const defiData = JSON.parse(defiResponse)
                    const totalTvl = Object.values(defiData).reduce((sum, val) => sum + val, 0)
                    data.defiTvl = `$${(totalTvl / 1e9).toFixed(1)}B`
                } catch (e) {
                    console.error('DeFi TVL fetch error:', e)
                }

                // NFT Volume - using mock data (OpenSea API requires key)
                // TODO: Integrate with OpenSea API or similar for real NFT volume data
                data.nftVolume = MOCK_CHAIN_DATA.nftVolume

                if (!cancelled) setChainData(data)
            } catch (e) {
                console.error('Chain data fetch error:', e)
                if (!cancelled) setChainData(MOCK_CHAIN_DATA)
            }
        }

        fetchChainData()
        const dataInterval = setInterval(fetchChainData, 2 * 60 * 1000) // Update chain data every 2 minutes
        return () => {
            cancelled = true
            clearInterval(dataInterval)
        }
        // `fetchChainData` is defined inline and would cause an infinite loop if
        // included in the deps array. `refreshKey` is intentionally included to force
        // a re-fetch when the user clicks the REFRESH button.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [refreshKey])

    if (loading && news.length === 0) {
        return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('blockchain.loading')}</div>
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-[rgba(245,158,11,0.05)] border-b border-[rgba(245,158,11,0.1)] max-[768px]:grid-cols-2 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.btcHashrate')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{chainData.btcHashrate}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.ethGas')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{chainData.ethGas}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.defiTvl')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)] !text-[#10b981]">{chainData.defiTvl}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.nft24h')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{chainData.nftVolume}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {news.map((item, idx) => (
                    <div key={idx} className="py-2.5 px-4 border-b border-[rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] last:border-b-0">
                        <div className="text-[0.7rem] text-[#f59e0b] font-semibold uppercase tracking-[0.08em] mb-0.5">{item.source}</div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-[0.85rem] text-text-primary no-underline leading-[1.4] transition-colors duration-200 hover:text-[#f59e0b]">
                            {item.title}
                        </a>
                        <div className="text-[0.7rem] text-text-dim mt-1 font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CryptoPanel
