import { useState, useEffect } from 'react'
import { fetchChainActivity } from './githubActivity'
import { fetchChainStats, formatTVL, formatCount, CHAIN_CONFIG } from './chainStats'
import { useI18n } from '@context/I18nContext'


const CHAIN_DISPLAY = {
    ethereum: {
        name: 'Ethereum',
        color: '#627eea',
    },
    cardano: {
        name: 'Cardano',
        color: '#0d6efd',
    },
    avalanche: {
        name: 'Avalanche',
        color: '#e84142',
    },
}

const SHOWN_DAY_LABELS = new Set([1, 3, 5]) // Mon, Wed, Fri

const CELL = 13
const GAP = 2
const CELL_TOTAL = CELL + GAP
const DAY_LABEL_WIDTH = 28
const MONTH_LABEL_HEIGHT = 14
const SVG_HEIGHT = MONTH_LABEL_HEIGHT + 7 * CELL_TOTAL

// Quartile-based level bucketing: uses the 75th percentile of non-zero values
const getLevel = (count, p75) => {
    if (!count || count === 0) return 0
    if (count <= p75 * 0.25) return 1
    if (count <= p75 * 0.6) return 2
    if (count <= p75) return 3
    return 4
}

const computeP75 = (allCounts) => {
    const nonZero = allCounts.filter(c => c > 0).sort((a, b) => a - b)
    if (nonZero.length === 0) return 1
    return nonZero[Math.floor(nonZero.length * 0.75)] || 1
}

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getCellColor = (level, color) => {
    if (level === 0) return 'var(--graph-empty)'
    const alphas = [null, 0.25, 0.5, 0.75, 1.0]
    return hexToRgba(color, alphas[level])
}

const formatTooltip = (weekTimestamp, dayIndex, count, locale, t) => {
    const date = new Date((weekTimestamp + dayIndex * 86400) * 1000)
    const label = date.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    if (count === 0) return t('developer.noCommitsOn', { date: label })
    if (count === 1) return t('developer.oneCommitOn', { date: label })
    return t('developer.manyCommitsOn', { count, date: label })
}

