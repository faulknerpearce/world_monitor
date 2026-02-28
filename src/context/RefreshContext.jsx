import { createContext, useState, useCallback } from 'react'
import { clearCache } from '@utils/fetchUtils'

export const RefreshContext = createContext({ refreshKey: 0, triggerRefresh: () => {} })

/**
 * Provides a refreshKey counter that increments whenever a manual refresh is
 * triggered. Components that depend on it re-fetch their data automatically.
 * Also clears the RSS proxy cache so fresh data is retrieved.
 */
export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    clearCache()
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  )
}
