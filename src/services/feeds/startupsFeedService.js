import { BaseFeedService } from './baseFeedService.js'
import { FEED_CONFIG } from './feedConfig.js'

/**
 * Service for fetching startup funding news
 */
export class StartupsFeedService extends BaseFeedService {
  static extractFunding(title) {
    // Try to extract funding amount from title
    const match = title.match(/\$(\d+(?:\.\d+)?)\s*(M|B|million|billion)/i)
    if (match) {
      const value = parseFloat(match[1])
      const multiplier = match[2].toLowerCase().startsWith('b') ? 1000 : 1
      return value * multiplier
    }
    return null
  }

  static async fetchStartupNews(maxItems = 10) {
    // Fetch more items initially to ensure we have enough after filtering
    const allItems = await this.fetchFeeds(FEED_CONFIG.startups, { maxItems: maxItems * 3 })
    
    // Filter and enhance items with funding information
    const fundingItems = allItems
      .map(item => ({
        ...item,
        company: item.title.split(' ')[0],
        amount: this.extractFunding(item.title)
      }))
      .filter(item => 
        item.amount || 
        item.title.toLowerCase().includes('raises') ||
        item.title.toLowerCase().includes('funding') ||
        item.title.toLowerCase().includes('series') ||
        item.title.toLowerCase().includes('valuation') ||
        item.title.toLowerCase().includes('investment')
      )
    
    return fundingItems.slice(0, maxItems)
  }
}
