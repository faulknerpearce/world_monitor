import { useState, useEffect, useCallback } from 'react'
import { HOTSPOTS, INTEL_HOTSPOTS, US_HOTSPOTS, CONFLICT_ZONES } from '@config/regions'
import { NEWS_FEEDS } from '@features/news/feedConfig'
import { getCachedParsedFeed, fetchAndParseFeed } from '@utils/fetchUtils'
import { mapWithConcurrency } from '@utils/concurrency'

const URGENCY_KEYWORDS = [
  'crisis', 'emergency', 'attack', 'strike', 'bomb', 'explosion',
  'casualties', 'killed', 'wounded', 'urgent', 'breaking',
  'escalation', 'conflict', 'war', 'military action', 'invasion'
]

const SEVERITY_THRESHOLDS = {
  critical: { matchCount: 20, urgency: 10 },
  high: { matchCount: 15, urgency: 5, recent: 5 },
  elevated: { matchCount: 5, urgency: 2, recent: 2 },
}

const calculateEnhancedSeverity = (keywords, allNews) => {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  let matchCount = 0
  let recentMatchCount = 0
  let urgencyScore = 0
  const matchedArticles = []

  allNews.forEach(article => {
    const articleDate = new Date(article.pubDate)
    if (articleDate >= oneDayAgo) {
      const text = `${article.title} ${article.description || ''}`.toLowerCase()
      let hasMatch = false

      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          matchCount++
          hasMatch = true
          if (articleDate >= oneHourAgo) recentMatchCount++
        }
      })

      URGENCY_KEYWORDS.forEach(urgentWord => {
        if (text.includes(urgentWord)) urgencyScore++
      })

      if (hasMatch) {
        matchedArticles.push({
          title: article.title,
          pubDate: article.pubDate,
          source: article.source
        })
      }
    }
  })

  let severity = 'medium'
  if (matchCount > SEVERITY_THRESHOLDS.critical.matchCount || urgencyScore > SEVERITY_THRESHOLDS.critical.urgency) {
    severity = 'critical'
  } else if (matchCount > SEVERITY_THRESHOLDS.high.matchCount || urgencyScore > SEVERITY_THRESHOLDS.high.urgency || recentMatchCount > SEVERITY_THRESHOLDS.high.recent) {
    severity = 'high'
  } else if (matchCount > SEVERITY_THRESHOLDS.elevated.matchCount || urgencyScore > SEVERITY_THRESHOLDS.elevated.urgency || recentMatchCount > SEVERITY_THRESHOLDS.elevated.recent) {
    severity = 'elevated'
  }

  return {
    severity,
    matchCount,
    recentMatchCount,
    urgencyScore,
    timestamp: now,
    matchedArticles: matchedArticles.slice(0, 5)
  }
}

