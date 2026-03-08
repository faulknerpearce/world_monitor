import { useEffect, useRef } from 'react'
import { COMMAND_MODES } from '@config/panels'
import { useI18n } from '@context/I18nContext'
import './CommandModal.css'

const CommandModal = ({ isOpen, onClose, currentMode, onModeChange }) => {
  const closeButtonRef = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
      // Keyboard shortcuts for modes - toggle on/off
      const shortcuts = { '1': 'founder', '2': 'markets', '3': 'intel', '4': 'signal' }
      if (shortcuts[e.key]) {
        const mode = shortcuts[e.key]
        onModeChange(currentMode === mode ? null : mode)
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, onModeChange])

  if (!isOpen) return null

  const handleModeSelect = (modeId) => {
    // Toggle: clicking active mode turns it off
    onModeChange(currentMode === modeId ? null : modeId)
    onClose()
  }

  return (
    <div 
      className="command-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-modal-title"
    >
      <div className="command-content" onClick={(e) => e.stopPropagation()}>
        <button 
          ref={closeButtonRef}
          className="command-close" 
          onClick={onClose}
          aria-label={t('command.close')}
        >
          ✕
        </button>
        
        <h2 id="command-modal-title" className="command-title">{t('command.title')}</h2>
        <p className="command-subtitle">{t('command.subtitle')}</p>
        
        <div className="mode-grid">
          {Object.values(COMMAND_MODES).map((mode, index) => (
            <button
              key={mode.id}
              className={`mode-card ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeSelect(mode.id)}
              style={{ '--mode-gradient': mode.gradient }}
            >
              <div className="mode-icon">{mode.icon}</div>
              <div className="mode-name">{t(mode.nameKey)}</div>
              <div className="mode-tagline">{t(mode.taglineKey)}</div>
              <div className="mode-shortcut">{index + 1}</div>
              {currentMode === mode.id && (
                <div className="mode-active-indicator">{t('command.active')}</div>
              )}
            </button>
          ))}
        </div>

        <div className="command-footer">
          {currentMode 
            ? <>{t('command.focus', { name: t(COMMAND_MODES[currentMode]?.nameKey) })}</>
            : <>{t('command.noFocus')}</>}
        </div>
      </div>
    </div>
  )
}

export default CommandModal
