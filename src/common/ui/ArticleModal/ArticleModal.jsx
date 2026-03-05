import { useEffect, useRef } from 'react'
import { getTimeAgo } from '@core/utils/dateHelpers'
import './ArticleModal.css'

/**
 * Remove script tags, event-handler attributes, and other dangerous nodes
 * from an HTML string using the browser's own DOMParser.
 */
const sanitizeHTML = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, iframe, object, embed, form').forEach(el => el.remove())
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'srcdoc') {
        el.removeAttribute(attr.name)
        return
      }
      // Strip dangerous URL schemes from href/src/action attributes
      if (['href', 'src', 'action', 'data'].includes(attr.name)) {
        const val = attr.value.trim().toLowerCase()
        if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
          el.removeAttribute(attr.name)
        }
      }
    })
  })
  return doc.body.innerHTML
}

const ArticleModal = ({ article, onClose }) => {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!article) return null

  // Prefer full content (content:encoded) over the shorter description
  const rawHTML = article.content || article.description || ''
  const safeHTML = rawHTML ? sanitizeHTML(rawHTML) : ''

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

          {safeHTML ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: safeHTML }}
            />
          ) : (
            <p className="article-content article-content--empty">
              No preview available. Visit the source to read the full article.
            </p>
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
