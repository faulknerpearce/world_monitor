import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import {
  US_CITIES, SHIPPING_CHOKEPOINTS, MILITARY_BASES,
  NUCLEAR_FACILITIES, UNDERSEA_CABLES, CYBER_REGIONS
} from '@config/regions'
import { MapFeedService } from './mapFeedService'
import { useDynamicRegions } from '@hooks/useDynamicRegions'
import { useDynamicHotspots } from '@hooks/useDynamicHotspots'
import { useMapData } from './hooks/useMapData'
import { useI18n } from '@context/I18nContext'
import HotspotModal from './HotspotModal'
import { TickerStrip } from '@features/markets'
import MapViewControls from './MapViewControls'
import MapLayerControls from './MapLayerControls'
import {
  MARKER_COLORS,
  getMarkerColor,
  MAX_ZOOM,
  DEFAULT_LAYER_VISIBILITY,
  createGlobeDrag,
  safeClick,
} from './mapHelpers'

const GlobalMap = () => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const rotationRef = useRef([0, 0]) // Ref to track rotation for drag callbacks
  const renderMapRef = useRef(null) // Holds the latest renderMap for use inside the render effect
  const { t, locale } = useI18n()
  const { loading, error, worldData, usData, reload } = useMapData()
  const [renderError, setRenderError] = useState(null)
  const [mapView, setMapView] = useState('global') // 'global' or 'us'
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const isDraggingRef = useRef(false) // Ref so D3 closures always read the latest value
  const zoomRef = useRef(null) // Store D3 zoom behavior to avoid re-initialization
  const prevZoomLevelRef = useRef(1) // Track previous zoom level to detect mode transitions

  // Use dynamic regions hook
  const { hotspots, intelHotspots, usHotspots, conflictZones, lastUpdated } = useDynamicRegions()
  const { emergingHotspots, error: gdeltError } = useDynamicHotspots()

  // Handle projection mode changes - reset appropriate state
  const handleProjectionModeChange = (mode) => {
    setProjectionMode(mode)
    if (mode === 'flat') {
      // Reset rotation when switching to flat mode
      setRotation([0, 0])
      rotationRef.current = [0, 0]
      // Reset zoom and center the map in flat mode
      setZoomLevel(1)
      setTranslation([0, 0])
      // Disable auto-rotation in flat mode
      setIsAutoRotating(false)
      // Reset D3 zoom so it re-initializes cleanly for flat mode
      zoomRef.current = null
    } else {
      // Reset translation when switching back to 3D mode
      setTranslation([0, 0])
      // Reset D3 zoom so it doesn't interfere with 3D interaction
      zoomRef.current = null
    }
  }

  // Calculate quick stats
  const activeConflicts = conflictZones ? conflictZones.length : 0
  const totalIntel = (intelHotspots ? intelHotspots.length : 0) + (hotspots ? Object.keys(hotspots).length : 0)
  const alertLevel = activeConflicts > 3 ? 'high' : activeConflicts > 0 ? 'elevated' : 'moderate'

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [translation, setTranslation] = useState([0, 0])
  const [rotation, setRotation] = useState([0, 0]) // [longitude, latitude] rotation for globe
  const [projectionMode, setProjectionMode] = useState('3d') // '3d' or 'flat'

  // Auto-rotation state
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState(DEFAULT_LAYER_VISIBILITY)

  // Update layer visibility based on map view
  useEffect(() => {
    setLayerVisibility(prev => ({
      ...prev,
      hotspots: mapView === 'us',
      usCities: mapView === 'us'
    }))
  }, [mapView])

  // Auto-rotation effect - slow ambient spin when idle. Uses
  // requestAnimationFrame so the loop is paused while the tab is backgrounded
  // (the previous `setInterval(50)` continued firing in hidden tabs).
  useEffect(() => {
    if (!isAutoRotating || isUserInteracting || mapView !== 'global' || zoomLevel > MAX_ZOOM) {
      return
    }

    const rotationSpeed = 0.15 // degrees per frame
    let rafId
    let lastTime = performance.now()
    const tick = (now) => {
      const delta = now - lastTime
      if (delta >= 50) {
        lastTime = now - (delta % 50)
        const current = rotationRef.current
        rotationRef.current = [current[0] + rotationSpeed, current[1]]
        renderMapRef.current?.()
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafId)
  }, [isAutoRotating, isUserInteracting, mapView, zoomLevel])

  // Keyboard navigation: +/- for zoom, arrow keys for pan (flat) or
  // rotate (3D), 0 / r to reset. Only active when the map SVG (or one
  // of its descendants) has focus, so the keyboard shortcuts don't
  // collide with other input on the page.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      if (!(target instanceof Element)) return
      if (!target.closest('[data-map-keyboard-target]')) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const isGlobe = mapView === 'global' && projectionMode !== 'flat'

      if (e.key === '+' || e.key === '=' || e.key === ']') {
        e.preventDefault()
        if (isGlobe) {
          setZoomLevel(z => Math.min(z * 1.2, MAX_ZOOM))
        } else {
          setZoomLevel(z => Math.min(z * 1.2, MAX_ZOOM))
        }
      } else if (e.key === '-' || e.key === '_' || e.key === '[') {
        e.preventDefault()
        if (isGlobe) {
          setZoomLevel(z => Math.max(z / 1.2, 1))
        } else {
          setZoomLevel(z => Math.max(z / 1.2, 1))
        }
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        setZoomLevel(1)
        setTranslation([0, 0])
        if (isGlobe) {
          rotationRef.current = [0, 0]
          setRotation([0, 0])
          renderMapRef.current?.()
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (isGlobe) {
          const current = rotationRef.current
          const dx = e.key === 'ArrowLeft' ? -5 : e.key === 'ArrowRight' ? 5 : 0
          const dy = e.key === 'ArrowUp' ? 5 : e.key === 'ArrowDown' ? -5 : 0
          const next = [current[0] + dx, current[1] + dy]
          rotationRef.current = next
          setRotation(next)
          renderMapRef.current?.()
        } else {
          // Pan in flat mode: 20px per arrow press.
          const dx = e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0
          const dy = e.key === 'ArrowUp' ? -20 : e.key === 'ArrowDown' ? 20 : 0
          setTranslation(prev => [prev[0] + dx, prev[1] + dy])
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mapView, projectionMode])

  useEffect(() => {
    try {
      if (mapView === 'global' && worldData && worldData.objects && worldData.objects.countries) {
        renderMapRef.current?.()
      } else if (mapView === 'us' && usData && usData.objects && usData.objects.states) {
        renderMapRef.current?.()
      }
    } catch (error) {
      console.error('Error in map render effect:', error)
      setRenderError(t('map.failedRender'))
    }
  }, [worldData, usData, mapView, zoomLevel, translation, projectionMode, layerVisibility, lastUpdated, t, hotspots, intelHotspots, usHotspots, conflictZones, emergingHotspots])

  const redrawGlobe = () => renderMapRef.current?.()

  const renderMap = () => {
    try {
      if (!containerRef.current || !svgRef.current) return
      setRenderError(null)
      if (mapView === 'global' && !worldData) return
      if (mapView === 'us' && !usData) return

      // Additional validation
      if (mapView === 'global' && (!worldData.objects || !worldData.objects.countries)) {
        console.error('Invalid world data structure')
        setRenderError(t('map.invalidData'))
        return
      }

      if (mapView === 'us' && (!usData.objects || !usData.objects.states)) {
        console.error('Invalid US data structure')
        setRenderError(t('map.invalidData'))
        return
      }

      const container = containerRef.current
      const width = container.offsetWidth || 800
      const height = container.offsetHeight || window.innerHeight - 60 // Full height

      // Clear existing content
      d3.select(svgRef.current).selectAll('*').remove()

      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      // Create projection
      let projection
      const minDimension = Math.min(width, height)
      if (mapView === 'global') {
        // Use projection based on manual mode selection
        if (projectionMode === '3d') {
          // Orthographic projection for spherical globe appearance
          projection = d3.geoOrthographic()
            .scale((minDimension / 2.2) * zoomLevel)
            .translate([width / 2, height / 2])
            .center([0, 0])
            .rotate(rotationRef.current)
        } else {
          // Natural earth projection for flat view
          projection = d3.geoNaturalEarth1()
            .scale((width / (2 * Math.PI)) * zoomLevel)
            .translate([width / 2 + translation[0], height / 2 + translation[1]])
            .center([0, 0])
        }
      } else {
        projection = d3.geoAlbersUsa()
          .scale(width * zoomLevel * 1.2)
          .translate([width / 2 + translation[0], height / 2 + translation[1]])
      }

      const path = d3.geoPath().projection(projection)

      // Helper: check if a point is on the visible side of the globe (only for 3D mode)
      const isMarkerVisible = (lon, lat) => {
        if (mapView !== 'global' || projectionMode === 'flat') return true
        const center = [-rotationRef.current[0], -rotationRef.current[1]]
        return d3.geoDistance([lon, lat], center) < Math.PI / 2
      }

      const globeDrag = createGlobeDrag(svgRef, zoomLevel, rotationRef, setRotation, isDraggingRef, {
        onRotate: redrawGlobe,
      })

      // Background
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'var(--map-bg)')
        .style('pointer-events', 'all')

      if (mapView === 'global') {
        // Grid pattern for global
        const defs = svg.append('defs')

        // Glow filter for globe edge
        const filter = defs.append('filter')
          .attr('id', 'glow')
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%')

        filter.append('feGaussianBlur')
          .attr('stdDeviation', '10')
          .attr('result', 'coloredBlur')

        const merge = filter.append('feMerge')
        merge.append('feMergeNode').attr('in', 'coloredBlur')
        merge.append('feMergeNode').attr('in', 'SourceGraphic')

        // Gradient for sphere 3D depth
        const gradient = defs.append('radialGradient')
          .attr('id', 'sphereGradient')
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '50%')

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#1a202c')
          .attr('stop-opacity', 0.8)

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#0d1219')
          .attr('stop-opacity', 1)

        // Render sphere base (Ocean) with glow - only in 3D mode
        if (projectionMode === '3d') {
          const sphere = svg.append('path')
            .datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', 'url(#sphereGradient)')
            .attr('stroke', 'var(--accent)')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5)
            .style('filter', 'url(#glow)')
            .style('cursor', 'grab')
            .style('pointer-events', 'all')

          sphere.call(createGlobeDrag(svgRef, zoomLevel, rotationRef, setRotation, isDraggingRef, {
            clickDistance: 5,
            onRotate: redrawGlobe,
            onStart: (event) => d3.select(event.sourceEvent.target).style('cursor', 'grabbing'),
            onEnd: (event) => d3.select(event.sourceEvent.target).style('cursor', 'grab')
          }))
        }

        const smallGrid = defs.append('pattern')
          .attr('id', 'smallGrid')
          .attr('width', 20)
          .attr('height', 20)
          .attr('patternUnits', 'userSpaceOnUse')

        smallGrid.append('path')
          .attr('d', 'M 20 0 L 0 0 0 20')
          .attr('fill', 'none')
          .attr('stroke', 'var(--map-grid)')
          .attr('stroke-width', 0.5)

        const grid = defs.append('pattern')
          .attr('id', 'grid')
          .attr('width', 60)
          .attr('height', 60)
          .attr('patternUnits', 'userSpaceOnUse')

        grid.append('rect')
          .attr('width', 60)
          .attr('height', 60)
          .attr('fill', 'url(#smallGrid)')

        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'url(#grid)')
          .attr('opacity', 0.3)
          .style('pointer-events', 'none')

        // Graticule (lat/lon lines)
        const graticule = d3.geoGraticule().step([30, 30])
        svg.append('path')
          .datum(graticule)
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', 'var(--map-grid)')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.5)
          .style('pointer-events', 'none')

        // Render countries
        const countries = topojson.feature(worldData, worldData.objects.countries)

        const countriesGroup = svg.append('g')
          .attr('class', 'countries')

        countriesGroup.selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', 'var(--map-land)')
          .attr('stroke', 'var(--map-stroke)')
          .attr('stroke-width', 0.5)
          .style('pointer-events', 'visiblePainted')
          .call(globeDrag)
      }

      // Note: Sphere was rendered earlier for ocean visual.
      // Drag is handled by individual elements (sphere, countries, hotspots)

      if (mapView === 'us') {
        // Render US states
        const states = topojson.feature(usData, usData.objects.states)

        svg.append('g')
          .attr('class', 'states')
          .selectAll('path')
          .data(states.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', 'var(--map-land)')
          .attr('stroke', 'var(--map-stroke)')
          .attr('stroke-width', 0.5)
          .style('pointer-events', 'none')

        // Render US cities from config
        if (layerVisibility.usCities) {
          const citiesGroup = svg.append('g').attr('class', 'us-cities')

          US_CITIES.forEach(city => {
            const projected = projection([city.lon, city.lat])
            if (!projected) return
            const [x, y] = projected
            if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return

            const group = citiesGroup.append('g')
              .attr('class', `us-city ${city.type}`)
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            group.on('click', safeClick(() => handleHotspotClick({
              ...city,
              type: 'city',
              severity: city.type === 'capital' ? 'high' : city.type === 'military' ? 'elevated' : 'medium'
            }), isDraggingRef))

            group.call(globeDrag)

            group.append('circle')
              .attr('class', 'us-city-dot')
              .attr('r', city.type === 'capital' ? 6 : city.type === 'major' ? 5 : city.type === 'military' ? 5 : 4)
              .attr('fill', city.type === 'capital' ? '#ffcc00' : city.type === 'military' ? '#ff6600' : '#00ff00')

            group.append('text')
              .attr('class', 'us-city-label')
              .attr('x', 8)
              .attr('y', 4)
              .text(city.name)
          })
        }
      }

      // Add hotspots (global hotspots for global view, US hotspots for US view)
      if (layerVisibility.hotspots) {
        const hotspotsData = mapView === 'global' ? Object.values(hotspots) : usHotspots

        const hotspotsGroup = svg.append('g').attr('class', 'hotspots')

        hotspotsData.forEach(hotspot => {
          if (!isMarkerVisible(hotspot.lon, hotspot.lat)) return
          const projected = projection([hotspot.lon, hotspot.lat])
          if (!projected) return
          const [x, y] = projected

          const severity = hotspot.severity || hotspot.level
          const color = getMarkerColor(severity)
          const group = hotspotsGroup.append('g')
            .attr('class', `hotspot ${severity}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          group.on('click', safeClick(() => handleHotspotClick(hotspot), isDraggingRef))

          group.call(globeDrag)

          // Pulsing ring
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', severity === 'high' || severity === 'critical' ? 'hotspot-pulse' : '')

          // Inner dot
          group.append('circle')
            .attr('r', 3)
            .attr('fill', color)

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', color)
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(hotspot.name)
        })
      }

      // Add additional layers (Global Only)
      if (mapView === 'global') {
        // Shipping Chokepoints
        if (layerVisibility.shippingChokepoints) {
          const chokeGroup = svg.append('g').attr('class', 'chokepoints')
          SHIPPING_CHOKEPOINTS.forEach(point => {
            if (!isMarkerVisible(point.lon, point.lat)) return
            const projected = projection([point.lon, point.lat])
            if (!projected) return
            const [x, y] = projected
            const g = chokeGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', safeClick(() => handleHotspotClick({ ...point, type: 'chokepoint' }), isDraggingRef))

            g.call(globeDrag)

            g.append('rect')
              .attr('x', -6).attr('y', -6)
              .attr('width', 12).attr('height', 12)
              .attr('fill', '#0091ff')
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 1)
          })
        }

        // Conflict Zones
        if (layerVisibility.conflictZones) {
          const conflictGroup = svg.append('g').attr('class', 'conflict-zones')
          conflictZones.forEach(zone => {
            if (!isMarkerVisible(zone.labelPos.lon, zone.labelPos.lat)) return
            const projected = projection([zone.labelPos.lon, zone.labelPos.lat])
            if (!projected) return
            const [x, y] = projected

            const intensity = zone.intensity || 'medium'
            const color = getMarkerColor(intensity)

            const g = conflictGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', safeClick(() => handleHotspotClick({ ...zone, type: 'conflict' }), isDraggingRef))

            g.call(globeDrag)

            g.append('circle')
              .attr('r', 10)
              .attr('fill', `${color}33`) // Add alpha
              .attr('stroke', color)
              .attr('stroke-dasharray', '2,2')

            // X symbol for conflict (larger)
            g.append('path')
              .attr('d', 'M-6,-6 L6,6 M6,-6 L-6,6')
              .attr('stroke', color)
              .attr('stroke-width', 2)
              .attr('fill', 'none')
          })
        }

        // Military Bases
        if (layerVisibility.militaryBases) {
          const baseGroup = svg.append('g').attr('class', 'military-bases')
          MILITARY_BASES.forEach(base => {
            if (!isMarkerVisible(base.lon, base.lat)) return
            const projected = projection([base.lon, base.lat])
            if (!projected) return
            const [x, y] = projected
            const g = baseGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', safeClick(() => handleHotspotClick({ ...base, type: 'base' }), isDraggingRef))

            g.call(globeDrag)

            g.append('circle')
              .attr('r', 6)
              .attr('fill', '#888888')
              .attr('stroke', '#666666')
          })
        }

        // Nuclear Facilities
        if (layerVisibility.nuclearFacilities) {
          const nucGroup = svg.append('g').attr('class', 'nuclear-facilities')
          NUCLEAR_FACILITIES.forEach(nuc => {
            if (!isMarkerVisible(nuc.lon, nuc.lat)) return
            const projected = projection([nuc.lon, nuc.lat])
            if (!projected) return
            const [x, y] = projected
            const g = nucGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', safeClick(() => handleHotspotClick({ ...nuc, type: 'nuclear' }), isDraggingRef))

            g.call(globeDrag)

            g.append('circle').attr('r', 4).attr('fill', '#ffff00').attr('stroke', '#000')

            // Radiation symbol (three blades, larger)
            g.append('path')
              .attr('d', 'M0,-7.5 L1.5,-3 L-1.5,-3 Z M-4.5,0 L-1.5,-1.5 L-1.5,1.5 Z M4.5,0 L1.5,-1.5 L1.5,1.5 Z')
              .attr('fill', '#000')
              .attr('stroke', 'none')
          })
        }

        // Undersea Cables
        if (layerVisibility.underseaCables) {
          const cablesGroup = svg.append('g').attr('class', 'cables')
          UNDERSEA_CABLES.forEach(cable => {
            const line = d3.line()
              .x(d => projection(d)[0])
              .y(d => projection(d)[1])
              .curve(d3.curveBasis) // Smooth curves for cables

            const pathCoords = cable.points
            // Check if projection is successful for all points to avoid errors
            const valid = pathCoords.every(p => {
              const [x, y] = projection(p) || [null, null]
              return x !== null && y !== null
            })

            if (valid) {
              cablesGroup.append('path')
                .datum(pathCoords)
                .attr('d', line)
                .attr('class', cable.major ? 'major' : '')
                .attr('fill', 'none')
              // Tooltip or interaction could be added here
            }
          })
        }

        // Cyber Regions
        if (layerVisibility.cyberRegions) {
          const cyberGroup = svg.append('g').attr('class', 'cyber-regions')
          CYBER_REGIONS.forEach(reg => {
            if (!isMarkerVisible(reg.lon, reg.lat)) return
            const projected = projection([reg.lon, reg.lat])
            if (!projected) return
            const [x, y] = projected
            const g = cyberGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', safeClick(() => handleHotspotClick({ ...reg, type: 'cyber' }), isDraggingRef))

            g.call(globeDrag)

            g.append('rect')
              .attr('x', -8).attr('y', -8)
              .attr('width', 16).attr('height', 16)
              .attr('fill', 'none')
              .attr('stroke', '#00ff00')
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '2,2')

            // Circuit symbol (simple lines, larger)
            g.append('path')
              .attr('d', 'M-6,-3 L6,-3 M-6,3 L6,3 M-3,-6 L-3,6 M3,-6 L3,6')
              .attr('stroke', '#00ff00')
              .attr('stroke-width', 1.5)
              .attr('fill', 'none')
          })
        }

      }

      // Intelligence Hotspots (show on both global and US maps)
      if (layerVisibility.intelHotspots) {
        const intelGroup = svg.append('g').attr('class', 'intel-hotspots')

        // Track current hovered intel for tooltip click
        let currentHoveredIntel = null
        let hideTimer = null

        // Create hover tooltip group (hidden by default) - square container matching sidebar style
        const tooltip = svg.append('g')
          .attr('class', 'marker-tooltip')
          .style('pointer-events', 'none')
          .style('display', 'none')
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            // Cancel any pending hide so tooltip stays visible
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
          })
          .on('mouseleave', function() {
            // Hide tooltip when mouse leaves the tooltip area
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
            tooltip.style('display', 'none')
            currentHoveredIntel = null
          })

        // Tooltip background (square container) - clickable
        tooltip.append('rect')
          .attr('class', 'tooltip-bg')
          .attr('rx', 4)
          .attr('ry', 4)
          .style('pointer-events', 'all')

        // Area name header
        tooltip.append('text')
          .attr('class', 'tooltip-header')
          .attr('x', 12)
          .attr('y', 20)
          .attr('fill', 'var(--green)')
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('text-transform', 'uppercase')
          .attr('letter-spacing', '1px')

        // Divider line between header and content
        tooltip.append('line')
          .attr('class', 'tooltip-divider')
          .attr('x1', 12)
          .attr('y1', 28)
          .attr('x2', 188)
          .attr('y2', 28)
          .attr('stroke', 'rgba(0, 255, 136, 0.3)')
          .attr('stroke-width', 1)
          .style('display', 'none')

        // Article title text - using tspan for wrapping
        const textGroup = tooltip.append('g')
          .attr('class', 'tooltip-text-group')
          .attr('transform', `translate(12, 42)`)

        textGroup.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('fill', '#e2e8f0')
          .attr('font-size', '11px')
          .attr('font-weight', '500')
          .attr('max-width', '176')

        // Show More button background
        tooltip.append('rect')
          .attr('class', 'tooltip-show-more-bg')
          .attr('rx', 2)
          .attr('ry', 2)
          .attr('fill', 'var(--green-dim)')
          .attr('stroke', 'var(--green)')
          .attr('stroke-width', 1)
          .style('display', 'none')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')

        // Show More button text
        tooltip.append('text')
          .attr('class', 'tooltip-show-more-text')
          .attr('fill', 'var(--green)')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('text-anchor', 'middle')
          .style('display', 'none')
          .style('pointer-events', 'none')
          .text('SHOW MORE')

        intelHotspots.forEach(intel => {
          // Skip DC in US view since it's already rendered as a city
          if (mapView === 'us' && intel.id === 'dc') return
          if (!isMarkerVisible(intel.lon, intel.lat)) return

          const projected = projection([intel.lon, intel.lat])
          if (!projected) return
          const [x, y] = projected

          // Derive colour from the severity that useDynamicRegions already computed
          // (accounts for matchCount, urgency keywords, and recency).
          const severity = intel.severity || 'medium'
          const markerColor = getMarkerColor(severity)

          const group = intelGroup.append('g')
            .attr('class', `intel-hotspot ${severity === 'critical' || severity === 'high' ? 'high' : severity === 'elevated' ? 'moderate' : 'low'}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          // Remove marker click - only hover interaction
          group.style('cursor', 'pointer')

          // First mouseleave handler removed — debounced handler below handles this

          // Show More button click handler
          tooltip.select('.tooltip-show-more-bg').on('click', function(event) {
            event.stopPropagation()
            if (!isDraggingRef.current && currentHoveredIntel) {
              tooltip.style('display', 'none')
              handleIntelHotspotClick({ ...currentHoveredIntel, severity: currentHoveredIntel.severity || 'medium' })
            }
          })

          // Hover tooltip: fetch and show most recent story with area name header
          group.on('mouseenter', async function () {
            // Store current intel for tooltip click
            currentHoveredIntel = intel

            // Show loading state immediately with area name
            tooltip.select('.tooltip-header').text(intel.name)
            tooltip.select('.tooltip-divider').style('display', 'none')
            tooltip.select('.tooltip-show-more-bg').style('display', 'none')
            tooltip.select('.tooltip-show-more-text').style('display', 'none')

            const textElem = tooltip.select('.tooltip-text')
            textElem.text('Fetching news...')

            tooltip.select('.tooltip-bg')
              .attr('width', 200)
              .attr('height', 80)
              .attr('fill', 'rgba(10, 14, 20, 0.98)')
              .attr('stroke', markerColor)
              .attr('stroke-width', 1)
            tooltip.attr('transform', `translate(${x - 100},${y - 92})`)
            tooltip.style('display', null)
            tooltip.style('pointer-events', 'all')

            try {
              // Fetch fresh news for this intel hotspot
              const newsItems = await MapFeedService.fetchNewsForHotspot(intel)
              const actualCount = newsItems ? newsItems.length : 0

              // Re-derive severity from the live article count and recolour the marker
              const liveSeverity = actualCount >= 5 ? 'high' : actualCount >= 2 ? 'elevated' : 'medium'
              const updatedMarkerColor = getMarkerColor(liveSeverity)

              // Update the marker's ring and dot color
              const circles = group.selectAll('circle')
              circles.each(function(d, i) {
                if (i === 0) {
                  // First circle is the pulsing ring (stroke only)
                  d3.select(this).attr('stroke', updatedMarkerColor)
                } else {
                  // Second circle is the inner dot (fill)
                  d3.select(this).attr('fill', updatedMarkerColor)
                }
              })

              const recentArticle = newsItems && newsItems.length > 0
                ? newsItems[0]
                : null

              if (recentArticle && recentArticle.title) {
                // Show full article title, dynamically size the container
                const fullTitle = recentArticle.title
                const textElem = tooltip.select('.tooltip-text')

                // Clear the loading text
                textElem.text('')

                // Word wrap the text manually using tspan
                const words = fullTitle.split(' ')
                const maxWidth = 176
                const lineHeight = 15
                const charWidth = 6.5 // approx width per character for 11px font
                let lines = []
                let currentLine = ''
                
                words.forEach(word => {
                  const testLine = currentLine ? currentLine + ' ' + word : word
                  const testWidth = testLine.length * charWidth
                  if (testWidth <= maxWidth) {
                    currentLine = testLine
                  } else {
                    if (currentLine) lines.push(currentLine)
                    currentLine = word
                  }
                })
                if (currentLine) lines.push(currentLine)
                
                // Remove all existing tspan children and add new ones
                textElem.selectAll('tspan').remove()
                lines.forEach((line, i) => {
                  textElem.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? 10 : lineHeight)
                    .text(line)
                })
                
                tooltip.select('.tooltip-divider').style('display', null)

                // Calculate dynamic height based on content
                const contentHeight = Math.max(20, lines.length * lineHeight)
                const buttonHeight = 24
                const totalHeight = 42 + contentHeight + 8 + buttonHeight + 8 // header + content + padding + button + padding

                tooltip.select('.tooltip-bg').attr('height', totalHeight)
                
                // Position and show Show More button
                const buttonWidth = 80
                const buttonX = 100 - (buttonWidth / 2)
                const buttonY = 42 + contentHeight + 16
                
                tooltip.select('.tooltip-show-more-bg')
                  .attr('x', buttonX)
                  .attr('y', buttonY)
                  .attr('width', buttonWidth)
                  .attr('height', buttonHeight)
                  .style('display', null)
                  
                tooltip.select('.tooltip-show-more-text')
                  .attr('x', 100)
                  .attr('y', buttonY + 15)
                  .style('display', null)
              } else {
                // No news available
                const textElem = tooltip.select('.tooltip-text')
                textElem.text('No news for this area')
                tooltip.select('.tooltip-divider').style('display', null)
                tooltip.select('.tooltip-bg').attr('height', 60)
              }
            } catch (e) {
              console.error('Error fetching news for intel hotspot:', e)
              const textElem = tooltip.select('.tooltip-text')
              textElem.text('Error loading news')
              tooltip.select('.tooltip-divider').style('display', null)
              tooltip.select('.tooltip-bg').attr('height', 60)
            }
          })

          group.on('mouseleave', function () {
            // Delay hide to give mouse time to reach the tooltip without flickering
            hideTimer = setTimeout(() => {
              tooltip.style('display', 'none')
              currentHoveredIntel = null
              hideTimer = null
            }, 150)
          })

          group.call(globeDrag)

          // Pulsing ring
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', markerColor)
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', severity === 'high' || severity === 'critical' ? 'hotspot-pulse' : '')

          // Inner dot
          group.append('circle')
            .attr('r', 3)
            .attr('fill', markerColor)

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', markerColor)
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(intel.name)
        })
      }

      // Emerging Hotspots (GDELT-driven). Drawn on top of every other
      // layer so they stand out as new events not yet covered by the
      // static region dataset. Global view only — the marker design
      // (orange pulse + ⚡ label) is meaningless on a US-only map.
      if (layerVisibility.emergingHotspots && mapView === 'global' && emergingHotspots.length > 0) {
        const emergingGroup = svg.append('g').attr('class', 'emerging-hotspots')

        emergingGroup.selectAll('circle.emerging-marker')
          .data(emergingHotspots)
          .enter()
          .append('circle')
          .attr('class', 'emerging-marker hotspot-fast-pulse')
          .attr('cx', (d) => {
            const coords = projection([d.lon, d.lat])
            return coords ? coords[0] : null
          })
          .attr('cy', (d) => {
            const coords = projection([d.lon, d.lat])
            return coords ? coords[1] : null
          })
          .attr('r', 7)
          .attr('fill', '#ff6b35')
          .attr('fill-opacity', 0.85)
          .attr('stroke', '#ff6b35')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .on('click', (event, d) => {
            event.stopPropagation()
            if (!isDraggingRef.current) {
              setSelectedHotspot({
                id: d.id,
                name: d.name,
                location: d.actors.join(' / ') || t('map.emerging'),
                description: t('map.emergingDescription', { mentions: d.mentions }),
                lat: d.lat,
                lon: d.lon,
                severity: d.severity,
                source: 'GDELT',
                news: [],
              })
            }
          })
      }

      // Add pan/zoom for flat mode or US view
      const isFlatMode = mapView !== 'global' || projectionMode === 'flat'
      const wasFlatMode = prevZoomLevelRef.current === -1 || mapView !== 'global' || prevZoomLevelRef.current < 0 // -1 means flat mode
      
      if (isFlatMode) {
        // Flat mode (US view or manual flat projection)
        // Initialize zoom behavior once
        if (!zoomRef.current) {
          zoomRef.current = d3.zoom()
            .scaleExtent([1, MAX_ZOOM])
            .clickDistance(2)
            .filter((event) => {
              // For wheel events
              if (event.type === 'wheel') {
                if (!event.button) return false
                // Prevent zooming beyond limits
                if (event.deltaY < 0 && zoomLevel >= MAX_ZOOM) return false // Zooming in at max
                if (event.deltaY > 0 && zoomLevel <= 1) return false // Zooming out at min
                return true
              }
              // For mouse drag, allow only on background/countries (not on interactive markers)
              const target = event.target
              if (event.button) return false
              // Check if clicking on an interactive marker
              if (target.closest('.hotspot, .intel-hotspot, .us-city, .conflict-zone, .military-base, .nuclear-facility, .cyber-region, .chokepoint')) {
                return false
              }
              // Allow drag on background rect, svg, or country/state paths
              return target.tagName === 'rect' || target.tagName === 'svg' || target.tagName === 'path'
            })
            .on('zoom', (event) => {
              // Clamp the scale to prevent going beyond limits
              const clampedScale = Math.max(1, Math.min(MAX_ZOOM, event.transform.k))
              const newTranslation = [event.transform.x, event.transform.y]
              setZoomLevel(clampedScale)
              setTranslation(newTranslation)
            })
          
          // Apply zoom behavior only once when first created
          svg.call(zoomRef.current)
        }
        
        // Set initial transform when switching to flat mode
        if (prevZoomLevelRef.current >= 0 && isFlatMode) {
          const currentTransform = d3.zoomIdentity.translate(translation[0], translation[1]).scale(zoomLevel)
          svg.call(zoomRef.current.transform, currentTransform)
        }
        
        // Disable custom wheel handler when D3 zoom is active
        svg.on('wheel.mapZoom', null)
      } else {
        // 3D Globe mode - disable D3 zoom
        svg.on('.zoom', null)
        
        // Reset D3 zoom transform when switching back to 3D mode
        if (zoomRef.current && isFlatMode) {
          svg.call(zoomRef.current.transform, d3.zoomIdentity)
        }

        // Custom wheel handler for globe zoom
        svg.on('wheel.mapZoom', function (event) {
          event.preventDefault()
          event.stopPropagation()
          const delta = event.deltaY > 0 ? 0.9 : 1.1
          const newZoom = Math.max(1, Math.min(MAX_ZOOM, zoomLevel * delta))
          setZoomLevel(newZoom)
        })
      }
      
      // Track mode for transition detection (-1 = flat mode, >= 0 = 3d mode with zoom level)
      prevZoomLevelRef.current = isFlatMode ? -1 : zoomLevel
    } catch (error) {
      console.error('Error rendering map:', error)
      setRenderError(`${t('map.failedRender')}: ${error.message}`)
    }
  }

  // Keep renderMapRef in sync with the latest renderMap closure so the render
  // effect can invoke it without needing it in the dep array. renderMap reads
  // many component state values; updating via ref means the effect's deps
  // remain an accurate description of what triggers a full SVG rebuild.
  renderMapRef.current = renderMap

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 1))
  }

  const handleZoomReset = () => {
    setZoomLevel(1)
    setTranslation([0, 0])
    setRotation([0, 0])
    rotationRef.current = [0, 0]
  }

  const toggleLayer = (layer) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const handleHotspotClick = async (hotspot) => {
    // Normalize description field - some use 'desc' instead of 'description'
    const normalizedHotspot = {
      ...hotspot,
      description: hotspot.description || hotspot.desc || t('map.situationDefault', { name: hotspot.name }),
      type: hotspot.type || 'hotspot',
      news: []
    }

    // Open modal immediately with loading state
    setSelectedHotspot(normalizedHotspot)
    setNewsLoading(true)

    // Fetch news for this specific marker
    try {
      const newsItems = await MapFeedService.fetchNewsForHotspot(hotspot)
      setSelectedHotspot(prev => prev ? { ...prev, news: newsItems } : null)
    } catch (e) {
      console.error('Error fetching news for hotspot:', e)
    } finally {
      setNewsLoading(false)
    }
  }

  const handleIntelHotspotClick = async (intel) => {
    // Open modal immediately with loading state
    setSelectedHotspot({ ...intel, type: 'intel', news: [] })
    setNewsLoading(true)

    // Fetch news for this specific marker
    try {
      const newsItems = await MapFeedService.fetchNewsForHotspot(intel)
      setSelectedHotspot(prev => prev ? { ...prev, news: newsItems } : null)
    } catch (e) {
      console.error('Error fetching news for intel hotspot:', e)
    } finally {
      setNewsLoading(false)
    }
  }

  const closePopup = () => {
    setSelectedHotspot(null)
  }

  if (loading || (!worldData && !usData)) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-4 text-text-secondary">
        <div className="w-10 h-10 border-[3px] border-border-main border-t-accent rounded-full animate-spin"></div>
        <div>{t('map.loadingData')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 w-full h-full gap-4 text-text-secondary"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-3xl" aria-hidden="true">!</div>
        <div>{error}</div>
        <button
          onClick={reload}
          className="mt-2.5 px-2.5 py-1.5 cursor-pointer bg-accent text-bg-dark border-none rounded font-semibold hover:opacity-90"
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  // Extra safety check - don't render if we don't have the required data for current view
  if (mapView === 'global' && !worldData) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-4 text-text-secondary">
        <div>{t('map.loadingWorld')}</div>
      </div>
    )
  }

  if (mapView === 'us' && !usData) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-4 text-text-secondary">
        <div>{t('map.loadingUs')}</div>
      </div>
    )
  }

  return (
    <div className="global-map-container relative h-full w-full flex-1 bg-[linear-gradient(135deg,#0a1419_0%,#020a08_100%)] overflow-hidden" ref={containerRef}>
      {renderError && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-2 bg-[rgba(10,14,20,0.9)] border border-red-500/50 rounded text-sm text-red-300 max-w-md text-center"
          role="alert"
          aria-live="assertive"
        >
          {renderError}
        </div>
      )}
      {gdeltError && (
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 bg-[rgba(10,14,20,0.85)] border border-orange-500/40 rounded text-xs text-orange-300 max-w-md text-center"
          role="status"
        >
          {t('map.emerging')}: {gdeltError.message || String(gdeltError)}
        </div>
      )}
      {/* Right Controls Sidebar */}
      <MapViewControls
        mapView={mapView}
        setMapView={setMapView}
        projectionMode={projectionMode}
        onProjectionModeChange={handleProjectionModeChange}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
      />
      {/* Left Layer Controls Sidebar */}
      <MapLayerControls
        layerVisibility={layerVisibility}
        toggleLayer={toggleLayer}
        setLayerVisibility={setLayerVisibility}
        mapView={mapView}
      />
      <div className="absolute inset-0 pointer-events-none z-[5]">
        <div className="absolute text-xs font-semibold text-accent tracking-[1px] p-2 bg-[rgba(10,14,20,0.7)] border border-border-main bottom-2 left-2 rounded-tr flex gap-4">
          <span className="flex items-center gap-1 text-[0.65rem]"><span className="legend-dot w-2 h-2 rounded-full inline-block hotspot"></span>{t('map.high')}</span>
          <span className="flex items-center gap-1 text-[0.65rem]"><span className="legend-dot w-2 h-2 rounded-full inline-block active"></span>{t('map.medium')}</span>
          <span className="flex items-center gap-1 text-[0.65rem]"><span className="legend-dot w-2 h-2 rounded-full inline-block inactive"></span>{t('map.noIntel')}</span>
        </div>
        <div className="absolute text-xs font-semibold text-accent tracking-[1px] p-2 bg-[rgba(10,14,20,0.7)] border border-border-main bottom-2 right-2 rounded-tl font-[family-name:var(--font-mono)] !text-[0.65rem]">
          <div>{new Date().toISOString().slice(0, 16).replace('T', ' ')}Z</div>
          <div style={{ fontSize: '9px', opacity: 0.7 }}>
            {t('map.updated', { time: lastUpdated.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })}
          </div>
        </div>
      </div>
      <svg
        ref={svgRef}
        role="img"
        aria-label={t('map.svgLabel')}
        data-map-keyboard-target
        tabIndex={0}
      ></svg>
      <HotspotModal selectedHotspot={selectedHotspot} onClose={closePopup} newsLoading={newsLoading} />
      <div className="absolute bottom-0 w-full z-20">
        <TickerStrip mode="geo" />
      </div>
    </div>
  )
}

export default GlobalMap
