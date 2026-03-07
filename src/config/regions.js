// Permanent geographic regions
export const REGIONS = {
  northAmerica: { name: 'North America', coords: [-100, 45] },
  southAmerica: { name: 'South America', coords: [-60, -15] },
  europe: { name: 'Europe', coords: [10, 50] },
  middleEast: { name: 'Middle East', coords: [45, 30] },
  africa: { name: 'Africa', coords: [20, 5] },
  asia: { name: 'Asia', coords: [100, 35] },
  oceania: { name: 'Oceania', coords: [155, -25] }
}

// US Major Cities for domestic view
export const US_CITIES = [
  // Capital
  {
    id: 'dc', name: 'Washington D.C.', state: 'DC', lat: 38.9072, lon: -77.0369,
    type: 'capital', population: '700K',
    keywords: ['washington', 'capitol', 'congress', 'white house', 'pentagon', 'dc', 'biden', 'trump'],
    description: 'Federal government center. White House, Capitol Hill, Pentagon, and major federal agencies.',
    sectors: ['Government', 'Defense', 'Policy']
  },
  // Major metros
  {
    id: 'nyc', name: 'New York City', state: 'NY', lat: 40.7128, lon: -74.0060,
    type: 'major', population: '8.3M',
    keywords: ['new york', 'nyc', 'manhattan', 'wall street', 'broadway', 'brooklyn'],
    description: 'Financial capital. Wall Street, major media headquarters, UN headquarters.',
    sectors: ['Finance', 'Media', 'Tech']
  },
  {
    id: 'la', name: 'Los Angeles', state: 'CA', lat: 34.0522, lon: -118.2437,
    type: 'major', population: '3.9M',
    keywords: ['los angeles', 'la', 'hollywood', 'california', 'socal'],
    description: 'Entertainment industry hub. Major port, aerospace, and tech presence.',
    sectors: ['Entertainment', 'Tech', 'Aerospace']
  },
  {
    id: 'chicago', name: 'Chicago', state: 'IL', lat: 41.8781, lon: -87.6298,
    type: 'major', population: '2.7M',
    keywords: ['chicago', 'illinois', 'midwest'],
    description: 'Midwest economic hub. Commodities trading, transportation logistics.',
    sectors: ['Finance', 'Logistics', 'Manufacturing']
  },
  {
    id: 'houston', name: 'Houston', state: 'TX', lat: 29.7604, lon: -95.3698,
    type: 'major', population: '2.3M',
    keywords: ['houston', 'texas', 'energy', 'oil', 'nasa'],
    description: 'Energy capital. Oil & gas headquarters, NASA Johnson Space Center.',
    sectors: ['Energy', 'Aerospace', 'Healthcare']
  },
  {
    id: 'sf', name: 'San Francisco', state: 'CA', lat: 37.7749, lon: -122.4194,
    type: 'major', population: '870K',
    keywords: ['san francisco', 'sf', 'bay area', 'silicon valley', 'tech'],
    description: 'Tech industry epicenter. Venture capital, startups, major tech HQs.',
    sectors: ['Tech', 'Finance', 'Biotech']
  },
  {
    id: 'seattle', name: 'Seattle', state: 'WA', lat: 47.6062, lon: -122.3321,
    type: 'major', population: '750K',
    keywords: ['seattle', 'washington', 'amazon', 'microsoft', 'boeing'],
    description: 'Pacific Northwest tech hub. Amazon, Microsoft, Boeing headquarters.',
    sectors: ['Tech', 'Aerospace', 'E-commerce']
  },
  {
    id: 'miami', name: 'Miami', state: 'FL', lat: 25.7617, lon: -80.1918,
    type: 'major', population: '450K',
    keywords: ['miami', 'florida', 'latin america', 'caribbean'],
    description: 'Gateway to Latin America. Finance, real estate, tourism hub.',
    sectors: ['Finance', 'Real Estate', 'Tourism']
  },
  {
    id: 'atlanta', name: 'Atlanta', state: 'GA', lat: 33.7490, lon: -84.3880,
    type: 'major', population: '500K',
    keywords: ['atlanta', 'georgia', 'cdc', 'delta'],
    description: 'Southeast economic center. CDC headquarters, major logistics hub.',
    sectors: ['Logistics', 'Healthcare', 'Media']
  },
  {
    id: 'boston', name: 'Boston', state: 'MA', lat: 42.3601, lon: -71.0589,
    type: 'major', population: '680K',
    keywords: ['boston', 'massachusetts', 'harvard', 'mit', 'biotech'],
    description: 'Education and biotech hub. Harvard, MIT, major hospitals.',
    sectors: ['Education', 'Biotech', 'Finance']
  },
  {
    id: 'denver', name: 'Denver', state: 'CO', lat: 39.7392, lon: -104.9903,
    type: 'regional', population: '720K',
    keywords: ['denver', 'colorado', 'aerospace'],
    description: 'Mountain West hub. Aerospace, tech growth, federal facilities.',
    sectors: ['Aerospace', 'Tech', 'Energy']
  },
  {
    id: 'phoenix', name: 'Phoenix', state: 'AZ', lat: 33.4484, lon: -112.0740,
    type: 'regional', population: '1.6M',
    keywords: ['phoenix', 'arizona', 'semiconductor', 'tsmc'],
    description: 'Fast-growing Sun Belt metro. Semiconductor manufacturing expansion.',
    sectors: ['Manufacturing', 'Tech', 'Real Estate']
  },
  {
    id: 'austin', name: 'Austin', state: 'TX', lat: 30.2672, lon: -97.7431,
    type: 'regional', population: '1M',
    keywords: ['austin', 'texas', 'tesla', 'tech'],
    description: 'Texas tech hub. Tesla, Samsung, major tech company expansions.',
    sectors: ['Tech', 'Manufacturing', 'Entertainment']
  },
  {
    id: 'detroit', name: 'Detroit', state: 'MI', lat: 42.3314, lon: -83.0458,
    type: 'regional', population: '640K',
    keywords: ['detroit', 'michigan', 'auto', 'ev', 'ford', 'gm'],
    description: 'Auto industry center. EV transition, manufacturing renaissance.',
    sectors: ['Auto', 'Manufacturing', 'Tech']
  },
  {
    id: 'vegas', name: 'Las Vegas', state: 'NV', lat: 36.1699, lon: -115.1398,
    type: 'regional', population: '650K',
    keywords: ['las vegas', 'vegas', 'nevada', 'gaming'],
    description: 'Entertainment and convention hub. Growing tech presence.',
    sectors: ['Tourism', 'Entertainment', 'Tech']
  },
  // Strategic locations
  {
    id: 'norfolk', name: 'Norfolk', state: 'VA', lat: 36.8508, lon: -76.2859,
    type: 'military', population: '245K',
    keywords: ['norfolk', 'navy', 'naval', 'fleet'],
    description: 'Largest naval base in world. Atlantic Fleet headquarters.',
    sectors: ['Military', 'Defense', 'Shipbuilding']
  },
  {
    id: 'sandiego', name: 'San Diego', state: 'CA', lat: 32.7157, lon: -117.1611,
    type: 'military', population: '1.4M',
    keywords: ['san diego', 'navy', 'pacific fleet', 'border'],
    description: 'Major military hub. Pacific Fleet, border region.',
    sectors: ['Military', 'Biotech', 'Tourism']
  }
]


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
export const MILITARY_BASES = [
  { id: 'ramstein', name: 'Ramstein AB', lat: 49.4371, lon: 7.6021, type: 'us-nato' },
  { id: 'pituffik', name: 'Pituffik Space Base', lat: 76.5333, lon: -68.7500, type: 'us-nato' },
  { id: 'diego_garcia', name: 'Diego Garcia', lat: -7.3133, lon: 72.4111, type: 'us-nato' },
  { id: 'guam', name: 'Andersen AFB', lat: 13.5833, lon: 144.9333, type: 'us-nato' },
  { id: 'okinawa', name: 'Kadena AB', lat: 26.3517, lon: 127.7694, type: 'us-nato' },
  { id: 'yokosuka', name: 'Yokosuka Naval Base', lat: 35.2833, lon: 139.6667, type: 'us-nato' },
  { id: 'camp_humphreys', name: 'Camp Humphreys', lat: 36.9667, lon: 127.0333, type: 'us-nato' },
  { id: 'bahrain', name: 'NSA Bahrain', lat: 26.2333, lon: 50.6167, type: 'us-nato' },
  { id: 'al_udeid', name: 'Al Udeid AB', lat: 25.1167, lon: 51.3167, type: 'us-nato' },
  { id: 'camp_lemonnier', name: 'Camp Lemonnier', lat: 11.5500, lon: 43.1500, type: 'us-nato' },
  { id: 'incirlik', name: 'Incirlik AB', lat: 37.0000, lon: 35.4333, type: 'us-nato' },
  { id: 'rota', name: 'NS Rota', lat: 36.6167, lon: -6.3500, type: 'us-nato' },
  { id: 'stirling', name: 'HMAS Stirling (SRF-West)', lat: -32.2333, lon: 115.6833, type: 'us-nato' },
  { id: 'djibouti_cn', name: 'PLA Djibouti Base', lat: 11.5833, lon: 43.0667, type: 'china' },
  { id: 'ream', name: 'Ream Naval Base', lat: 10.5167, lon: 103.6333, type: 'china' },
  { id: 'woody_island', name: 'Woody Island', lat: 16.8333, lon: 112.3333, type: 'china' },
  { id: 'fiery_cross', name: 'Fiery Cross Reef', lat: 9.5500, lon: 112.8833, type: 'china' },
  { id: 'mischief_reef', name: 'Mischief Reef', lat: 9.9000, lon: 115.5333, type: 'china' },
  { id: 'kaliningrad', name: 'Kaliningrad Oblast', lat: 54.7100, lon: 20.5100, type: 'russia' },
  { id: 'sevastopol', name: 'Sevastopol', lat: 44.6167, lon: 33.5333, type: 'russia' },
  { id: 'tartus', name: 'Tartus Naval Base', lat: 34.8833, lon: 35.8667, type: 'russia' },
  { id: 'hmeimim', name: 'Hmeimim AB', lat: 35.4000, lon: 35.9500, type: 'russia' },
  { id: 'cam_ranh', name: 'Cam Ranh Bay', lat: 11.9833, lon: 109.2167, type: 'russia' }
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

export const CYBER_REGIONS = [
  {
    id: 'cyber_russia',
    name: 'RU',
    fullName: 'Russia',
    lat: 55.7558,
    lon: 37.6173,
    group: 'APT28 / APT29',
    aka: 'Fancy Bear / Cozy Bear',
    sponsor: 'GRU / SVR',
    desc: 'State-sponsored groups linked to Russian intelligence. Active in espionage, disinformation, and disruptive operations supporting geopolitical objectives, including Ukraine-related activities.',
    targets: ['Government', 'Defense', 'Critical Infrastructure', 'Elections', 'Ukraine/NATO Allies']
  },
  {
    id: 'cyber_china',
    name: 'CN',
    fullName: 'China',
    lat: 39.9042,
    lon: 116.4074,
    group: 'APT41 / Salt Typhoon / Volt Typhoon',
    aka: 'Winnti / Operator Panda',
    sponsor: 'MSS / PLA',
    desc: 'Prolific state-sponsored actors conducting global espionage, supply chain compromises, and pre-positioning in critical infrastructure. Surge in telecom and infrastructure targeting observed in 2025.',
    targets: ['Telecom', 'Critical Infrastructure', 'Tech', 'Government', 'Aerospace']
  },
  {
    id: 'cyber_nk',
    name: 'NK',
    fullName: 'North Korea',
    lat: 39.0392,
    lon: 125.7625,
    group: 'Lazarus / Kimsuky',
    aka: 'Famous Chollima / Velvet Chollima / APT43',
    sponsor: 'Reconnaissance General Bureau (RGB)',
    desc: 'Hybrid operations blending espionage with financially motivated attacks, including record cryptocurrency thefts and ransomware to fund regime. Increasing use of AI and collaboration with other actors.',
    targets: ['Cryptocurrency', 'Finance', 'Defense', 'Supply Chain', 'Think Tanks']
  },
  {
    id: 'cyber_iran',
    name: 'IR',
    fullName: 'Iran',
    lat: 35.6892,
    lon: 51.3890,
    group: 'MuddyWater / Charming Kitten',
    aka: 'APT33/35 / UNC1549',
    sponsor: 'IRGC / MOIS',
    desc: 'Adaptive operations focusing on regional adversaries, disruptive wiper attacks, and espionage. Increased sophistication and targeting of aerospace, defense, and critical sectors amid geopolitical tensions.',
    targets: ['Israel', 'Energy', 'Aerospace', 'Government', 'Dissidents']
  }
]

// =============================================================================
// DYNAMIC REGIONS - Updated periodically based on current events
// =============================================================================
// These are markers that can change based on current events

export const HOTSPOTS = {
  'gaza-conflict': {
    id: 'gaza-conflict',
    name: 'Gaza Conflict',
    location: 'Gaza Strip',
    lat: 31.3547,
    lon: 34.3088,
    severity: 'high',
    category: 'Armed Conflict',
    description: 'Ongoing Israel-Hamas conflict. Humanitarian crisis, ceasefire negotiations, hostage situation, and military operations.',
    keywords: ['gaza', 'hamas', 'israel', 'hostage', 'ceasefire', 'rafah', 'humanitarian', 'netanyahu'],
    startDate: 'Oct 2023',
    status: 'Active Conflict',
    icon: '💥'
  },
  'iran-tensions': {
    id: 'iran-tensions',
    name: 'Iran Nuclear & Regional',
    location: 'Tehran, Iran',
    lat: 35.6892,
    lon: 51.3890,
    severity: 'high',
    category: 'Geopolitical',
    description: 'Nuclear program concerns, regional proxy conflicts, sanctions, and diplomatic tensions with Western powers.',
    keywords: ['iran', 'tehran', 'nuclear', 'irgc', 'sanctions', 'khamenei', 'enrichment', 'proxy'],
    startDate: 'Ongoing',
    status: 'Elevated Tensions',
    icon: '☢'
  },
  'yemen-houthis': {
    id: 'yemen-houthis',
    name: 'Yemen & Houthi Attacks',
    location: 'Sanaa, Yemen',
    lat: 15.3694,
    lon: 44.1910,
    severity: 'high',
    category: 'Armed Conflict',
    description: 'Houthi attacks on Red Sea shipping, ongoing civil war, and humanitarian catastrophe. US/UK military strikes.',
    keywords: ['yemen', 'houthi', 'red sea', 'shipping', 'sanaa', 'aden', 'saudi', 'bab el-mandeb'],
    startDate: '2014',
    status: 'Active Conflict',
    icon: '⚔'
  }
}

// Intelligence Hotspots - Major world capitals and strategic locations
export const INTEL_HOTSPOTS = [
  {
    id: 'dc', name: 'DC', subtext: 'US National Security Hub', lat: 38.9072, lon: -77.0369,
    keywords: ['pentagon', 'white house', 'washington', 'd.c.', 'us military', 'cia', 'nsa', 'trump', 'biden', 'us', 'america', 'united states', 'federal', 'government', 'congress', 'senate', 'house of representatives'],
    description: 'US national security and political center. Monitor for domestic and international developments affecting American interests.',
    agencies: ['Pentagon', 'CIA', 'NSA', 'State Dept', 'White House', 'Congress'],
    status: 'Active monitoring'
  },
  {
    id: 'moscow', name: 'Moscow', subtext: 'Kremlin Activity', lat: 55.7558, lon: 37.6173,
    keywords: ['russia', 'putin', 'kremlin', 'moscow', 'russian'],
    description: 'Russian political and military command center. FSB, GRU, Presidential Administration.',
    agencies: ['FSB', 'GRU', 'SVR', 'Kremlin'],
    status: 'High activity'
  },
  {
    id: 'beijing', name: 'Beijing', subtext: 'PLA/MSS Activity', lat: 39.9042, lon: 116.4074,
    keywords: ['china', 'beijing', 'chinese', 'xi jinping', 'taiwan strait', 'pla'],
    description: 'Chinese Communist Party headquarters. PLA command, MSS intelligence operations.',
    agencies: ['PLA', 'MSS', 'CCP Politburo'],
    status: 'Elevated posture'
  },
  {
    id: 'kyiv', name: 'Kyiv', subtext: 'Conflict Zone', lat: 50.4501, lon: 30.5234,
    keywords: ['ukraine', 'kyiv', 'zelensky', 'ukrainian', 'donbas', 'crimea'],
    description: 'Ukrainian capital under wartime conditions. Government, military coordination center.',
    agencies: ['SBU', 'GUR', 'Armed Forces'],
    status: 'Active conflict'
  },
  {
    id: 'taipei', name: 'Taipei', subtext: 'Strait Watch', lat: 25.0330, lon: 121.5654,
    keywords: ['taiwan', 'taipei', 'taiwanese', 'strait'],
    description: 'Taiwan government and military HQ. ADIZ violations and PLA exercises tracked.',
    agencies: ['NSB', 'MND', 'AIT'],
    status: 'Heightened alert'
  },
  {
    id: 'tehran', name: 'Tehran', subtext: 'IRGC Activity', lat: 35.6892, lon: 51.3890,
    keywords: ['iran', 'tehran', 'iranian', 'irgc', 'hezbollah', 'nuclear'],
    description: 'Iranian regime center. IRGC Quds Force, nuclear program oversight, proxy coordination.',
    agencies: ['IRGC', 'MOIS', 'AEOI'],
    status: 'Proxy operations active'
  },
  {
    id: 'telaviv', name: 'Tel Aviv', subtext: 'Mossad/IDF', lat: 32.0853, lon: 34.7818,
    keywords: ['israel', 'israeli', 'gaza', 'hamas', 'idf', 'netanyahu', 'mossad'],
    description: 'Israeli security apparatus. IDF operations, Mossad intel, Shin Bet domestic security.',
    agencies: ['Mossad', 'IDF', 'Shin Bet', 'Aman'],
    status: 'Active operations'
  },
  {
    id: 'pyongyang', name: 'Pyongyang', subtext: 'DPRK Watch', lat: 39.0392, lon: 125.7625,
    keywords: ['north korea', 'kim jong', 'pyongyang', 'dprk', 'korean missile'],
    description: 'North Korean leadership compound. Nuclear/missile program, regime stability indicators.',
    agencies: ['RGB', 'KPA', 'SSD'],
    status: 'Missile tests ongoing'
  },
  {
    id: 'london', name: 'London', subtext: 'GCHQ/MI6', lat: 51.5074, lon: -0.1278,
    keywords: ['uk', 'britain', 'british', 'mi6', 'gchq', 'london'],
    description: 'UK intelligence community hub. Five Eyes partner, SIGINT, foreign intelligence.',
    agencies: ['MI6', 'GCHQ', 'MI5'],
    status: 'Normal operations'
  },
  {
    id: 'brussels', name: 'Brussels', subtext: 'NATO HQ', lat: 50.8503, lon: 4.3517,
    keywords: ['nato', 'eu', 'european union', 'brussels'],
    description: 'NATO headquarters and EU institutions. Alliance coordination, Article 5 readiness.',
    agencies: ['NATO', 'EU Commission', 'EEAS'],
    status: 'Enhanced readiness'
  },
  {
    id: 'caracas', name: 'Caracas', subtext: 'Venezuela Transition', lat: 10.4806, lon: -66.9036,
    keywords: ['venezuela', 'maduro', 'caracas', 'venezuelan', 'pdvsa', 'us intervention'],
    description: 'Site of recent US military operation capturing Maduro. Interim administration, oil sector reforms, international responses.',
    agencies: ['SEBIN', 'DGCIM', 'GNB', 'US Oversight'],
    status: 'US-influenced transition'
  },
  {
    id: 'nuuk', name: 'Nuuk', subtext: 'Arctic Tensions', lat: 64.1750, lon: -51.7388,
    keywords: ['greenland', 'denmark', 'arctic', 'nuuk', 'thule', 'pituffik', 'rare earth'],
    description: 'Arctic strategic territory with US military presence at Pituffik Space Base. Renewed US interest in control, rare earth minerals, sovereignty disputes.',
    agencies: ['Danish Defence', 'US Space Force', 'Arctic Council'],
    status: 'Heightened diplomatic tensions'
  },
  {
    id: 'seoul', name: 'Seoul', subtext: 'Korean Peninsula Watch', lat: 37.5665, lon: 126.9780,
    keywords: ['south korea', 'seoul', 'korean', 'rok', 'usfk', 'missile defense'],
    description: 'South Korean capital and military command center. US-ROK alliance, deterrence against DPRK threats.',
    agencies: ['ROK Ministry of National Defense', 'USFK', 'NSC'],
    status: 'Alliance vigilance'
  },
  {
    id: 'newdelhi', name: 'New Delhi', subtext: 'Indo-Pacific Strategy', lat: 28.6139, lon: 77.2090,
    keywords: ['india', 'new delhi', 'modi', 'indian', 'quad', 'indo-pacific'],
    description: 'Indian political and military hub. Growing strategic partnerships, border tensions monitoring.',
    agencies: ['RAW', 'Indian Armed Forces', 'MEA'],
    status: 'Strategic realignment'
  },
  {
    id: 'riyadh', name: 'Riyadh', subtext: 'Gulf Security Hub', lat: 24.7136, lon: 46.6753,
    keywords: ['saudi arabia', 'riyadh', 'mbs', 'gulf', 'oil', 'yemen'],
    description: 'Saudi Arabian command center. Regional security, energy policy, alliances with US.',
    agencies: ['GID', 'Saudi Armed Forces', 'MOD'],
    status: 'Regional stabilization'
  },
  {
    id: 'ankara', name: 'Ankara', subtext: 'NATO Southern Flank', lat: 39.9334, lon: 32.8597,
    keywords: ['turkey', 'ankara', 'erdogan', 'turkish', 'nato', 'syria'],
    description: 'Turkish government and military headquarters. NATO member dynamics, regional operations.',
    agencies: ['MIT', 'Turkish Armed Forces', 'Presidency'],
    status: 'Alliance coordination'
  },
  {
    id: 'tokyo', name: 'Tokyo', subtext: 'US-Japan Alliance', lat: 35.6762, lon: 139.6503,
    keywords: ['japan', 'tokyo', 'japanese', 'usfj', 'east china sea'],
    description: 'Japanese political and defense center. US alliance, regional deterrence.',
    agencies: ['PSIA', 'JSDF', 'MOD'],
    status: 'Enhanced deterrence'
  },
  {
    id: 'singapore', name: 'Singapore', subtext: 'Malacca Strait Oversight', lat: 1.3521, lon: 103.8198,
    keywords: ['singapore', 'malacca', 'strait', 'maritime', 'asean'],
    description: 'Key maritime hub monitoring critical chokepoint. Regional security and trade flows.',
    agencies: ['ISD', 'RSAF', 'RSN'],
    status: 'Maritime vigilance'
  },
  {
    id: 'cfr', name: 'CFR', subtext: 'Council on Foreign Relations', lat: 40.7128, lon: -74.0060,
    keywords: ['cfr', 'council on foreign relations', 'foreign policy', 'think tank', 'nyc', 'new york'],
    description: 'Premier US foreign policy think tank. Research, analysis, and policy recommendations on global affairs.',
    agencies: ['CFR'],
    status: 'Active research'
  }
]

export const US_HOTSPOTS = [
  {
    id: 'mn-daycare-fraud',
    name: 'Minnesota Daycare Fraud',
    location: 'Minneapolis, MN',
    lat: 44.9778,
    lon: -93.2650,
    level: 'high',
    category: 'Federal Investigation',
    description: 'Massive $250M+ fraud scheme involving Feeding Our Future nonprofit. Largest pandemic-era fraud case. Multiple convictions and ongoing trials.',
    keywords: ['minnesota', 'daycare', 'fraud', 'feeding our future', 'minneapolis', 'pandemic fraud', 'child nutrition', 'somali'],
    startDate: '2022',
    status: 'Active Investigation',
    icon: '⚠'
  },
  {
    id: 'la-wildfires',
    name: 'California Wildfires',
    location: 'Los Angeles, CA',
    lat: 34.0522,
    lon: -118.2437,
    level: 'high',
    category: 'Natural Disaster',
    description: 'Ongoing wildfire emergency in Los Angeles area. Multiple fires, evacuations, and widespread destruction.',
    keywords: ['california', 'wildfire', 'los angeles', 'fire', 'evacuation', 'palisades', 'eaton', 'altadena'],
    startDate: '2025',
    status: 'Active Emergency',
    icon: '🔥'
  },
  {
    id: 'border-crisis',
    name: 'Border Enforcement',
    location: 'El Paso, TX',
    lat: 31.7619,
    lon: -106.4850,
    level: 'elevated',
    category: 'Immigration',
    description: 'Ongoing migration and border enforcement actions. Policy changes, deportations, and humanitarian concerns.',
    keywords: ['border', 'immigration', 'migrant', 'el paso', 'texas', 'cbp', 'deportation', 'ice'],
    startDate: '2024',
    status: 'Ongoing',
    icon: '🚨'
  },
  {
    id: 'ai-regulation',
    name: 'AI & Tech Policy',
    location: 'San Francisco, CA',
    lat: 37.7749,
    lon: -122.4194,
    level: 'medium',
    category: 'Technology',
    description: 'Major tech companies facing regulatory scrutiny. AI safety debates, antitrust actions, and policy formation.',
    keywords: ['openai', 'anthropic', 'google ai', 'ai regulation', 'artificial intelligence', 'tech regulation', 'deepseek'],
    startDate: '2024',
    status: 'Developing',
    icon: '🤖'
  }
]

export const CONFLICT_ZONES = [
  {
    id: 'ukraine',
    name: 'Ukraine Conflict',
    intensity: 'high',
    coords: [
      [37.5, 47.0], [38.5, 47.5], [39.0, 48.5], [38.0, 49.5],
      [37.0, 49.0], [36.0, 48.5], [35.5, 47.5], [36.5, 47.0]
    ],
    labelPos: { lat: 48.0, lon: 37.5 },
    startDate: 'Feb 24, 2022',
    parties: ['Russia', 'Ukraine', 'NATO/Western support'],
    casualties: 'Hundreds of thousands ongoing',
    displaced: 'Millions internally; millions refugees',
    description: 'Full-scale Russian invasion continues with positional warfare in the east, heavy infrastructure strikes, and drone/missile exchanges. Negotiations for security guarantees and potential ceasefire ongoing amid high casualties.',
    keyEvents: ['Pokrovsk direction advances', 'Energy infrastructure attacks', 'Peacekeeping proposals'],
    keywords: ['ukraine', 'russia', 'zelensky', 'putin', 'donbas', 'crimea', 'kharkiv']
  },
  {
    id: 'gaza',
    name: 'Gaza Conflict',
    intensity: 'medium',
    coords: [
      [34.2, 31.6], [34.6, 31.6], [34.6, 31.2], [34.2, 31.2]
    ],
    labelPos: { lat: 31.4, lon: 34.4 },
    startDate: 'Oct 7, 2023',
    parties: ['Israel (IDF)', 'Hamas'],
    casualties: 'Over 70,000 Palestinian; thousands Israeli (cumulative)',
    displaced: 'Majority of population',
    description: 'Fragile US-brokered ceasefire in effect since October 2025 (phase one). IDF controls ~50-60% of territory; ongoing violations, aid restrictions, humanitarian crisis persist.',
    keyEvents: ['October 2025 ceasefire', 'Hostage releases', 'Yellow Line enforcement'],
    keywords: ['gaza', 'israel', 'hamas', 'idf', 'netanyahu', 'ceasefire', 'yellow line']
  },
  {
    id: 'sudan',
    name: 'Sudan Civil War',
    intensity: 'high',
    coords: [
      [32.0, 16.0], [34.0, 16.5], [35.0, 15.0], [33.5, 13.5],
      [31.5, 14.0], [31.0, 15.5]
    ],
    labelPos: { lat: 15.0, lon: 32.5 },
    startDate: 'Apr 15, 2023',
    parties: ['Sudanese Armed Forces (SAF)', 'Rapid Support Forces (RSF)'],
    casualties: 'Tens of thousands',
    displaced: '11M+ (world\'s largest crisis)',
    description: 'Escalating RSF advances in Darfur and Kordofan; sieges on cities, famine conditions, ethnic targeting in contested areas.',
    keyEvents: ['Fall of El Fasher', 'Heglig oil field capture', 'Famine spread'],
    keywords: ['sudan', 'khartoum', 'rsf', 'saf', 'darfur', 'burhan', 'hemedti']
  },
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    intensity: 'high',
    coords: [
      [96.0, 22.0], [98.0, 23.0], [98.5, 21.0], [97.0, 19.5], [95.5, 20.5]
    ],
    labelPos: { lat: 21.0, lon: 96.5 },
    startDate: 'Feb 1, 2021',
    parties: ['Military Junta', 'Ethnic Armed Organizations', 'People\'s Defense Forces'],
    casualties: 'Over 100,000',
    displaced: '3.5M+',
    description: 'Junta conducting controversial phased elections amid ongoing resistance offensives; pro-military party dominating controlled areas while opposition controls significant territory.',
    keyEvents: ['2025-2026 phased elections', 'Resistance territorial gains'],
    keywords: ['myanmar', 'burma', 'junta', 'arakan', 'karen', 'kachin', 'election']
  },
  {
    id: 'taiwan_strait',
    name: 'Taiwan Strait Tensions',
    intensity: 'elevated',
    coords: [
      [119.0, 26.0], [121.5, 26.0], [121.5, 22.5], [119.0, 22.5]
    ],
    labelPos: { lat: 24.5, lon: 120.0 },
    startDate: 'Ongoing',
    parties: ['China (PLA)', 'Taiwan', 'United States'],
    casualties: 'Low (incursions)',
    displaced: 'N/A',
    description: 'Increased PLA blockade simulation exercises and ADIZ incursions; heightened risk of escalation amid regional deterrence.',
    keyEvents: ['Justice Mission 2025 exercises', 'ADIZ violations'],
    keywords: ['taiwan', 'china', 'strait', 'pla', 'adiz', 'blockade']
  },
  {
    id: 'sahel',
    name: 'Sahel Jihadist Insurgencies',
    intensity: 'high',
    coords: [
      [-4.0, 15.0], [0.0, 15.0], [0.0, 12.0], [-4.0, 12.0]
    ],
    labelPos: { lat: 14.0, lon: -2.0 },
    startDate: '2012 (escalated 2020s)',
    parties: ['JNIM (al-Qaeda affiliate)', 'Islamic State Sahel', 'Governments of Mali/Burkina Faso/Niger'],
    casualties: 'Tens of thousands annual',
    displaced: 'Millions',
    description: 'Escalating insurgencies with JNIM and IS-Sahel controlling/contesting large rural areas; sieges on towns, record terrorism deaths.',
    keyEvents: ['JNIM territorial expansion', 'IS-Sahel attacks'],
    keywords: ['sahel', 'mali', 'burkina faso', 'niger', 'jnim', 'islamic state', 'jihadist']
  },
  {
    id: 'yemen_south',
    name: 'Yemen Southern Conflict',
    intensity: 'medium',
    coords: [
      [43.0, 13.0], [54.0, 13.0], [54.0, 17.0], [43.0, 17.0]
    ],
    labelPos: { lat: 15.0, lon: 48.0 },
    startDate: 'Dec 2025 escalation',
    parties: ['Yemeni Government/Saudi-backed', 'Southern Transitional Council (STC/UAE-aligned)'],
    casualties: 'Hundreds recent',
    displaced: 'Thousands',
    description: 'Saudi-backed offensive against UAE-supported separatists; government forces retaking southern territories amid rift in anti-Houthi coalition.',
    keyEvents: ['STC offensive reversal', 'Aden recapture'],
    keywords: ['yemen', 'south yemen', 'stc', 'aden', 'saudi', 'uae', 'separatist']
  }
]
