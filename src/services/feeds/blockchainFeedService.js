import { BaseFeedService } from './baseFeedService.js'
import { FEED_CONFIG } from './feedConfig.js'

/**
 * Service for fetching blockchain/crypto news and data
 */
export class BlockchainFeedService extends BaseFeedService {
  static async fetchCryptoNews(maxItems = 15) {
    return await this.fetchFeeds(FEED_CONFIG.blockchain, { maxItems })
  }
}
