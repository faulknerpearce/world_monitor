import { memo, useCallback } from 'react'
import { BaseFeedService } from './baseFeedService'
import { useFeedData } from '@hooks/useFeedData'
import { useI18n } from '@context/I18nContext'
import { getTimeAgo } from '@utils'

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
      <div className="news-summary flex gap-5 py-2.5 px-4 border-b border-[rgba(255,255,255,0.06)] items-center">
        <div className="flex items-center gap-1.5">
          <span className="stat-value text-[0.9rem] font-bold text-text-primary font-[family-name:var(--font-mono)]">{news.length}</span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('news.articles')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="stat-value text-[0.9rem] font-bold text-text-primary font-[family-name:var(--font-mono)]">{uniqueSources}</span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('news.sources')}</span>
        </div>
        <div className="flex items-center ml-auto gap-1">
          <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-live-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
          <span className="text-[0.5rem] text-text-dim uppercase tracking-[0.1em]">{t('common.live')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col p-4">
        {news.map((item, index) => (
          <div key={item.guid || `${item.link}-${item.title}-${item.pubDateStr ?? index}`} className="news-item flex flex-col p-3.5 mb-3 bg-panel-item-bg border border-border-glass rounded-lg transition-all duration-200 cursor-pointer hover:bg-panel-item-hover hover:border-border-glass-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-1.5">
              <span className="item-source text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-secondary group-hover:text-accent transition-colors duration-200">{item.source}</span>
              <span className="text-[0.65rem] text-text-dim font-[family-name:var(--font-mono)]">{getTimeAgo(item.date, locale)}</span>
            </div>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-text-primary text-[0.85rem] font-medium leading-relaxed no-underline transition-colors duration-200 hover:text-accent line-clamp-3">
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(NewsPanel)
