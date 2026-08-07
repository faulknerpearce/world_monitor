import { memo, useCallback } from 'react'
import { BaseFeedService } from './baseFeedService'
import { useFeedData } from '@hooks/useFeedData'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo, getArticleSnippet } from '@utils'

const NewsPanel = ({ feeds, panelId }) => {
  const { t, locale } = useI18n()

  const fetchNews = useCallback(
    () => BaseFeedService.fetchFeeds(feeds, { maxItems: 50 }),
    [feeds]
  )
  const { data: news, loading, error } = useFeedData(fetchNews, 5 * 60 * 1000)

  // Get unique sources count
  const uniqueSources = [...new Set(news.map(item => item.source))].length

  // Get theme class based on panel type
  const getThemeClass = () => {
    if (panelId === 'politics' || panelId === 'warwatch') return 'theme-blue'
    if (panelId === 'tech') return 'theme-cyan'
    if (panelId === 'finance') return 'theme-green'
    return 'theme-neutral'
  }

  const errorMessage = error ? t('news.failed', { message: error.message }) : null

  if (loading && news.length === 0) {
    return <div className="p-4 text-center text-text-dim text-[0.8rem]">{t('news.loading')}</div>
  }

  if (errorMessage && news.length === 0) {
    return <div className="p-8 text-center text-status-red text-[0.7rem]">{errorMessage}</div>
  }

  return (
    <div className={`${getThemeClass()} flex flex-col h-full overflow-hidden`}>
      <div className="news-summary flex gap-4 py-2 px-4 border-b border-section-border items-center">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.65rem] text-text-dim">{t('news.articles')}</span>
          <span className="stat-value text-sm font-semibold text-text-primary font-[family-name:var(--font-mono)]">{news.length}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.65rem] text-text-dim">{t('news.sources')}</span>
          <span className="stat-value text-sm font-semibold text-text-primary font-[family-name:var(--font-mono)]">{uniqueSources}</span>
        </div>
        <div className="flex items-center ml-auto gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse"></span>
          <span className="text-[0.65rem] text-text-dim">{t('common.live')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col p-3">
        {news.map((item, index) => {
          const snippet = getArticleSnippet(item)
          return (
            <div key={item.guid || `${item.link}-${item.title}-${item.pubDateStr ?? index}`} className="news-item flex flex-col p-3 mb-2 bg-panel-item-bg rounded-md transition-colors duration-200 cursor-pointer hover:bg-panel-item-hover group">
              <div className="flex justify-between items-center mb-1">
                <span className="item-source text-[0.7rem] font-medium">{item.source}</span>
                <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</span>
              </div>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="feed-headline block text-text-primary hover:text-text-primary text-[0.85rem] font-medium leading-relaxed no-underline line-clamp-2">
                {item.title}
              </a>
              {snippet && (
                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-text-dim line-clamp-2 group-hover:text-text-secondary transition-colors duration-200">
                  {snippet}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(NewsPanel)
