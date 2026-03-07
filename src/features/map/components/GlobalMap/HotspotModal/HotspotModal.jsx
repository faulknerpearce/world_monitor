import './HotspotModal.css'

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

const formatNewsDate = (dateStr) => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Just Now'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return 'Just Now'
  }
}

const HotspotModal = ({ selectedHotspot, onClose }) => {
  if (!selectedHotspot) return null

  const relatedAssets = getRelatedAssets(selectedHotspot)

  return (
    <div className="hotspot-popup visible">
      <div className="hotspot-popup-header">
        <div className="hotspot-popup-title">
          {selectedHotspot.name}
          {selectedHotspot.subtext && (
            <span className="hotspot-popup-subtext"> - {selectedHotspot.subtext}</span>
          )}
        </div>
        {selectedHotspot.type === 'hotspot' ? (
          <div className={`hotspot-popup-level ${selectedHotspot.severity || selectedHotspot.level || 'unknown'}`}>
            {(selectedHotspot.severity || selectedHotspot.level || 'unknown').toUpperCase()}
          </div>
        ) : selectedHotspot.type === 'country' ? (
          <div className="hotspot-popup-level country">COUNTRY</div>
        ) : selectedHotspot.type === 'intel' ? (
          <div className={`hotspot-popup-level ${selectedHotspot.severity || 'unknown'}`}>
            {(selectedHotspot.severity || 'unknown').toUpperCase()}
          </div>
        ) : selectedHotspot.type === 'chokepoint' ? (
          <div className="hotspot-popup-level elevated">SHIPPING</div>
        ) : selectedHotspot.type === 'conflict' ? (
          <div className="hotspot-popup-level high">CONFLICT</div>
        ) : selectedHotspot.type === 'base' ? (
          <div className="hotspot-popup-level medium">MILITARY BASE</div>
        ) : selectedHotspot.type === 'nuclear' ? (
          <div className="hotspot-popup-level high">NUCLEAR</div>
        ) : selectedHotspot.type === 'cyber' ? (
          <div className="hotspot-popup-level elevated">CYBER</div>
        ) : selectedHotspot.type === 'city' ? (
          <div className={`hotspot-popup-level ${selectedHotspot.severity || 'medium'}`}>
            {selectedHotspot.severity && typeof selectedHotspot.severity === 'string' ? selectedHotspot.severity.toUpperCase() : 'CITY'}
          </div>
        ) : (
          <div className="hotspot-popup-level unknown">LOCATION</div>
        )}
      </div>
      
      {selectedHotspot.category && (
        <div className="hotspot-popup-category">{selectedHotspot.category}</div>
      )}
      {selectedHotspot.location && (
        <div className="hotspot-popup-location">{selectedHotspot.location}</div>
      )}
      {selectedHotspot.region && (
        <div className="hotspot-popup-location">
          <strong>Region:</strong> {selectedHotspot.region}
        </div>
      )}
      
      {/* ASSETS AT RISK SECTION */}
      {relatedAssets.length > 0 && (
        <div className="hotspot-popup-assets-section">
          <div className="hotspot-popup-section-title">ASSETS AT RISK</div>
          <div className="hotspot-popup-assets-grid">
            {relatedAssets.map((asset, i) => (
              <div key={i} className="hotspot-asset-card">
                <div className="asset-ticker">{asset.ticker}</div>
                <div className="asset-name">{asset.name}</div>
                <div className={`asset-change ${asset.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {asset.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hotspot-popup-desc">
        {selectedHotspot.description || `Situation in ${selectedHotspot.name}. Monitoring for developments.`}
      </div>
      
      {selectedHotspot.status && (
        <div className="hotspot-popup-status">Status: {selectedHotspot.status}</div>
      )}
      
      {/* LIVE INTEL SECTION */}
      {selectedHotspot.news && selectedHotspot.news.length > 0 && (
        <div className="hotspot-popup-headlines">
          <div className="hotspot-popup-headlines-title">LIVE INTEL ({selectedHotspot.news.length})</div>
          {selectedHotspot.news.map((item, i) => (
            <div key={i} className="hotspot-popup-headline">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
              <div className="hotspot-popup-source">{item.source} • {formatNewsDate(item.pubDate)}</div>
            </div>
          ))}
        </div>
      )}
      <button className="hotspot-popup-close" onClick={onClose}>×</button>
    </div>
  )
}

export default HotspotModal