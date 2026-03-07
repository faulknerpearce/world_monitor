export const PANELS = {
  map: { name: 'Global Map', priority: 1, draggable: false, category: 'all' },
  politics: { name: 'World / Geopolitical', priority: 1, draggable: true, category: 'news' },
  tech: { name: 'Technology / AI', priority: 1, draggable: true, category: 'tech' },
  finance: { name: 'Financial', priority: 1, draggable: true, category: 'markets' },
  startups: { name: 'Startups', priority: 1, draggable: true, category: 'tech' },
  vc: { name: 'VC Activity', priority: 1, draggable: true, category: 'markets' },
  blockchain: { name: 'Blockchain / Crypto', priority: 1, draggable: true, category: 'crypto' },
  warwatch: { name: 'War Watch', priority: 1, draggable: true, category: 'news' },
  heatmap: { name: 'Sector Heatmap', priority: 1, draggable: true, category: 'markets' },
  markets: { name: 'Markets', priority: 1, draggable: true, category: 'markets' },
  layoffs: { name: 'Layoffs Tracker', priority: 3, draggable: true, category: 'data' },
}

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: '' },
  { id: 'news', name: 'News', icon: '' },
  { id: 'markets', name: 'Markets', icon: '' },
  { id: 'crypto', name: 'Crypto', icon: '' },
  { id: 'tech', name: 'Tech', icon: '' },
  { id: 'data', name: 'Data', icon: '' },
]

export const COMMAND_MODES = {
  founder: {
    id: 'founder',
    name: 'FOUNDER',
    icon: '◆',
    tagline: 'Build the future',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    panels: ['startups', 'vc', 'tech', 'layoffs']
  },
  markets: {
    id: 'markets',
    name: 'MARKETS',
    icon: '◇',
    tagline: 'Follow the money',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    panels: ['finance', 'blockchain', 'vc']
  },
  intel: {
    id: 'intel',
    name: 'INTEL',
    icon: '◈',
    tagline: 'Know everything',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    panels: ['politics', 'gov', 'warwatch', 'tech']
  },
  signal: {
    id: 'signal',
    name: 'SIGNAL',
    icon: '◉',
    tagline: 'Cut through noise',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    panels: ['politics', 'finance']
  }
}
