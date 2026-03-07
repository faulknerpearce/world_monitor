import { useLocalStorage } from './useLocalStorage.js'

export const usePanelSettings = () => {
  const [panelSettings, setPanelSettings] = useLocalStorage('situationMonitorPanels', {})

  const togglePanel = (panelId) => {
    setPanelSettings(prev => ({ ...prev, [panelId]: !prev[panelId] }))
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

