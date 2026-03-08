import { useState, useEffect } from 'react'
import { fetchChainActivity } from '@services/githubActivity'
import { fetchChainStats, formatTVL, formatCount } from '@services/chainStats'
import { useI18n } from '@context/I18nContext'
import './DeveloperActivity.css'

const CHAIN_CONFIGS = {
    ethereum: {
        name: 'Ethereum',
        color: '#627eea',
        // go-ethereum (main client), solidity (compiler), web3.py and py-evm are
        // active code repos that give a more representative commit signal than
        // the spec/text-heavy EIPs and consensus-specs repositories.
        repos: ['ethereum/go-ethereum', 'ethereum/solidity', 'ethereum/web3.py', 'ethereum/py-evm'],
    },
    cardano: {
        name: 'Cardano',
        color: '#0d6efd',
        repos: ['IntersectMBO/cardano-node', 'input-output-hk/plutus', 'IntersectMBO/cardano-ledger'],
    },
    avalanche: {
        name: 'Avalanche',
        color: '#e84142',
        repos: ['ava-labs/avalanchego', 'ava-labs/subnet-evm', 'ava-labs/avalanche-docs'],
    },
}

const SHOWN_DAY_LABELS = new Set([1, 3, 5]) // Mon, Wed, Fri

const CELL = 11
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
        <div className="contribution-graph">
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
                    className="graph-tooltip"
                    style={{ left: tooltip.x, top: tooltip.y - 8 }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    )
}

const ChainCard = ({ chainKey, stats, t, locale }) => {
    const config = CHAIN_CONFIGS[chainKey]
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
    }, [chainKey])

    const tvl = chainStats ? formatTVL(chainStats.tvl) : null
    const validators = chainStats ? formatCount(chainStats.validators) : null
    const validatorLabel = chainStats?.validatorLabel ?? t('developer.validators')

    return (
        <div className="chain-card">
            <div className="chain-header">
                <div className="chain-name" style={{ color: config.color }}>
                    {config.name}
                </div>
            </div>

            {/* Metrics row */}
            <div className="chain-metrics">
                <div className="metric">
                    <span className="metric-label">{t('developer.commitsPerYear')}</span>
                    <span className="metric-value" style={{ color: config.color }}>
                        {loading ? '...' : data ? data.totalCommits.toLocaleString() : '--'}
                    </span>
                </div>
                <div className="metric">
                    <span className="metric-label">TVL</span>
                    <span className="metric-value" style={{ color: config.color }}>
                        {tvl ?? '...'}
                    </span>
                </div>
                <div className="metric">
                    <span className="metric-label">{validatorLabel}</span>
                    <span className="metric-value" style={{ color: config.color }}>
                        {validators ?? '...'}
                    </span>
                </div>
            </div>

            <div className="chain-repos">
                {config.repos.map((repo, idx) => (
                    <a
                        key={idx}
                        className="repo-tag"
                        href={`https://github.com/${repo}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {repo}
                    </a>
                ))}
            </div>

            <div className="chain-graph">
                {loading && <div className="graph-skeleton" />}
                {error && <div className="graph-error">{error}</div>}
                {!loading && !error && data && (
                    <ContributionGraph weeks={data.weeks} color={config.color} locale={locale} t={t} />
                )}
                {!loading && !error && !data && (
                    <div className="graph-error">{t('developer.statsUnavailable')}</div>
                )}
            </div>

            <div className="graph-legend">
                <span className="legend-label">{t('developer.less')}</span>
                <div className="legend-squares">
                    {[0,1,2,3,4].map(level => (
                        <span
                            key={level}
                            className="legend-square"
                            style={{ background: getCellColor(level, config.color) }}
                        />
                    ))}
                </div>
                <span className="legend-label">{t('developer.more')}</span>
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
        <div className="chain-activity">
            <div className="chain-activity-header">
                <span className="chain-activity-title">{t('developer.title')}</span>
            </div>
            <div className="chain-activity-grid">
                {Object.keys(CHAIN_CONFIGS).map(key => (
                    <ChainCard key={key} chainKey={key} stats={stats} t={t} locale={locale} />
                ))}
            </div>
        </div>
    )
}

export default ChainActivity
