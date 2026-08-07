import { memo } from 'react'
import { getTimeAgo, getArticleSnippet } from '@utils'

/**
 * One row in a panel's feed list. Renders a source label, time-ago, link,
 * and title with the standard hover styling shared by every feed panel.
 * The accent prop drives the source-label color so each panel keeps its
 * visual identity (startups → green, VC → purple, layoffs → red).
 * Headlines always use the theme text color (white in dark, black in light).
 *
 * @param {Object} props
 * @param {{title: string, link: string, source: string, date: Date|string, description?: string}} props.item
 * @param {string} props.locale - BCP-47 locale for the time-ago formatter
 * @param {'green'|'purple'|'red'|'blue'|'amber'|'cyan'} [props.accent='green']
 */
const PanelFeedItem = ({ item, locale, accent = 'green' }) => {
    if (!item?.link) return null

    const accentClasses = ACCENTS[accent] ?? ACCENTS.green
    const snippet = getArticleSnippet(item)

    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-feed-item group text-text-primary hover:text-text-primary"
        >
            <div className="flex items-center justify-between mb-1.5">
                <span className={`feed-source text-[0.65rem] ${accentClasses.source} uppercase font-bold tracking-[0.1em] transition-colors duration-200`}>
                    {item.source}
                </span>
                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">
                    {getTimeAgo(item.date, locale)}
                </span>
            </div>
            <span className="feed-headline text-[0.85rem] leading-relaxed font-medium line-clamp-2 text-text-primary">
                {item.title}
            </span>
            {snippet && (
                <span className="mt-1.5 text-[0.75rem] leading-relaxed text-text-dim line-clamp-2 group-hover:text-text-secondary transition-colors duration-200">
                    {snippet}
                </span>
            )}
        </a>
    )
}

// Static class-name maps. Computed once at module load — keeps Tailwind's
// content scanner happy (no dynamic class strings) and avoids the per-row
// object allocation that an inline object literal would cause.
const ACCENTS = {
    green:  { source: 'text-green-400' },
    purple: { source: 'text-purple-400' },
    red:    { source: 'text-red-400' },
    blue:   { source: 'text-blue-400' },
    amber:  { source: 'text-amber-400' },
    cyan:   { source: 'text-cyan-400' },
}

export default memo(PanelFeedItem)
