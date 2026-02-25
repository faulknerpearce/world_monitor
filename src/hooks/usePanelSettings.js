import { useState } from 'react'

export const usePanelSettings = () => {
  const [panelSettings, setPanelSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('situationMonitorPanels')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Error loading panel settings from localStorage:', error)
      return {}
    }
  })

  const togglePanel = (panelId) => {
    setPanelSettings(prev => {
      const newSettings = { ...prev, [panelId]: !prev[panelId] }
      localStorage.setItem('situationMonitorPanels', JSON.stringify(newSettings))
      return newSettings
    })
  }

  const isPanelEnabled = (panelId) => {
    return panelSettings[panelId] !== false
  }

  return {
    panelSettings,
    togglePanel,
    isPanelEnabled
  }
}
