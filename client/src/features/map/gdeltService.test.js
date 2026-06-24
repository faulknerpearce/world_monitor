import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { zipSync, strToU8 } from 'fflate'

vi.mock('@config/api', () => ({
  API: { gdeltBaseUrl: 'http://data.gdeltproject.org/gdeltv2' },
  GDELT_REFRESH_MS: 15 * 60 * 1000,
  GDELT_MAX_EVENTS: 150,
}))

import {
  fetchChunk,
  fetchGdeltEvents,
  clearGdeltCache,
  unzipBlob,
  setUnzipForTesting,
  resetUnzipForTesting,
  setFetchBytesForTesting,
  resetFetchBytesForTesting,
} from './gdeltService'

const header = Array(61).fill('').map((_, i) => `col${i}`).join('\t')
const baseRow = (overrides = {}) => {
  const cols = Array(61).fill('')
  cols[7] = 'USA'
  cols[17] = 'RUSSIA'
  cols[29] = '4'
  cols[30] = '-5'
  cols[31] = '10'
  cols[53] = '31.3547'
  cols[54] = '34.3088'
  cols[56] = 'Gaza City'
  cols[60] = 'https://example.com/news'
  Object.assign(cols, overrides)
  return cols.join('\t')
}

const wrapCsv = (...rows) => header + '\n' + rows.join('\n') + '\n'

const zipCsv = (csv) => {
  const zipped = zipSync({ 'data.CSV': strToU8(csv) })
  return new Blob([zipped], { type: 'application/zip' })
}

const fetchMock = (body) => {
  const blob = typeof body === 'string' ? zipCsv(body) : body
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(blob),
    arrayBuffer: () => blob.arrayBuffer(),
  })
}

beforeEach(() => {
  resetUnzipForTesting()
  resetFetchBytesForTesting()
  setFetchBytesForTesting(async (url) => {
    const res = await global.fetch(url)
    if (!res.ok) return null
    return res.arrayBuffer()
  })
})
afterEach(() => {
  resetUnzipForTesting()
  resetFetchBytesForTesting()
  clearGdeltCache()
})

describe('GDELT unzipBlob', () => {
  it('extracts CSV text from a real ZIP archive', async () => {
    const csv = wrapCsv(baseRow())
    const text = await unzipBlob(zipCsv(csv))
    expect(text).toContain('Gaza City')
  })
})

describe('GDELT fetchChunk', () => {
  it('parses a valid GDELT row', async () => {
    fetchMock(wrapCsv(baseRow()))
    const { events, ok } = await fetchChunk('http://example.com/chunk.zip')
    expect(ok).toBe(true)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      lat: 31.3547,
      lon: 34.3088,
      name: 'Gaza City',
      actor1: 'USA',
      actor2: 'RUSSIA',
      mentions: 10,
    })
    expect(events[0].severity).toBe('high')
  })

  it('drops non-material-conflict events (QuadClass 1 or 2)', async () => {
    fetchMock(wrapCsv(baseRow({ 29: '1' }), baseRow({ 29: '2' })))
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events).toEqual([])
  })

  it('drops events with mentions < 3', async () => {
    fetchMock(wrapCsv(baseRow({ 31: '2' })))
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events).toEqual([])
  })

  it('drops events with GoldsteinScale >= -3', async () => {
    fetchMock(wrapCsv(baseRow({ 30: '-2' })))
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events).toEqual([])
  })

  it('maps severity buckets correctly', async () => {
    fetchMock(wrapCsv(
      baseRow({ 30: '-8', 31: '20' }),
      baseRow({ 30: '-5', 31: '20' }),
    ))
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events.map((e) => e.severity)).toEqual(['critical', 'high'])
  })

  it('skips rows with non-numeric coordinates', async () => {
    fetchMock(wrapCsv(baseRow({ 53: 'not-a-lat', 54: 'not-a-lon' })))
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events).toEqual([])
  })

  it('skips short rows', async () => {
    fetchMock('too few columns\n')
    const { events } = await fetchChunk('http://example.com/chunk.zip')
    expect(events).toEqual([])
  })

  it('survives a failed fetch', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'))
    const { events, ok } = await fetchChunk('http://example.com/chunk.zip')
    expect(ok).toBe(false)
    expect(events).toEqual([])
  })

  it('returns empty on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    const { events, ok } = await fetchChunk('http://example.com/chunk.zip')
    expect(ok).toBe(false)
    expect(events).toEqual([])
  })
})

describe('fetchGdeltEvents', () => {
  it('throws when every chunk download fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'))
    await expect(fetchGdeltEvents()).rejects.toThrow(/GDELT download failed/)
  })
})