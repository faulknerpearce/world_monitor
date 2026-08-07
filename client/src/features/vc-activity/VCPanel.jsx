import { memo } from 'react'
import { createFeedFetcher } from '@features/news/createFeedFetcher'
import { useI18n } from '@context/I18nContext'
import { useFeedData } from '@hooks/useFeedData'
import { PanelFeedItem } from '@features/dashboard'

const fetchVCNews = createFeedFetcher('vc', 10)

const VCPanel = () => {
    const { t, locale } = useI18n()
    const { data: vcNews, loading } = useFeedData(fetchVCNews, 10 * 60 * 1000)

    // `vcNews` is just the news count now — the hardcoded "total raised" and
    // "funds closed" numbers are gone. The header shows the live item count
    // and a labeled placeholder until a real VC-statistics source is wired up.
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex gap-6 py-2 px-4 border-b border-section-border shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-text-dim">{t('vc.capitalRaised')}</span>
                    <span className="text-sm font-semibold !text-[#a78bfa] font-[family-name:var(--font-mono)]">—</span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-text-dim">{t('vc.fundsClosed')}</span>
                    <span className="text-sm font-semibold font-[family-name:var(--font-mono)]">{vcNews.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-4">
                {loading && vcNews.length === 0 ? (
                    <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('vc.loading')}</div>
                ) : (
                    vcNews.map((news) => (
                        <PanelFeedItem key={news.link} item={news} locale={locale} accent="purple" />
                    ))
                )}
            </div>
        </div>
    )
}

export default memo(VCPanel)
