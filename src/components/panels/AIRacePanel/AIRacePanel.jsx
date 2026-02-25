import { useEffect, useState } from 'react'
import { AIRaceFeedService } from '@services/feeds'
import { getTimeAgo } from '@utils/dateHelpers'
import './AIRacePanel.css'

// Key players in the AI race
const AI_PLAYERS = AIRaceFeedService.AI_PLAYERS

const AIRacePanel = () => {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNews()
        const interval = setInterval(fetchNews, 10 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchNews = async () => {
        try {
            setLoading(true)
            const items = await AIRaceFeedService.fetchAINews(10)
            setNews(items)
        } catch (e) {
            console.error('AI news fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

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
                    <div className="loading-msg">Loading AI news...</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="ai-news-item">
                            <span className="ai-news-source">{item.source}</span>
                            <span className="ai-news-title">{item.title}</span>
                            <span className="ai-news-time">{getTimeAgo(item.date)}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default AIRacePanel
