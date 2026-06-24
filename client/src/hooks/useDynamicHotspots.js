import { useEffect, useState, useContext } from 'react'
import { fetchGdeltEvents, clearGdeltCache } from '@features/map/gdeltService'
import { clusterPoints, dedupAgainstExisting } from '@utils/geoUtils'
import { HOTSPOTS, INTEL_HOTSPOTS, US_HOTSPOTS, CONFLICT_ZONES } from '@config/regions'
import { GDELT_REFRESH_MS } from '@config/api'
import { RefreshContext } from '@context/RefreshContext'

// Flatten the four region arrays into a single dedup set. Each array is
// guaranteed to carry `lat` and `lon` (verified in regions/dynamic.js etc.).
const ALL_STATIC_HOTSPOTS = [
  ...Object.values(HOTSPOTS),
  ...INTEL_HOTSPOTS,
  ...US_HOTSPOTS,
  ...CONFLICT_ZONES,
]

/**
 * Fetches GDELT material-conflict events for the last 24 hours, clusters
 * nearby events, and dedups them against the static hotspot dataset.
 * Re-fetches every `GDELT_REFRESH_MS` (15 minutes) and immediately on
 * `RefreshContext` change (manual refresh button).
 *
 * Returns `{ emergingHotspots, loading, error }`. `emergingHotspots` items
 * carry `source: 'gdelt'` and `emerging: true` so the map can distinguish
 * them from static hotspots and apply a different visual treatment.
 */
export const useDynamicHotspots = () => {
  const [emergingHotspots, setEmergingHotspots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshKey } = useContext(RefreshContext)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const events = await fetchGdeltEvents()
        if (cancelled) return
        const clustered = clusterPoints(events)
        const deduped = dedupAgainstExisting(clustered, ALL_STATIC_HOTSPOTS)
        setEmergingHotspots(deduped.map((c) => ({
          id: `gdelt-${c.lat.toFixed(2)}-${c.lon.toFixed(2)}`,
          name: c.names[0] || 'Emerging event',
          lat: c.lat,
          lon: c.lon,
          severity: c.severity,
          mentions: c.mentions,
          firstSeen: Date.now(),
          actors: Array.from(new Set(c.actors)).slice(0, 3),
          source: 'gdelt',
          emerging: true,
        })))
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setEmergingHotspots([])
          setError(e instanceof Error ? e : new Error(String(e)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const timer = setInterval(load, GDELT_REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [refreshKey])

  // Manual refresh clears the GDELT cache so the next load repopulates.
  useEffect(() => {
    if (refreshKey === 0) return
    clearGdeltCache()
  }, [refreshKey])

  return { emergingHotspots, loading, error }
}
