import { AIRaceFeedService } from './aiRaceFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'

// Key players in the AI race
const AI_PLAYERS = AIRaceFeedService.AI_PLAYERS

const AIRacePanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => AIRaceFeedService.fetchAINews(10),
        10 * 60 * 1000
    )

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Key Players Chips */}
            <div className="flex gap-2 overflow-x-auto pt-0.5 pb-3 mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {AI_PLAYERS.map((player) => (
                    <div
                        key={player.name}
                        className="ai-player-chip shrink-0 py-1 px-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs font-medium text-text-secondary transition-all duration-200 cursor-default flex items-center gap-1.5 hover:bg-[rgba(255,255,255,0.1)] hover:text-text-primary"
                        style={{ '--chip-color': player.color }}
                    >
                        {player.name}
                    </div>
                ))}
            </div>

            {/* News Feed */}
            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading && news.length === 0 ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('aiRace.loading')}</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-col p-3.5 mb-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg no-underline transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[0.65rem] text-[#22d3ee] font-bold uppercase tracking-[0.1em] group-hover:text-cyan-400 transition-colors duration-200">{item.source}</span>
                                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</span>
                            </div>
                            <span className="text-[0.85rem] text-text-primary leading-relaxed font-medium line-clamp-3 group-hover:text-cyan-400 transition-colors duration-200">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default AIRacePanel
