import { useEffect, useRef } from 'react'
import { useTheme } from '@context/ThemeContext'
import './SettingsModal.css'

const SettingsModal = ({ isOpen, onClose }) => {
  const { currentTheme, setCurrentTheme, themes } = useTheme()
  const closeButtonRef = useRef(null)

  // Focus trap and escape key handling
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="settings-modal-title">Settings</h2>
          <button 
            ref={closeButtonRef}
            className="modal-close" 
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h3 id="appearance-section">Appearance</h3>
            <div className="theme-grid" role="radiogroup" aria-labelledby="appearance-section">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-card ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => setCurrentTheme(key)}
                  role="radio"
                  aria-checked={currentTheme === key}
                  aria-label={`Select ${theme.name} theme`}
                  style={{
                    backgroundColor: theme.colors['--bg-dark'],
                    borderColor: theme.colors['--border-color']
                  }}
                >
                  <div className="theme-preview" aria-hidden="true">
                    <div className="preview-swatch" style={{ background: theme.colors['--bg-panel'] }}></div>
                    <div className="preview-swatch" style={{ background: theme.colors['--accent'] }}></div>
                    <div className="preview-swatch" style={{ background: theme.colors['--text-primary'] }}></div>
                  </div>
                  <span className="theme-name" style={{ color: theme.colors['--text-primary'] }}>
                    {theme.name}
                  </span>
                  {currentTheme === key && (
                    <div className="theme-check" style={{ color: theme.colors['--accent'] }} aria-hidden="true">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

