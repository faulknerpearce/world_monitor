import { useEffect, useState, useContext } from 'react'
import { BaseFeedService } from '@services/baseFeedService'
import { RefreshContext } from '@context/RefreshContext'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo } from '@utils/dateHelpers'
import './NewsPanel.css'

const NewsPanel = ({ feeds, panelId }) => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshKey } = useContext(RefreshContext)
  const { t, locale } = useI18n()

  useEffect(() => {
    let cancelled = false

    const fetchNews = async () => {
      try {
        setLoading(true)
        const items = await BaseFeedService.fetchFeeds(feeds, { maxItems: 50 })
        if (!cancelled) {
          setNews(items)
          setError(null)
        }
      } catch (e) {
        console.error('News fetch error:', e)
        if (!cancelled) {
          setError(t('news.failed', { message: e.message }))
          setNews([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // `feeds` is intentionally the only stable dep; `fetchNews` is defined inline
    // and would cause an infinite loop if included. `refreshKey` forces a new cycle
    // when the user clicks the REFRESH button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeds, refreshKey])

  // Get unique sources count
  const uniqueSources = [...new Set(news.map(item => item.source))].length

  // Get theme class based on panel type
  const getThemeClass = () => {
    if (panelId === 'politics' || panelId === 'warwatch') return 'theme-blue'
    if (panelId === 'tech') return 'theme-cyan'
    if (panelId === 'finance') return 'theme-green'
    return 'theme-neutral'
  }

  if (loading && news.length === 0) {
    return <div className="loading-msg">{t('news.loading')}</div>
  }

  if (error && news.length === 0) {
    return <div className="error-msg">{error}</div>
  }

  return (
    <div className={`news-panel ${getThemeClass()}`}>
      <div className="news-summary">
        <div className="summary-stat">
          <span className="stat-value">{news.length}</span>
          <span className="stat-label">{t('news.articles')}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{uniqueSources}</span>
          <span className="stat-label">{t('news.sources')}</span>
        </div>
        <div className="summary-stat live-indicator">
          <span className="pulse-dot"></span>
          <span className="stat-label">{t('common.live')}</span>
        </div>
      </div>

      <div className="news-list">
        {news.map((item, idx) => (
          <div key={idx} className="item">
            <div className="item-source">{item.source}</div>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-title">
              {item.title}
            </a>
            <div className="item-time">{getTimeAgo(item.date, locale)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsPanel
