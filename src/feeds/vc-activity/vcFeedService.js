import { BaseFeedService } from '@services/baseFeedService.js'
import { FEED_CONFIG } from '@services/feedConfig.js'

/**
 * Service for fetching VC activity news
 */
export class VCFeedService extends BaseFeedService {
  static async fetchVCNews(maxItems = 6) {
    return await this.fetchFeeds(FEED_CONFIG.vc, { maxItems })
  }
}
