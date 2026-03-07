import { fetchWithProxy, parseRSS } from '@utils/fetchUtils.js'
import { FEED_CONFIG } from '@services/feedConfig.js'

/**
 * Service for fetching map-related news feeds
 * Handles intel, politics, and government feeds used by the global map
 */
export class MapFeedService {
  /**
   * Fetch all news feeds relevant to the map
   * @returns {Promise<Array>} Array of parsed news items
   */
  static async fetchMapNews() {
    try {
      const feedsToFetch = [
        ...FEED_CONFIG.news.intel,
        ...FEED_CONFIG.news.politics,
        ...FEED_CONFIG.news.gov
      ]

      const results = await Promise.allSettled(feedsToFetch.map(async (feed) => {
        try {
          const xmlText = await fetchWithProxy(feed.url)
          const items = parseRSS(xmlText)

          return items.slice(0, 5).map(item => ({
            ...item,
            source: feed.name
          }))
        } catch (e) {
          console.error(`Failed to fetch ${feed.name}`, e)
          return []
        }
      }))

      const flattened = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)

      // Also fetch Google News for specific hotspots
      const googleNewsResults = await Promise.allSettled([
        this.fetchGoogleNews('washington dc politics'),
        this.fetchGoogleNews('us politics trump biden'),
        this.fetchGoogleNews('pentagon military news'),
        this.fetchGoogleNews('venezuela maduro caracas'),
        this.fetchGoogleNews('ukraine russia putin'),
        this.fetchGoogleNews('israel gaza hamas'),
        this.fetchGoogleNews('taiwan china strait')
      ])

      const googleNews = googleNewsResults
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)

      return [...flattened, ...googleNews]
    } catch (e) {
      console.error('Error fetching map news:', e)
      return []
    }
  }

  /**
   * Fetch Google News for a specific query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of news items
   */
  static async fetchGoogleNews(query) {
    try {
      const searchTerms = encodeURIComponent(query)
      const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-US&gl=US&ceid=US:en`
      const xmlText = await fetchWithProxy(rssUrl)
      const items = parseRSS(xmlText)

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
