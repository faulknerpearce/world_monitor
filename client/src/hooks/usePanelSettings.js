import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Per-panel visibility settings. `panelSettings` is a map of `panelId →
 * boolean` where `false` hides the panel. Missing keys default to visible.
 */
export const usePanelSettings = () => {
  const [panelSettings, setPanelSettings] = useLocalStorage('world_monitor_panels', {})

  const togglePanel = useCallback((panelId) => {
    setPanelSettings(prev => ({ ...prev, [panelId]: !prev[panelId] }))
  }, [setPanelSettings])

  const isPanelEnabled = useCallback(
    (panelId) => panelSettings[panelId] !== false,
    [panelSettings]
  )

  return { panelSettings, setPanelSettings, togglePanel, isPanelEnabled }
}
