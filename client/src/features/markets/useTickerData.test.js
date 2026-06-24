import { describe, it, expect } from 'vitest'
import { parseYahooQuote } from './useTickerData'

describe('parseYahooQuote', () => {
  it('returns price, change, and changePercent for valid meta', () => {
    const result = parseYahooQuote({
      regularMarketPrice: 110,
      chartPreviousClose: 100,
    })
    expect(result).toEqual({
      price: 110,
      change: 10,
      changePercent: 10,
    })
  })

  it('returns null when prevClose is zero', () => {
    expect(parseYahooQuote({
      regularMarketPrice: 110,
      chartPreviousClose: 0,
    })).toBeNull()
  })

  it('returns null when price is missing or non-finite', () => {
    expect(parseYahooQuote({
      regularMarketPrice: undefined,
      chartPreviousClose: 100,
    })).toBeNull()
    expect(parseYahooQuote({
      regularMarketPrice: NaN,
      chartPreviousClose: 100,
    })).toBeNull()
  })

  it('returns null when prevClose is missing or non-finite', () => {
    expect(parseYahooQuote({
      regularMarketPrice: 110,
      chartPreviousClose: undefined,
    })).toBeNull()
    expect(parseYahooQuote({
      regularMarketPrice: 110,
      chartPreviousClose: Infinity,
    })).toBeNull()
  })

  it('returns null for null/undefined meta', () => {
    expect(parseYahooQuote(null)).toBeNull()
    expect(parseYahooQuote(undefined)).toBeNull()
  })
})