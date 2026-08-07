import { useState, useRef } from 'react'
import { useI18n } from '@context/I18nContext'
import {
    useTickerData,
    TICKER_MARKET_ITEMS,
    TICKER_COMMODITY_ITEMS,
    TICKER_CRYPTO_ITEMS,
    TICKER_GEO_ITEMS,
} from './useTickerData'

const GroupLabel = ({ children }) => (
    <span className="text-[0.6rem] font-medium text-text-dim tracking-wide shrink-0 pr-1">
        {children}
    </span>
)

const GroupDivider = () => (
    <span className="text-text-dim/40 shrink-0 px-2" aria-hidden="true">·</span>
)

const TickerStrip = ({ mode = 'default', variant = 'default' }) => {
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

    const formatTickerSymbol = (symbol) =>
        symbol.replace('-USD', '').replace('=F', '').replace('^', '')

    const renderTickerItem = (item, key, data) => {
        if (!data) return null
        const isUp = data.changePercent !== null && data.changePercent >= 0
        const hasData = data.price !== null
        const itemType = item.type ?? data.type
        return (
            <div
                key={key}
                className={`ticker-item ${itemType} ${hasData ? (isUp ? 'up' : 'down') : ''} flex items-center gap-2 shrink-0 py-0.5 transition-opacity duration-200 hover:opacity-70`}
            >
                <span className="ticker-symbol text-[0.65rem] font-semibold text-text-primary uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">
                    {formatTickerSymbol(item.symbol)}
                </span>
                <span className="ticker-name text-[0.65rem] font-medium text-text-secondary tracking-[0.04em]">
                    {item.name}
                </span>
                <span className="text-[0.7rem] font-medium text-text-primary font-[family-name:var(--font-mono)]">
                    {formatPrice(data.price, itemType)}
                </span>
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

    const marketItems = TICKER_MARKET_ITEMS.filter(item => tickerData[item.symbol])
    const commodityItems = TICKER_COMMODITY_ITEMS.filter(item => tickerData[item.symbol])
    const cryptoItems = TICKER_CRYPTO_ITEMS.filter(item => tickerData[item.symbol])

    if (variant === 'compact') {
        const compactItems = [
            { label: t('category.markets'), items: marketItems },
            { label: t('ticker.commodities'), items: commodityItems },
            { label: t('category.crypto'), items: cryptoItems },
        ].filter((group) => group.items.length > 0)

        const flatItems = compactItems.flatMap((group) =>
            group.items.map((item) => ({ ...item, groupLabel: group.label }))
        )
        const labeledItems = flatItems.map((item, index) => ({
            ...item,
            showLabel: index === 0 || flatItems[index - 1].groupLabel !== item.groupLabel,
        }))
        const loopItems = [...labeledItems, ...labeledItems]

        return (
            <div
                className={`w-full bg-ticker-bg section-divider shrink-0 relative z-20 py-2 ${isPaused ? 'paused' : ''}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                ref={stripRef}
            >
                <div className="ticker-strip w-full overflow-hidden relative">
                    <div className="ticker-track flex items-center gap-8 py-1 animate-ticker-scroll-slow w-max">
                        {loopItems.map((item, index) => {
                            const data = tickerData[item.symbol]
                            return (
                                <div key={`${item.symbol}-${index}`} className="flex items-center gap-3 shrink-0">
                                    {item.showLabel && (
                                        <>
                                            {index > 0 && <GroupDivider />}
                                            <GroupLabel>{item.groupLabel}</GroupLabel>
                                        </>
                                    )}
                                    {renderTickerItem(item, `${item.symbol}-${index}`, data)}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`w-full bg-ticker-bg border-b border-border-glass shrink-0 relative z-20 py-1 ${isPaused ? 'paused' : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            ref={stripRef}
        >
            <div className="ticker-strip w-full overflow-hidden relative">
                <div className="ticker-track flex gap-6 py-1.5 animate-ticker-scroll w-max">
                    {[...marketItems, ...marketItems].map((item) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, item.symbol, data)
                    })}
                </div>
            </div>

            <div className="ticker-strip w-full overflow-hidden relative border-t border-t-[rgba(255,255,255,0.03)]">
                <div className="ticker-track flex gap-6 py-1.5 !animate-ticker-scroll-reverse w-max">
                    {[...commodityItems, ...commodityItems].map((item) => {
                        const data = tickerData[item.symbol]
                        return renderTickerItem(item, item.symbol, data)
                    })}
                </div>
            </div>

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
