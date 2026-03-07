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
