import { GoodNewsFeedService } from './goodNewsFeedService'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'
import './GoodNewsPanel.css'

// Positive stats
const POSITIVE_STATS = [
    { label: 'Global Poverty', value: '-50%', detail: 'since 2000' },
    { label: 'Renewable Energy', value: '+300%', detail: 'since 2010' },
    { label: 'Child Mortality', value: '-59%', detail: 'since 1990' },
]

const GoodNewsPanel = () => {
    const { data: news, loading } = useFeedData(
        () => GoodNewsFeedService.fetchGoodNews(12),
        10 * 60 * 1000
    )

    if (loading && news.length === 0) {
        return <div className="loading-msg">Loading good news...</div>
    }

    return (
        <div className="goodnews-panel">
            <div className="positive-stats">
                {POSITIVE_STATS.map((stat, idx) => (
                    <div key={idx} className="positive-stat">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-detail">{stat.detail}</span>
                    </div>
                ))}
            </div>

            <div className="good-news-list">
                {news.map((item, idx) => (
                    <div key={idx} className="good-item">
                        <span className="good-emoji">✨</span>
                        <div className="good-content">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="good-title">
                                {item.title}
                            </a>
                            <div className="good-meta">
                                <span className="good-source">{item.source}</span>
                                <span className="good-time">{getTimeAgo(item.date)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GoodNewsPanel
