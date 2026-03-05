import { useEffect, useState, useContext, useCallback } from 'react'
import { BaseFeedService } from '@core/services/base/baseFeedService'
import { RefreshContext } from '@core/context/RefreshContext'
import { getTimeAgo } from '@core/utils/dateHelpers'
import ArticleModal from '@common/ui/ArticleModal/ArticleModal'
import './NewsPanel.css'

const NewsPanel = ({ feeds, title }) => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const { refreshKey } = useContext(RefreshContext)

  const handleArticleClick = useCallback((e, item) => {
    e.preventDefault()
    setSelectedArticle(item)
  }, [])

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
          setError(`Failed to load news: ${e.message}`)
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
    const titleLower = title?.toLowerCase() || ''
    if (titleLower.includes('politic') || titleLower.includes('geopolitic')) return 'theme-blue'
    if (titleLower.includes('tech') || titleLower.includes('ai')) return 'theme-cyan'
    if (titleLower.includes('financ')) return 'theme-green'
    if (titleLower.includes('gov') || titleLower.includes('policy')) return 'theme-purple'
    if (titleLower.includes('intel')) return 'theme-red'
    return 'theme-neutral'
  }

  if (loading && news.length === 0) {
    return <div className="loading-msg">Loading news...</div>
  }

  if (error && news.length === 0) {
    return <div className="error-msg">{error}</div>
  }

  return (
    <>
      <div className={`news-panel ${getThemeClass()}`}>
        <div className="news-summary">
          <div className="summary-stat">
            <span className="stat-value">{news.length}</span>
            <span className="stat-label">Articles</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{uniqueSources}</span>
            <span className="stat-label">Sources</span>
          </div>
          <div className="summary-stat live-indicator">
            <span className="pulse-dot"></span>
            <span className="stat-label">LIVE</span>
          </div>
        </div>

        <div className="news-list">
          {news.map((item, idx) => (
            <div key={idx} className="item" onClick={(e) => handleArticleClick(e, item)}>
              <div className="item-source">{item.source}</div>
              <span className="item-title">{item.title}</span>
              <div className="item-time">{getTimeAgo(item.date)}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  )
}

export default NewsPanel

