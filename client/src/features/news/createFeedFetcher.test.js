import { describe, it, expect, vi } from 'vitest'

// Mock BaseFeedService before importing createFeedFetcher
vi.mock('./baseFeedService', () => ({
  BaseFeedService: {
    fetchFeeds: vi.fn(async (feeds) => feeds.map(f => ({ title: f.name, link: f.url, date: new Date() }))),
  },
}))

const { createFeedFetcher } = await import('./createFeedFetcher')
const { BaseFeedService } = await import('./baseFeedService')
const { FEED_CONFIG } = await import('./feedConfig')

describe('createFeedFetcher', () => {
  it('returns a function', () => {
    const fetcher = createFeedFetcher('blockchain')
    expect(typeof fetcher).toBe('function')
  })

  it('the returned function calls BaseFeedService.fetchFeeds with the matching feed config', async () => {
    BaseFeedService.fetchFeeds.mockClear()
    const fetcher = createFeedFetcher('blockchain', 5)
    await fetcher()
    expect(BaseFeedService.fetchFeeds).toHaveBeenCalledWith(FEED_CONFIG.blockchain, { maxItems: 5 })
  })

  it('defaults maxItems to 10', async () => {
    BaseFeedService.fetchFeeds.mockClear()
    const fetcher = createFeedFetcher('vc')
    await fetcher()
    expect(BaseFeedService.fetchFeeds).toHaveBeenCalledWith(FEED_CONFIG.vc, { maxItems: 10 })
  })

  it('exposes the expected feed keys', () => {
    expect(FEED_CONFIG.news).toBeDefined()
    expect(FEED_CONFIG.blockchain).toBeDefined()
    expect(FEED_CONFIG.startups).toBeDefined()
    expect(FEED_CONFIG.vc).toBeDefined()
    expect(FEED_CONFIG.warWatch).toBeDefined()
    expect(FEED_CONFIG.layoffs).toBeDefined()
  })
})
