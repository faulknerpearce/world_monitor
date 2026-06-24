import { describe, it, expect, vi } from 'vitest'
import { mapWithConcurrency } from './concurrency'

describe('mapWithConcurrency', () => {
  it('returns results in input order', async () => {
    const out = await mapWithConcurrency([1, 2, 3], async (n) => n * 2, 2)
    expect(out).toEqual([2, 4, 6])
  })

  it('limits concurrent in-flight tasks', async () => {
    let inFlight = 0
    let maxInFlight = 0
    const items = Array.from({ length: 12 }, (_, i) => i)

    await mapWithConcurrency(items, async (n) => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((r) => setTimeout(r, 5))
      inFlight -= 1
      return n
    }, 3)

    expect(maxInFlight).toBeLessThanOrEqual(3)
    expect(maxInFlight).toBeGreaterThan(1)
  })

  it('returns empty array for empty input', async () => {
    expect(await mapWithConcurrency([], vi.fn(), 4)).toEqual([])
  })
})