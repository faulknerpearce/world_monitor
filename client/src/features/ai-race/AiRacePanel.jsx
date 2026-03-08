import { AIRaceFeedService } from './aiRaceFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'
import './AiRacePanel.css'

// Key players in the AI race
const AI_PLAYERS = AIRaceFeedService.AI_PLAYERS

const AIRacePanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => AIRaceFeedService.fetchAINews(10),
        10 * 60 * 1000
    )

    return (
        <div className="ai-panel">
            {/* Key Players Chips */}
            <div className="ai-players">
                {AI_PLAYERS.map((player) => (
                    <div
                        key={player.name}
                        className="ai-player-chip"
                        style={{ '--chip-color': player.color }}
                    >
                        {player.name}
                    </div>
                ))}
            </div>

            {/* News Feed */}
            <div className="ai-news">
                {loading && news.length === 0 ? (
                    <div className="loading-msg">{t('aiRace.loading')}</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="ai-news-item">
                            <span className="ai-news-source">{item.source}</span>
                            <span className="ai-news-title">{item.title}</span>
                            <span className="ai-news-time">{getTimeAgo(item.date, locale)}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default AIRacePanel
