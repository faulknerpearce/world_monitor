import { StartupsFeedService } from './startupsFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
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

const StartupsPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => StartupsFeedService.fetchStartupNews(10),
        10 * 60 * 1000
    )

    // Calculate total raised from RECENT_FUNDING
    const totalRaisedVal = RECENT_FUNDING.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="startups-panel">
            <div className="startups-header-stats">
                <div className="stat-item">
                    <span className="stat-label">{t('startups.totalRaised')}</span>
                    <span className="stat-value green">{formatAmount(totalRaisedVal)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">{t('startups.deals')}</span>
                    <span className="stat-value">{RECENT_FUNDING.length}</span>
                </div>
            </div>

            <div className="startups-news-container">
                {loading && news.length === 0 ? (
                    <div className="loading-msg">{t('startups.loading')}</div>
                ) : (
                    news.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="startup-news-item">
                            <div className="startup-news-header">
                                <span className="startup-news-source">{item.source}</span>
                                <span className="startup-news-time">{getTimeAgo(item.date, locale)}</span>
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
