// Centralized feed configuration for all panels.
//
// Feeds that appear in more than one panel are defined once as a canonical
// array and referenced by spread elsewhere, so a URL change propagates to
// every consumer and dedup logic in the feed cache (useDynamicRegions,
// MapFeedService) sees the same object identity.

// Defense-oriented sources used by both `news.intel` and `warWatch`.
const DEFENSE_FEEDS = [
  { name: 'Defense One', url: 'https://www.defenseone.com/rss/all/' },
  { name: 'War on Rocks', url: 'https://warontherocks.com/feed/' },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/' },
  { name: 'The War Zone', url: 'https://www.thedrive.com/the-war-zone/feed' },
]

// Startup coverage shared by `startups` and `vc`.
const STARTUP_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/category/startups/feed/' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/category/deals/feed/' },
  { name: 'Crunchbase', url: 'https://news.crunchbase.com/feed/' },
  { name: 'Sifted', url: 'https://sifted.eu/feed' },
]

export const FEED_CONFIG = {
  news: {
    politics: [
      { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
      { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
      { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
      { name: 'AP News Top Headlines', url: 'https://feeds.feedburner.com/AssociatedPressTopHeadlines' }
    ],
    tech: [
      { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
      { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
      { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
      { name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
      { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' }
    ],
    finance: [
      { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
      { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories' },
      { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
      { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/business/news.rss' },
      { name: 'FT', url: 'https://www.ft.com/rss/home' }
    ],
    gov: [
      { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
      { name: 'SEC', url: 'https://www.sec.gov/news/pressreleases.rss' },
      { name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/' }
    ],
    intel: [
      { name: 'Brookings', url: 'https://www.brookings.edu/feed/', type: 'think-tank', topics: ['policy', 'geopolitics'] },
      ...DEFENSE_FEEDS.map(f => ({ ...f, type: 'defense', topics: ['military', 'defense'] })),
      { name: 'The Diplomat', url: 'https://thediplomat.com/feed/', type: 'regional', topics: ['asia-pacific'], region: 'APAC' },
      { name: 'Al-Monitor', url: 'https://www.al-monitor.com/rss', type: 'regional', topics: ['middle-east'], region: 'MENA' },
      { name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/', type: 'osint', topics: ['investigation', 'osint'] },
      { name: 'CISA Alerts', url: 'https://www.cisa.gov/uscert/ncas/alerts.xml', type: 'cyber', topics: ['cyber', 'security'] },
      { name: 'Krebs Security', url: 'https://krebsonsecurity.com/feed/', type: 'cyber', topics: ['cyber', 'security'] },
      { name: 'Politico', url: 'https://www.politico.com/rss/politics-news.xml', type: 'politics', topics: ['us-politics', 'dc'] },
      { name: 'Axios', url: 'https://api.axios.com/feed/', type: 'politics', topics: ['us-politics', 'breaking-news'] },
      { name: 'The Hill', url: 'https://thehill.com/rss/syndicator/19110', type: 'politics', topics: ['congress', 'dc'] }
    ]
  },

  blockchain: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'The Block', url: 'https://www.theblock.co/rss.xml' }
  ],

  aiRace: [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
    { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' }
  ],

  layoffs: {
    rss: 'https://news.google.com/rss/search?q=tech+layoffs+jobs&hl=en-US&gl=US&ceid=US:en'
  },

  startups: STARTUP_FEEDS,

  vc: [
    { name: 'TechCrunch VC', url: 'https://techcrunch.com/category/venture/feed/' },
    { name: 'StrictlyVC', url: 'https://www.strictlyvc.com/feed/' },
    ...STARTUP_FEEDS.filter(f => f.name !== 'TechCrunch'),
    { name: 'Forbes VC', url: 'https://www.forbes.com/venture-capital/feed/' }
  ],

  warWatch: [
    ...DEFENSE_FEEDS,
    { name: 'Janes', url: 'https://www.janes.com/feeds/news' }
  ]
}

// Re-export news feeds for backward compatibility
export const NEWS_FEEDS = FEED_CONFIG.news
