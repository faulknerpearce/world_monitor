import { memo } from 'react'
import { getTimeAgo } from '@utils'

/**
 * One row in a panel's feed list. Renders a source label, time-ago, link,
 * and title with the standard hover styling shared by every feed panel.
 * The accent prop drives the source-label and hover color so each panel
 * keeps its visual identity (startups → green, VC → purple, layoffs → red).
 *
 * @param {Object} props
 * @param {{title: string, link: string, source: string, date: Date|string}} props.item
 * @param {string} props.locale - BCP-47 locale for the time-ago formatter
 * @param {'green'|'purple'|'red'|'blue'|'amber'|'cyan'} [props.accent='green']
 */
const PanelFeedItem = ({ item, locale, accent = 'green' }) => {
    if (!item?.link) return null

    const accentClasses = ACCENTS[accent] ?? ACCENTS.green

    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-feed-item group"
        >
            <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[0.65rem] ${accentClasses.source} uppercase font-bold tracking-[0.1em] group-hover:${accentClasses.hover} transition-colors duration-200`}>
                    {item.source}
                </span>
                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">
                    {getTimeAgo(item.date, locale)}
                </span>
            </div>
            <span className={`text-[0.85rem] text-text-primary leading-relaxed font-medium line-clamp-3 group-hover:${accentClasses.hover} transition-colors duration-200`}>
                {item.title}
            </span>
        </a>
    )
}

// Static class-name maps. Computed once at module load — keeps Tailwind's
// content scanner happy (no dynamic class strings) and avoids the per-row
// object allocation that an inline object literal would cause.
const ACCENTS = {
    green:  { source: 'text-[var(--green)]',  hover: 'text-green-400' },
    purple: { source: 'text-[var(--purple)]', hover: 'text-purple-400' },
    red:    { source: 'text-[var(--red)]',    hover: 'text-red-400' },
    blue:   { source: 'text-[var(--blue)]',   hover: 'text-blue-400' },
    amber:  { source: 'text-[#f59e0b]',       hover: 'text-amber-400' },
    cyan:   { source: 'text-[var(--cyan)]',   hover: 'text-cyan-400' },
}

export default memo(PanelFeedItem)
