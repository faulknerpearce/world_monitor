import { memo } from 'react'
import { StartupsFeedService } from './startupsFeedService'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { formatAmount } from '@utils'
import { PanelFeedItem } from '@features/dashboard'

const StartupsPanel = () => {
    const { t, locale } = useI18n()
    const { data: news, loading } = useFeedData(
        () => StartupsFeedService.fetchStartupNews(10),
        10 * 60 * 1000
    )

    // Derive the header stats from the live feed rather than a hardcoded
    // snapshot. `amount` is populated by `StartupsFeedService.extractFunding`
    // when the title contains a $M / $B figure.
    const totalRaisedVal = news.reduce(
        (acc, item) => acc + (item.amount ?? 0),
        0
    )

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center py-2.5 px-4 bg-[rgba(16,185,129,0.05)] border-b border-[rgba(16,185,129,0.1)] shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('startups.totalRaised')}</span>
                    <span className="text-lg font-bold !text-[var(--green)]">
                        {totalRaisedVal > 0 ? formatAmount(totalRaisedVal) : '—'}
                    </span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('startups.deals')}</span>
                    <span className="text-lg font-bold">{news.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading && news.length === 0 ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('startups.loading')}</div>
                ) : (
                    news.map((item) => (
                        <PanelFeedItem key={item.link} item={item} locale={locale} accent="green" />
                    ))
                )}
            </div>
        </div>
    )
}

export default memo(StartupsPanel)
