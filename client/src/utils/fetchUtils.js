import axios from 'axios'

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
]

// Cache for RSS feed response text
const feedCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Cache for parsed RSS items (shared across all panels and useDynamicRegions)
const parsedFeedCache = new Map()
const inFlightFetches = new Map()

const isCacheFresh = (entry) => Date.now() - entry.timestamp < CACHE_DURATION

/**
 * Read a parsed feed from the shared cache, or null on miss/expired.
 * @param {string} url
 * @returns {Array|null}
 */
export const getCachedParsedFeed = (url) => {
  const entry = parsedFeedCache.get(url)
  if (!entry) return null
  if (!isCacheFresh(entry)) {
    parsedFeedCache.delete(url)
    return null
  }
  return entry.items
}

/**
 * Write a parsed feed to the shared cache.
 * @param {string} url
 * @param {Array} items
 */
export const setCachedParsedFeed = (url, items) => {
  parsedFeedCache.set(url, { items, timestamp: Date.now() })
}

/**
 * Fetch + parse a feed URL with request coalescing. Concurrent callers for
 * the same URL share a single in-flight promise. Parsed results are stored
 * in `parsedFeedCache` so any subsequent call (different panel, different
 * hook instance) gets the cached array.
 *
 * @param {string} url
 * @returns {Promise<Array>}
 */
export const fetchAndParseFeed = async (url) => {
  const cached = getCachedParsedFeed(url)
  if (cached) return cached

  if (inFlightFetches.has(url)) return inFlightFetches.get(url)

  const promise = (async () => {
    try {
      const xmlText = await fetchWithProxy(url)
      const items = parseRSS(xmlText)
      setCachedParsedFeed(url, items)
      return items
    } finally {
      inFlightFetches.delete(url)
    }
  })()

  inFlightFetches.set(url, promise)
  return promise
}

/**
 * Fetch data with CORS proxy support and caching
 * @param {string} url - URL to fetch
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<string>} - Response text
 */
export const fetchWithProxy = async (url, useCache = true) => {
  // Check cache first
  if (useCache && feedCache.has(url)) {
    const cached = feedCache.get(url)
    if (isCacheFresh(cached)) {
      return cached.data
    }
    // Cache expired, remove it
    feedCache.delete(url)
  }

  // Try each proxy
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await axios.get(proxy + encodeURIComponent(url), {
        timeout: 10000 // 10 second timeout
      })

      // Handle response data
      let data
      if (typeof response.data === 'string') {
        data = response.data
      } else {
        try {
          data = JSON.stringify(response.data)
        } catch (jsonError) {
          console.warn(`Failed to stringify response from ${proxy}:`, jsonError)
          data = String(response.data)
        }
      }

      // Cache the result
      if (useCache) {
        feedCache.set(url, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (e) {
      console.warn(`Proxy ${proxy} failed for ${url}:`, e.message)
      continue
    }
  }

  throw new Error('All proxies failed')
}

/**
 * Fetch binary data with CORS proxy support (for GDELT zip archives, etc.).
 * @param {string} url - URL to fetch
 * @returns {Promise<ArrayBuffer>}
 */
export const fetchBinaryWithProxy = async (url) => {
  if (url.startsWith('/')) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    return response.arrayBuffer()
  }

  for (const proxy of CORS_PROXIES) {
    try {
      const response = await axios.get(proxy + encodeURIComponent(url), {
        timeout: 15000,
        responseType: 'arraybuffer',
      })
      if (response.status >= 200 && response.status < 300) {
        return response.data
      }
    } catch (e) {
      console.warn(`Binary proxy ${proxy} failed for ${url}:`, e.message)
      continue
    }
  }

  throw new Error('All proxies failed')
}

/**
 * Parse RSS/Atom feed XML
 * @param {string} xmlText - XML text
 * @returns {Array} - Array of parsed items
 */
export const parseRSS = (xmlText) => {
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlText, 'text/xml')

  let items = xml.querySelectorAll('item')
  if (items.length === 0) items = xml.querySelectorAll('entry')

  return Array.from(items).map(item => {
    const title = item.querySelector('title')?.textContent || ''
    const link = item.querySelector('link')?.textContent ||
                 item.querySelector('link')?.getAttribute('href') || '#'
    const guid = item.querySelector('guid, id')?.textContent?.trim() || ''
    const pubDate = item.querySelector('pubDate, published, updated')?.textContent || ''
    const description = item.querySelector('description, summary, content')?.textContent || ''

    const dateObj = new Date(pubDate || Date.now())
    const isValidDate = !isNaN(dateObj.getTime())

    return {
      title: title.trim(),
      link: link.trim(),
      guid,
      pubDate: pubDate, // Return original string
      date: isValidDate ? dateObj : new Date(),
      description: description.trim(),
      pubDateStr: isValidDate ? dateObj.toISOString() : new Date().toISOString()
    }
  }).filter(item => item.title && item.link)
}

/**
 * Clear all caches (raw response text, parsed items, and in-flight promises).
 * @param {string} url - Optional URL to clear, clears all if not provided
 */
export const clearCache = (url = null) => {
  if (url) {
    feedCache.delete(url)
    parsedFeedCache.delete(url)
    inFlightFetches.delete(url)
  } else {
    feedCache.clear()
    parsedFeedCache.clear()
    // Do not clear inFlightFetches: an in-flight request is allowed to finish
    // and write to the (now-empty) parsed cache for any consumers that have
    // already subscribed to the promise.
  }
}
