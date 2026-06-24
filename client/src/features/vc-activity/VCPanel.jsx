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
            <div className="flex justify-between items-center py-2.5 px-4 bg-[rgba(139,92,246,0.05)] border-b border-[rgba(139,92,246,0.1)] shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('vc.capitalRaised')}</span>
                    <span className="text-lg font-bold !text-[#a78bfa]">—</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] text-text-dim uppercase">{t('vc.fundsClosed')}</span>
                    <span className="text-lg font-bold">{vcNews.length}</span>
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
