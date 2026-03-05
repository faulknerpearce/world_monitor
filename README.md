# Alpha Monitor

![Alpha Monitor](public/dashboard.png)

A real-time monitoring dashboard for markets, news, and geopolitical events.

## Features

- Real-time news aggregation from multiple RSS sources
- Live market data (stocks, crypto) via Yahoo Finance
- Sector heatmap with colour-coded performance
- Interactive global map with geopolitical hotspots
- Blockchain on-chain metrics (BTC hashrate, ETH gas, DeFi TVL)
- Drag-and-drop panel reordering with collapse/expand
- Focus modes (Founder, Markets, Intel, Signal) to filter panels
- Persistent settings and panel preferences via localStorage
- Manual refresh that clears the RSS cache and re-fetches all panels
- 13 built-in colour themes

## Tech Stack

- **React 18** – UI framework
- **Vite** – Build tool and dev server
- **D3.js** – Interactive world map visualisation
- **Axios** – HTTP client with CORS-proxy fallback

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── CategoryTabs/     # Panel category filter tabs
│   ├── CommandModal/     # Focus-mode selector (Founder / Markets / Intel / Signal)
│   ├── Dashboard/        # Main layout – panel grid, drag-and-drop, hero section
│   ├── ErrorBoundary/    # React error boundary wrapper
│   ├── GlobalMap/        # Interactive D3 world map with hotspot markers
│   ├── Navbar/           # Top navigation bar with live clock
│   ├── SettingsModal/    # Theme & panel-visibility settings
│   ├── TickerStrip/      # Scrolling live market ticker
│   └── panels/           # Individual panel implementations
│       ├── AIRacePanel/      # AI company news feed
│       ├── BlockchainPanel/  # Crypto news + on-chain metrics
│       ├── GoodNewsPanel/    # Positive news feed
│       ├── HeatmapPanel/     # Sector performance heatmap
│       ├── LayoffsPanel/     # Tech layoffs tracker
│       ├── MarketsPanel/     # Stock & crypto prices
│       ├── NewsPanel/        # General RSS news panel (reusable)
│       ├── Panel/            # Shared panel chrome (header, collapse, drag)
│       ├── StartupsPanel/    # Startup funding rounds
│       ├── VCPanel/          # VC fund activity
│       └── WarWatchPanel/    # Defence & conflict news
├── config/
│   ├── panels.js         # Panel definitions, categories, and priorities
│   ├── regions.js        # Geographic hotspots and conflict-zone keywords
│   └── themes.js         # 13 colour themes (CSS variable maps)
├── context/
│   ├── RefreshContext.jsx  # Global refresh counter + cache-clearing trigger
│   └── ThemeContext.jsx    # Active theme state and CSS variable injection
├── hooks/
│   ├── useDynamicRegions.js  # Periodic geopolitical severity scoring from news
│   ├── useFeedData.js        # Shared polling hook for all RSS feed panels
│   ├── useLocalStorage.js    # Generic localStorage state hook
│   └── usePanelSettings.js   # Panel visibility preferences
├── services/
│   └── feeds/
│       ├── baseFeedService.js      # Core RSS fetch + parse logic
│       ├── feedConfig.js           # Centralised RSS feed URL registry
│       ├── aiRaceFeedService.js    # AI news feed (with player list)
│       ├── blockchainFeedService.js
│       ├── goodNewsFeedService.js
│       ├── layoffsFeedService.js
│       ├── mapFeedService.js       # Intel + politics feeds for the global map
│       ├── newsFeedService.js
│       ├── startupsFeedService.js  # Funding-keyword extraction
│       ├── vcFeedService.js
│       └── warWatchFeedService.js
└── utils/
    ├── dateHelpers.js    # getTimeAgo() relative-time formatter
    ├── fetchUtils.js     # CORS-proxy fetch with 5-minute RSS cache
    └── helpers.js        # Number / percentage / text formatters
```

## Architecture Notes

### Real-time Updates
All panels use interval-based polling (no WebSockets). A shared `useFeedData` hook handles the polling lifecycle, cancellation on unmount, and re-fetching when the user presses **REFRESH**. The RSS proxy cache (5-minute TTL) is cleared on manual refresh so panels receive fresh data immediately.

| Panel | Polling interval |
|-------|-----------------|
| Navbar clock | 1 s |
| Markets / Ticker | 30 s |
| Heatmap | 60 s |
| Blockchain on-chain metrics | 2 min |
| News / WarWatch / Blockchain news | 5 min |
| AI Race / Startups / VC / Good News | 10 min |
| Layoffs | 15 min |
| Global Map hotspots | 10 min |

### State Management
- **ThemeContext** – active theme and CSS variable injection
- **RefreshContext** – global refresh counter that panels subscribe to; clears the RSS cache on trigger
- **usePanelSettings** – panel visibility stored in `localStorage`
- **Dashboard** – panel order stored in `localStorage`

## Features Roadmap

- [ ] WebSocket support for true push updates
- [ ] Advanced keyword search and filtering
- [ ] Export / import panel configurations
- [ ] Mobile-responsive layout
