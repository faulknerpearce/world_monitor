import { useEffect, useState } from 'react'
import { useI18n } from '@context/I18nContext'
import { formatNumber, formatPercent } from '@utils'

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
  const { t } = useI18n()

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
    return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('marketsPanel.loading')}</div>
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col p-4 h-full overflow-hidden">
      {MARKETS.map(market => {
        const data = markets[market.symbol]
        if (!data) return null

        const isUp = data.change >= 0

        return (
          <div key={market.symbol} className="flex justify-between items-center p-3.5 mb-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:-translate-y-0.5 shadow-sm hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-[0.85rem] text-text-primary font-medium">{market.name}</span>
              <span className="text-[0.65rem] text-text-dim uppercase tracking-[0.05em]">{market.symbol}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[0.85rem] font-bold text-text-primary">${formatNumber(data.price)}</span>
              <span className={`text-[0.75rem] font-semibold mt-0.5 ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {isUp ? '+' : ''}{formatPercent(data.changePercent)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MarketsPanel
