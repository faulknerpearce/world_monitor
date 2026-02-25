import { useState, useCallback } from 'react'
import Panel from '@components/panels/Panel/Panel'
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary'
import { PANELS } from '@config/panels'
import { NEWS_FEEDS } from '@services/feeds'
import NewsPanel from '@components/panels/NewsPanel/NewsPanel'
import StartupsPanel from '@components/panels/StartupsPanel/StartupsPanel'
import VCPanel from '@components/panels/VCPanel/VCPanel'
import BlockchainPanel from '@components/panels/BlockchainPanel/BlockchainPanel'
import WarWatchPanel from '@components/panels/WarWatchPanel/WarWatchPanel'
import GoodNewsPanel from '@components/panels/GoodNewsPanel/GoodNewsPanel'
import AIRacePanel from '@components/panels/AIRacePanel/AIRacePanel'
import LayoffsPanel from '@components/panels/LayoffsPanel/LayoffsPanel'
import CategoryTabs from '@components/CategoryTabs/CategoryTabs'
import TickerStrip from '@components/TickerStrip/TickerStrip'
import { COMMAND_MODES } from '@components/CommandModal/CommandModal'

import './Dashboard.css'

// Hero panels are featured at the top with larger size
const HERO_PANELS = ['politics', 'finance']

const Dashboard = ({ panelSettings, currentMode }) => {
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

  // Separate hero panels from regular panels
  const heroPanelIds = HERO_PANELS.filter(id => enabledPanels.includes(id))

  // Get panels for current command mode
  const modePanels = currentMode && COMMAND_MODES[currentMode]
    ? COMMAND_MODES[currentMode].panels
    : null

  // Filter panels by command mode first, then by category
  const filteredPanels = enabledPanels.filter(id => {
    if (id === 'markets' || id === 'heatmap') return false
    if (HERO_PANELS.includes(id)) return false // Exclude hero panels from grid
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
        return <NewsPanel feeds={NEWS_FEEDS.politics} title="World / Geopolitical" />
      case 'tech':
        return <NewsPanel feeds={NEWS_FEEDS.tech} title="Technology / AI" />
      case 'finance':
        return <NewsPanel feeds={NEWS_FEEDS.finance} title="Financial" />
      case 'gov':
        return <NewsPanel feeds={NEWS_FEEDS.gov} title="Government / Policy" />
      case 'startups':
        return <StartupsPanel />
      case 'vc':
        return <VCPanel />
      case 'blockchain':
        return <BlockchainPanel />
      case 'warwatch':
        return <WarWatchPanel />
      case 'goodnews':
        return <GoodNewsPanel />
      case 'ai':
        return <AIRacePanel />
      case 'layoffs':
        return <LayoffsPanel />
      default:
        return (
          <div className="panel-placeholder">
            Panel content for {PANELS[panelId]?.name} coming soon
          </div>
        )
    }
  }

  return (
    <main className="dashboard">
      {/* Ticker strip for markets and sectors */}
      <div className="ticker-section">
        <ErrorBoundary>
          <TickerStrip />
        </ErrorBoundary>
      </div>

      {/* Hero Section - Featured Panel + Events Sidebar */}
      <section className="hero-section">
        {/* Featured Panel */}
        <div className="hero-featured">
          <Panel
            id="politics"
            title={PANELS.politics?.name || 'World / Geopolitical'}
            draggable={false}
          >
            <ErrorBoundary>
              {getPanelContent('politics')}
            </ErrorBoundary>
          </Panel>
        </div>

        {/* Events Sidebar */}
        <aside className="events-sidebar">
          <h3 className="events-title">Key Developments</h3>
          <ul className="events-list">
            <li className="event-item urgent">
              <span className="event-badge">LIVE</span>
              <span className="event-text">Fed Rate Decision</span>
              <span className="event-time">2:00 PM ET</span>
            </li>
            <li className="event-item">
              <span className="event-badge upcoming">SOON</span>
              <span className="event-text">Earnings: NVDA, AAPL</span>
              <span className="event-time">4:00 PM ET</span>
            </li>
            <li className="event-item">
              <span className="event-badge">ONGOING</span>
              <span className="event-text">Davos Economic Forum</span>
              <span className="event-time">Day 3</span>
            </li>
            <li className="event-item">
              <span className="event-badge upcoming">TOMORROW</span>
              <span className="event-text">ECB Policy Meeting</span>
              <span className="event-time">8:00 AM ET</span>
            </li>
          </ul>
          <a href="#" className="events-link">View Full Calendar</a>
        </aside>
      </section>

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Filtered panels grid - 3 columns */}
      <div className="news-grid">
        {filteredPanels.map(panelId => {
          const config = PANELS[panelId]
          if (!config) return null

          return (
            <Panel
              key={panelId}
              id={panelId}
              title={config.name}
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
    </main>
  )
}

export default Dashboard

