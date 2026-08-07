import { describe, it, expect } from 'vitest'
import { countKoiosPoolPage, parseKoiosContentRangeTotal } from './chainStats'

describe('parseKoiosContentRangeTotal', () => {
  it('parses exact totals from Content-Range', () => {
    expect(parseKoiosContentRangeTotal('0-999/2983')).toBe(2983)
    expect(parseKoiosContentRangeTotal('1000-1999/2983')).toBe(2983)
  })

  it('returns null when the total is unavailable', () => {
    expect(parseKoiosContentRangeTotal(null)).toBeNull()
    expect(parseKoiosContentRangeTotal('0-999/*')).toBeNull()
  })
})

describe('countKoiosPoolPage', () => {
  it('returns 0 for non-arrays', () => {
    expect(countKoiosPoolPage(null)).toBe(0)
    expect(countKoiosPoolPage(undefined)).toBe(0)
  })

  it('counts pools on a page', () => {
    expect(countKoiosPoolPage([{ pool_id_bech32: 'pool1' }, { pool_id_bech32: 'pool2' }])).toBe(2)
  })
})