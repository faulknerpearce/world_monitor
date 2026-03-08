export const PANELS = {
  map: { nameKey: 'panels.map', priority: 1, draggable: false, category: 'all' },
  politics: { nameKey: 'panels.politics', priority: 1, draggable: true, category: 'news' },
  tech: { nameKey: 'panels.tech', priority: 1, draggable: true, category: 'tech' },
  finance: { nameKey: 'panels.finance', priority: 1, draggable: true, category: 'markets' },
  startups: { nameKey: 'panels.startups', priority: 1, draggable: true, category: 'tech' },
  vc: { nameKey: 'panels.vc', priority: 1, draggable: true, category: 'markets' },
  blockchain: { nameKey: 'panels.blockchain', priority: 1, draggable: true, category: 'crypto' },
  warwatch: { nameKey: 'panels.warwatch', priority: 1, draggable: true, category: 'news' },
  heatmap: { nameKey: 'panels.heatmap', priority: 1, draggable: true, category: 'markets' },
  markets: { nameKey: 'panels.markets', priority: 1, draggable: true, category: 'markets' },
  layoffs: { nameKey: 'panels.layoffs', priority: 3, draggable: true, category: 'data' },
}

export const CATEGORIES = [
  { id: 'all', nameKey: 'category.all', icon: '' },
  { id: 'news', nameKey: 'category.news', icon: '' },
  { id: 'markets', nameKey: 'category.markets', icon: '' },
  { id: 'crypto', nameKey: 'category.crypto', icon: '' },
  { id: 'tech', nameKey: 'category.tech', icon: '' },
  { id: 'data', nameKey: 'category.data', icon: '' },
]

export const COMMAND_MODES = {
  founder: {
    id: 'founder',
    nameKey: 'mode.founder',
    icon: '◆',
    taglineKey: 'mode.founderTagline',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    panels: ['startups', 'vc', 'tech', 'layoffs']
  },
  markets: {
    id: 'markets',
    nameKey: 'mode.markets',
    icon: '◇',
    taglineKey: 'mode.marketsTagline',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    panels: ['finance', 'blockchain', 'vc']
  },
  intel: {
    id: 'intel',
    nameKey: 'mode.intel',
    icon: '◈',
    taglineKey: 'mode.intelTagline',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    panels: ['politics', 'gov', 'warwatch', 'tech']
  },
  signal: {
    id: 'signal',
    nameKey: 'mode.signal',
    icon: '◉',
    taglineKey: 'mode.signalTagline',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    panels: ['politics', 'finance']
  }
}
