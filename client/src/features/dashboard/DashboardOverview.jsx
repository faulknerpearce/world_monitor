import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@context/I18nContext'
import {
  useTickerData,
  TICKER_MARKET_ITEMS,
  TICKER_COMMODITY_ITEMS,
  TICKER_CRYPTO_ITEMS,
} from '@features/markets'

const OVERVIEW_ITEMS = [
  ...TICKER_MARKET_ITEMS,
  ...TICKER_COMMODITY_ITEMS,
  ...TICKER_CRYPTO_ITEMS,
]

const formatChange = (change) => {
  if (change === undefined || change === null) return '—'
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

const formatTickerSymbol = (symbol) =>
  symbol.replace('-USD', '').replace('=F', '').replace('^', '')

const StatChip = ({ label, value, valueClass = 'text-text-primary' }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-[0.65rem] text-text-dim">{label}</span>
    <span className={`text-sm font-semibold font-[family-name:var(--font-mono)] truncate ${valueClass}`}>
      {value}
    </span>
  </div>
)

const DashboardOverview = ({ panelCount, currentMode }) => {
  const { t } = useI18n()
  const { tickerData, loading } = useTickerData()

  const stats = useMemo(() => {
    const withChange = OVERVIEW_ITEMS
      .map((item) => {
        const data = tickerData[item.symbol]
        if (!data || data.changePercent === null || data.changePercent === undefined) return null
        return { name: item.name, symbol: item.symbol, changePercent: data.changePercent }
      })
      .filter(Boolean)

    const up = withChange.filter((d) => d.changePercent >= 0).length
    const down = withChange.filter((d) => d.changePercent < 0).length

    const sorted = [...withChange].sort((a, b) => b.changePercent - a.changePercent)
    const topGainer = sorted[0] ?? null
    const topLoser = sorted[sorted.length - 1] ?? null

    return { up, down, topGainer, topLoser }
  }, [tickerData])

  if (loading) {
    return (
      <div className="shrink-0 section-divider px-6 py-3 max-[768px]:px-3">
        <div className="text-[0.7rem] text-text-dim">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="shrink-0 section-divider px-6 py-3 max-[768px]:px-3">
      <div className="flex items-center gap-6 max-[768px]:grid max-[768px]:grid-cols-2 max-[768px]:gap-4 max-[1000px]:gap-4 max-[1000px]:flex-wrap">
        <StatChip
          label={t('dashboard.overview.marketsUp')}
          value={stats.up}
          valueClass="text-[var(--emerald)]"
        />
        <StatChip
          label={t('dashboard.overview.marketsDown')}
          value={stats.down}
          valueClass="text-[#ef4444]"
        />
        {stats.topGainer && (
          <StatChip
            label={t('dashboard.overview.topGainer')}
            value={`${formatTickerSymbol(stats.topGainer.symbol)} ${formatChange(stats.topGainer.changePercent)}`}
            valueClass="text-[var(--emerald)]"
          />
        )}
        {stats.topLoser && (
          <StatChip
            label={t('dashboard.overview.topLoser')}
            value={`${formatTickerSymbol(stats.topLoser.symbol)} ${formatChange(stats.topLoser.changePercent)}`}
            valueClass="text-[#ef4444]"
          />
        )}
        <StatChip
          label={t('dashboard.overview.panelsActive')}
          value={panelCount}
        />
        {currentMode && (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[0.65rem] text-text-dim">{t('command.active')}</span>
            <span className="text-sm font-semibold text-[var(--indigo)]">
              {t(`mode.${currentMode}`)}
            </span>
          </div>
        )}
        <Link
          to="/map"
          className="ml-auto text-sm text-text-secondary no-underline transition-colors duration-200 hover:text-accent max-[768px]:col-span-2 max-[768px]:ml-0"
        >
          {t('dashboard.overview.viewMap')} →
        </Link>
      </div>
    </div>
  )
}

export default DashboardOverview