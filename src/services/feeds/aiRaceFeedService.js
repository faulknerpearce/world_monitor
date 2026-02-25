import { BaseFeedService } from './baseFeedService.js'
import { FEED_CONFIG } from './feedConfig.js'

/**
 * Service for fetching AI race news
 */
export class AIRaceFeedService extends BaseFeedService {
  // Key players in the AI race for filtering
  static AI_PLAYERS = [
    { name: 'Nvidia', color: '#76b900' },
    { name: 'OpenAI', color: '#10a37f' },
    { name: 'Google', color: '#4285f4' },
    { name: 'Microsoft', color: '#f25022' },
    { name: 'Anthropic', color: '#d97757' },
    { name: 'Meta', color: '#0668e1' },
    { name: 'xAI', color: '#ffffff' },
    { name: 'Mistral', color: '#facc15' }
  ]

  static async fetchAINews(maxItems = 10) {
    const allItems = await this.fetchFeeds(FEED_CONFIG.aiRace)
    
    // Filter for AI-related content
    const keywords = ['AI', 'GPT', 'LLM', ...this.AI_PLAYERS.map(p => p.name)]
    const filteredItems = this.filterByKeywords(allItems, keywords)
    
    return filteredItems.slice(0, maxItems)
  }
}
