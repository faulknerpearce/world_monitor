import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'

// Active conflict zones
const CONFLICT_ZONES = [
    { region: 'Ukraine', status: 'active', intensity: 'high' },
    { region: 'Gaza', status: 'active', intensity: 'high' },
    { region: 'Red Sea', status: 'active', intensity: 'medium' },
    { region: 'Myanmar', status: 'active', intensity: 'medium' },
    { region: 'Sudan', status: 'active', intensity: 'high' },
    { region: 'Syria', status: 'ongoing', intensity: 'low' },
]

const fetchWarNews = createFeedFetcher('warWatch', 15)

const WarWatchPanel = () => {
    const { data: news, loading } = useFeedData(fetchWarNews, 5 * 60 * 1000)
    const { t, locale } = useI18n()

    if (loading && news.length === 0) {
        return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('warwatch.loading')}</div>
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-1.5 py-2.5 px-4 bg-[rgba(239,68,68,0.05)] border-b border-[rgba(239,68,68,0.1)] shrink-0">
                {CONFLICT_ZONES.map((zone, idx) => (
                    <div key={idx} className={`intensity-${zone.intensity} flex items-center gap-1 py-0.5 px-2 bg-[rgba(0,0,0,0.3)] rounded-[3px] border border-[rgba(255,255,255,0.05)]`}>
                        <span className="zone-indicator w-[5px] h-[5px] rounded-full"></span>
                        <span className="text-[0.6rem] text-text-primary font-semibold">{zone.region}</span>
                        <span className="text-[0.45rem] text-text-dim uppercase">{t(`intensity.${zone.intensity}`)}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {news.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-3.5 mb-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg transition-all duration-200 hover:bg-[rgba(239,68,68,0.04)] hover:border-[rgba(239,68,68,0.2)] hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-muted group-hover:text-red-400 transition-colors duration-200">{item.source}</span>
                            <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</span>
                        </div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-text-primary text-[0.85rem] font-medium leading-relaxed no-underline transition-colors duration-200 hover:text-red-400 line-clamp-3">
                            {item.title}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WarWatchPanel
