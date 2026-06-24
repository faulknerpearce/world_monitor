import { useI18n } from '@context/I18nContext'

// Map regions/keywords to market assets
const MARKET_IMPACT_MAP = {
  'taiwan': {
    assets: [
      { ticker: 'TSM', name: 'TSMC', change: '-1.2%' },
      { ticker: 'SOXX', name: 'Semiconductors', change: '-0.8%' },
      { ticker: 'AAPL', name: 'Apple', change: '+0.5%' }
    ]
  },
  'ukraine': {
    assets: [
      { ticker: 'WEAT', name: 'Wheat ETF', change: '+2.1%' },
      { ticker: 'UNG', name: 'Natural Gas', change: '+1.5%' },
      { ticker: 'ITA', name: 'Defense ETF', change: '+0.9%' }
    ]
  },
  'russia': {
    assets: [
      { ticker: 'RSX', name: 'Russia ETF', change: '-5.0%' },
      { ticker: 'LUKOY', name: 'Lukoil', change: '-2.1%' }
    ]
  },
  'israel': {
    assets: [
      { ticker: 'ITA', name: 'Aerospace & Def', change: '+1.1%' },
      { ticker: 'ZIM', name: 'ZIM Shipping', change: '+3.4%' }
    ]
  },
  'gaza': {
    assets: [
      { ticker: 'ITA', name: 'US Defense', change: '+0.8%' },
      { ticker: 'CL=F', name: 'Crude Oil', change: '+1.2%' }
    ]
  },
  'suez': {
    assets: [
      { ticker: 'ZIM', name: 'ZIM Shipping', change: '+4.2%' },
      { ticker: 'CL=F', name: 'Crude Oil', change: '+1.5%' },
      { ticker: 'NAT', name: 'Nordic Tankers', change: '+2.8%' }
    ]
  },
  'hormuz': {
    assets: [
      { ticker: 'CL=F', name: 'Brent Crude', change: '+2.5%' },
      { ticker: 'XLE', name: 'Energy Select', change: '+1.8%' }
    ]
  },
  'china': {
    assets: [
      { ticker: 'FXI', name: 'China Large-Cap', change: '-0.5%' },
      { ticker: 'KWEB', name: 'China Internet', change: '-1.2%' }
    ]
  },
  'iran': {
    assets: [
      { ticker: 'CL=F', name: 'Crude Oil', change: '+1.5%' },
      { ticker: 'XOM', name: 'Exxon Mobil', change: '+0.8%' }
    ]
  }
}

const getRelatedAssets = (hotspot) => {
  if (!hotspot) return []
  const text = (hotspot.name + ' ' + (hotspot.description || '') + ' ' + (hotspot.region || '')).toLowerCase()
  
  for (const [key, data] of Object.entries(MARKET_IMPACT_MAP)) {
    if (text.includes(key)) {
      return data.assets
    }
  }
  
  // Default fallback based on type
  if (hotspot.type === 'conflict') return [{ ticker: 'ITA', name: 'Defense ETF', change: '+0.5%' }, { ticker: 'XAR', name: 'Aerospace', change: '+0.7%' }]
  if (hotspot.type === 'chokepoint') return [{ ticker: 'ZIM', name: 'ZIM Shipping', change: '+1.2%' }, { ticker: 'CL=F', name: 'Crude Oil', change: '+0.3%' }]
  
  return []
}

const TYPE_BADGE_CONFIG = {
  hotspot: (s) => ({ className: s.severity || s.level || 'unknown', label: `map.${s.severity || s.level || 'medium'}` }),
  country: () => ({ className: 'country', label: 'map.country' }),
  intel: (s) => ({ className: s.severity || 'unknown', label: `map.${s.severity || 'medium'}` }),
  chokepoint: () => ({ className: 'elevated', label: 'map.shipping' }),
  conflict: () => ({ className: 'high', label: 'map.conflict' }),
  base: () => ({ className: 'medium', label: 'map.militaryBase' }),
  nuclear: () => ({ className: 'high', label: 'map.nuclear' }),
  cyber: () => ({ className: 'elevated', label: 'map.cyber' }),
  city: (s) => ({ className: s.severity || 'medium', label: s.severity && typeof s.severity === 'string' ? `map.${s.severity}` : 'map.location' }),
}

const getTypeBadge = (hotspot, t) => {
  const config = TYPE_BADGE_CONFIG[hotspot.type]
  if (!config) return { className: 'unknown', label: t('map.location') }
  const result = config(hotspot)
  return { className: result.className, label: t(result.label) }
}

const formatNewsDate = (dateStr, locale, t) => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return t('common.justNow')
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return t('common.justNow')
  }
}

