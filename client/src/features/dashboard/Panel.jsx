import { useState } from 'react'
import './Panel.css'

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setCollapsed(!collapsed)
    }
  }

  return (
    <article 
      className={`panel ${isWide ? 'wide' : ''} ${collapsed ? 'collapsed' : ''}`}
      data-panel={id}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-labelledby={`panel-title-${id}`}
    >
      <header 
        className="panel-header" 
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-controls={`panel-content-${id}`}
      >
        <div className="panel-header-left">
          {draggable && (
            <span 
              className="drag-handle" 
              aria-label="Drag to reorder"
              role="img"
            >
              ⠿
            </span>
          )}
          <span className="panel-toggle" aria-hidden="true">
            {collapsed ? '▶' : '▼'}
          </span>
          <h3 className="panel-title" id={`panel-title-${id}`}>{title}</h3>
          {count !== undefined && (
            <span className="panel-count" aria-label={`${count} items`}>
              ({count})
            </span>
          )}
        </div>
      </header>
      {!collapsed && (
        <div 
          className="panel-content"
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

