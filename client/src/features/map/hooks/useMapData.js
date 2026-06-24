import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '@context/I18nContext'
import { API } from '@config/api'

/**
 * Fetches the world and US topology JSON used by the D3 map. Returns loading
 * and error state, the parsed topology objects, and a `reload` function for
 * manual retries.
 */
export const useMapData = () => {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [worldData, setWorldData] = useState(null)
  const [usData, setUsData] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [worldResponse, usResponse] = await Promise.all([
          fetch(API.worldAtlas),
          fetch(API.usAtlas),
        ])

        if (!worldResponse.ok) {
          throw new Error(`Failed to fetch world map: ${worldResponse.status}`)
        }
        if (!usResponse.ok) {
          throw new Error(`Failed to fetch US map: ${usResponse.status}`)
        }

        const [world, us] = await Promise.all([
          worldResponse.json(),
          usResponse.json(),
        ])

        if (cancelled) return
        setWorldData(world)
        setUsData(us)
      } catch (e) {
        console.error('Failed to load map:', e)
        if (!cancelled) setError(t('map.failedLoadData', { message: e.message }))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [t, reloadKey])

  return { loading, error, worldData, usData, reload }
}
