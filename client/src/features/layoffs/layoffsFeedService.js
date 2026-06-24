import { BaseFeedService } from '@features/news/baseFeedService'
import { FEED_CONFIG } from '@features/news/feedConfig'

/**
 * Fetch the latest layoffs news from Google News RSS.
 * @param {number} maxItems
 * @returns {Promise<Array>}
 */
export const fetchLayoffsNews = (maxItems = 10) =>
  BaseFeedService.fetchSingleFeed(
    { name: 'Google News', url: FEED_CONFIG.layoffs.rss },
    maxItems
  )
