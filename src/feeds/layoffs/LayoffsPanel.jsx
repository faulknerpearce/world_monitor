import { LayoffsFeedService } from './layoffsFeedService'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils'
import { formatCount } from '@services/chainStats'
import './LayoffsPanel.css'

// Real recent major layoffs (2025/2026)
const RECENT_LAYOFFS = [
    { company: 'Meta', count: 12000, date: 'Jan 2026' },
    { company: 'Google', count: 8500, date: 'Jan 2026' },
    { company: 'Amazon', count: 11000, date: 'Dec 2025' },
    { company: 'Goldman Sachs', count: 3200, date: 'Dec 2025' },
    { company: 'Salesforce', count: 4500, date: 'Nov 2025' },
    { company: 'Spotify', count: 1500, date: 'Nov 2025' },
    { company: 'Tesla', count: 6500, date: 'Oct 2025' },
    { company: 'Intel', count: 5000, date: 'Oct 2025' },
    { company: 'Oracle', count: 3000, date: 'Sep 2025' },
    { company: 'IBM', count: 4200, date: 'Sep 2025' },
]

// Mock stats for the header
const LAYOFF_STATS = {
    total2026: 45000, // Jan 2026 MTD
    companies: 42,
}

const LayoffsPanel = () => {
    const { data: news, loading } = useFeedData(
        () => LayoffsFeedService.fetchLayoffsNews(10),
        15 * 60 * 1000
    )

    return (
        <div className="layoffs-panel">
            <div className="layoffs-header-stats">
                <span className="stat-item">
                    <span className="stat-label">Total Affected</span>
                    <span className="stat-value red">{formatCount(LAYOFF_STATS.total2026)}</span>
                </span>
                <span className="stat-item">
                    <span className="stat-label">Events</span>
                    <span className="stat-value">{LAYOFF_STATS.companies}</span>
                </span>
            </div>

            <div className="layoffs-news-container">
                {loading ? (
                    <div className="loading-msg">Loading layoff news...</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="layoff-news-item">
                            <div className="layoff-news-header">
                                <span className="layoff-news-source">{item.source}</span>
                                <span className="layoff-news-time">{getTimeAgo(item.date)}</span>
                            </div>
                            <span className="layoff-news-title">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default LayoffsPanel
