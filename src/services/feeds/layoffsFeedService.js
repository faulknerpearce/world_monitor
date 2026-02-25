import { BaseFeedService } from './baseFeedService.js'
import { FEED_CONFIG } from './feedConfig.js'

/**
 * Service for fetching layoffs news
 */
export class LayoffsFeedService extends BaseFeedService {
  static async fetchLayoffsNews(maxItems = 10) {
    return await this.fetchSingleFeed(
      { name: 'Google News', url: FEED_CONFIG.layoffs.rss },
      maxItems
    )
  }
}
