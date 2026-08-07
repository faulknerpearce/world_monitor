import { describe, it, expect } from 'vitest'
import { formatNumber, formatAmount, stripHtml, getArticleSnippet } from './helpers'

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

describe('stripHtml', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('returns empty string for falsy input', () => {
    expect(stripHtml('')).toBe('')
    expect(stripHtml(null)).toBe('')
  })
})

describe('getArticleSnippet', () => {
  it('returns a trimmed plain-text snippet', () => {
    expect(getArticleSnippet({
      title: 'Headline',
      description: '<p>First sentence about the story.</p>',
    })).toBe('First sentence about the story.')
  })

  it('skips descriptions that only repeat the title', () => {
    expect(getArticleSnippet({
      title: 'Headline',
      description: 'Headline',
    })).toBe('')
  })

  it('strips a leading title prefix from the description', () => {
    expect(getArticleSnippet({
      title: 'Headline',
      description: 'Headline: More detail here.',
    })).toBe('More detail here.')
  })

  it('truncates long descriptions', () => {
    const long = 'a'.repeat(200)
    expect(getArticleSnippet({ title: 'T', description: long }, 50)).toMatch(/…$/)
    expect(getArticleSnippet({ title: 'T', description: long }, 50).length).toBe(51)
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
