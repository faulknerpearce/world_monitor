import { memo, useState } from 'react'
import { useI18n } from '@context/I18nContext'

const Panel = ({ 
  id, 
  title, 
  count, 
  children, 
  isWide = false,
  draggable = true,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useI18n()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setCollapsed(!collapsed)
    }
  }

  const wideClasses = isWide
    ? 'col-span-2 max-[1400px]:col-span-2 max-[768px]:col-span-1'
    : ''

  return (
    <article
      className={`panel group border border-border-glass-hover bg-bg-panel-hover rounded-lg overflow-hidden flex flex-col min-h-[360px] max-h-[480px] opacity-0 translate-y-3 animate-panel-enter transition-[background-color,border-color] duration-300 hover:bg-bg-panel hover:border-section-border max-[768px]:min-h-[300px] max-[768px]:max-h-[400px] ${wideClasses} ${collapsed ? 'collapsed' : ''}`}
      data-panel={id}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-labelledby={`panel-title-${id}`}
    >
      <header 
        className="flex items-center justify-between py-3 px-4 bg-panel-item-bg border-b border-section-border cursor-pointer select-none shrink-0 outline-none hover:bg-panel-header-bg focus-visible:bg-panel-item-hover focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]"
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-controls={`panel-content-${id}`}
      >
        <div className="flex items-center gap-2.5">
          {draggable && (
            <span 
              className="opacity-40 group-hover:opacity-0 cursor-grab text-text-dim text-[0.8rem] transition-opacity duration-200 active:cursor-grabbing"
              aria-label={t('panel.dragToReorder')}
              role="img"
            >
              ⠿
            </span>
          )}
          <span className="text-text-dim text-[0.55rem] transition-transform duration-200" aria-hidden="true">
            {collapsed ? '▶' : '▼'}
          </span>
          <h2 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)]" id={`panel-title-${id}`}>{title}</h2>
          {count !== undefined && (
            <span className="text-text-dim text-[0.7rem] font-normal" aria-label={t('panel.items', { count })}>
              ({count})
            </span>
          )}
        </div>
      </header>
      {!collapsed && (
        <div 
          className="p-0 flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          id={`panel-content-${id}`}
          role="region"
          aria-labelledby={`panel-title-${id}`}
        >
          {children}
        </div>
      )}
    </article>
  )
}

const MemoPanel = memo(Panel)
MemoPanel.displayName = 'Panel'
export default MemoPanel