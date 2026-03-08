import { useEffect, useState } from 'react'
import { useI18n } from '@context/I18nContext'
import { formatPercent } from '@utils'
import './HeatmapPanel.css'

const SECTORS = [
  { symbol: 'XLK', name: 'Tech' },
  { symbol: 'XLF', name: 'Finance' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLV', name: 'Health' },
  { symbol: 'XLY', name: 'Consumer' },
  { symbol: 'XLI', name: 'Industrial' },
  { symbol: 'XLP', name: 'Staples' },
  { symbol: 'XLU', name: 'Utilities' },
  { symbol: 'XLB', name: 'Materials' },
  { symbol: 'XLRE', name: 'Real Est' },
  { symbol: 'XLC', name: 'Comms' },
  { symbol: 'SMH', name: 'Semis' }
]

const HeatmapPanel = () => {
  const [sectors, setSectors] = useState({})
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    fetchSectors()
    const interval = setInterval(fetchSectors, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchSectors = async () => {
    try {
      const data = {}
      for (const sector of SECTORS) {
        try {
          const response = await fetch(
            `/api/yahoo/v8/finance/chart/${sector.symbol}?interval=1d&range=1d`
          )
          const json = await response.json()
          const meta = json.chart?.result?.[0]?.meta

          if (meta) {
            data[sector.symbol] = {
              change: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${sector.symbol}`)
        }
      }
      setSectors(data)
      setLoading(false)
    } catch (e) {
      console.error('Sectors fetch error:', e)
      setLoading(false)
    }
  }

  const getColorClass = (change) => {
    if (change >= 3) return 'up-3'
    if (change >= 2) return 'up-2'
    if (change >= 1) return 'up-1'
    if (change >= 0) return 'up-0'
    if (change >= -1) return 'down-0'
    if (change >= -2) return 'down-1'
    if (change >= -3) return 'down-2'
    return 'down-3'
  }

  if (loading) {
    return <div className="loading-msg">{t('heatmap.loading')}</div>
  }

  return (
    <div className="heatmap">
      {SECTORS.map(sector => {
        const data = sectors[sector.symbol]
        if (!data) return null

        return (
          <div
            key={sector.symbol}
            className={`heatmap-cell ${getColorClass(data.change)}`}
          >
            <div className="sector-name">{sector.name}</div>
            <div className="sector-change">{formatPercent(data.change)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default HeatmapPanel
