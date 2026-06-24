import { useState, useRef } from 'react'
import { useI18n } from '@context/I18nContext'
import {
    useTickerData,
    TICKER_MARKET_ITEMS,
    TICKER_COMMODITY_ITEMS,
    TICKER_CRYPTO_ITEMS,
    TICKER_GEO_ITEMS,
} from './useTickerData'

const TickerStrip = ({ mode = 'default' }) => {
    const { tickerData, loading } = useTickerData()
    const [isPaused, setIsPaused] = useState(false)
    const stripRef = useRef(null)
    const { t } = useI18n()

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

    const renderTickerItem = (item, key, data) => {
        if (!data) return null
        const isUp = data.changePercent !== null && data.changePercent >= 0
        const hasData = data.price !== null
        return (
            <div
                key={key}
                className={`ticker-item ${data.type} ${hasData ? (isUp ? 'up' : 'down') : ''} flex items-center gap-2.5 shrink-0 py-0.5 transition-opacity duration-200 hover:opacity-70`}
            >
                <span className="ticker-name text-[0.65rem] font-medium text-text-secondary uppercase tracking-[0.08em]">{data.name}</span>
                <span className="text-[0.7rem] font-medium text-text-primary font-[family-name:var(--font-mono)]">{formatPrice(data.price, data.type)}</span>
                <span className={`text-[0.65rem] font-semibold font-[family-name:var(--font-mono)] ${hasData ? (isUp ? 'text-[var(--emerald)]' : 'text-[#ef4444]') : 'text-text-dim'}`}>
                    {formatChange(data.changePercent)}
                </span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="w-full bg-ticker-bg border-b border-border-glass shrink-0 relative z-20 flex items-center justify-center p-4">
                <div className="text-[0.65rem] text-text-dim tracking-[0.1em] uppercase">
                    {t('ticker.loading', { target: mode === 'geo' ? t('ticker.geoAlpha') : t('ticker.market') })}
                </div>
            </div>
        )
    }

    if (mode === 'geo') {
        const geoItems = TICKER_GEO_ITEMS.filter(item => tickerData[item.symbol])
        const itemsToDisplay = [...geoItems, ...geoItems, ...geoItems] // Triple for smooth loop

        return (
             <div
                className={`w-full bg-ticker-bg border-b border-border-glass shrink-0 relative py-1 !border-t !border-t-accent !border-b-0 !bg-[linear-gradient(to_bottom,rgba(10,20,15,0.95),rgba(5,10,8,0.98))] !z-40 max-[768px]:fixed max-[768px]:bottom-0 max-[768px]:left-0 max-[768px]:right-0 ${isPaused ? 'paused' : ''}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                ref={stripRef}
            >
                 <div className="absolute left-0 top-0 bottom-0 bg-accent text-black text-[0.7rem] font-extrabold px-3 flex items-center z-10 tracking-[1px] shadow-[5px_0_15px_rgba(0,0,0,0.5)] max-[768px]:text-[0.75rem]">{t('ticker.geoAlphaLabel')}</div>
                <div className="ticker-strip w-full overflow-hidden relative">
                    <div className="ticker-track flex gap-6 py-1.5 animate-ticker-scroll w-max">
                        {itemsToDisplay.map((item) => {
                             const data = tickerData[item.symbol]
                             return renderTickerItem(item, item.symbol, data)
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Default Mode
    const marketItems = TICKER_MARKET_ITEMS.filter(item => tickerData[item.symbol])
    const commodityItems = TICKER_COMMODITY_ITEMS.filter(item => tickerData[item.symbol])
    const cryptoItems = TICKER_CRYPTO_ITEMS.filter(item => tickerData[item.symbol])

    return (
        <div
            className={`w-full bg-ticker-bg border-b border-border-glass shrink-0 relative z-20 py-1 ${isPaused ? 'paused' : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            ref={stripRef}
        >
            {/* Markets & Sectors Row - scrolls left */}
            <div className="ticker-strip w-full overflow-hidden relative">
                <div className="ticker-track flex gap-6 py-1.5 animate-ticker-scroll w-max">
                    {[...marketItems, ...marketItems].map((item) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, item.symbol, data)
                    })}
                </div>
            </div>

            {/* Commodities Row - scrolls right */}
            <div className="ticker-strip w-full overflow-hidden relative border-t border-t-[rgba(255,255,255,0.03)]">
                <div className="ticker-track flex gap-6 py-1.5 !animate-ticker-scroll-reverse w-max">
                    {[...commodityItems, ...commodityItems].map((item) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, item.symbol, data)
                    })}
                </div>
            </div>

            {/* Crypto Row - scrolls left */}
            <div className="ticker-strip w-full overflow-hidden relative border-t border-t-[rgba(245,158,11,0.05)]">
                <div className="ticker-track flex gap-6 py-1.5 animate-ticker-scroll w-max">
                    {[...cryptoItems, ...cryptoItems].map((item) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, item.symbol, data)
                    })}
                </div>
            </div>
        </div>
    )
}

export default TickerStrip
