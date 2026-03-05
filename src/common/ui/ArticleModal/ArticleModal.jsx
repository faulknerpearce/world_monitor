import { useEffect, useRef } from 'react'
import { getTimeAgo } from '@core/utils/dateHelpers'
import './ArticleModal.css'

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

  // Use the browser's own parser to safely extract plain text from HTML
  const plainDescription = article.description
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

          {plainDescription ? (
            <p className="article-description">{plainDescription}</p>
          ) : (
            <p className="article-description article-description--empty">
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
