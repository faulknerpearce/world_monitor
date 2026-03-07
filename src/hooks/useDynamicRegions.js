import { useState, useEffect, useCallback } from 'react'
import { HOTSPOTS, INTEL_HOTSPOTS, US_HOTSPOTS, CONFLICT_ZONES } from '@config/regions.js'
import { NEWS_FEEDS } from '@services/feedConfig'
import { fetchWithProxy, parseRSS } from '@utils/fetchUtils.js'

// Urgency keywords that increase severity scores
const URGENCY_KEYWORDS = [
  'crisis', 'emergency', 'attack', 'strike', 'bomb', 'explosion',
  'casualties', 'killed', 'wounded', 'urgent', 'breaking',
  'escalation', 'conflict', 'war', 'military action', 'invasion'
]

/**
 * Hook to manage dynamic regions data with periodic refresh
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 10 minutes)
 * @returns {Object} - Dynamic regions data with loading state and last updated timestamp
 */
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

  /**
   * Enhanced severity calculation based on multiple factors:
   * - Keyword match frequency (news volume)
   * - Recency of mentions (time decay)
   * - Event categorization (military, political, economic, humanitarian)
   * - Urgency keywords (crisis, attack, emergency, etc.)
   */
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

        // Check for keyword matches
        keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase())) {
            matchCount++
            hasMatch = true

            // Weight recent articles more heavily
            if (articleDate >= oneHourAgo) {
              recentMatchCount++
            }
          }
        })

        // Check for urgency keywords
        URGENCY_KEYWORDS.forEach(urgentWord => {
          if (text.includes(urgentWord)) {
            urgencyScore++
          }
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

    // Calculate base severity from match count
    let severity = 'medium'
    if (matchCount > 20 || urgencyScore > 10) {
      severity = 'critical'
    } else if (matchCount > 15 || urgencyScore > 5 || recentMatchCount > 5) {
      severity = 'high'
    } else if (matchCount > 5 || urgencyScore > 2 || recentMatchCount > 2) {
      severity = 'elevated'
    }

    return {
      severity,
      matchCount,
      recentMatchCount,
      urgencyScore,
      timestamp: now,
      matchedArticles: matchedArticles.slice(0, 5) // Keep top 5 matched articles
    }
  }

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch news from all feeds
      const allFeeds = Object.values(NEWS_FEEDS).flat()
      const newsPromises = allFeeds.map(async (feed) => {
        try {
          const rssText = await fetchWithProxy(feed.url)
          const parsed = await parseRSS(rssText)
          return parsed.items || []
        } catch (error) {
          console.error(`Error fetching ${feed.name}:`, error)
          return []
        }
      })

      const newsResults = await Promise.all(newsPromises)
      const allNews = newsResults.flat()

      // Track events for historical analysis
      const events = []

      // Update hotspots with enhanced dynamic severity
      const updatedHotspots = { ...HOTSPOTS }
      Object.keys(updatedHotspots).forEach(key => {
        const hotspot = updatedHotspots[key]
        if (hotspot.keywords) {
          const severityData = calculateEnhancedSeverity(hotspot.keywords, allNews)
          hotspot.severity = severityData.severity
          hotspot.matchCount = severityData.matchCount
          hotspot.recentMatchCount = severityData.recentMatchCount
          hotspot.urgencyScore = severityData.urgencyScore
          hotspot.lastChecked = severityData.timestamp

          // Track event if significant
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
            lastChecked: severityData.timestamp
          }
        }
        return { ...hotspot, severity: 'medium' }
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
        eventHistory: [...(prevData.eventHistory || []), ...events].slice(-100) // Keep last 100 events
      }))

      console.log('Dynamic regions data refreshed at:', new Date().toISOString())
      console.log('Tracked events:', events.length)
    } catch (error) {
      console.error('Error refreshing dynamic regions:', error)
      // Fallback to static data
      setDynamicData({
        hotspots: HOTSPOTS,
        intelHotspots: INTEL_HOTSPOTS,
        usHotspots: US_HOTSPOTS,
        conflictZones: CONFLICT_ZONES,
        lastUpdated: new Date(),
        eventHistory: []
      })
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
