import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@components/Navbar/Navbar'
import Dashboard from '@components/Dashboard/Dashboard'
import GlobalMap from '@components/GlobalMap/GlobalMap'
import SettingsModal from '@components/SettingsModal/SettingsModal'
import CommandModal from '@components/CommandModal/CommandModal'
import { usePanelSettings } from '@hooks/usePanelSettings'
import { ThemeProvider } from '@context/ThemeContext'
import './App.css'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentMode, setCurrentMode] = useState(null) // null = show all panels
  const { panelSettings } = usePanelSettings()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Trigger refresh logic
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
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
            <Route path="/map" element={<GlobalMap />} />
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
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

