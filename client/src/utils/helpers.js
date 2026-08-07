export const formatNumber = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

export const formatAmount = (amount) => {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}B`
  return `$${amount}M`
}

/**
 * Strip HTML tags and collapse whitespace from RSS description fields.
 * @param {string} html
 * @returns {string}
 */
export const stripHtml = (html) => {
  if (!html) return ''
  const text = typeof DOMParser !== 'undefined'
    ? new DOMParser().parseFromString(html, 'text/html').body.textContent
    : html.replace(/<[^>]+>/g, ' ')
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Plain-text article snippet for display under a headline.
 * Skips empty, duplicate, or title-prefixed descriptions from RSS feeds.
 * @param {{ title?: string, description?: string }} item
 * @param {number} [maxLength=160]
 * @returns {string}
 */
export const getArticleSnippet = (item, maxLength = 160) => {
  const raw = stripHtml(item?.description ?? '')
  if (!raw) return ''

  const title = item?.title?.trim() ?? ''
  const lowerRaw = raw.toLowerCase()
  const lowerTitle = title.toLowerCase()

  let text = raw
  if (lowerTitle && lowerRaw.startsWith(lowerTitle)) {
    text = raw.slice(title.length).replace(/^[\s:–—-]+/, '').trim()
  }
  if (!text || text.toLowerCase() === lowerTitle) return ''

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}