const HotspotModal = ({ selectedHotspot, onClose, newsLoading }) => {
  const { t, locale } = useI18n()
  if (!selectedHotspot) return null

  const relatedAssets = getRelatedAssets(selectedHotspot)
  const severityLabel = selectedHotspot.severity || selectedHotspot.level || 'medium'

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[420px] bg-[rgba(10,14,20,0.98)] border-l border-l-accent p-6 overflow-y-auto z-[100] translate-x-0 transition-transform duration-300 shadow-[-5px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-text-primary">
          {selectedHotspot.name}
          {selectedHotspot.subtext && (
            <span className="text-[0.85rem] font-normal text-text-secondary ml-2"> - {selectedHotspot.subtext}</span>
          )}
        </div>
        {(() => {
          const { className, label } = getTypeBadge(selectedHotspot, t)
          return (
            <div className={`hotspot-popup-level py-1 px-3 text-xs font-bold uppercase tracking-[1px] border border-current ${className}`}>
              {label}
            </div>
          )
        })()}
      </div>

      {selectedHotspot.category && (
        <div className="text-text-secondary text-[0.85rem] mb-3 leading-relaxed [&_strong]:text-text-primary [&_strong]:mr-1">{selectedHotspot.category}</div>
      )}
      {selectedHotspot.location && (
        <div className="text-text-secondary text-[0.85rem] mb-3 leading-relaxed [&_strong]:text-text-primary [&_strong]:mr-1">{selectedHotspot.location}</div>
      )}
      {selectedHotspot.region && (
        <div className="text-text-secondary text-[0.85rem] mb-3 leading-relaxed [&_strong]:text-text-primary [&_strong]:mr-1">
          <strong>{t('map.region')}</strong> {selectedHotspot.region}
        </div>
      )}

      {/* ASSETS AT RISK SECTION */}
      {relatedAssets.length > 0 && (
        <div className="mt-4">
          <div className="text-[0.7rem] font-bold text-accent tracking-[1px] mt-6 mb-3 border-b border-[rgba(0,255,136,0.2)] pb-1">{t('map.assetsAtRisk')}</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mb-4">
            {relatedAssets.map((asset) => (
              <div key={asset.ticker ?? asset.name} className="bg-[rgba(255,255,255,0.03)] border border-border-main p-3 rounded text-center transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:border-accent hover:-translate-y-0.5">
                <div className="text-[0.9rem] font-bold text-text-primary mb-0.5">{asset.ticker}</div>
                <div className="text-[0.7rem] text-text-secondary mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</div>
                <div className={`text-[0.8rem] font-semibold font-[family-name:var(--font-mono)] ${asset.change.startsWith('+') ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {asset.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-text-secondary mb-4 leading-relaxed">
        {selectedHotspot.description || t('map.situationDefault', { name: selectedHotspot.name })}
      </div>

      {selectedHotspot.status && (
        <div className="text-text-secondary text-[0.85rem] mb-3 leading-relaxed [&_strong]:text-text-primary [&_strong]:mr-1">{t('map.status', { status: selectedHotspot.status })}</div>
      )}

      {/* LIVE INTEL SECTION */}
      {newsLoading ? (
        <div className="mt-4 pt-4 border-t border-border-main">
          <div className="text-xs font-bold text-accent mb-2 uppercase tracking-[1px]">{t('map.liveIntel')}</div>
          <div className="flex items-center gap-3 py-4 text-text-secondary text-[0.8rem]">
            <div className="w-5 h-5 border-2 border-border-main border-t-accent rounded-full animate-spin"></div>
            <span>{t('map.loadingIntel')}</span>
          </div>
        </div>
      ) : selectedHotspot.news && selectedHotspot.news.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-border-main">
          <div className="text-xs font-bold text-accent mb-2 uppercase tracking-[1px]">{t('map.liveIntel')} ({selectedHotspot.news.length})</div>
          {selectedHotspot.news.map((item) => (
            <div key={item.link} className="py-2 border-b border-[rgba(255,255,255,0.1)] last:border-b-0">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-text-primary no-underline text-[0.85rem] block mb-1 transition-colors duration-200 leading-[1.4] hover:text-accent">
                {item.title}
              </a>
              <div className="text-xs text-text-secondary">{item.source} • {formatNewsDate(item.pubDate, locale, t)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-border-main">
          <div className="text-xs font-bold text-accent mb-2 uppercase tracking-[1px]">{t('map.liveIntel')}</div>
          <div className="py-3 text-text-dim text-[0.8rem]">{t('map.noIntel')}</div>
        </div>
      )}
      <button className="absolute top-2 right-2 bg-transparent border-none text-text-secondary text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-accent hover:text-bg-dark" onClick={onClose}>×</button>
    </div>
  )
}

export default HotspotModal
