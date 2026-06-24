import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseRSS, clearCache, getCachedParsedFeed, setCachedParsedFeed } from './fetchUtils'

const wrapRSS = (items) => `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Test</title>
${items}
</channel></rss>`

const item = (overrides = {}) => {
  const defaults = {
    title: 'A headline',
    link: 'https://example.com/a',
    pubDate: 'Wed, 24 Jun 2026 12:00:00 GMT',
    description: 'desc',
  }
  const merged = { ...defaults, ...overrides }
  return `<item>
    <title>${merged.title}</title>
    <link>${merged.link}</link>
    <pubDate>${merged.pubDate}</pubDate>
    <description>${merged.description}</description>
  </item>`
}

const atomWrap = (entries) => `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Atom</title>
${entries}
</feed>`

const atomEntry = (overrides = {}) => {
  const defaults = {
    title: 'Atom headline',
    link: 'https://example.com/atom',
    updated: '2026-06-24T12:00:00Z',
    summary: 'atom desc',
  }
  const merged = { ...defaults, ...overrides }
  return `<entry>
    <title>${merged.title}</title>
    <link href="${merged.link}"/>
    <updated>${merged.updated}</updated>
    <summary>${merged.summary}</summary>
  </entry>`
}

describe('parseRSS', () => {
  it('parses a basic RSS 2.0 feed', () => {
    const xml = wrapRSS(item())
    const result = parseRSS(xml)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('A headline')
    expect(result[0].link).toBe('https://example.com/a')
    expect(result[0].date).toBeInstanceOf(Date)
    expect(result[0].pubDateStr).toBe('2026-06-24T12:00:00.000Z')
  })

  it('parses Atom feeds', () => {
    const xml = atomWrap(atomEntry())
    const result = parseRSS(xml)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Atom headline')
    expect(result[0].link).toBe('https://example.com/atom')
  })

  it('extracts guid when present', () => {
    const xml = wrapRSS(`<item>
      <title>With guid</title>
      <link>https://example.com/g</link>
      <guid>unique-id-123</guid>
      <pubDate>Wed, 24 Jun 2026 12:00:00 GMT</pubDate>
    </item>`)
    const result = parseRSS(xml)
    expect(result[0].guid).toBe('unique-id-123')
  })

  it('falls back to # for missing link', () => {
    const xml = wrapRSS(`<item><title>No link</title><pubDate>Wed, 24 Jun 2026 12:00:00 GMT</pubDate></item>`)
    const result = parseRSS(xml)
    expect(result[0].link).toBe('#')
  })

  it('skips items with empty title', () => {
    const xml = wrapRSS(
      item() +
      `<item><link>https://example.com/no-title</link><pubDate>Wed, 24 Jun 2026 12:00:00 GMT</pubDate></item>` +
      `<item><title>No link</title><pubDate>Wed, 24 Jun 2026 12:00:00 GMT</pubDate></item>`
    )
    const result = parseRSS(xml)
    // item() has both title and link → kept
    // no-title item is filtered (title === '')
    // no-link item gets link='#', title='No link' → kept
    expect(result).toHaveLength(2)
    expect(result.map(r => r.title)).toEqual(['A headline', 'No link'])
  })

  it('falls back to now() for invalid pubDate', () => {
    const xml = wrapRSS(item({ pubDate: 'not a date' }))
    const result = parseRSS(xml)
    expect(result[0].date).toBeInstanceOf(Date)
    expect(new Date() - result[0].date).toBeLessThan(5_000)
  })
})

describe('parsed-feed cache', () => {
  beforeEach(() => {
    clearCache()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'))
  })

  it('getCachedParsedFeed returns null for unknown URLs', () => {
    expect(getCachedParsedFeed('https://example.com/never-cached')).toBeNull()
  })

  it('setCachedParsedFeed + getCachedParsedFeed round-trips', () => {
    const items = [{ title: 'cached', link: 'https://x', date: new Date() }]
    setCachedParsedFeed('https://example.com/cached', items)
    expect(getCachedParsedFeed('https://example.com/cached')).toBe(items)
  })

  it('cache entries expire after 5 minutes', () => {
    const items = [{ title: 'stale', link: 'https://x', date: new Date() }]
    setCachedParsedFeed('https://example.com/stale', items)

    vi.advanceTimersByTime(6 * 60 * 1000)
    expect(getCachedParsedFeed('https://example.com/stale')).toBeNull()
  })

  it('clearCache(null) wipes everything', () => {
    setCachedParsedFeed('https://example.com/a', [{ title: 'a', link: 'l', date: new Date() }])
    setCachedParsedFeed('https://example.com/b', [{ title: 'b', link: 'l', date: new Date() }])
    clearCache()
    expect(getCachedParsedFeed('https://example.com/a')).toBeNull()
    expect(getCachedParsedFeed('https://example.com/b')).toBeNull()
  })
})
