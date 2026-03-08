import { createFeedFetcher } from '@services/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { getTimeAgo } from '@utils/dateHelpers'
import './GoodNewsPanel.css'

// Positive stats
const POSITIVE_STATS = [
    { labelKey: 'goodNews.poverty', value: '-50%', detailKey: 'goodNews.since2000' },
    { labelKey: 'goodNews.renewable', value: '+300%', detailKey: 'goodNews.since2010' },
    { labelKey: 'goodNews.childMortality', value: '-59%', detailKey: 'goodNews.since1990' },
]

const fetchGoodNews = createFeedFetcher('goodNews', 12)

const GoodNewsPanel = () => {
    const { data: news, loading } = useFeedData(fetchGoodNews, 10 * 60 * 1000)
    const { t, locale } = useI18n()

    if (loading && news.length === 0) {
        return <div className="loading-msg">{t('goodNews.loading')}</div>
    }

    return (
        <div className="goodnews-panel">
            <div className="positive-stats">
                {POSITIVE_STATS.map((stat, idx) => (
                    <div key={idx} className="positive-stat">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{t(stat.labelKey)}</span>
                        <span className="stat-detail">{t(stat.detailKey)}</span>
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
                                <span className="good-time">{getTimeAgo(item.date, locale)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GoodNewsPanel
