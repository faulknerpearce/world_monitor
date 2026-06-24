import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimeAgo } from './dateHelpers'

describe('getTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "now" for the current instant', () => {
    expect(getTimeAgo(new Date('2026-06-24T12:00:00Z'))).toBe('now')
  })

  it('returns minutes for sub-hour deltas', () => {
    const past = new Date('2026-06-24T11:55:00Z')
    expect(getTimeAgo(past)).toMatch(/min\. ago|minutes? ago/)
  })

  it('returns hours for sub-day deltas', () => {
    const past = new Date('2026-06-24T09:00:00Z')
    expect(getTimeAgo(past)).toMatch(/hr\. ago|hours? ago/)
  })

  it('returns days for sub-week deltas', () => {
    const past = new Date('2026-06-22T12:00:00Z')
    expect(getTimeAgo(past)).toMatch(/day|days/)
  })

  it('returns weeks for sub-month deltas', () => {
    const past = new Date('2026-06-10T12:00:00Z')
    expect(getTimeAgo(past)).toMatch(/wk\. ago|weeks? ago/)
  })

  it('returns months for sub-year deltas', () => {
    const past = new Date('2026-01-01T12:00:00Z')
    expect(getTimeAgo(past)).toMatch(/mo\. ago|months? ago/)
  })

  it('returns years for multi-year deltas', () => {
    const past = new Date('2024-01-01T12:00:00Z')
    expect(getTimeAgo(past)).toMatch(/yr\. ago|years? ago/)
  })

  it('handles future dates (negative deltas)', () => {
    const future = new Date('2026-06-24T13:00:00Z')
    const result = getTimeAgo(future)
    expect(result).toMatch(/in|in.*hr/)
  })

  it('uses the requested locale', () => {
    const past = new Date('2026-06-24T09:00:00Z')
    const fr = getTimeAgo(past, 'fr-FR')
    expect(fr).toMatch(/il y a|h/)
  })
})
