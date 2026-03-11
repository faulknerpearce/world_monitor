import { StartupsFeedService } from './startupsFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { formatAmount, getTimeAgo } from '@utils'

// Recent major funding rounds (2025/2026)
const RECENT_FUNDING = [
    { company: 'Anthropic', amount: 6500, round: 'Series F', lead: 'Amazon', date: 'Jan 2026' },
    { company: 'Databricks', amount: 4200, round: 'Series I', lead: 'T. Rowe', date: 'Dec 2025' },
    { company: 'SpaceX', amount: 15000, round: 'Private', lead: 'Founders Fund', date: 'Dec 2025' },
    { company: 'Anduril', amount: 2800, round: 'Series F', lead: 'Valor', date: 'Nov 2025' },
    { company: 'CoreWeave', amount: 3500, round: 'Debt', lead: 'Blackstone', date: 'Nov 2025' },
    { company: 'Liquid AI', amount: 450, round: 'Series B', lead: 'Benchmark', date: 'Oct 2025' },
    { company: 'Scale AI', amount: 1200, round: 'Series G', lead: 'Accel', date: 'Oct 2025' },
    { company: 'Figure', amount: 850, round: 'Series C', lead: 'Parkway', date: 'Sep 2025' },
    { company: 'Groq', amount: 600, round: 'Series E', lead: 'BlackRock', date: 'Sep 2025' },
    { company: 'Lambda', amount: 500, round: 'Series C', lead: 'USV', date: 'Aug 2025' },
]

const StartupsPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => StartupsFeedService.fetchStartupNews(10),
        10 * 60 * 1000
    )

    // Calculate total raised from RECENT_FUNDING
    const totalRaisedVal = RECENT_FUNDING.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center py-2.5 px-4 bg-[rgba(16,185,129,0.05)] border-b border-[rgba(16,185,129,0.1)] shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('startups.totalRaised')}</span>
                    <span className="text-lg font-bold !text-[var(--green)]">{formatAmount(totalRaisedVal)}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('startups.deals')}</span>
                    <span className="text-lg font-bold">{RECENT_FUNDING.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading && news.length === 0 ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('startups.loading')}</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-col p-3.5 mb-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg no-underline transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[0.65rem] text-[var(--green)] uppercase font-bold tracking-[0.1em] group-hover:text-green-400 transition-colors duration-200">{item.source}</span>
                                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</span>
                            </div>
                            <span className="text-[0.85rem] text-text-primary leading-relaxed font-medium line-clamp-3 group-hover:text-green-400 transition-colors duration-200">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default StartupsPanel
