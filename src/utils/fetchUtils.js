import axios from 'axios'

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
]

// Cache for RSS feed data
const feedCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${url}`)
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
    const pubDate = item.querySelector('pubDate, published, updated')?.textContent || ''
    const description = item.querySelector('description, summary, content')?.textContent || ''

    const dateObj = new Date(pubDate || Date.now())
    const isValidDate = !isNaN(dateObj.getTime())

    return {
      title: title.trim(),
      link: link.trim(),
      pubDate: pubDate, // Return original string
      date: isValidDate ? dateObj : new Date(),
      description: description.trim(),
      pubDateStr: isValidDate ? dateObj.toISOString() : new Date().toISOString()
    }
  }).filter(item => item.title && item.link)
}

/**
 * Clear cache for a specific URL or all cache
 * @param {string} url - Optional URL to clear, clears all if not provided
 */
export const clearCache = (url = null) => {
  if (url) {
    feedCache.delete(url)
  } else {
    feedCache.clear()
  }
}

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export const getCacheStats = () => {
  return {
    size: feedCache.size,
    entries: Array.from(feedCache.keys())
  }
}
