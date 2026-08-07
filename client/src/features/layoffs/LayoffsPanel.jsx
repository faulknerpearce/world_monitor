import { memo } from 'react'
import { fetchLayoffsNews } from './layoffsFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { PanelFeedItem } from '@features/dashboard'

const LayoffsPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => fetchLayoffsNews(10),
        15 * 60 * 1000
    )

    // Hardcoded `LAYOFF_STATS` removed: the "total affected" and "events"
    // numbers were a fixed 2026 snapshot. Until a real layoffs-statistics
    // source is wired up, only the live news count is shown.

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex gap-6 py-2 px-4 border-b border-section-border shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-text-dim">{t('layoffs.totalAffected')}</span>
                    <span className="text-sm font-semibold !text-[var(--red)] font-[family-name:var(--font-mono)]">—</span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-text-dim">{t('layoffs.events')}</span>
                    <span className="text-sm font-semibold font-[family-name:var(--font-mono)]">{news.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('layoffs.loading')}</div>
                ) : (
                    news.map((item) => (
                        <PanelFeedItem key={item.link} item={item} locale={locale} accent="red" />
                    ))
                )}
            </div>
        </div>
    )
}

export default memo(LayoffsPanel)
