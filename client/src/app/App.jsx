import { useState, useContext, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar, SettingsModal, CommandModal } from '@features/navigation'
import { usePanelSettings } from '@hooks/usePanelSettings'
import { ThemeProvider } from '@context/ThemeContext'
import { I18nProvider } from '@context/I18nContext'
import { RefreshProvider, RefreshContext } from '@context/RefreshContext'
import SkipToContent from './SkipToContent'

const Dashboard = lazy(() => import('@features/dashboard/Dashboard'))
const Map = lazy(() => import('@features/map/Map'))

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-bg-dark">
    <div className="w-5 h-5 border-2 border-border-main border-t-accent rounded-full animate-spin" />
  </div>
)

const NotFound = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-bg-dark text-center p-8">
    <div className="text-6xl font-display font-bold text-text-dim mb-4">404</div>
    <div className="text-lg text-text-secondary mb-2">Page not found</div>
    <div className="text-sm text-text-dim">The page you are looking for does not exist.</div>
  </div>
)

function AppContent() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentMode, setCurrentMode] = useState(null)
  const { panelSettings } = usePanelSettings()
  const { triggerRefresh } = useContext(RefreshContext)

  const handleRefresh = () => {
    setIsRefreshing(true)
    triggerRefresh()
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SkipToContent />
      <Navbar
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        currentMode={currentMode}
      />

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <Dashboard
              panelSettings={panelSettings}
              currentMode={currentMode}
            />
          } />
          <Route path="/map" element={<Map />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

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
