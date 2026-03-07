import { useEffect, useState, useRef } from 'react'
import './TickerStrip.css'

const MARKET_ITEMS = [
    // Market Indices
    { symbol: 'SPY', name: 'S&P 500', type: 'index' },
    { symbol: 'QQQ', name: 'Nasdaq', type: 'index' },
    { symbol: 'DIA', name: 'Dow', type: 'index' },
    { symbol: 'IWM', name: 'Russell', type: 'index' },
    // Sectors
    { symbol: 'XLK', name: 'Tech', type: 'sector' },
    { symbol: 'XLF', name: 'Finance', type: 'sector' },
    { symbol: 'XLE', name: 'Energy', type: 'sector' },
    { symbol: 'XLV', name: 'Health', type: 'sector' },
    { symbol: 'XLY', name: 'Consumer', type: 'sector' },
    { symbol: 'XLI', name: 'Industrial', type: 'sector' },
    { symbol: 'SMH', name: 'Semis', type: 'sector' }
]

const COMMODITY_ITEMS = [
    { symbol: 'GC=F', name: 'Gold', type: 'commodity' },
    { symbol: 'SI=F', name: 'Silver', type: 'commodity' },
    { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' },
    { symbol: 'NG=F', name: 'Nat Gas', type: 'commodity' },
    { symbol: 'HG=F', name: 'Copper', type: 'commodity' },
    { symbol: 'ZC=F', name: 'Corn', type: 'commodity' },
    { symbol: 'ZW=F', name: 'Wheat', type: 'commodity' },
    { symbol: '^VIX', name: 'VIX', type: 'commodity' },
]

const CRYPTO_ITEMS = [
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
    { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
    { symbol: 'DOGE-USD', name: 'Doge', type: 'crypto' },
    { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
    { symbol: 'XRP-USD', name: 'XRP', type: 'crypto' },
    { symbol: 'AVAX-USD', name: 'Avalanche', type: 'crypto' },
    { symbol: 'LINK-USD', name: 'Chainlink', type: 'crypto' },
    { symbol: 'DOT-USD', name: 'Polkadot', type: 'crypto' },
    { symbol: 'MATIC-USD', name: 'Polygon', type: 'crypto' }
]

const GEO_ITEMS = [
    { symbol: 'ITA', name: 'US Defense', type: 'sector' },
    { symbol: 'XAR', name: 'Aerospace', type: 'sector' },
    { symbol: 'LMT', name: 'Lockheed', type: 'stock' },
    { symbol: 'RTX', name: 'Raytheon', type: 'stock' },
    { symbol: 'NOC', name: 'Northrop', type: 'stock' },
    { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' },
    { symbol: 'NG=F', name: 'Nat Gas', type: 'commodity' },
    { symbol: 'GC=F', name: 'Gold', type: 'commodity' },
    { symbol: 'ZW=F', name: 'Wheat', type: 'commodity' },
    { symbol: 'ZIM', name: 'ZIM Shipping', type: 'stock' },
    { symbol: 'TSM', name: 'TSMC', type: 'stock' },
    { symbol: 'SOXX', name: 'Semis', type: 'sector' },
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' }
]

const ALL_ITEMS = [...MARKET_ITEMS, ...COMMODITY_ITEMS, ...CRYPTO_ITEMS, ...GEO_ITEMS]

const TickerStrip = ({ mode = 'default' }) => {
    const [tickerData, setTickerData] = useState({})
    const [loading, setLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const stripRef = useRef(null)

    useEffect(() => {
        fetchTickerData()
        const interval = setInterval(fetchTickerData, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchTickerData = async () => {
        try {
            const data = {}
            for (const item of ALL_ITEMS) {
                try {
                    // Mock data for new geo items if API fails or for demo
                    // In a real app, this would hit the API for all items
                    // We'll use a mix of real API where possible and fallbacks
                    const response = await fetch(
                        `/api/yahoo/v8/finance/chart/${item.symbol}?interval=1d&range=1d`
                    )
                    const json = await response.json()
                    const quote = json.chart?.result?.[0]
                    
                    if (quote) {
                        const meta = quote.meta
                        const price = meta.regularMarketPrice
                        const prevClose = meta.chartPreviousClose
                        const change = price - prevClose
                        const changePercent = (change / prevClose) * 100

                        data[item.symbol] = {
                            price,
                            change,
                            changePercent,
                            name: item.name,
                            type: item.type
                        }
                    } else {
                        // Fallback for demo if API doesn't support the symbol yet
                         data[item.symbol] = {
                            price: 100 + Math.random() * 50,
                            change: Math.random() * 5 - 2,
                            changePercent: Math.random() * 4 - 2,
                            name: item.name,
                            type: item.type
                        }
                    }
                } catch (e) {
                     // Fallback mock data
                     data[item.symbol] = {
                        price: 100 + Math.random() * 50,
                        change: Math.random() * 5 - 2,
                        changePercent: Math.random() * 4 - 2,
                        name: item.name,
                        type: item.type
                    }
                }
            }
            setTickerData(data)
            setLoading(false)
        } catch (e) {
            console.error('Ticker fetch error:', e)
            setLoading(false)
        }
    }

    const formatPrice = (price, type) => {
        if (!price) return '—'
        if (type === 'crypto') {
            if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`
            if (price >= 1) return `$${price.toFixed(2)}`
            return `$${price.toFixed(4)}`
        }
        return `$${price.toFixed(2)}`
    }

    const formatChange = (change) => {
        if (change === undefined || change === null) return '—'
        const sign = change >= 0 ? '+' : ''
        return `${sign}${change.toFixed(2)}%`
    }

    const renderTickerItem = (item, idx, data) => {
        if (!data) return null
        const isUp = data.changePercent >= 0
        return (
            <div
                key={`${item.symbol}-${idx}`}
                className={`ticker-item ${data.type} ${isUp ? 'up' : 'down'}`}
            >
                <span className="ticker-name">{data.name}</span>
                <span className="ticker-price">{formatPrice(data.price, data.type)}</span>
                <span className={`ticker-change ${isUp ? 'up' : 'down'}`}>
                    {formatChange(data.changePercent)}
                </span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="ticker-container ticker-loading">
                <div className="ticker-loading-text">Loading {mode === 'geo' ? 'Geo-Alpha' : 'market'} data...</div>
            </div>
        )
    }

    let itemsToDisplay = []
    if (mode === 'geo') {
        const geoItems = GEO_ITEMS.filter(item => tickerData[item.symbol])
        itemsToDisplay = [...geoItems, ...geoItems, ...geoItems] // Triple for smooth loop
        
        return (
             <div
                className={`ticker-container geo-mode ${isPaused ? 'paused' : ''}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                ref={stripRef}
            >
                 <div className="ticker-label">GEO-ALPHA</div>
                <div className="ticker-strip">
                    <div className="ticker-track">
                        {itemsToDisplay.map((item, idx) => {
                             const data = tickerData[item.symbol]
                             return renderTickerItem(item, idx, data)
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Default Mode
    const marketItems = MARKET_ITEMS.filter(item => tickerData[item.symbol])
    const commodityItems = COMMODITY_ITEMS.filter(item => tickerData[item.symbol])
    const cryptoItems = CRYPTO_ITEMS.filter(item => tickerData[item.symbol])

    return (
        <div
            className={`ticker-container ${isPaused ? 'paused' : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            ref={stripRef}
        >
            {/* Markets & Sectors Row - scrolls left */}
            <div className="ticker-strip">
                <div className="ticker-track">
                    {[...marketItems, ...marketItems].map((item, idx) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, idx, data)
                    })}
                </div>
            </div>

            {/* Commodities Row - scrolls right */}
            <div className="ticker-strip commodity-strip">
                <div className="ticker-track reverse">
                    {[...commodityItems, ...commodityItems].map((item, idx) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, idx, data)
                    })}
                </div>
            </div>

            {/* Crypto Row - scrolls left */}
            <div className="ticker-strip crypto-strip">
                <div className="ticker-track">
                    {[...cryptoItems, ...cryptoItems].map((item, idx) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, idx, data)
                    })}
                </div>
            </div>
        </div>
    )
}

export default TickerStrip

