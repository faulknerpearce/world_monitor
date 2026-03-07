import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import {
  US_CITIES, SHIPPING_CHOKEPOINTS, MILITARY_BASES,
  NUCLEAR_FACILITIES, UNDERSEA_CABLES, CYBER_REGIONS
} from '@config/regions.js'
import { MapFeedService } from '@services/mapFeedService'
import { useDynamicRegions } from '@hooks/useDynamicRegions'
import HotspotModal from './HotspotModal'
import TickerStrip from '@features/markets/TickerStrip'
import './GlobalMap.css'

const GlobalMap = () => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const rotationRef = useRef([0, 0]) // Ref to track rotation for drag callbacks
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapView, setMapView] = useState('global') // 'global' or 'us'
  const [worldData, setWorldData] = useState(null)
  const [usData, setUsData] = useState(null)
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // Track if user is dragging

  // Use dynamic regions hook
  const { hotspots, intelHotspots, usHotspots, conflictZones, lastUpdated } = useDynamicRegions()

  // Calculate quick stats
  const activeConflicts = conflictZones ? conflictZones.length : 0
  const totalIntel = (intelHotspots ? intelHotspots.length : 0) + (hotspots ? Object.keys(hotspots).length : 0)
  const alertLevel = activeConflicts > 3 ? 'HIGH' : activeConflicts > 0 ? 'ELEVATED' : 'MODERATE'

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [translation, setTranslation] = useState([0, 0])
  const [rotation, setRotation] = useState([0, 0]) // [longitude, latitude] rotation for globe

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
    if (!isAutoRotating || isUserInteracting || mapView !== 'global' || zoomLevel > 2) {
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
      setError('Failed to render map')
    }
    // Only re-render when essential dependencies change - lastUpdated timestamp handles dynamic data updates
  }, [worldData, usData, mapView, zoomLevel, translation, rotation, layerVisibility, lastUpdated])

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
      setError('Failed to load map data: ' + e.message)
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
        setError('Invalid map data format')
        return
      }

      if (mapView === 'us' && (!usData.objects || !usData.objects.states)) {
        console.error('Invalid US data structure')
        setError('Invalid map data format')
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
        // Dynamic projection based on zoom level
        if (zoomLevel <= 2) {
          // Use orthographic projection for spherical globe appearance when zoomed out
          projection = d3.geoOrthographic()
            .scale((minDimension / 2.2) * zoomLevel)
            .translate([width / 2, height / 2])
            .center([0, 0])
            .rotate(rotation)
        } else {
          // Use natural earth projection for flatter appearance when zoomed in
          projection = d3.geoNaturalEarth1()
            .scale((width / (2 * Math.PI)) * zoomLevel)
            .translate([width / 2 + translation[0], height / 2 + translation[1]])
            .center([180, 0])
        }
      } else {
        projection = d3.geoAlbersUsa()
          .scale(width * zoomLevel * 1.2)
          .translate([width / 2 + translation[0], height / 2 + translation[1]])
      }

      const path = d3.geoPath().projection(projection)

      // Helper: check if a point is on the visible side of the globe
      const isMarkerVisible = (lon, lat) => {
        if (mapView !== 'global' || zoomLevel > 2) return true
        const center = [-rotation[0], -rotation[1]]
        return d3.geoDistance([lon, lat], center) < Math.PI / 2
      }

      // Background
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'var(--map-bg)')
        .style('pointer-events', 'none')

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

        // Render sphere base (Ocean) with glow - this will be the drag surface
        if (zoomLevel <= 2) {
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
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              setIsDragging(false)
              d3.select(this).style('cursor', 'grabbing')
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              setIsDragging(true)
              const sensitivity = 0.5
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
              setTimeout(() => setIsDragging(false), 50)
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

        // Graticule (lat/lon lines)
        const graticule = d3.geoGraticule().step([30, 30])
        svg.append('path')
          .datum(graticule)
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', 'var(--map-grid)')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.5)

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
            .on('start', function (event) {
              event.sourceEvent.stopPropagation()
              setIsDragging(false)
            })
            .on('drag', function (event) {
              event.sourceEvent.stopPropagation()
              setIsDragging(true)
              const sensitivity = 0.5
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
              setTimeout(() => setIsDragging(false), 50)
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
          .on('mouseenter', function (event, d) {
            d3.select(this)
              .attr('fill', 'var(--map-hover)')
              .attr('stroke', 'var(--accent)')
          })
          .on('mouseleave', function (event, d) {
            d3.select(this).attr('fill', 'var(--map-land)').attr('stroke', 'var(--map-stroke)')
          })

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
              if (!isDragging) handleHotspotClick({
                ...city,
                type: 'city',
                severity: city.type === 'capital' ? 'high' : city.type === 'military' ? 'elevated' : 'medium'
              })
            })

            group.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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
          const group = hotspotsGroup.append('g')
            .attr('class', `hotspot ${severity}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          group.on('click', () => {
            if (!isDragging) handleHotspotClick(hotspot)
          })

          group.call(d3.drag()
            .on('start', () => setIsDragging(false))
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              setIsDragging(true)
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => setIsDragging(false), 50))
          )

          // Pulsing ring
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', severity === 'high' ? 'hotspot-pulse' : '')

          // Inner dot
          group.append('circle')
            .attr('r', 3)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
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
              if (!isDragging) handleHotspotClick({ ...point, type: 'chokepoint' })
            })

            g.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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
            const color = intensity === 'high' ? '#ff3333' : intensity === 'elevated' ? '#ffcc00' : '#ccff00'

            const g = conflictGroup.append('g')
              .attr('transform', `translate(${x},${y})`)
              .style('cursor', 'pointer')

            g.on('click', () => {
              if (!isDragging) handleHotspotClick({ ...zone, type: 'conflict' })
            })

            g.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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
              if (!isDragging) handleHotspotClick({ ...base, type: 'base' })
            })

            g.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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
              if (!isDragging) handleHotspotClick({ ...nuc, type: 'nuclear' })
            })

            g.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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
              if (!isDragging) handleHotspotClick({ ...reg, type: 'cyber' })
            })

            g.call(d3.drag()
              .on('start', () => setIsDragging(false))
              .on('drag', (event) => {
                event.sourceEvent.stopPropagation()
                setIsDragging(true)
                const sensitivity = 0.5
                const currentRotation = rotationRef.current
                const newRotation = [
                  currentRotation[0] + event.dx * sensitivity,
                  Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
                ]
                rotationRef.current = newRotation
                setRotation(newRotation)
              })
              .on('end', () => setTimeout(() => setIsDragging(false), 50))
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

        intelHotspots.forEach(intel => {
          // Skip DC in US view since it's already rendered as a city
          if (mapView === 'us' && intel.id === 'dc') return
          if (!isMarkerVisible(intel.lon, intel.lat)) return

          const projected = projection([intel.lon, intel.lat])
          if (!projected) return
          const [x, y] = projected

          // Determine severity for intel hotspots
          let severity = 'medium' // default
          if (intel.id === 'dc') severity = 'high' // DC is a major intelligence hub
          else if (intel.status && intel.status.includes('High')) severity = 'high'
          else if (intel.status && intel.status.includes('Elevated')) severity = 'elevated'

          const group = intelGroup.append('g')
            .attr('class', `intel-hotspot ${severity}`)
            .attr('transform', `translate(${x},${y})`)
            .style('cursor', 'pointer')

          group.on('click', () => {
            if (!isDragging) handleIntelHotspotClick({ ...intel, severity })
          })

          group.call(d3.drag()
            .on('start', () => setIsDragging(false))
            .on('drag', (event) => {
              event.sourceEvent.stopPropagation()
              setIsDragging(true)
              const sensitivity = 0.5
              const currentRotation = rotationRef.current
              const newRotation = [
                currentRotation[0] + event.dx * sensitivity,
                Math.max(-90, Math.min(90, currentRotation[1] - event.dy * sensitivity))
              ]
              rotationRef.current = newRotation
              setRotation(newRotation)
            })
            .on('end', () => setTimeout(() => setIsDragging(false), 50))
          )

          // Pulsing ring (like regular hotspots)
          group.append('circle')
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .attr('class', severity === 'high' ? 'hotspot-pulse' : '')

          // Inner dot (like regular hotspots)
          group.append('circle')
            .attr('r', 3)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')

          // Label
          group.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', severity === 'high' ? '#ff3333' : severity === 'elevated' ? '#ffcc00' : '#00ff88')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(intel.name)
        })
      }

      // Add pan/zoom for flat map view
      if (mapView !== 'global' || zoomLevel > 2) {
        const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            const newScale = event.transform.k
            const newTranslation = [event.transform.x, event.transform.y]
            setZoomLevel(newScale)
            setTranslation(newTranslation)
          })

        svg.call(zoom)
      }

      // Always allow zooming via scroll
      svg.on('wheel.zoom', function (event) {
        event.preventDefault()
        const delta = event.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(1, Math.min(8, zoomLevel * delta))
        setZoomLevel(newZoom)
      })
    } catch (error) {
      console.error('Error rendering map:', error)
      setError('Failed to render map: ' + error.message)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 8))
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
      description: hotspot.description || hotspot.desc || `Monitoring situation in ${hotspot.name}.`,
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
      <div className="global-map-loading">
        <div className="loading-spinner"></div>
        <div>Loading map data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="global-map-error">
        <div className="error-icon">!</div>
        <div>{error}</div>
        <button onClick={loadMapData} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
  }

  // Extra safety check - don't render if we don't have the required data for current view
  if (mapView === 'global' && !worldData) {
    return (
      <div className="global-map-loading">
        <div>Loading world map...</div>
      </div>
    )
  }

  if (mapView === 'us' && !usData) {
    return (
      <div className="global-map-loading">
        <div>Loading US map...</div>
      </div>
    )
  }

  return (
    <div className="global-map-container" ref={containerRef}>
      {/* Quick Stats Bar */}
      <div className="map-quick-stats">
        <div className="stat-item">
          <span className="stat-label">ACTIVE CONFLICTS</span>
          <span className={`stat-value ${activeConflicts > 2 ? 'critical' : ''}`}>{activeConflicts}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">GLOBAL ALERT</span>
          <span className={`stat-value alert-${alertLevel.toLowerCase()}`}>{alertLevel}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">INTEL HOTSPOTS</span>
          <span className="stat-value">{totalIntel > 0 ? totalIntel : '—'}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <button 
            className={`auto-rotate-btn ${isAutoRotating ? 'active' : ''}`}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
          >
            {isAutoRotating ? 'ROTATING' : 'PAUSED'}
          </button>
        </div>
      </div>
      <div className="map-controls map-controls-right">
        <div className="map-view-toggle">
          <button
            className={mapView === 'global' ? 'active' : ''}
            onClick={() => setMapView('global')}
          >
            GLOBAL
          </button>
          <button
            className={mapView === 'us' ? 'active' : ''}
            onClick={() => setMapView('us')}
          >
            US
          </button>
        </div>
        <div className="map-zoom-controls">
          <button onClick={handleZoomIn} title="Zoom In">+</button>
          <div className="zoom-level">{zoomLevel.toFixed(1)}x</div>
          <button onClick={handleZoomOut} title="Zoom Out">−</button>
          <button onClick={handleZoomReset} title="Reset">RST</button>
        </div>
      </div>
      <div className="map-controls map-controls-left">
        <div className="map-layer-toggles">
          {/* Layer Presets */}
          <div className="layer-preset-group">
            <button
              className={`layer-preset ${!layerVisibility.shippingChokepoints && !layerVisibility.conflictZones && !layerVisibility.militaryBases ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: false,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: false,
                cyberRegions: false
              }))}
              title="Intel focus - Intelligence hotspots only"
            >
              ◈ INTEL
            </button>
            <button
              className={`layer-preset ${layerVisibility.conflictZones && layerVisibility.intelHotspots ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: true,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: true,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: false,
                cyberRegions: false
              }))}
              title="Geopolitical focus - Conflicts and hotspots"
            >
              ✕ CONFLICT
            </button>
            <button
              className={`layer-preset ${layerVisibility.shippingChokepoints && layerVisibility.underseaCables ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: false,
                shippingChokepoints: true,
                conflictZones: false,
                militaryBases: false,
                nuclearFacilities: false,
                underseaCables: true,
                cyberRegions: false
              }))}
              title="Trade focus - Shipping routes and infrastructure"
            >
              ⚓ TRADE
            </button>
            <button
              className={`layer-preset ${layerVisibility.militaryBases && layerVisibility.nuclearFacilities ? 'active' : ''}`}
              onClick={() => setLayerVisibility(prev => ({
                ...prev,
                hotspots: false,
                intelHotspots: true,
                shippingChokepoints: false,
                conflictZones: true,
                militaryBases: true,
                nuclearFacilities: true,
                underseaCables: false,
                cyberRegions: false
              }))}
              title="Defense focus - Military and nuclear facilities"
            >
              ▲ DEFENSE
            </button>
          </div>
          
          {/* Individual Layer Toggles */}
          <div className="layer-toggle-group">
            <button
              className={`layer-toggle ${layerVisibility.intelHotspots ? 'active' : ''}`}
              onClick={() => toggleLayer('intelHotspots')}
              title="Intelligence Hotspots"
            >
              Intel
            </button>
            <button
              className={`layer-toggle ${layerVisibility.hotspots ? 'active' : ''}`}
              onClick={() => toggleLayer('hotspots')}
              title="Watch Zones"
            >
              Watch
            </button>
            {mapView === 'us' && (
              <button
                className={`layer-toggle ${layerVisibility.usCities ? 'active' : ''}`}
                onClick={() => toggleLayer('usCities')}
                title="Major Cities"
              >
                Cities
              </button>
            )}
          </div>
          {mapView === 'global' && (
            <div className="layer-toggle-group">
              <button
                className={`layer-toggle ${layerVisibility.conflictZones ? 'active' : ''}`}
                onClick={() => toggleLayer('conflictZones')}
                title="Active Conflicts"
              >
                Conflict
              </button>
              <button
                className={`layer-toggle ${layerVisibility.shippingChokepoints ? 'active' : ''}`}
                onClick={() => toggleLayer('shippingChokepoints')}
                title="Shipping Routes"
              >
                Shipping
              </button>
              <button
                className={`layer-toggle ${layerVisibility.militaryBases ? 'active' : ''}`}
                onClick={() => toggleLayer('militaryBases')}
                title="Military Bases"
              >
                Military
              </button>
              <button
                className={`layer-toggle ${layerVisibility.nuclearFacilities ? 'active' : ''}`}
                onClick={() => toggleLayer('nuclearFacilities')}
                title="Nuclear Facilities"
              >
                Nuclear
              </button>
              <button
                className={`layer-toggle ${layerVisibility.underseaCables ? 'active' : ''}`}
                onClick={() => toggleLayer('underseaCables')}
                title="Undersea Cables"
              >
                Infra
              </button>
              <button
                className={`layer-toggle ${layerVisibility.cyberRegions ? 'active' : ''}`}
                onClick={() => toggleLayer('cyberRegions')}
                title="Cyber Regions"
              >
                Cyber
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="map-labels">
        <div className="map-label bottom-left">
          <span className="legend-item"><span className="legend-dot high"></span>HIGH</span>
          <span className="legend-item"><span className="legend-dot elevated"></span>ELEVATED</span>
          <span className="legend-item"><span className="legend-dot medium"></span>MEDIUM</span>
        </div>
        <div className="map-label bottom-right">
          <div>{new Date().toISOString().slice(0, 16).replace('T', ' ')}Z</div>
          <div style={{ fontSize: '9px', opacity: 0.7 }}>
            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <svg ref={svgRef}></svg>
      <HotspotModal selectedHotspot={selectedHotspot} onClose={closePopup} newsLoading={newsLoading} />
      <TickerStrip mode="geo" />
    </div>
  )
}

export default GlobalMap
