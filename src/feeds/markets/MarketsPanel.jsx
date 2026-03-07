import { useEffect, useState } from 'react'
import { formatNumber, formatPercent } from '@utils'
import './MarketsPanel.css'

const MARKETS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' }
]

const MarketsPanel = () => {
  const [markets, setMarkets] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarkets()
    const interval = setInterval(fetchMarkets, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMarkets = async () => {
    try {
      const data = {}
      for (const market of MARKETS) {
        try {
          const response = await fetch(
            `/api/yahoo/v8/finance/chart/${market.symbol}?interval=1d&range=1d`
          )
          const json = await response.json()
          const meta = json.chart?.result?.[0]?.meta

          if (meta) {
            const price = meta.regularMarketPrice
            const prevClose = meta.chartPreviousClose
            data[market.symbol] = {
              price,
              change: price - prevClose,
              changePercent: ((price - prevClose) / prevClose) * 100
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${market.symbol}`)
        }
      }
      setMarkets(data)
      setLoading(false)
    } catch (e) {
      console.error('Markets fetch error:', e)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-msg">Loading markets...</div>
  }

  return (
    <div className="markets-panel">
      {MARKETS.map(market => {
        const data = markets[market.symbol]
        if (!data) return null

        const isUp = data.change >= 0

        return (
          <div key={market.symbol} className="market-item">
            <div>
              <div className="market-name">{market.name}</div>
              <div className="market-symbol">{market.symbol}</div>
            </div>
            <div className="market-data">
              <div className="market-price">${formatNumber(data.price)}</div>
              <div className={`market-change ${isUp ? 'up' : 'down'}`}>
                {formatPercent(data.changePercent)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MarketsPanel
