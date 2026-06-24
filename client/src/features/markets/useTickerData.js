import { useEffect, useState, useRef, useContext } from 'react'
import { RefreshContext } from '@context/RefreshContext'

const MARKET_ITEMS = [
    { symbol: 'SPY', name: 'S&P 500', type: 'index' },
    { symbol: 'QQQ', name: 'Nasdaq', type: 'index' },
    { symbol: 'DIA', name: 'Dow', type: 'index' },
    { symbol: 'IWM', name: 'Russell', type: 'index' },
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

export const ALL_TICKER_ITEMS = [...MARKET_ITEMS, ...COMMODITY_ITEMS, ...CRYPTO_ITEMS, ...GEO_ITEMS]
export const TICKER_MARKET_ITEMS = MARKET_ITEMS
export const TICKER_COMMODITY_ITEMS = COMMODITY_ITEMS
export const TICKER_CRYPTO_ITEMS = CRYPTO_ITEMS
export const TICKER_GEO_ITEMS = GEO_ITEMS

// Module-level cache so two <TickerStrip> instances (Dashboard + Map) share
// a single fetch and a single result. Keyed by symbol; refreshed every
// `STALE_AFTER_MS`; cleared on `clearTickerCache()`.
const tickerCache = new Map() // symbol -> { price, change, changePercent, fetchedAt }
const STALE_AFTER_MS = 30 * 1000

const subscribers = new Set()
let pollTimer = null

/**
 * Parse a Yahoo chart meta object into ticker fields. Returns null when the
 * response is missing or would produce NaN/Infinity values.
 */
export const parseYahooQuote = (meta) => {
    if (!meta) return null
    const price = meta.regularMarketPrice
    const prevClose = meta.chartPreviousClose
    if (!Number.isFinite(price) || !Number.isFinite(prevClose) || prevClose === 0) {
        return null
    }
    return {
        price,
        change: price - prevClose,
        changePercent: ((price - prevClose) / prevClose) * 100,
    }
}

const fetchSymbol = async (symbol) => {
    const response = await fetch(
        `/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1d`
    )
    if (!response.ok) return null
    const json = await response.json()
    const quote = json.chart?.result?.[0]
    if (!quote) return null
    return parseYahooQuote(quote.meta)
}

const fetchAll = async () => {
    const uniqueSymbols = Array.from(new Set(ALL_TICKER_ITEMS.map(i => i.symbol)))
    const results = await Promise.allSettled(
        uniqueSymbols.map(async (symbol) => {
            const cached = tickerCache.get(symbol)
            if (cached && Date.now() - cached.fetchedAt < STALE_AFTER_MS) {
                return { symbol, ...cached, hit: true }
            }
            const fresh = await fetchSymbol(symbol)
            const entry = { ...(fresh ?? { price: null, change: null, changePercent: null }), fetchedAt: Date.now() }
            tickerCache.set(symbol, entry)
            return { symbol, ...entry, hit: false }
        })
    )
    return results
}

const notify = (data) => {
    for (const cb of subscribers) cb(data)
}

const ensurePolling = () => {
    if (pollTimer) return
    const tick = async () => {
        try {
            await fetchAll()
            const snapshot = Object.fromEntries(tickerCache)
            notify(snapshot)
        } catch (e) {
            console.error('Ticker fetch error:', e)
        }
    }
    tick()
    pollTimer = setInterval(tick, STALE_AFTER_MS)
}

const stopPollingIfUnused = () => {
    if (subscribers.size === 0 && pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
    }
}

export const clearTickerCache = () => tickerCache.clear()

/**
 * Subscribes the calling component to the module-level ticker cache. Multiple
 * components (e.g. <TickerStrip> on both Dashboard and Map) share a single
 * fetch loop. Returns a `tickerData` object keyed by symbol plus a `loading`
 * flag that is true on the very first render before any data has arrived.
 */
export const useTickerData = () => {
    const [tickerData, setTickerData] = useState(() => Object.fromEntries(tickerCache))
    const [loading, setLoading] = useState(tickerCache.size === 0)
    const { refreshKey } = useContext(RefreshContext)
    const refreshKeyRef = useRef(refreshKey)

    useEffect(() => {
        const onUpdate = (data) => {
            setTickerData(data)
            if (loading) setLoading(false)
        }
        subscribers.add(onUpdate)
        ensurePolling()
        return () => {
            subscribers.delete(onUpdate)
            stopPollingIfUnused()
        }
    }, [loading])

    // Honor a manual refresh: clear the cache so the next poll refetches.
    useEffect(() => {
        if (refreshKey === refreshKeyRef.current) return
        refreshKeyRef.current = refreshKey
        tickerCache.clear()
    }, [refreshKey])

    return { tickerData, loading }
}
