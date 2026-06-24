import { describe, it, expect } from 'vitest'
import { haversineDistance, clusterPoints, dedupAgainstExisting } from './geoUtils'

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(40, -75, 40, -75)).toBeCloseTo(0, 5)
  })

  it('matches known distance NYC ↔ London (~5570 km)', () => {
    const d = haversineDistance(40.7128, -74.0060, 51.5074, -0.1278)
    expect(d).toBeGreaterThan(5500)
    expect(d).toBeLessThan(5650)
  })

  it('matches known distance antipodal points (~half Earth circumference)', () => {
    const d = haversineDistance(0, 0, 0, 180)
    // π × R = ~20015 km
    expect(d).toBeGreaterThan(20000)
    expect(d).toBeLessThan(20040)
  })

  it('is symmetric', () => {
    const ab = haversineDistance(10, 20, 30, 40)
    const ba = haversineDistance(30, 40, 10, 20)
    expect(ab).toBeCloseTo(ba, 5)
  })
})

describe('clusterPoints', () => {
  it('returns an empty array for empty input', () => {
    expect(clusterPoints([])).toEqual([])
  })

  it('returns one cluster per isolated point', () => {
    const points = [
      { lat: 0, lon: 0, name: 'A', mentions: 5, severity: 'high' },
      { lat: 80, lon: 80, name: 'B', mentions: 3, severity: 'elevated' },
    ]
    const clusters = clusterPoints(points, 150)
    expect(clusters).toHaveLength(2)
  })

  it('groups nearby points by descending mention count', () => {
    const points = [
      { lat: 0, lon: 0, name: 'A', mentions: 100, severity: 'elevated' },
      { lat: 0.1, lon: 0.1, name: 'B', mentions: 50, severity: 'critical' },
      { lat: 0.2, lon: 0.2, name: 'C', mentions: 10, severity: 'high' },
      { lat: 80, lon: 80, name: 'D', mentions: 1, severity: 'low' },
    ]
    const clusters = clusterPoints(points, 150)
    // A, B, C should be in one cluster (close together); D is isolated
    expect(clusters).toHaveLength(2)
    const big = clusters.find((c) => c.names.length === 3)
    expect(big).toBeDefined()
    expect(big.mentions).toBe(160)
    // Centroid is weighted by mentions: (0*100 + 0.1*50 + 0.2*10) / 160
    // = 7/160 = 0.04375
    expect(big.lat).toBeCloseTo(0.04375, 5)
    // Critical (the worst severity) wins over elevated
    expect(big.severity).toBe('critical')
  })

  it('uses the worst severity in the cluster', () => {
    const points = [
      { lat: 0, lon: 0, name: 'A', mentions: 100, severity: 'elevated' },
      { lat: 0.1, lon: 0.1, name: 'B', mentions: 10, severity: 'high' },
    ]
    const clusters = clusterPoints(points, 150)
    expect(clusters[0].severity).toBe('high')
  })
})

describe('dedupAgainstExisting', () => {
  it('returns all clusters when no existing hotspots', () => {
    const clusters = [
      { lat: 0, lon: 0, mentions: 5 },
      { lat: 10, lon: 10, mentions: 3 },
    ]
    expect(dedupAgainstExisting(clusters, [])).toHaveLength(2)
  })

  it('drops clusters within dedup radius of an existing hotspot', () => {
    const clusters = [
      { lat: 31.3547, lon: 34.3088, mentions: 50 },  // Gaza
      { lat: 50, lon: 50, mentions: 20 },           // far away
    ]
    const existing = [
      { lat: 31.5, lon: 34.4, name: 'gaza-conflict' }, // within 250 km of Gaza
    ]
    const result = dedupAgainstExisting(clusters, existing, 250)
    expect(result).toHaveLength(1)
    expect(result[0].lat).toBe(50)
  })

  it('skips existing hotspots missing lat/lon', () => {
    const clusters = [{ lat: 0, lon: 0, mentions: 5 }]
    const existing = [{ name: 'broken' }, null, { lat: 'oops' }]
    expect(dedupAgainstExisting(clusters, existing)).toHaveLength(1)
  })
})
