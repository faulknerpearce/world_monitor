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
    id: 'houston', name: 'Houston', state: 'TX', lat: 29.7604, lon: -95.3698,
    type: 'major', population: '2.3M',
    keywords: ['houston', 'texas', 'energy', 'oil', 'nasa'],
    description: 'Energy capital. Oil & gas headquarters, NASA Johnson Space Center.',
    sectors: ['Energy', 'Aerospace', 'Healthcare']
  },
  {
    id: 'denver', name: 'Denver', state: 'CO', lat: 39.7392, lon: -104.9903,
    type: 'regional', population: '720K',
    keywords: ['denver', 'colorado', 'aerospace'],
    description: 'Mountain West hub. Aerospace, tech growth, federal facilities.',
    sectors: ['Aerospace', 'Tech', 'Energy']
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
  // Australia / Oceania
  {
    id: 'canberra', name: 'Canberra', subtext: 'AUKUS / Five Eyes', lat: -35.2809, lon: 149.1300,
    keywords: ['australia', 'canberra', 'aukus', 'five eyes', 'australian', 'albanese', 'pine gap'],
    description: 'Australian government and defense headquarters. AUKUS alliance, Five Eyes intelligence partner, Indo-Pacific strategy.',
    agencies: ['ASD', 'ASIO', 'ADF', 'ASIS'],
    status: 'Alliance coordination'
  },
  {
    id: 'sydney', name: 'Sydney', subtext: 'Pacific Economic Hub', lat: -33.8688, lon: 151.2093,
    keywords: ['sydney', 'australia', 'australian economy', 'pacific trade', 'new south wales'],
    description: 'Australia\'s largest city and financial center. Major Pacific trade hub, technology sector, defense industries.',
    agencies: ['ASX', 'RBA'],
    status: 'Economic monitoring'
  },
  {
    id: 'perth', name: 'Perth', subtext: 'Indian Ocean / HMAS Stirling', lat: -31.9505, lon: 115.8605,
    keywords: ['perth', 'western australia', 'hmas stirling', 'indian ocean', 'aukus submarine', 'mining'],
    description: 'Western gateway to Indian Ocean. HMAS Stirling naval base (SRF-West) for AUKUS submarine rotations. Major mining and resources sector.',
    agencies: ['RAN', 'ADF'],
    status: 'AUKUS submarine hub'
  },
  {
    id: 'darwin', name: 'Darwin', subtext: 'US Force Posture', lat: -12.4634, lon: 130.8456,
    keywords: ['darwin', 'northern territory', 'us marines', 'force posture', 'tindal', 'indo-pacific'],
    description: 'Strategic northern military hub. US Marine rotational deployments, RAAF Tindal expansion, closest major base to Southeast Asia.',
    agencies: ['USMC', 'RAAF', 'ADF'],
    status: 'Force posture expansion'
  },
  // Africa
  {
    id: 'lagos', name: 'Lagos', subtext: 'West Africa Hub', lat: 6.5244, lon: 3.3792,
    keywords: ['nigeria', 'lagos', 'boko haram', 'oil', 'west africa', 'ecowas'],
    description: 'Nigeria\'s economic capital and Africa\'s largest city. Oil sector, regional security, ECOWAS dynamics.',
    agencies: ['DSS', 'NIA'],
    status: 'Regional monitoring'
  },
  {
    id: 'nairobi', name: 'Nairobi', subtext: 'East Africa Security', lat: -1.2921, lon: 36.8219,
    keywords: ['kenya', 'nairobi', 'east africa', 'al-shabaab', 'somalia', 'african union'],
    description: 'East African diplomatic and security hub. AU peacekeeping coordination, counter-terrorism, regional trade.',
    agencies: ['NIS', 'KDF', 'AMISOM/ATMIS'],
    status: 'Counter-terrorism ops'
  },
  {
    id: 'addis_ababa', name: 'Addis Ababa', subtext: 'African Union HQ', lat: 9.0250, lon: 38.7469,
    keywords: ['ethiopia', 'addis ababa', 'african union', 'tigray', 'horn of africa', 'red sea'],
    description: 'African Union headquarters. Continental diplomacy, Horn of Africa security, post-Tigray stabilization.',
    agencies: ['AU', 'NISS', 'IGAD'],
    status: 'Continental diplomacy'
  },
  // South America
  {
    id: 'brasilia', name: 'Brasília', subtext: 'BRICS / Regional Power', lat: -15.7975, lon: -47.8919,
    keywords: ['brazil', 'brasilia', 'lula', 'brics', 'amazon', 'south america'],
    description: 'Brazilian government center. BRICS member, regional influence, Amazon security, defense industry.',
    agencies: ['ABIN', 'Armed Forces', 'Itamaraty'],
    status: 'BRICS coordination'
  },
  {
    id: 'buenos_aires', name: 'Buenos Aires', subtext: 'Southern Cone Watch', lat: -34.6037, lon: -58.3816,
    keywords: ['argentina', 'buenos aires', 'milei', 'mercosur', 'falklands', 'lithium'],
    description: 'Argentine capital. Economic reforms under Milei, Mercosur dynamics, lithium triangle, Falklands sovereignty claims.',
    agencies: ['AFI', 'Armed Forces'],
    status: 'Economic restructuring'
  },
  {
    id: 'bogota', name: 'Bogotá', subtext: 'Colombia Security', lat: 4.7110, lon: -74.0721,
    keywords: ['colombia', 'bogota', 'farc', 'eln', 'drug trafficking', 'venezuela border'],
    description: 'Colombian capital. Peace process monitoring, narcotics operations, Venezuelan border situation.',
    agencies: ['DNI', 'Armed Forces', 'National Police'],
    status: 'Peace negotiations'
  },
  // Additional strategic locations
  {
    id: 'cairo', name: 'Cairo', subtext: 'Suez / Middle East Broker', lat: 30.0444, lon: 31.2357,
    keywords: ['egypt', 'cairo', 'suez canal', 'sisi', 'middle east', 'gaza mediator'],
    description: 'Egyptian capital. Suez Canal oversight, Gaza ceasefire mediator, regional stabilization role.',
    agencies: ['GIS', 'Armed Forces', 'Presidency'],
    status: 'Mediation active'
  },
  {
    id: 'islamabad', name: 'Islamabad', subtext: 'Nuclear State Watch', lat: 33.6844, lon: 73.0479,
    keywords: ['pakistan', 'islamabad', 'isi', 'nuclear', 'kashmir', 'afghanistan border', 'taliban'],
    description: 'Pakistani capital. Nuclear arsenal oversight, ISI operations, Afghanistan border dynamics, India tensions.',
    agencies: ['ISI', 'SPD', 'Armed Forces'],
    status: 'Heightened alert'
  },
  {
    id: 'jakarta', name: 'Jakarta', subtext: 'ASEAN / Maritime Security', lat: -6.2088, lon: 106.8456,
    keywords: ['indonesia', 'jakarta', 'asean', 'south china sea', 'natuna', 'maritime'],
    description: 'ASEAN largest member. Maritime sovereignty disputes, South China Sea dynamics, regional trade hub.',
    agencies: ['BIN', 'TNI', 'Bakamla'],
    status: 'Maritime monitoring'
  }
]
