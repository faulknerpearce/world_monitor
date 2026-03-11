import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { formatAmount, getTimeAgo } from '@utils'

// Recent major VC fund raises (2025/2026)
const RECENT_FUNDS = [
    { firm: 'Andreessen Horowitz', fund: 'Crypto Fund V', amount: 4500, date: 'Jan 2026' },
    { firm: 'Sequoia Capital', fund: 'Growth Fund X', amount: 3200, date: 'Jan 2026' },
    { firm: 'Founders Fund', fund: 'Fund IX', amount: 1800, date: 'Dec 2025' },
    { firm: 'Insight Partners', fund: 'Fund XIII', amount: 12500, date: 'Dec 2025' },
    { firm: 'Lightspeed', fund: 'Global Opportunity II', amount: 6200, date: 'Nov 2025' },
    { firm: 'Paradigm', fund: 'Paradigm Two', amount: 2500, date: 'Nov 2025' },
    { firm: 'Accel', fund: 'Global Growth VII', amount: 4000, date: 'Oct 2025' },
    { firm: 'Index Ventures', fund: 'Growth VI', amount: 2800, date: 'Oct 2025' },
    { firm: 'Khosla Ventures', fund: 'Main Fund IX', amount: 1800, date: 'Sep 2025' },
    { firm: 'Greycroft', fund: 'Core Fund VII', amount: 950, date: 'Aug 2025' },
]

const VC_STATS = {
    totalRaised: 40250, // Total capital raised by VCs
    funds: 42, // Number of funds closed
}

const fetchVCNews = createFeedFetcher('vc', 10)

const VCPanel = () => {
    const { t, locale } = useI18n()
    const { data: vcNews, loading } = useFeedData(fetchVCNews, 10 * 60 * 1000)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center py-2.5 px-4 bg-[rgba(139,92,246,0.05)] border-b border-[rgba(139,92,246,0.1)] shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('vc.capitalRaised')}</span>
                    <span className="text-lg font-bold !text-[#a78bfa]">{formatAmount(VC_STATS.totalRaised)}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('vc.fundsClosed')}</span>
                    <span className="text-lg font-bold">{VC_STATS.funds}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading && vcNews.length === 0 ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('vc.loading')}</div>
                ) : (
                    vcNews.map((news, idx) => (
                        <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="flex flex-col p-3.5 mb-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg no-underline transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[0.65rem] text-[var(--purple)] uppercase font-bold tracking-[0.1em] group-hover:text-purple-400 transition-colors duration-200">{news.source}</span>
                                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(news.date, locale)}</span>
                            </div>
                            <span className="text-[0.85rem] text-text-primary leading-relaxed font-medium line-clamp-3 group-hover:text-purple-400 transition-colors duration-200">{news.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default VCPanel
