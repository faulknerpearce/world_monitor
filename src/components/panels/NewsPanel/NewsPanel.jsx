import { useEffect, useState } from 'react'
import { BaseFeedService } from '@services/feeds'
import { getTimeAgo } from '@utils/dateHelpers'
import './NewsPanel.css'

const NewsPanel = ({ feeds, title }) => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [feeds])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const items = await BaseFeedService.fetchFeeds(feeds, { maxItems: 50 })
      setNews(items)
      setError(null)
    } catch (e) {
      console.error('News fetch error:', e)
      setError(`Failed to load news: ${e.message}`)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

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
          <div key={idx} className="item">
            <div className="item-source">{item.source}</div>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-title">
              {item.title}
            </a>
            <div className="item-time">{getTimeAgo(item.date)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsPanel

