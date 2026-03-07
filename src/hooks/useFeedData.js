import { useState, useEffect, useRef, useContext } from 'react'
import { RefreshContext } from '@context/RefreshContext'

/**
 * Custom hook for polling RSS feed data with automatic refresh support.
 * Eliminates the repeated useState/useEffect/fetch pattern across feed panels.
 *
 * @param {Function} fetchFn - Async function that returns an array of feed items
 * @param {number} interval - Polling interval in milliseconds
 * @returns {{ data: Array, loading: boolean }}
 */
export const useFeedData = (fetchFn, interval) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchFnRef = useRef(fetchFn)
  const { refreshKey } = useContext(RefreshContext)

  // Keep ref up to date without triggering effect re-runs
  fetchFnRef.current = fetchFn

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const items = await fetchFnRef.current()
        if (!cancelled) setData(items)
      } catch (e) {
        console.error('Feed fetch error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const timer = setInterval(load, interval)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  // fetchFnRef is a ref (not state/prop), so it is intentionally omitted from the
  // dependency array – updating it does not require a new effect cycle.
  // refreshKey is included so that a manual refresh forces a new fetch cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, refreshKey])

  return { data, loading }
}
