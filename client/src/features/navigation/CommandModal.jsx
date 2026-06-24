import { useEffect, useRef } from 'react'
import { COMMAND_MODES } from '@config/panels'
import { useI18n } from '@context/I18nContext'
import { useFocusTrap } from '@hooks/useFocusTrap'

const CommandModal = ({ isOpen, onClose, currentMode, onModeChange }) => {
  const dialogRef = useRef(null)
  const { t } = useI18n()

  useFocusTrap(dialogRef, isOpen, onClose)

  // Number-key shortcuts (1-4) for mode toggling. The focus trap above
  // handles Tab/Escape, so this listener only handles the digit keys.
  useEffect(() => {
    if (!isOpen) return
    const handleDigits = (e) => {
      const shortcuts = { '1': 'founder', '2': 'markets', '3': 'intel', '4': 'signal' }
      if (shortcuts[e.key]) {
        const mode = shortcuts[e.key]
        onModeChange(currentMode === mode ? null : mode)
        onClose()
      }
    }
    document.addEventListener('keydown', handleDigits)
    return () => document.removeEventListener('keydown', handleDigits)
  }, [isOpen, onClose, onModeChange, currentMode])

  if (!isOpen) return null

  const handleModeSelect = (modeId) => {
    // Toggle: clicking active mode turns it off
    onModeChange(currentMode === modeId ? null : modeId)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-overlay-bg backdrop-blur-[8px] flex items-center justify-center z-[1000] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-modal-title"
    >
      <div
        ref={dialogRef}
        className="bg-bg-panel border border-border-main rounded-xl p-10 max-w-[700px] w-[90%] relative animate-scale-in max-[600px]:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          data-autofocus
          className="absolute top-4 right-4 bg-transparent border-none text-text-dim text-xl cursor-pointer p-2 transition-colors duration-200 hover:text-text-primary"
          onClick={onClose}
          aria-label={t('command.close')}
        >
          ✕
        </button>
        
        <h2 id="command-modal-title" className="text-[0.9rem] font-bold tracking-[0.2em] uppercase text-text-primary text-center mb-2 font-[family-name:var(--font-mono)]">{t('command.title')}</h2>
        <p className="text-[0.75rem] text-text-dim text-center mb-8">{t('command.subtitle')}</p>
        
        <div className="grid grid-cols-4 gap-4 max-[600px]:grid-cols-2">
          {Object.values(COMMAND_MODES).map((mode, index) => (
            <button
              key={mode.id}
              className={`mode-card bg-panel-item-bg border border-border-main rounded-[10px] py-6 px-4 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-3 hover:bg-panel-item-hover hover:border-border-glass-hover hover:-translate-y-0.5 ${currentMode === mode.id ? 'active !border-accent !bg-[rgba(var(--accent-rgb),0.08)]' : ''}`}
              onClick={() => handleModeSelect(mode.id)}
              style={{ '--mode-gradient': mode.gradient }}
            >
              <div className="text-3xl bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]" style={{ backgroundImage: mode.gradient }}>{mode.icon}</div>
              <div className="text-[0.75rem] font-bold tracking-[0.15em] text-text-primary font-[family-name:var(--font-mono)]">{t(mode.nameKey)}</div>
              <div className="text-[0.65rem] text-text-dim text-center">{t(mode.taglineKey)}</div>
              <div className="absolute top-2 right-2 text-[0.6rem] font-[family-name:var(--font-mono)] text-text-dim bg-panel-item-bg py-[0.15rem] px-1.5 rounded-[3px]">{index + 1}</div>
              {currentMode === mode.id && (
                <div className="absolute bottom-0 left-0 right-0 text-[0.55rem] font-semibold tracking-[0.1em] text-accent bg-[rgba(var(--accent-rgb),0.1)] py-1.5 text-center">{t('command.active')}</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-border-main text-center text-[0.7rem] text-text-dim [&_strong]:text-accent [&_strong]:font-[family-name:var(--font-mono)]">
          {currentMode 
            ? <>{t('command.focus', { name: t(COMMAND_MODES[currentMode]?.nameKey) })}</>
            : <>{t('command.noFocus')}</>}
        </div>
      </div>
    </div>
  )
}

export default CommandModal
