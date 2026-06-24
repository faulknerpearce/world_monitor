import { describe, it, expect } from 'vitest'
import { formatNumber, formatAmount } from './helpers'

describe('formatNumber', () => {
  it('formats sub-thousand numbers with 2 decimals', () => {
    expect(formatNumber(42)).toBe('42.00')
    expect(formatNumber(0)).toBe('0.00')
    expect(formatNumber(-3.5)).toBe('-3.50')
  })

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.50K')
    expect(formatNumber(999_999)).toBe('1000.00K')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(1_500_000)).toBe('1.50M')
    expect(formatNumber(42_000_000)).toBe('42.00M')
  })

  it('formats billions with B suffix', () => {
    expect(formatNumber(1_500_000_000)).toBe('1.50B')
    expect(formatNumber(7_300_000_000)).toBe('7.30B')
  })
})

describe('formatAmount', () => {
  it('formats sub-1000 amounts in raw $M', () => {
    expect(formatAmount(500)).toBe('$500M')
    expect(formatAmount(42)).toBe('$42M')
  })

  it('formats 1000+ amounts as $XB', () => {
    expect(formatAmount(1000)).toBe('$1.0B')
    expect(formatAmount(40_250)).toBe('$40.3B')
  })
})
