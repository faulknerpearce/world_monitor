import { memo, useEffect, useState } from 'react'
import { useI18n } from '@context/I18nContext'

/**
 * Self-contained clock that updates every second. Extracted from `Navbar` so
 * the rest of the navbar (and any other consumer) does not re-render once per
 * second. `React.memo` keeps the rendered output stable when the time string
 * is unchanged.
 */
const Clock = memo(({ className = '' }) => {
    const [currentTime, setCurrentTime] = useState(() => new Date())
    const { t, locale, formatDate, formatTime } = useI18n()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-[0.65rem] text-text-secondary tracking-[0.05em] font-medium">
                {formatDate(currentTime, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
            </span>
            <span className="text-[0.7rem] text-text-primary font-[family-name:var(--font-mono)] font-semibold tracking-[0.05em]">
                {formatTime(currentTime, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: locale === 'en-US' })}
            </span>
        </div>
    )
})

Clock.displayName = 'Clock'

export default Clock
