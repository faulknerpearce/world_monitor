import { createFeedFetcher } from '@services/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { formatAmount, getTimeAgo } from '@utils'
import './VCPanel.css'

// Recent major VC fund raises (2025/2026)
const RECENT_FUNDS = [
    { firm: 'Andreessen Horowitz', fund: 'Crypto Fund V', amount: 4500, date: 'Jan 2026' },
    { firm: 'Sequoia Capital', fund: 'Growth Fund X', amount: 3200, date: 'Jan 2026' },
    { firm: 'Founders Fund', fund: 'Fund IX', amount: 1800, date: 'Dec 2025' },
    { firm: 'Insight Partners', fund: 'Fund XIII', amount: 12500, date: 'Dec 2025' },
    { firm: 'Lightspeed', fund: 'Global Opportunity II', amount: 6200, date: 'Nov 2025' },
    { firm: 'Paradigm', fund: 'Paradigm Two', amount: 2500, date: 'Nov 2025' },
    { firm: 'Accel', fund: 'Global Growth VII', amount: 4000, date: 'Oct 2025' },
    { firm: 'Index Ventures', fund: 'Growth VI', amount: 2800, date: 'Oct 2025' },
    { firm: 'Khosla Ventures', fund: 'Main Fund IX', amount: 1800, date: 'Sep 2025' },
    { firm: 'Greycroft', fund: 'Core Fund VII', amount: 950, date: 'Aug 2025' },
]

const VC_STATS = {
    totalRaised: 40250, // Total capital raised by VCs
    funds: 42, // Number of funds closed
}

const fetchVCNews = createFeedFetcher('vc', 10)

const VCPanel = () => {
    const { t, locale } = useI18n()
    const { data: vcNews, loading } = useFeedData(fetchVCNews, 10 * 60 * 1000)

    return (
        <div className="vc-panel">
            <div className="vc-header-stats">
                <div className="stat-item">
                    <span className="stat-label">{t('vc.capitalRaised')}</span>
                    <span className="stat-value purple">{formatAmount(VC_STATS.totalRaised)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">{t('vc.fundsClosed')}</span>
                    <span className="stat-value">{VC_STATS.funds}</span>
                </div>
            </div>

            <div className="vc-news-container">
                {loading && vcNews.length === 0 ? (
                    <div className="loading-msg">{t('vc.loading')}</div>
                ) : (
                    vcNews.map((news, idx) => (
                        <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="vc-news-item">
                            <div className="vc-news-header">
                                <span className="vc-news-source">{news.source}</span>
                                <span className="vc-news-time">{getTimeAgo(news.date, locale)}</span>
                            </div>
                            <span className="vc-news-title">{news.title}</span>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default VCPanel
