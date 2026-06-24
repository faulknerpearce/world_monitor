import { fetchAndParseFeed } from '@utils/fetchUtils'

/**
 * Service for fetching map-related news feeds.
 * Exposes on-demand helpers used by the global map for hotspot-specific
 * Google News lookups. All requests go through the shared parsed-feed
 * cache so two hotspots with the same search query share a single fetch.
 */
export class MapFeedService {
  /**
   * Fetch Google News for a specific query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of news items
   */
  static async fetchGoogleNews(query) {
    try {
      const searchTerms = encodeURIComponent(query)
      const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-US&gl=US&ceid=US:en`
      const items = await fetchAndParseFeed(rssUrl)

      return items.slice(0, 3).map(item => ({
        ...item,
        source: item.source || 'Google News'
      }))
    } catch (e) {
      console.error('Error fetching Google News:', e)
      return []
    }
  }

  /**
   * Fetch news for a specific hotspot on demand
   * Uses the hotspot's name and keywords to search for relevant news
   * @param {Object} hotspot - Hotspot object with name and optional keywords
   * @returns {Promise<Array>} Array of news items relevant to the hotspot
   */
  static async fetchNewsForHotspot(hotspot) {
    try {
      const queries = []

      // Use keywords if available, otherwise fall back to name
      if (hotspot.keywords && hotspot.keywords.length > 0) {
        queries.push(hotspot.keywords.slice(0, 3).join(' '))
      } else if (hotspot.name) {
        queries.push(hotspot.name)
      }

      if (queries.length === 0) return []

      const results = await Promise.allSettled(
        queries.map(q => this.fetchGoogleNews(q))
      )

      return results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .slice(0, 5)
    } catch (e) {
      console.error('Error fetching news for hotspot:', e)
      return []
    }
  }
}
