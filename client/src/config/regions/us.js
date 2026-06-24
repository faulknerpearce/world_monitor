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
  {
    id: 'cfr', name: 'CFR', subtext: 'Council on Foreign Relations', lat: 40.7128, lon: -74.0060,
    keywords: ['cfr', 'council on foreign relations', 'foreign policy', 'think tank', 'nyc', 'new york'],
    description: 'Premier US foreign policy think tank. Research, analysis, and policy recommendations on global affairs.',
    agencies: ['CFR'],
    status: 'Active research'
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
