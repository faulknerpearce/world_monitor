import { fetchWithProxy, parseRSS, getCachedParsedFeed, fetchAndParseFeed } from '@utils/fetchUtils'

/**
 * Base service for fetching RSS feeds
 * Provides common functionality used across all feed-based panels
 */
export class BaseFeedService {
  /**
   * Fetch and parse multiple RSS feeds
   * @param {Array} feeds - Array of feed objects with name and url
   * @param {Object} options - Options for fetching
   * @param {number} options.maxItems - Maximum total items to return across all feeds
   * @returns {Promise<Array>} Array of parsed items with source information
   */
  static async fetchFeeds(feeds, options = {}) {
    const { maxItems = null } = options

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        // Try the shared parsed cache first; only hit the network on miss.
        // Concurrent callers for the same URL share one in-flight fetch.
        const cached = getCachedParsedFeed(feed.url)
        const items = cached ?? await fetchAndParseFeed(feed.url)
        // Tag the source without mutating the cached array (frozen in spirit
        // though not via Object.freeze — copy to be safe).
        return items.map(item => ({ ...item, source: feed.name }))
      })
    )

    const allItems = []
    let successCount = 0
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
        successCount++
      } else {
        console.error(`Failed to fetch ${feeds[idx].name}:`, result.reason?.message)
      }
    })

    if (successCount === 0) {
      throw new Error('All feeds failed to load')
    }

    // Sort by date, newest first
    allItems.sort((a, b) => b.date - a.date)

    // Limit items if specified
    return maxItems ? allItems.slice(0, maxItems) : allItems
  }

  /**
   * Fetch a single RSS feed
   * @param {Object} feed - Feed object with name and url
   * @param {number} maxItems - Maximum items to return
   * @returns {Promise<Array>} Array of parsed items
   */
  static async fetchSingleFeed(feed, maxItems = null) {
    const xmlText = await fetchWithProxy(feed.url)
    const items = parseRSS(xmlText)

    items.forEach(item => {
      item.source = feed.name
    })

    // Sort by date, newest first
    items.sort((a, b) => b.date - a.date)

    return maxItems ? items.slice(0, maxItems) : items
  }
}
