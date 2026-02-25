import { useEffect, useState } from 'react'
import { WarWatchFeedService } from '@services/feeds'
import { getTimeAgo } from '@utils/dateHelpers'
import './WarWatchPanel.css'

// Active conflict zones
const CONFLICT_ZONES = [
    { region: 'Ukraine', status: 'active', intensity: 'high' },
    { region: 'Gaza', status: 'active', intensity: 'high' },
    { region: 'Red Sea', status: 'active', intensity: 'medium' },
    { region: 'Myanmar', status: 'active', intensity: 'medium' },
    { region: 'Sudan', status: 'active', intensity: 'high' },
    { region: 'Syria', status: 'ongoing', intensity: 'low' },
]

const WarWatchPanel = () => {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNews()
        const interval = setInterval(fetchNews, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchNews = async () => {
        try {
            setLoading(true)
            const items = await WarWatchFeedService.fetchWarNews(15)
            setNews(items)
        } catch (e) {
            console.error('War news fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    if (loading && news.length === 0) {
        return <div className="loading-msg">Loading conflict data...</div>
    }

    return (
        <div className="warwatch-panel">
            <div className="conflict-zones">
                {CONFLICT_ZONES.map((zone, idx) => (
                    <div key={idx} className={`conflict-zone intensity-${zone.intensity}`}>
                        <span className="zone-indicator"></span>
                        <span className="zone-name">{zone.region}</span>
                        <span className="zone-intensity">{zone.intensity}</span>
                    </div>
                ))}
            </div>

            <div className="war-news">
                {news.map((item, idx) => (
                    <div key={idx} className="war-item">
                        <div className="war-source">{item.source}</div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="war-title">
                            {item.title}
                        </a>
                        <div className="war-time">{getTimeAgo(item.date)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WarWatchPanel