const ContributionGraph = ({ weeks, color, locale, t }) => {
    const [tooltip, setTooltip] = useState(null)

    if (!weeks || weeks.length === 0) return null

    const allCounts = weeks.flatMap(w => w.days)
    const p75 = computeP75(allCounts)

    const monthLabels = []
    let lastMonth = -1
    weeks.forEach((week, idx) => {
        const date = new Date(week.week * 1000)
        const month = date.getMonth()
        if (month !== lastMonth) {
            monthLabels.push({ idx, label: date.toLocaleDateString(locale, { month: 'short' }) })
            lastMonth = month
        }
    })

    const dayLabels = Array.from({ length: 7 }, (_, d) => {
        const baseDate = new Date(Date.UTC(2024, 0, 7 + d))
        return baseDate.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
    })

    const svgWidth = DAY_LABEL_WIDTH + weeks.length * CELL_TOTAL

    return (
        <div className="w-full relative">
            <svg
                width="100%"
                viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMinYMid meet"
            >
                {monthLabels.map(({ idx, label }) => (
                    <text
                        key={`m-${idx}`}
                        x={DAY_LABEL_WIDTH + idx * CELL_TOTAL}
                        y={MONTH_LABEL_HEIGHT - 3}
                        fontSize="7"
                        fill="var(--text-dim)"
                    >
                        {label}
                    </text>
                ))}

                {dayLabels.map((label, d) =>
                    SHOWN_DAY_LABELS.has(d) ? (
                        <text
                            key={`d-${d}`}
                            x={0}
                            y={MONTH_LABEL_HEIGHT + d * CELL_TOTAL + CELL * 0.8}
                            fontSize="7"
                            fill="var(--text-dim)"
                        >
                            {label}
                        </text>
                    ) : null
                )}

                {weeks.map((week, w) =>
                    week.days.map((count, d) => {
                        const level = getLevel(count, p75)
                        return (
                            <rect
                                key={`${w}-${d}`}
                                x={DAY_LABEL_WIDTH + w * CELL_TOTAL}
                                y={MONTH_LABEL_HEIGHT + d * CELL_TOTAL}
                                width={CELL}
                                height={CELL}
                                rx="2"
                                fill={getCellColor(level, color)}
                                className="graph-cell"
                                onMouseEnter={(e) => {
                                    const rect = e.target.getBoundingClientRect()
                                    setTooltip({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                        text: formatTooltip(week.week, d, count, locale, t),
                                    })
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        )
                    })
                )}
            </svg>

            {tooltip && (
                <div
                    className="fixed -translate-x-1/2 -translate-y-full bg-bg-dark border border-border-main rounded py-1 px-2 text-[0.6rem] text-text-primary whitespace-nowrap pointer-events-none z-[9999]"
                    style={{ left: tooltip.x, top: tooltip.y - 8 }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    )
}

const ChainCard = ({ chainKey, stats, t, locale }) => {
    const displayConfig = CHAIN_DISPLAY[chainKey]
    const config = CHAIN_CONFIG[chainKey]
    const chainStats = stats?.[chainKey] ?? null
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        fetchChainActivity(config.repos)
            .then(result => {
                if (!cancelled) {
                    setData(result)
                    setLoading(false)
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err.message)
                    setLoading(false)
                }
            })
        return () => { cancelled = true }
    }, [chainKey, config.repos])

    const totalCommits = chainStats?.totalCommits
    const tvl = chainStats ? formatTVL(chainStats.tvl) : null
    const validators = chainStats ? formatCount(chainStats.validators) : null
    const validatorLabel = chainStats?.validatorLabel ?? t('developer.validators')

    return (
        <div className="bg-bg-panel section-border rounded-lg p-5 flex flex-col gap-4">
            <div className="mb-2">
                <h3 className="text-[0.85rem] font-bold uppercase tracking-[0.05em]" style={{ color: displayConfig.color }}>
                    {displayConfig.name}
                </h3>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-panel-item-bg rounded-md">
                <div className="flex flex-row items-center justify-center gap-1.5">
                    <span className="text-[0.55rem] text-text-dim uppercase tracking-[0.05em]">{t('developer.totalCommits')}</span>
                    <span className="text-[0.9rem] font-bold font-[family-name:var(--font-mono)]" style={{ color: displayConfig.color }}>
                        {loading ? '...' : totalCommits ? formatCount(totalCommits) : '--'}
                    </span>
                </div>
                <div className="flex flex-row items-center justify-center gap-1.5">
                    <span className="text-[0.55rem] text-text-dim uppercase tracking-[0.05em]">TVL</span>
                    <span className="text-[0.9rem] font-bold font-[family-name:var(--font-mono)]" style={{ color: displayConfig.color }}>
                        {tvl ?? '...'}
                    </span>
                </div>
                <div className="flex flex-row items-center justify-center gap-1.5">
                    <span className="text-[0.55rem] text-text-dim uppercase tracking-[0.05em]">{validatorLabel}</span>
                    <span className="text-[0.9rem] font-bold font-[family-name:var(--font-mono)]" style={{ color: displayConfig.color }}>
                        {validators ?? '...'}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {config.repos.map((repo) => (
                    <a
                        key={repo}
                        className="text-[0.55rem] text-text-dim bg-panel-item-bg py-[0.15rem] px-1.5 rounded-[3px] font-[family-name:var(--font-mono)] no-underline transition-colors duration-150 hover:text-text-primary"
                        href={`https://github.com/${repo}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {repo}
                    </a>
                ))}
            </div>

            <div className="w-full relative overflow-hidden">
                {loading && <div className="w-full h-[100px] bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_25%,rgba(255,255,255,0.07)_50%,rgba(255,255,255,0.03)_75%)] bg-[length:200%_100%] animate-shimmer rounded" />}
                {error && <div className="text-[0.6rem] text-text-dim leading-relaxed py-1">{error}</div>}
                {!loading && !error && data && (
                    <ContributionGraph weeks={data.weeks} color={displayConfig.color} locale={locale} t={t} />
                )}
                {!loading && !error && !data && (
                    <div className="text-[0.6rem] text-text-dim leading-relaxed py-1">{t('developer.statsUnavailable')}</div>
                )}
            </div>

            <div className="flex items-center justify-end gap-1.5">
                <span className="text-[0.5rem] text-text-dim uppercase">{t('developer.less')}</span>
                <div className="flex gap-0.5">
                    {[0,1,2,3,4].map(level => (
                        <span
                            key={level}
                            className="w-2 h-2 rounded-sm"
                            style={{ background: getCellColor(level, displayConfig.color) }}
                        />
                    ))}
                </div>
                <span className="text-[0.5rem] text-text-dim uppercase">{t('developer.more')}</span>
            </div>
        </div>
    )
}

const ChainActivity = () => {
    const [stats, setStats] = useState(null)
    const { t, locale } = useI18n()

    useEffect(() => {
        fetchChainStats()
            .then(setStats)
            .catch(() => {})
    }, [])

    return (
        <section className="mt-8 pt-6 border-t border-section-border" aria-labelledby="developer-activity-heading">
            <h2 id="developer-activity-heading" className="text-sm font-semibold text-text-secondary mb-4">
                {t('developer.title')}
            </h2>
            <div className="grid grid-cols-3 gap-6 max-[1400px]:grid-cols-2 max-[1000px]:grid-cols-1 max-[1000px]:gap-4">
                {Object.keys(CHAIN_CONFIG).map(key => (
                    <ChainCard key={key} chainKey={key} stats={stats} t={t} locale={locale} />
                ))}
            </div>
        </section>
    )
}

export default ChainActivity
