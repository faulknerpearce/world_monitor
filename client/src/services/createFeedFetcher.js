import { BaseFeedService } from './baseFeedService.js'
import { FEED_CONFIG } from './feedConfig.js'

/**
 * Factory to create a feed fetcher for a given feed config key.
 * Replaces individual one-liner feed service classes.
 *
 * Usage:
 *   const fetchCryptoNews = createFeedFetcher('blockchain', 15)
 *   const { data, loading } = useFeedData(fetchCryptoNews, 5 * 60 * 1000)
 */
export const createFeedFetcher = (feedKey, maxItems = 10) => {
  return () => BaseFeedService.fetchFeeds(FEED_CONFIG[feedKey], { maxItems })
}
