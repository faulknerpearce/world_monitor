import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import {
  US_CITIES, SHIPPING_CHOKEPOINTS, MILITARY_BASES,
  NUCLEAR_FACILITIES, UNDERSEA_CABLES, CYBER_REGIONS
} from '@config/regions.js'
import { MapFeedService } from './mapFeedService'
import { useDynamicRegions } from '@hooks/useDynamicRegions'
import { useI18n } from '@context/I18nContext'
import HotspotModal from './HotspotModal'
import TickerStrip from '@features/markets/TickerStrip'

// Centralized color palette for map markers based on severity level.
// Keeps a single source of truth so every marker type stays visually consistent.
const MARKER_COLORS = {
  critical: '#ef4444',  // red
  high:     '#ef4444',  // red
  elevated: '#f59e0b',  // amber / yellow
  medium:   '#22c55e',  // green
  low:      '#22c55e',  // green
}

/**
 * Return the marker colour for a given severity string.
 * Falls back to green when the severity is unknown.
 */
const getMarkerColor = (severity) => MARKER_COLORS[severity] || MARKER_COLORS.medium

const GlobalMap = () => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const rotationRef = useRef([0, 0]) // Ref to track rotation for drag callbacks
  const { t, locale } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapView, setMapView] = useState('global') // 'global' or 'us'
  const [worldData, setWorldData] = useState(null)
  const [usData, setUsData] = useState(null)
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const isDraggingRef = useRef(false) // Ref so D3 closures always read the latest value
  const zoomRef = useRef(null) // Store D3 zoom behavior to avoid re-initialization
  const prevZoomLevelRef = useRef(1) // Track previous zoom level to detect mode transitions

  // Use dynamic regions hook
  const { hotspots, intelHotspots, usHotspots, conflictZones, lastUpdated } = useDynamicRegions()

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
  const MAX_ZOOM = 3.5 // Prevent zooming too close into the globe

  // Auto-rotation state
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    hotspots: false,
    intelHotspots: true,
    shippingChokepoints: false,
    conflictZones: false,
    militaryBases: false,
    nuclearFacilities: false,
    underseaCables: false,
    cyberRegions: false,
    usCities: false
  })

  useEffect(() => {
    loadMapData()
  }, [])

  // Update layer visibility based on map view
  useEffect(() => {
    setLayerVisibility(prev => ({
      ...prev,
      hotspots: mapView === 'us',
      usCities: mapView === 'us'
    }))
  }, [mapView])

  // Auto-rotation effect - slow ambient spin when idle
  useEffect(() => {
    if (!isAutoRotating || isUserInteracting || mapView !== 'global' || zoomLevel > MAX_ZOOM) {
      return
    }

    const rotationSpeed = 0.15 // degrees per frame
    const interval = setInterval(() => {
      setRotation(prev => {
        const newRotation = [prev[0] + rotationSpeed, prev[1]]
        rotationRef.current = newRotation
        return newRotation
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isAutoRotating, isUserInteracting, mapView, zoomLevel])

  useEffect(() => {
    try {
      if (mapView === 'global' && worldData && worldData.objects && worldData.objects.countries) {
        renderMap()
      } else if (mapView === 'us' && usData && usData.objects && usData.objects.states) {
        renderMap()
      }
    } catch (error) {
      console.error('Error in map render effect:', error)
      setError(t('map.failedRender'))
    }
    // Only re-render when essential dependencies change - lastUpdated timestamp handles dynamic data updates
  }, [worldData, usData, mapView, zoomLevel, translation, rotation, layerVisibility, lastUpdated, t])

  const loadMapData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load world map topology data
      const worldResponse = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      if (!worldResponse.ok) {
        throw new Error(`Failed to fetch world map: ${worldResponse.status}`)
      }
      const world = await worldResponse.json()
      setWorldData(world)

      // Load US map topology data
      const usResponse = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      if (!usResponse.ok) {
        throw new Error(`Failed to fetch US map: ${usResponse.status}`)
      }
      const us = await usResponse.json()
      setUsData(us)

      setError(null)
    } catch (e) {
      console.error('Failed to load map:', e)
      setError(t('map.failedLoadData', { message: e.message }))
    } finally {
      setLoading(false)
    }
  }

  const renderMap = () => {
    try {
      if (!containerRef.current || !svgRef.current) return
      if (mapView === 'global' && !worldData) return
      if (mapView === 'us' && !usData) return

      // Additional validation
      if (mapView === 'global' && (!worldData.objects || !worldData.objects.countries)) {
        console.error('Invalid world data structure')
        setError(t('map.invalidData'))
        return
      }

      if (mapView === 'us' && (!usData.objects || !usData.objects.states)) {
        console.error('Invalid US data structure')
        setError(t('map.invalidData'))
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
            .rotate(rotation)
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
        const center = [-rotation[0], -rotation[1]]
        return d3.geoDistance([lon, lat], center) < Math.PI / 2
      }

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

          // Attach drag behavior to sphere
          const drag = d3.drag()
            .container(function () { return svgRef.current })
            .clickDistance(5) // Ignore drags smaller than 5 pixels (treats them as clicks)
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = false
              d3.select(this).style('cursor', 'grabbing')
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              // Scale sensitivity based on zoom level - higher zoom = lower sensitivity for finer control
              const sensitivity = 0.5 / zoomLevel
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', function (event) {
              event.sourceEvent.stopPropagation()
              d3.select(this).style('cursor', 'grab')
              setTimeout(() => isDraggingRef.current = false, 50)
            })

          sphere.call(drag)
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
          .call(d3.drag()
            .container(function () { return svgRef.current })
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = false
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5 / zoomLevel
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', function (event) {
              event.sourceEvent.stopPropagation()
              setTimeout(() => isDraggingRef.current = false, 50)
            })
          )
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

            group.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({
                ...city,
                type: 'city',
                severity: city.type === 'capital' ? 'high' : city.type === 'military' ? 'elevated' : 'medium'
              })
            })

            group.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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

          group.on('click', () => {
            if (!isDraggingRef.current) handleHotspotClick(hotspot)
          })

          group.call(d3.drag()
            .container(function () { return svgRef.current })
            .on('start', () => isDraggingRef.current = false)
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5 / zoomLevel
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
          )

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

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...point, type: 'chokepoint' })
            })

            g.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...zone, type: 'conflict' })
            })

            g.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...base, type: 'base' })
            })

            g.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...nuc, type: 'nuclear' })
            })

            g.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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

            g.on('click', () => {
              if (!isDraggingRef.current) handleHotspotClick({ ...reg, type: 'cyber' })
            })

            g.call(d3.drag()
              .container(function () { return svgRef.current })
              .on('start', () => isDraggingRef.current = false)
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                isDraggingRef.current = true
                const sensitivity = 0.5 / zoomLevel
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
            )

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
          .attr('fill', '#00ff88')
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
          .attr('fill', 'rgba(0, 255, 136, 0.2)')
          .attr('stroke', '#00ff88')
          .attr('stroke-width', 1)
          .style('display', 'none')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')

        // Show More button text
        tooltip.append('text')
          .attr('class', 'tooltip-show-more-text')
          .attr('fill', '#00ff88')
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

          group.call(d3.drag()
            .container(function () { return svgRef.current })
            .on('start', () => isDraggingRef.current = false)
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              isDraggingRef.current = true
              const sensitivity = 0.5 / zoomLevel
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => isDraggingRef.current = false, 50))
          )

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
      setError(`${t('map.failedRender')}: ${error.message}`)
    }
  }

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
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-4 text-text-secondary">
        <div className="text-3xl">!</div>
        <div>{error}</div>
        <button onClick={loadMapData} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>
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
      {/* Right Controls Sidebar */}
      <div className="absolute top-4 z-10 flex flex-col gap-2 right-4 max-[1000px]:top-20 max-[768px]:top-auto max-[768px]:bottom-[50px] max-[768px]:left-1/2 max-[768px]:-translate-x-1/2 max-[768px]:right-auto max-[768px]:w-[95%] max-[768px]:max-w-[400px] bg-[rgba(10,14,20,0.85)] backdrop-blur-md rounded-xl border border-border-main p-1.5 shadow-lg">
        
        <div className="flex flex-col gap-2 max-[768px]:flex-col max-[768px]:gap-1.5">
          {/* Top Row on Mobile (Region + Projection) */}
          <div className="flex flex-col gap-2 max-[768px]:flex-row max-[768px]:justify-between max-[768px]:gap-1 border-b border-border-main pb-1.5 max-[768px]:pb-1.5">
            {/* Region Toggle */}
            <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-1/2 max-[768px]:border-r max-[768px]:border-border-main max-[768px]:pr-1">
              <button
                className={`py-2 px-3 text-xs font-bold tracking-[1px] rounded-lg transition-all duration-200 text-left max-[768px]:w-1/2 max-[768px]:text-[0.6rem] max-[768px]:py-1.5 max-[768px]:px-1 max-[768px]:text-center ${mapView === 'global' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
                onClick={() => setMapView('global')}
              >
                {t('map.global')}
              </button>
              <button
                className={`py-2 px-3 text-xs font-bold tracking-[1px] rounded-lg transition-all duration-200 text-left max-[768px]:w-1/2 max-[768px]:text-[0.6rem] max-[768px]:py-1.5 max-[768px]:px-1 max-[768px]:text-center ${mapView === 'us' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
                onClick={() => setMapView('us')}
              >
                {t('map.us')}
              </button>
            </div>

            {/* Projection Controls */}
            <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-1/2 max-[768px]:pl-1">
              <button
                className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 max-[768px]:w-1/2 max-[768px]:text-[0.55rem] max-[768px]:px-1 ${projectionMode === '3d' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
                onClick={() => handleProjectionModeChange('3d')}
              >
                3D Globe
              </button>
              <button
                className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 max-[768px]:w-1/2 max-[768px]:text-[0.55rem] max-[768px]:px-1 ${projectionMode === 'flat' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
                onClick={() => handleProjectionModeChange('flat')}
              >
                Flat Map
              </button>
            </div>
          </div>

          {/* Bottom Row on Mobile (Zoom + Rotate) */}
          <div className="flex flex-col gap-2 max-[768px]:flex-row max-[768px]:justify-between max-[768px]:gap-1">
            {/* Zoom Controls */}
            <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-2/3 max-[768px]:items-center">
              <button className="w-full py-1.5 px-3 bg-transparent text-text-primary rounded-lg font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:bg-[rgba(255,255,255,0.05)]" onClick={handleZoomIn} title={t('map.zoomIn')}>+</button>
              <div className="flex items-center justify-center py-1 text-[0.65rem] font-mono text-text-secondary max-[768px]:px-2 max-[768px]:w-10">{zoomLevel.toFixed(1)}x</div>
              <button className="w-full py-1.5 px-3 bg-transparent text-text-primary rounded-lg font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:bg-[rgba(255,255,255,0.05)]" onClick={handleZoomOut} title={t('map.zoomOut')}>−</button>
              <button className="w-full py-1.5 bg-transparent text-text-primary rounded-lg text-xs font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:ml-auto max-[768px]:bg-[rgba(255,255,255,0.05)] max-[768px]:text-[0.6rem]" onClick={handleZoomReset} title={t('map.reset')}>RST</button>
            </div>

            {/* Rotate Button (Extracted to Bottom Row on Mobile) */}
            <div className="flex flex-col gap-1 max-[768px]:w-1/3">
              <button
                className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 border border-border-main max-[768px]:w-full max-[768px]:h-full max-[768px]:text-[0.6rem] ${isAutoRotating ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[#10b981]/30' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                onClick={() => setIsAutoRotating(!isAutoRotating)}
              >
                {isAutoRotating ? t('map.rotating') : 'PAUSED'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Left Layer Controls Sidebar */}
      <div className="absolute top-4 z-10 flex flex-col gap-3 left-4 max-[1000px]:top-20 max-[768px]:hidden bg-[rgba(10,14,20,0.85)] backdrop-blur-md rounded-xl border border-border-main p-2 shadow-lg w-[180px]">
        
        {/* Layer Presets */}
        <div className="flex flex-col gap-1 border-b border-border-main pb-2 mb-1">
          <span className="text-[0.6rem] font-bold tracking-widest text-text-dim px-2 pb-1 mb-1 block">PRESETS</span>
          
          <button
            className={`py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${!layerVisibility.shippingChokepoints && !layerVisibility.conflictZones && !layerVisibility.militaryBases ? 'bg-[rgba(99,179,237,0.15)] text-accent' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setLayerVisibility(prev => ({
              ...prev, hotspots: false, intelHotspots: true, shippingChokepoints: false, conflictZones: false, militaryBases: false, nuclearFacilities: false, underseaCables: false, cyberRegions: false
            }))}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {t('map.presetIntel')}
          </button>
          
          <button
            className={`py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${layerVisibility.conflictZones && layerVisibility.intelHotspots ? 'bg-[rgba(239,68,68,0.15)] text-red-500' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setLayerVisibility(prev => ({
              ...prev, hotspots: true, intelHotspots: true, shippingChokepoints: false, conflictZones: true, militaryBases: false, nuclearFacilities: false, underseaCables: false, cyberRegions: false
            }))}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {t('map.presetConflict')}
          </button>

          <button
            className={`py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${layerVisibility.shippingChokepoints && layerVisibility.underseaCables ? 'bg-[rgba(245,158,11,0.15)] text-amber-500' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setLayerVisibility(prev => ({
              ...prev, hotspots: false, intelHotspots: false, shippingChokepoints: true, conflictZones: false, militaryBases: false, nuclearFacilities: false, underseaCables: true, cyberRegions: false
            }))}
          >
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {t('map.presetTrade')}
          </button>

          <button
            className={`py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${layerVisibility.militaryBases && layerVisibility.nuclearFacilities ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setLayerVisibility(prev => ({
              ...prev, hotspots: false, intelHotspots: true, shippingChokepoints: false, conflictZones: true, militaryBases: true, nuclearFacilities: true, underseaCables: false, cyberRegions: false
            }))}
          >
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('map.presetDefense')}
          </button>
        </div>
        
        {/* Individual Toggles */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.6rem] font-bold tracking-widest text-text-dim px-2 pt-1 pb-1 mb-1 block">LAYERS</span>
          
          <div className="grid grid-cols-2 gap-1">
            <button
              className={`py-1.5 px-2 rounded-md text-[0.6rem] font-bold tracking-wide transition-all duration-200 ${layerVisibility.intelHotspots ? 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
              onClick={() => toggleLayer('intelHotspots')}
            >
              {t('map.intel')}
            </button>
            <button
              className={`py-1.5 px-2 rounded-md text-[0.6rem] font-bold tracking-wide transition-all duration-200 ${layerVisibility.hotspots ? 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
              onClick={() => toggleLayer('hotspots')}
            >
              {t('map.watch')}
            </button>
            {mapView === 'us' && (
              <button
                className={`py-1.5 px-2 rounded-md text-[0.6rem] font-bold tracking-wide transition-all duration-200 ${layerVisibility.usCities ? 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                onClick={() => toggleLayer('usCities')}
              >
                {t('map.cities')}
              </button>
            )}
            {mapView === 'global' && (
              <>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.conflictZones ? 'bg-[rgba(239,68,68,0.1)] text-red-500 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('conflictZones')}
                >
                  CONFLICT
                </button>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.shippingChokepoints ? 'bg-[rgba(245,158,11,0.1)] text-amber-500 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('shippingChokepoints')}
                >
                  SHIPPING
                </button>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.militaryBases ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('militaryBases')}
                >
                  MILITARY
                </button>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.nuclearFacilities ? 'bg-[rgba(168,85,247,0.1)] text-purple-500 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('nuclearFacilities')}
                >
                  NUCLEAR
                </button>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.underseaCables ? 'bg-[rgba(56,189,248,0.1)] text-sky-500 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('underseaCables')}
                >
                  INFRA
                </button>
                <button
                  className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility.cyberRegions ? 'bg-[rgba(236,72,153,0.1)] text-pink-500 shadow-[inset_0_0_0_1px_rgba(236,72,153,0.3)]' : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onClick={() => toggleLayer('cyberRegions')}
                >
                  CYBER
                </button>
              </>
            )}
          </div>
        </div>
      </div>
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
      <svg ref={svgRef}></svg>
      <HotspotModal selectedHotspot={selectedHotspot} onClose={closePopup} newsLoading={newsLoading} />
      <div className="absolute bottom-0 w-full z-20">
        <TickerStrip mode="geo" />
      </div>
    </div>
  )
}

export default GlobalMap
