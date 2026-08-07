type PanelCategory = 'all' | 'news' | 'markets' | 'crypto' | 'tech' | 'data'
type PanelLayout = 'wide' | 'normal'

interface PanelConfig {
  nameKey: string
  priority: number
  draggable: boolean
  category: PanelCategory
  layout: PanelLayout
}

export const PANELS: Record<string, PanelConfig> = {
  map: { nameKey: 'panels.map', priority: 1, draggable: false, category: 'all', layout: 'normal' },
  politics: { nameKey: 'panels.politics', priority: 1, draggable: true, category: 'news', layout: 'wide' },
  tech: { nameKey: 'panels.tech', priority: 1, draggable: true, category: 'tech', layout: 'normal' },
  finance: { nameKey: 'panels.finance', priority: 1, draggable: true, category: 'markets', layout: 'normal' },
  startups: { nameKey: 'panels.startups', priority: 1, draggable: true, category: 'tech', layout: 'wide' },
  vc: { nameKey: 'panels.vc', priority: 1, draggable: true, category: 'markets', layout: 'normal' },
  blockchain: { nameKey: 'panels.blockchain', priority: 1, draggable: true, category: 'crypto', layout: 'normal' },
  warwatch: { nameKey: 'panels.warwatch', priority: 1, draggable: true, category: 'news', layout: 'normal' },
  layoffs: { nameKey: 'panels.layoffs', priority: 3, draggable: true, category: 'data', layout: 'normal' },
}

interface CategoryConfig {
  id: PanelCategory
  nameKey: string
  icon: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'all', nameKey: 'category.all', icon: '' },
  { id: 'news', nameKey: 'category.news', icon: '' },
  { id: 'markets', nameKey: 'category.markets', icon: '' },
  { id: 'crypto', nameKey: 'category.crypto', icon: '' },
  { id: 'tech', nameKey: 'category.tech', icon: '' },
  { id: 'data', nameKey: 'category.data', icon: '' },
]

interface CommandMode {
  id: string
  nameKey: string
  icon: string
  taglineKey: string
  gradient: string
  panels: string[]
}

export const COMMAND_MODES: Record<string, CommandMode> = {
  founder: {
    id: 'founder',
    nameKey: 'mode.founder',
    icon: '◆',
    taglineKey: 'mode.founderTagline',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    panels: ['startups', 'vc', 'tech', 'layoffs'],
  },
  markets: {
    id: 'markets',
    nameKey: 'mode.markets',
    icon: '◇',
    taglineKey: 'mode.marketsTagline',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    panels: ['finance', 'blockchain', 'vc'],
  },
  intel: {
    id: 'intel',
    nameKey: 'mode.intel',
    icon: '◈',
    taglineKey: 'mode.intelTagline',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    panels: ['politics', 'warwatch', 'tech'],
  },
  signal: {
    id: 'signal',
    nameKey: 'mode.signal',
    icon: '◉',
    taglineKey: 'mode.signalTagline',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    panels: ['politics', 'finance'],
  },
}
