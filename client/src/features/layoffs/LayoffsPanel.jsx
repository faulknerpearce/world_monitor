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
            <div className="flex justify-between items-center py-2.5 px-4 bg-[rgba(239,68,68,0.05)] border-b border-[rgba(239,68,68,0.1)] shrink-0">
                <span className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('layoffs.totalAffected')}</span>
                    <span className="text-lg font-bold !text-[var(--red)]">—</span>
                </span>
                <span className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('layoffs.events')}</span>
                    <span className="text-lg font-bold">{news.length}</span>
                </span>
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
