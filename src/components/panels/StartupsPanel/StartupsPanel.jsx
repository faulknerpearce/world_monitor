import { useEffect, useState } from 'react'
import { StartupsFeedService } from '@services/feeds'
import { formatAmount, getTimeAgo } from '@utils'
import './StartupsPanel.css'

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

const STARTUP_STATS = {
    totalRaised: '$574.95M', // Placeholder, using static string from design or calculated
    deals: 10
}

const StartupsPanel = () => {
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
            const items = await StartupsFeedService.fetchStartupNews(10)
            setNews(items)
        } catch (e) {
            console.error('Startups news fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    // Calculate total raised from RECENT_FUNDING
    const totalRaisedVal = RECENT_FUNDING.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="startups-panel">
            <div className="startups-header-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Raised</span>
                    <span className="stat-value green">{formatAmount(totalRaisedVal)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Deals</span>
                    <span className="stat-value">{RECENT_FUNDING.length}</span>
                </div>
            </div>

            <div className="startups-section-title">MAJOR ROUNDS (2025-26)</div>
            <div className="startups-list-container">
                {RECENT_FUNDING.map((deal, idx) => (
                    <div key={idx} className="startup-list-row">
                        <div className="startup-row-main">
                            <span className="startup-row-name">{deal.company}</span>
                            <span className="startup-row-round">{deal.round}</span>
                        </div>
                        <div className="startup-row-meta">
                            <span className="startup-row-date">{deal.date}</span>
                            <span className="startup-row-amount green">+{formatAmount(deal.amount)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="startups-section-title">NEWS WIRE</div>
            <div className="startups-news-container">
                {loading && news.length === 0 ? (
                    <div className="loading-msg">Loading startup news...</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="startup-news-item">
                            <div className="startup-news-header">
                                <span className="startup-news-source">{item.source}</span>
                                <span className="startup-news-time">{getTimeAgo(item.date)}</span>
                            </div>
                            <span className="startup-news-title">{item.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default StartupsPanel
