import { useState } from 'react'
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

  return (
    <article
      className={`panel bg-bg-panel backdrop-blur-[12px] border border-border-glass rounded-lg overflow-hidden flex flex-col opacity-0 translate-y-3 animate-panel-enter transition-[border-color,box-shadow,transform] duration-300 hover:border-accent hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(var(--accent-rgb),0.15)] hover:-translate-y-0.5 md:max-[768px]:rounded-md ${isWide ? 'col-span-2 md:max-[768px]:col-span-1' : ''} ${collapsed ? 'collapsed' : ''}`}
      data-panel={id}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-labelledby={`panel-title-${id}`}
    >
      <header 
        className="flex items-center justify-between py-3 px-4 bg-panel-header-bg border-b border-border-glass cursor-pointer select-none shrink-0 outline-none hover:bg-panel-item-bg focus-visible:bg-panel-item-hover focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]"
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
              className="cursor-grab text-text-dim text-[0.8rem] opacity-40 transition-opacity duration-200 active:cursor-grabbing"
              aria-label={t('panel.dragToReorder')}
              role="img"
            >
              ⠿
            </span>
          )}
          <span className="text-text-dim text-[0.55rem] transition-transform duration-200" aria-hidden="true">
            {collapsed ? '▶' : '▼'}
          </span>
          <h3 className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-text-primary font-[family-name:var(--font-display)]" id={`panel-title-${id}`}>{title}</h3>
          {count !== undefined && (
            <span className="text-text-dim text-[0.6rem] font-normal" aria-label={t('panel.items', { count })}>
              ({count})
            </span>
          )}
        </div>
      </header>
      {!collapsed && (
        <div 
          className="p-0 flex-1 overflow-y-auto overflow-x-hidden"
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

export default Panel
