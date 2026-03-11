import { useState, useCallback } from 'react'
import Panel from './Panel'
import ErrorBoundary from './ErrorBoundary'
import { PANELS, COMMAND_MODES } from '@config/panels'
import { NEWS_FEEDS } from '@features/news/feedConfig'
import NewsPanel from '@features/news/NewsPanel'
import StartupsPanel from '@features/startups/StartupsPanel'
import VCPanel from '@features/vc-activity/VCPanel'
import CryptoPanel from '@features/crypto/CryptoPanel'
import WarWatchPanel from '@features/war-watch/WarWatchPanel'
import LayoffsPanel from '@features/layoffs/LayoffsPanel'
import DeveloperActivity from '@features/developer-activity/DeveloperActivity'
import CategoryTabs from './CategoryTabs'
import TickerStrip from '@features/markets/TickerStrip'
import { useI18n } from '@context/I18nContext'

// No hero panels - all rendered in unified grid

const Dashboard = ({ panelSettings, currentMode }) => {
  const { t } = useI18n()
  const [draggedPanel, setDraggedPanel] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [panelOrder, setPanelOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('situationMonitorPanelOrder')
      const defaultOrder = Object.keys(PANELS).filter(id => id !== 'map')
      return saved ? JSON.parse(saved).filter(id => id !== 'map') : defaultOrder
    } catch (error) {
      console.error('Error loading panel order from localStorage:', error)
      return Object.keys(PANELS).filter(id => id !== 'map')
    }
  })

  const handleDragStart = useCallback((panelId) => {
    setDraggedPanel(panelId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedPanel(null)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((targetPanelId) => {
    if (!draggedPanel || draggedPanel === targetPanelId) return

    setPanelOrder(prev => {
      const newOrder = [...prev]
      const draggedIndex = newOrder.indexOf(draggedPanel)
      const targetIndex = newOrder.indexOf(targetPanelId)

      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedPanel)

      localStorage.setItem('situationMonitorPanelOrder', JSON.stringify(newOrder))
      return newOrder
    })
  }, [draggedPanel])

  const enabledPanels = panelOrder.filter(id => panelSettings[id] !== false)

  // Get panels for current command mode
  const modePanels = currentMode && COMMAND_MODES[currentMode]
    ? COMMAND_MODES[currentMode].panels
    : null

  // Filter panels by command mode first, then by category
  const filteredPanels = enabledPanels.filter(id => {
    if (id === 'markets' || id === 'heatmap') return false
    const panelConfig = PANELS[id]
    if (!panelConfig) return false
    
    // If in a command mode, only show mode-specific panels
    if (modePanels && !modePanels.includes(id)) return false
    
    if (activeCategory === 'all') return true
    return panelConfig.category === activeCategory
  })

  const getPanelContent = (panelId) => {
    switch (panelId) {
      case 'politics':
        return <NewsPanel feeds={NEWS_FEEDS.politics} panelId="politics" />
      case 'tech':
        return <NewsPanel feeds={NEWS_FEEDS.tech} panelId="tech" />
      case 'finance':
        return <NewsPanel feeds={NEWS_FEEDS.finance} panelId="finance" />
      case 'startups':
        return <StartupsPanel />
      case 'vc':
        return <VCPanel />
      case 'blockchain':
        return <CryptoPanel />
      case 'warwatch':
        return <WarWatchPanel />
      case 'layoffs':
        return <LayoffsPanel />
      default:
        return (
          <div className="p-4 text-center text-text-dim text-sm">
            {t('panel.comingSoon', { name: t(PANELS[panelId]?.nameKey) })}
          </div>
        )
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-bg-dark">
      {/* Ticker strip for markets and sectors */}
      <div className="w-full shrink-0">
        <ErrorBoundary>
          <TickerStrip />
        </ErrorBoundary>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-[1400px]:px-4 max-[1400px]:py-4 max-[1000px]:px-4 max-[1000px]:py-4 max-[768px]:px-3 max-[768px]:py-3 max-[768px]:pt-4">
        {/* Category Tabs */}
        <div className="mb-6 max-[1400px]:mb-4 max-[1000px]:mb-4 max-[768px]:mb-3">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>


        {/* Filtered panels grid - 3 columns */}
        <div className="news-grid grid grid-cols-3 gap-6 flex-1 overflow-y-auto content-start max-[1400px]:grid-cols-2 max-[1000px]:grid-cols-2 max-[1000px]:gap-4 max-[768px]:grid-cols-1 max-[768px]:gap-3">
          {filteredPanels.map(panelId => {
            const config = PANELS[panelId]
            if (!config) return null

            return (
              <Panel
                key={panelId}
                id={panelId}
                title={t(config.nameKey)}
                draggable={config.draggable}
                isWide={false}
                onDragStart={() => handleDragStart(panelId)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(panelId)}
              >
                <ErrorBoundary>
                  {getPanelContent(panelId)}
                </ErrorBoundary>
              </Panel>
            )
          })}
        </div>

        {/* Developer Activity Section */}
        <ErrorBoundary>
          <DeveloperActivity />
        </ErrorBoundary>
      </div>
    </main>
  )
}

export default Dashboard
