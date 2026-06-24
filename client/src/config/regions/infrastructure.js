
export const SHIPPING_CHOKEPOINTS = [
  {
    id: 'suez',
    name: 'Suez Canal',
    lat: 30.5833,
    lon: 32.3167,
    keywords: ['suez', 'red sea', 'houthi', 'canal', 'bab el-mandeb'],
    desc: 'Critical waterway handling ~12% of global trade. Traffic remains ~60% below pre-crisis levels in early 2026, despite cessation of Houthi attacks over 100 days ago; many vessels continue Cape of Good Hope routing.',
    traffic: '~20-30 ships/day (significantly reduced)',
    region: 'Egypt'
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    lat: 9.0800,
    lon: -79.6800,
    keywords: ['panama canal', 'panama', 'drought'],
    desc: 'Links Atlantic and Pacific oceans, ~5% of global trade. Post-drought recovery ongoing; daily transits increasing but still below pre-drought capacity of ~38 ships/day.',
    traffic: '~27-32 ships/day (recovering)',
    region: 'Panama'
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    lat: 26.5833,
    lon: 56.4667,
    keywords: ['hormuz', 'strait of hormuz', 'persian gulf', 'oil tanker'],
    desc: 'Primary sea route from Persian Gulf; ~20-21% of global petroleum liquids. Traffic stable despite regional tensions.',
    traffic: '~40-45 tankers/day (normal operations)',
    region: 'Iran/Oman'
  },
  {
    id: 'malacca',
    name: 'Malacca Strait',
    lat: 3.0000,
    lon: 101.0000,
    keywords: ['malacca', 'singapore strait', 'indo-pacific'],
    desc: 'Key link between Indian and Pacific oceans; ~25-30% of global trade and significant oil/LNG volumes. High traffic with growing congestion risks.',
    traffic: '~90-100 ships/day (high volume)',
    region: 'Malaysia/Singapore/Indonesia'
  },
  {
    id: 'bosphorus',
    name: 'Bosphorus/Turkish Straits',
    lat: 41.0167,
    lon: 29.0333,
    keywords: ['bosphorus', 'turkish strait', 'black sea', 'grain export'],
    desc: 'Sole access between Black Sea and Mediterranean. Vital for Russian and Ukrainian grain/oil exports; traffic impacted by ongoing regional conflict.',
    traffic: '~40-45 ships/day (variable due to tensions)',
    region: 'Turkey'
  },
  {
    id: 'babelmandeb',
    name: 'Bab el-Mandeb Strait',
    lat: 12.6667,
    lon: 43.5000,
    keywords: ['bab el-mandeb', 'red sea', 'yemen', 'houthi'],
    desc: 'Gateway to Red Sea and Suez Canal; ~8-10% of global seaborne oil and LNG. Traffic gradually recovering but remains vulnerable to regional security risks.',
    traffic: '~30-40 ships/day (partial recovery)',
    region: 'Yemen/Djibouti/Eritrea'
  },
  {
    id: 'danish',
    name: 'Danish Straits',
    lat: 55.6000,
    lon: 12.6000,
    keywords: ['danish straits', 'baltic sea', 'oresund', 'great belt'],
    desc: 'Primary access to Baltic Sea; important for Russian energy exports and Northern European trade. High annual volume with strategic NATO significance.',
    traffic: '~70-75 thousand ships/year (~200/day)',
    region: 'Denmark/Sweden'
  }
]
export const NUCLEAR_FACILITIES = [
  { id: 'zaporizhzhia', name: 'Zaporizhzhia NPP', lat: 47.5083, lon: 34.5833, type: 'plant', status: 'Russian-occupied, cold shutdown' },
  { id: 'fukushima', name: 'Fukushima Daiichi', lat: 37.4211, lon: 141.0333, type: 'plant', status: 'decommissioning' },
  { id: 'flamanville', name: 'Flamanville NPP', lat: 49.5333, lon: -1.8833, type: 'plant', status: 'active/construction' },
  { id: 'bruce', name: 'Bruce NPP', lat: 44.3333, lon: -81.6000, type: 'plant', status: 'active' },
  { id: 'natanz', name: 'Natanz Enrichment', lat: 33.7167, lon: 51.7333, type: 'enrichment', status: 'damaged 2025' },
  { id: 'fordow', name: 'Fordow Enrichment', lat: 34.8833, lon: 50.9833, type: 'enrichment', status: 'damaged 2025' },
  { id: 'yongbyon', name: 'Yongbyon Complex', lat: 39.8000, lon: 125.7500, type: 'weapons', status: 'active/expanding' },
  { id: 'dimona', name: 'Dimona (Shimon Peres) Reactor', lat: 31.0000, lon: 35.1500, type: 'weapons', status: 'active' },
  { id: 'los_alamos', name: 'Los Alamos National Lab', lat: 35.8833, lon: -106.3000, type: 'weapons', status: 'active' },
  { id: 'pantex', name: 'Pantex Plant', lat: 35.3167, lon: -101.5667, type: 'weapons', status: 'active' },
  { id: 'sellafield', name: 'Sellafield', lat: 54.4167, lon: -3.5000, type: 'reprocessing', status: 'active' },
  { id: 'la_hague', name: 'La Hague', lat: 49.6833, lon: -1.8833, type: 'reprocessing', status: 'active' }
]
export const UNDERSEA_CABLES = [
  {
    id: 'marea',
    name: 'MAREA',
    major: true,
    // Virginia Beach, US to Bilbao, Spain (direct transatlantic)
    points: [[-76.0, 36.9], [-45.0, 42.0], [-3.0, 43.4]]
  },
  {
    id: 'ellalink',
    name: 'EllaLink',
    major: true,
    // Fortaleza, Brazil to Sines, Portugal (direct transatlantic)
    points: [[-38.5, -3.7], [-25.0, 15.0], [-9.0, 38.0]]
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    major: true,
    // LA to Japan to Philippines (Pacific route - using extended coords to go westward)
    points: [[-118.4, 33.7], [-150.0, 28.0], [-180.0, 25.0], [-200.0, 28.0], [-220.2, 35.1], [-237.04, 14.11]]
  },
  {
    id: 'bifrost',
    name: 'Bifrost',
    major: true,
    // LA to Singapore via Pacific (through Guam - using extended coords to go westward)
    points: [[-118.2, 34.0], [-150.0, 25.0], [-180.0, 15.0], [-215.25, 13.4], [-240.0, 10.0], [-256.2, 1.3]]
  },
  {
    id: 'sea_me_we_5',
    name: 'SEA-ME-WE 5',
    major: true,
    // Singapore to France via Indian Ocean, Red Sea, Mediterranean
    points: [[103.8, 1.3], [80.5, 6.0], [65.0, 16.0], [50.0, 12.5], [43.5, 12.5], [38.0, 24.0], [32.5, 30.0], [30.0, 35.0], [15.0, 37.5], [5.4, 43.1]]
  },
  {
    id: '2africa',
    name: '2Africa (Core)',
    major: true,
    // Circumnavigates Africa - west coast down, around Cape, up east coast
    points: [[-9.0, 38.7], [-17.5, 14.7], [-5.0, 5.0], [8.0, -5.0], [12.0, -18.0], [18.4, -33.9], [32.0, -28.0], [40.0, -15.0], [43.0, 11.5], [50.0, 26.0], [32.5, 31.5]]
  },
  {
    id: 'curie',
    name: 'Curie (Google)',
    major: false,
    // LA to Chile via Panama (Pacific coastal route)
    points: [[-118.2, 33.9], [-110.0, 23.0], [-95.0, 15.0], [-85.0, 9.0], [-82.0, 5.0], [-81.0, -5.0], [-78.0, -15.0], [-71.61, -33.05]]
  }
]
