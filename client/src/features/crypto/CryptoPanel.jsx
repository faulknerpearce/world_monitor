import { memo } from 'react'
import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useFeedData } from '@hooks/useFeedData'
import { useChainData } from '@hooks/useChainData'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo } from '@utils'

const fetchCryptoNews = createFeedFetcher('blockchain', 15)

const CryptoPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading: newsLoading } = useFeedData(fetchCryptoNews, 5 * 60 * 1000)
    const { btcHashrate, ethGas, defiTvl, nftVolume } = useChainData(2 * 60 * 1000)

    if (newsLoading && news.length === 0) {
        return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('blockchain.loading')}</div>
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-[rgba(245,158,11,0.05)] border-b border-[rgba(245,158,11,0.1)] max-[768px]:grid-cols-2 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.btcHashrate')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{btcHashrate}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.ethGas')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{ethGas}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.defiTvl')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)] !text-[var(--emerald)]">{defiTvl}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.05em]">{t('blockchain.nft24h')}</span>
                    <span className="text-[0.7rem] font-semibold text-text-primary font-[family-name:var(--font-mono)]">{nftVolume}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {news.map((item) => (
                    <div key={item.link} className="py-2.5 px-4 border-b border-[rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] last:border-b-0">
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

export default memo(CryptoPanel)
