import { unzipSync } from 'fflate'
import { createCache } from '@utils/githubUtils'
import { fetchBinaryWithProxy } from '@utils/fetchUtils'
import { API, GDELT_REFRESH_MS, GDELT_MAX_EVENTS } from '@config/api'

/**
 * GDELT (Global Database of Events, Language, and Tone) project client.
 *
 * GDELT publishes raw event records as 15-minute CSV chunks at predictable
 * URLs. We download the last 24 hours of chunks (96 files), unzip them,
 * and filter for material conflict events corroborated by at least three
 * sources.
 *
 * @see https://www.gdeltproject.org/
 */

let cache = createCache(GDELT_REFRESH_MS)

/**
 * Compute the URL of the GDELT chunk that contains `at` (default: now).
 * GDELT filenames are zero-padded UTC timestamps at 15-minute boundaries.
 */
const chunkUrl = (at = new Date()) => {
  const d = new Date(at)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 15) * 15)
  const stamp =
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0') +
    '00'
  return `${API.gdeltBaseUrl}/${stamp}.export.CSV.zip`
}

/**
 * Build the list of GDELT chunk URLs covering the last `hours` hours.
 * @param {number} hours
 * @returns {string[]} URLs, newest first
 */
const chunkUrls = (hours = 24) => {
  const now = Date.now()
  const stepMs = 15 * 60 * 1000
  const count = Math.ceil((hours * 60 * 60 * 1000) / stepMs)
  return Array.from({ length: count }, (_, i) => chunkUrl(new Date(now - i * stepMs)))
}

/**
 * Extract CSV text from a GDELT `.export.CSV.zip` archive.
 * Exported for tests so they can replace the implementation.
 */
export const unzipBlob = async (blob) => {
  const buffer = new Uint8Array(await blob.arrayBuffer())
  const entries = unzipSync(buffer)
  const csvName = Object.keys(entries).find((name) => /\.csv$/i.test(name))
  if (!csvName) throw new Error('No CSV entry in GDELT zip')
  return new TextDecoder('utf-8').decode(entries[csvName])
}

const fetchChunkBytes = async (url) => {
  if (url.startsWith('/')) {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.arrayBuffer()
  }
  return fetchBinaryWithProxy(url)
}

/**
 * Dependency container for test doubles.
 */
const deps = { unzip: unzipBlob, fetchBytes: fetchChunkBytes }

/** @internal — only intended for use in tests. */
export const setUnzipForTesting = (fn) => { deps.unzip = fn }
export const resetUnzipForTesting = () => { deps.unzip = unzipBlob }
/** @internal — only intended for use in tests. */
export const setFetchBytesForTesting = (fn) => { deps.fetchBytes = fn }
export const resetFetchBytesForTesting = () => { deps.fetchBytes = fetchChunkBytes }

/**
 * Parse a single tab-separated GDELT row. GDELT has no quoted fields, so a
 * simple split('\t') is sufficient.
 * @param {string} line
 * @returns {Object|null} Normalized event or null if the row is malformed
 */
const parseRow = (line) => {
  if (!line) return null
  const cols = line.split('\t')
  if (cols.length < 60) return null

  const lat = Number(cols[53])
  const lon = Number(cols[54])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    lat,
    lon,
    name: cols[56] || 'Unknown',
    actor1: cols[7] || '',
    actor2: cols[17] || '',
    quadClass: Number(cols[29]),
    goldstein: Number(cols[30]),
    mentions: Number(cols[31]),
    sourceUrl: cols[60] || '',
  }
}

/**
 * Map a GDELT GoldsteinScale value to a severity bucket. The plan's mapping:
 *   < -7  → critical
 *   -7..-4 → high
 *   -4..0  → elevated
 *   ≥ 0    → filtered out
 */
const severityFor = (goldstein) => {
  if (goldstein < -7) return 'critical'
  if (goldstein < -4) return 'high'
  if (goldstein < 0) return 'elevated'
  return null
}

/**
 * Fetch a single chunk (zipped CSV) and return its parsed events.
 * Returns `{ events, ok }` where `ok` means the chunk downloaded and parsed.
 */
export const fetchChunk = async (url) => {
  try {
    const bytes = await deps.fetchBytes(url)
    if (!bytes) return { events: [], ok: false }
    const csv = await deps.unzip(new Blob([bytes]))
    const events = []
    for (const line of csv.split('\n')) {
      const ev = parseRow(line)
      if (!ev) continue
      if ((ev.quadClass === 3 || ev.quadClass === 4)
          && ev.goldstein < -3
          && ev.mentions >= 3) {
        const severity = severityFor(ev.goldstein)
        if (severity) events.push({ ...ev, severity })
      }
    }
    return { events, ok: true }
  } catch (e) {
    console.warn(`GDELT chunk failed: ${url}`, e.message)
    return { events: [], ok: false }
  }
}

/**
 * Fetch and return the last 24 hours of GDELT material-conflict events,
 * sorted by mention count (most-reported first) and capped at
 * `GDELT_MAX_EVENTS`. Result is cached for `GDELT_REFRESH_MS`.
 *
 * @returns {Promise<Array<{lat, lon, name, severity, actor1, actor2, mentions, sourceUrl}>>}
 */
export const fetchGdeltEvents = async () => {
  if (cache.has('events')) return cache.get('events')

  const urls = chunkUrls(24)
  const results = await Promise.all(urls.map(fetchChunk))
  const anyOk = results.some((r) => r.ok)
  if (!anyOk) {
    throw new Error('GDELT download failed — check network or CORS proxy')
  }
  const all = results.flatMap((r) => r.events)
  const top = all
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, GDELT_MAX_EVENTS)

  cache.set('events', top)
  return top
}

/**
 * Drop the GDELT cache. Wired up to the manual refresh button.
 */
export const clearGdeltCache = () => {
  cache = createCache(GDELT_REFRESH_MS)
}