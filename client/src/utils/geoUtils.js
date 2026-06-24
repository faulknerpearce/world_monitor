import { GDELT_CLUSTER_RADIUS_KM, GDELT_DEDUP_RADIUS_KM } from '@config/api'

/**
 * Geographic utilities used by the GDELT emerging-hotspot pipeline.
 * Pure functions — no React, no D3, no IO — so they are easy to test
 * and easy to reuse for future features.
 */

const EARTH_RADIUS_KM = 6371

/**
 * Great-circle distance between two lat/lon points in kilometres
 * (haversine formula).
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in km
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/**
 * Greedy clustering: iterate points in descending mention-count order and
 * assign each unassigned point within `radiusKm` of the current cluster
 * seed to the same cluster.
 *
 * Each output cluster has:
 *   - `lat`, `lon` (weighted centroid by mention count)
 *   - `severity` (worst of the cluster's points)
 *   - `mentions` (sum)
 *   - `names` and `actors` (top items by mention count)
 *
 * @param {Array<{lat: number, lon: number, name: string, severity: string, mentions: number, actor1?: string, actor2?: string}>} points
 * @param {number} radiusKm
 * @returns {Array}
 */
export const clusterPoints = (points, radiusKm = GDELT_CLUSTER_RADIUS_KM) => {
  const sorted = [...points].sort((a, b) => b.mentions - a.mentions)
  const clusters = []
  const assigned = new Set()

  for (let i = 0; i < sorted.length; i++) {
    if (assigned.has(i)) continue
    const seed = sorted[i]
    const cluster = {
      lat: seed.lat * seed.mentions,
      lon: seed.lon * seed.mentions,
      mentions: seed.mentions,
      severity: seed.severity,
      names: [seed.name],
      actors: [seed.actor1, seed.actor2].filter(Boolean),
      points: [seed],
    }
    assigned.add(i)

    for (let j = i + 1; j < sorted.length; j++) {
      if (assigned.has(j)) continue
      const candidate = sorted[j]
      if (haversineDistance(seed.lat, seed.lon, candidate.lat, candidate.lon) > radiusKm) continue
      cluster.lat += candidate.lat * candidate.mentions
      cluster.lon += candidate.lon * candidate.mentions
      cluster.mentions += candidate.mentions
      // Worst-severity wins.
      if (severityRank(candidate.severity) < severityRank(cluster.severity)) {
        cluster.severity = candidate.severity
      }
      cluster.names.push(candidate.name)
      if (candidate.actor1) cluster.actors.push(candidate.actor1)
      if (candidate.actor2) cluster.actors.push(candidate.actor2)
      cluster.points.push(candidate)
      assigned.add(j)
    }

    cluster.lat /= cluster.mentions
    cluster.lon /= cluster.mentions
    clusters.push(cluster)
  }

  return clusters
}

const SEVERITY_RANK = { critical: 0, high: 1, elevated: 2 }
const severityRank = (s) => SEVERITY_RANK[s] ?? 99

/**
 * Drop clusters whose centroid is within `dedupKm` of any point in the
 * existing static hotspot dataset. GDELT events in already-covered areas
 * are not surfaced as new markers — they continue to influence the
 * dynamic severity of the existing hotspot.
 *
 * @param {Array} clusters
 * @param {Array<{lat: number, lon: number}>} existingHotspots
 * @param {number} dedupKm
 * @returns {Array} clusters with `nearExisting: true` annotated and the
 *   covered ones filtered out
 */
export const dedupAgainstExisting = (clusters, existingHotspots, dedupKm = GDELT_DEDUP_RADIUS_KM) => {
  if (!existingHotspots || existingHotspots.length === 0) return clusters
  return clusters.filter((cluster) => {
    return !existingHotspots.some((h) => (
      typeof h?.lat === 'number' && typeof h?.lon === 'number' &&
      haversineDistance(cluster.lat, cluster.lon, h.lat, h.lon) <= dedupKm
    ))
  })
}