export const useDynamicRegions = (refreshInterval = 10 * 60 * 1000) => {
  const [dynamicData, setDynamicData] = useState({
    hotspots: HOTSPOTS,
    intelHotspots: INTEL_HOTSPOTS,
    usHotspots: US_HOTSPOTS,
    conflictZones: CONFLICT_ZONES,
    lastUpdated: new Date(),
    eventHistory: []
  })
  const [loading, setLoading] = useState(false)

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch news from all feeds. Reuses the shared parsed-feed cache so
      // any panel that has already fetched a feed in the last 5 minutes
      // contributes its cached result here, and concurrent hook instances
      // share in-flight requests.
      const allFeeds = Object.values(NEWS_FEEDS).flat()
      const newsResults = await mapWithConcurrency(allFeeds, async (feed) => {
        try {
          const cached = getCachedParsedFeed(feed.url)
          return (cached ?? await fetchAndParseFeed(feed.url)) || []
        } catch (error) {
          console.error(`Error fetching ${feed.name}:`, error)
          return []
        }
      }, 6)
      const allNews = newsResults.flat()

      // Track events for historical analysis
      const events = []

      // Update hotspots with enhanced dynamic severity
      const updatedHotspots = structuredClone(HOTSPOTS)
      Object.keys(updatedHotspots).forEach(key => {
        const hotspot = updatedHotspots[key]
        if (hotspot.keywords) {
          const severityData = calculateEnhancedSeverity(hotspot.keywords, allNews)
          hotspot.severity = severityData.severity
          hotspot.matchCount = severityData.matchCount
          hotspot.recentMatchCount = severityData.recentMatchCount
          hotspot.urgencyScore = severityData.urgencyScore
          hotspot.lastChecked = severityData.timestamp

          if (severityData.matchCount > 0) {
            events.push({
              regionId: key,
              regionName: hotspot.name,
              type: 'hotspot',
              severity: severityData.severity,
              matchCount: severityData.matchCount,
              urgencyScore: severityData.urgencyScore,
              timestamp: severityData.timestamp,
              recentArticles: severityData.matchedArticles
            })
          }
        }
      })

      // Update US hotspots with enhanced tracking
      const updatedUsHotspots = US_HOTSPOTS.map(hotspot => {
        if (hotspot.keywords) {
          const severityData = calculateEnhancedSeverity(hotspot.keywords, allNews)
          
          // Track US event
          if (severityData.matchCount > 0) {
            events.push({
              regionId: hotspot.id,
              regionName: hotspot.name,
              type: 'us_hotspot',
              severity: severityData.severity,
              matchCount: severityData.matchCount,
              urgencyScore: severityData.urgencyScore,
              timestamp: severityData.timestamp,
              recentArticles: severityData.matchedArticles
            })
          }

          return {
            ...hotspot,
            level: severityData.severity,
            matchCount: severityData.matchCount,
            recentMatchCount: severityData.recentMatchCount,
            urgencyScore: severityData.urgencyScore,
            lastChecked: severityData.timestamp
          }
        }
        return hotspot
      })

      // Update intel hotspots with enhanced tracking
      const updatedIntelHotspots = INTEL_HOTSPOTS.map(hotspot => {
        if (hotspot.keywords) {
          const severityData = calculateEnhancedSeverity(hotspot.keywords, allNews)
          
          // Track intel event
          if (severityData.matchCount > 0) {
            events.push({
              regionId: hotspot.id,
              regionName: hotspot.name,
              type: 'intel_hotspot',
              severity: severityData.severity,
              matchCount: severityData.matchCount,
              urgencyScore: severityData.urgencyScore,
              timestamp: severityData.timestamp,
              recentArticles: severityData.matchedArticles
            })
          }

          return {
            ...hotspot,
            severity: severityData.severity,
            matchCount: severityData.matchCount,
            recentMatchCount: severityData.recentMatchCount,
            urgencyScore: severityData.urgencyScore,
            lastChecked: severityData.timestamp,
            matchedArticles: severityData.matchedArticles
          }
        }
        return { ...hotspot, severity: 'medium', matchedArticles: [] }
      })

      // Update conflict zones with enhanced tracking
      const updatedConflictZones = CONFLICT_ZONES.map(zone => {
        if (zone.keywords) {
          const severityData = calculateEnhancedSeverity(zone.keywords, allNews)
          
          // Track conflict event
          if (severityData.matchCount > 0) {
            events.push({
              regionId: zone.id,
              regionName: zone.name,
              type: 'conflict_zone',
              severity: severityData.severity,
              matchCount: severityData.matchCount,
              urgencyScore: severityData.urgencyScore,
              timestamp: severityData.timestamp,
              recentArticles: severityData.matchedArticles
            })
          }

          return {
            ...zone,
            intensity: severityData.severity,
            matchCount: severityData.matchCount,
            recentMatchCount: severityData.recentMatchCount,
            urgencyScore: severityData.urgencyScore,
            lastChecked: severityData.timestamp
          }
        }
        return zone
      })

      // Update with new data and timestamp
      setDynamicData(prevData => ({
        hotspots: updatedHotspots,
        intelHotspots: updatedIntelHotspots,
        usHotspots: updatedUsHotspots,
        conflictZones: updatedConflictZones,
        lastUpdated: new Date(),
        eventHistory: [...(prevData.eventHistory || []), ...events].slice(-100)
      }))
    } catch (error) {
      console.error('Error refreshing dynamic regions:', error)
      setDynamicData(prevData => ({
        hotspots: HOTSPOTS,
        intelHotspots: INTEL_HOTSPOTS,
        usHotspots: US_HOTSPOTS,
        conflictZones: CONFLICT_ZONES,
        lastUpdated: new Date(),
        eventHistory: prevData.eventHistory || []
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial load
    refreshData()

    // Set up periodic refresh
    const interval = setInterval(refreshData, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  return {
    ...dynamicData,
    loading,
    refresh: refreshData
  }
}
