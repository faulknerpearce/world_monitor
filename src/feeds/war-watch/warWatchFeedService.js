import { BaseFeedService } from '@services/baseFeedService.js'
import { FEED_CONFIG } from '@services/feedConfig.js'

/**
 * Service for fetching war and defense news
 */
export class WarWatchFeedService extends BaseFeedService {
  static async fetchWarNews(maxItems = 15) {
    return await this.fetchFeeds(FEED_CONFIG.warWatch, { maxItems })
  }
}
