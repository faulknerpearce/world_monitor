import { useState, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@features/navigation/Navbar'
import Dashboard from '@features/dashboard/Dashboard'
import Map from '@features/map/Map'
import SettingsModal from '@features/navigation/SettingsModal'
import CommandModal from '@features/navigation/CommandModal'
import { usePanelSettings } from '@hooks/usePanelSettings'
import { ThemeProvider } from '@context/ThemeContext'
import { I18nProvider } from '@context/I18nContext'
import { RefreshProvider, RefreshContext } from '@context/RefreshContext'
import './App.css'

function AppContent() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentMode, setCurrentMode] = useState(null) // null = show all panels
  const { panelSettings } = usePanelSettings()
  const { triggerRefresh } = useContext(RefreshContext)

  const handleRefresh = () => {
    setIsRefreshing(true)
    triggerRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="app">
      <Navbar
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        currentMode={currentMode}
      />

      <Routes>
        <Route path="/" element={
          <Dashboard
            panelSettings={panelSettings}
            currentMode={currentMode}
          />
        } />
        <Route path="/map" element={<Map />} />
      </Routes>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <CommandModal
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />
    </div>
  )
}

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <RefreshProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </RefreshProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default App
