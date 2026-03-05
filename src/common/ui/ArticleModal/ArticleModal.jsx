import { useEffect, useRef, useState } from 'react'
import { getTimeAgo } from '@core/utils/dateHelpers'
import { fetchWithProxy } from '@core/utils/fetchUtils'
import './ArticleModal.css'

// Heuristic thresholds for content extraction.
const MIN_CONTAINER_LENGTH = 150  // chars – minimum text in a container for it to be considered the article body
const MIN_PARAGRAPH_LENGTH = 25   // chars – minimum text in a block element for it to count as a real paragraph

// Prioritised list of selectors for the main article container.
const ARTICLE_SELECTORS = [
  'article',
  '[role="main"] article',
  '[role="article"]',
  '.article-body',
  '.article-content',
  '.article__body',
  '.article__content',
  '.post-content',
  '.post-body',
  '.entry-content',
  '.entry-body',
  '.story-body',
  '.story-content',
  '.content-body',
  '.page-content',
  '#article-body',
  '#article-content',
  'main',
  '[role="main"]',
]

// Elements that are purely navigation / boilerplate – remove before extraction.
const NOISE_SELECTORS = [
  'script', 'style', 'noscript', 'iframe',
  'nav', 'header', 'footer', 'aside',
  '[class*="sidebar"]', '[class*="related"]',
  '[class*="newsletter"]', '[class*="subscribe"]',
  '[class*="promo"]', '[class*="banner"]',
  '[class*="comment"]', '[id*="comment"]',
  '[class*=" ad-"]', '[class*="advert"]',
  '[aria-hidden="true"]',
].join(', ')

/**
 * Given a parsed HTML document, return the article text as an array of
 * paragraph strings, or null when nothing useful can be extracted.
 */
const extractParagraphs = (doc) => {
  // Strip noisy elements.
  doc.querySelectorAll(NOISE_SELECTORS).forEach(el => el.remove())

  // Find the best container.
  let container = null
  for (const selector of ARTICLE_SELECTORS) {
    const el = doc.querySelector(selector)
    if (el && el.textContent.trim().length > MIN_CONTAINER_LENGTH) {
      container = el
      break
    }
  }
  if (!container) container = doc.body

  // Gather meaningful block elements.
  const blocks = container.querySelectorAll('p, h2, h3, h4, h5, blockquote, li')
  if (blocks.length > 0) {
    const paragraphs = Array.from(blocks)
      .map(el => el.textContent.replace(/\s+/g, ' ').trim())
      .filter(t => t.length > MIN_PARAGRAPH_LENGTH)
    if (paragraphs.length > 0) return paragraphs
  }

  // Fallback: split body text on double newlines.
  const raw = container.textContent.replace(/\t/g, ' ').trim()
  const lines = raw.split(/\n{2,}/).map(l => l.replace(/\s+/g, ' ').trim()).filter(l => l.length > MIN_PARAGRAPH_LENGTH)
  return lines.length > 0 ? lines : null
}

const ArticleModal = ({ article, onClose }) => {
  const closeButtonRef = useRef(null)
  const [paragraphs, setParagraphs] = useState(null)   // null = not loaded yet
  const [fetching, setFetching]     = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)

  // Lock body scroll and set up keyboard handler.
  useEffect(() => {
    if (closeButtonRef.current) closeButtonRef.current.focus()
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Fetch and extract the full article when the modal mounts / article changes.
  useEffect(() => {
    if (!article?.link || article.link === '#') return

    let cancelled = false
    setFetching(true)
    setParagraphs(null)
    setFetchFailed(false)

    fetchWithProxy(article.link, false) // skip cache for HTML pages
      .then(html => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const result = extractParagraphs(doc)
        setParagraphs(result)
        setFetching(false)
      })
      .catch(err => {
        console.warn('Article fetch failed:', err.message)
        if (!cancelled) {
          setFetchFailed(true)
          setFetching(false)
        }
      })

    return () => { cancelled = true }
  }, [article?.link])

  if (!article) return null

  // RSS excerpt as a fallback (plain text, no HTML).
  const rssExcerpt = article.description
    ? (() => {
        const doc = new DOMParser().parseFromString(article.description, 'text/html')
        return doc.body.textContent?.trim() || ''
      })()
    : ''

  return (
    <div
      className="article-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <div className="article-modal" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          className="article-close"
          onClick={onClose}
          aria-label="Close article"
        >
          ✕
        </button>

        <div className="article-body">
          <div className="article-meta">
            <span className="article-source-label">{article.source}</span>
            <span className="article-date">{getTimeAgo(article.date)}</span>
          </div>

          <h2 id="article-modal-title" className="article-title">
            {article.title}
          </h2>

          {/* Loading skeleton */}
          {fetching && (
            <div className="article-skeleton" aria-label="Loading article content">
              <div className="article-skeleton-line article-skeleton-line--wide" />
              <div className="article-skeleton-line" />
              <div className="article-skeleton-line article-skeleton-line--wide" />
              <div className="article-skeleton-line article-skeleton-line--short" />
              <div className="article-skeleton-gap" />
              <div className="article-skeleton-line article-skeleton-line--wide" />
              <div className="article-skeleton-line" />
              <div className="article-skeleton-line article-skeleton-line--short" />
            </div>
          )}

          {/* Full article content */}
          {!fetching && paragraphs && (
            <div className="article-full-content">
              {paragraphs.map((para, i) => (
                <p key={i} className="article-paragraph">{para}</p>
              ))}
            </div>
          )}

          {/* Fallback: RSS excerpt or empty notice */}
          {!fetching && !paragraphs && (
            <>
              {rssExcerpt ? (
                <>
                  <p className="article-description">{rssExcerpt}</p>
                  {fetchFailed && (
                    <p className="article-fetch-note">
                      Full article could not be loaded. Click the source pill below to read on the original site.
                    </p>
                  )}
                </>
              ) : (
                <p className="article-description article-description--empty">
                  No preview available. Visit the source to read the full article.
                </p>
              )}
            </>
          )}
        </div>

        <div className="article-footer">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="source-pill"
          >
            <span className="source-pill-icon">↗</span>
            {article.source}
          </a>
        </div>
      </div>
    </div>
  )
}

export default ArticleModal
