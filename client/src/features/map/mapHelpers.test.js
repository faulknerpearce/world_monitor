import { describe, it, expect, vi } from 'vitest'
import { createGlobeDrag, safeClick, getMarkerColor } from './mapHelpers'

describe('safeClick', () => {
  it('invokes handler when not dragging', () => {
    const isDraggingRef = { current: false }
    const handler = vi.fn()
    safeClick(handler, isDraggingRef)()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('skips handler while dragging', () => {
    const isDraggingRef = { current: true }
    const handler = vi.fn()
    safeClick(handler, isDraggingRef)()
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('createGlobeDrag', () => {
  it('returns a d3 drag behavior', () => {
    const rotationRef = { current: [0, 0] }
    const svgRef = { current: document.createElementNS('http://www.w3.org/2000/svg', 'svg') }
    const behavior = createGlobeDrag(svgRef, 1, rotationRef, vi.fn(), { current: false }, {
      onRotate: vi.fn(),
    })
    expect(behavior).toBeTruthy()
    expect(typeof behavior.on).toBe('function')
  })
})

describe('getMarkerColor', () => {
  it('falls back to medium for unknown severity', () => {
    expect(getMarkerColor('unknown')).toBe(getMarkerColor('medium'))
  })
})