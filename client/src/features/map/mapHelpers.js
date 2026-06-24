import * as d3 from 'd3'

export const MARKER_COLORS = {
  critical: '#ff2d55',
  high:     '#ff2d55',
  elevated: '#ffcc00',
  medium:   '#00ff88',
  low:      '#00ff88',
}

export const getMarkerColor = (severity) => MARKER_COLORS[severity] || MARKER_COLORS.medium

export const MAX_ZOOM = 3.5

export const DEFAULT_LAYER_VISIBILITY = {
  hotspots: false,
  intelHotspots: true,
  shippingChokepoints: false,
  conflictZones: false,
  militaryBases: false,
  nuclearFacilities: false,
  underseaCables: false,
  cyberRegions: false,
  usCities: false,
  emergingHotspots: false,
}

/**
 * D3 drag behavior for the orthographic globe. Mutates `rotationRef.current`
 * directly. Call `onRotate` after each drag step to redraw the projection
 * without rebuilding React state (the auto-rotation loop uses the same pattern).
 */
export const createGlobeDrag = (svgRef, zoomLevel, rotationRef, setRotation, isDraggingRef, opts = {}) => {
  const sensitivity = (opts.sensitivity ?? 0.5) / zoomLevel
  const notifyRotate = (newRotation) => {
    rotationRef.current = newRotation
    setRotation(newRotation)
    opts.onRotate?.()
  }
  return d3.drag()
    .container(svgRef.current ? svgRef : null)
    .clickDistance(opts.clickDistance ?? 0)
    .on('start', (event) => {
      event.sourceEvent.stopPropagation()
      isDraggingRef.current = false
      if (opts.onStart) opts.onStart(event)
    })
    .on('drag', (event) => {
      event.sourceEvent.stopPropagation()
      isDraggingRef.current = true
      const currentRotation = rotationRef.current
      notifyRotate([
        currentRotation[0] + event.dx * sensitivity,
        Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
      ])
    })
    .on('end', (event) => {
      event.sourceEvent.stopPropagation()
      if (opts.onEnd) opts.onEnd(event)
      setTimeout(() => isDraggingRef.current = false, 50)
    })
}

export const safeClick = (handler, isDraggingRef) => () => {
  if (!isDraggingRef.current) handler()
}
