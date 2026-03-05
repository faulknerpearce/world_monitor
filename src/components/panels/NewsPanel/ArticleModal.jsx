import { useEffect, useRef } from 'react'
import { getTimeAgo } from '@utils/dateHelpers'
import './ArticleModal.css'

const ArticleModal = ({ article, onClose }) => {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (article && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (article) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [article, onClose])

  if (!article) return null

  return (
    <div
      className="article-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <div className="article-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="article-modal-header">
          <span className="article-modal-source">{article.source}</span>
          <button
            ref={closeButtonRef}
            className="article-modal-close"
            onClick={onClose}
            aria-label="Close article"
          >
            ✕
          </button>
        </div>

        <div className="article-modal-body">
          <h2 id="article-modal-title" className="article-modal-title">
            {article.title}
          </h2>
          {article.date && (
            <p className="article-modal-time">{getTimeAgo(article.date)}</p>
          )}
          {article.description && (
            <p className="article-modal-description">{article.description}</p>
          )}
        </div>

        <div className="article-modal-footer">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="article-modal-source-link"
          >
            <span className="article-modal-source-label">Source</span>
            <span className="article-modal-source-name">{article.source} ↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ArticleModal
