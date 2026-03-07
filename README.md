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
├── App.jsx                 # Main app with routing
├── App.css
├── rootProviders.jsx       # Root providers (Theme, Refresh)
├── index.js                # Barrel exports
│
├── components/             # Shared/reusable components
│   ├── feedback/ErrorBoundary/
│   ├── layout/
│   │   ├── CategoryTabs/
│   │   ├── CommandModal/
│   │   ├── Navbar/
│   │   └── SettingsModal/
│   ├── ui/
│   │   ├── NewsWireFeed/
│   │   └── Panel/
│   └── visualization/
│       └── DeveloperActivity/
│
├── config/
│   ├── panels.js           # Panel definitions, categories
│   ├── regions.js          # Geographic hotspots
│   └── themes.js           # 13 colour themes
│
├── context/
│   ├── RefreshContext.jsx  # Global refresh counter
│   └── ThemeContext.jsx    # Active theme state
│
├── hooks/
│   ├── useDynamicRegions.js  # Geopolitical severity scoring
│   ├── useFeedData.js        # Shared polling hook for feeds
│   ├── useLocalStorage.js    # localStorage state hook
│   └── usePanelSettings.js   # Panel visibility preferences
│
├── services/               # All services flattened
│   ├── baseFeedService.js  # Core RSS fetch/parse
│   ├── feedConfig.js       # RSS feed URL registry
│   ├── mapFeedService.js   # Map data feeds
│   ├── chainStats.js       # Blockchain metrics
│   ├── githubActivity.js   # GitHub stats
│   └── newsFeedService.js  # News RSS service
│
├── utils/
│   ├── dateHelpers.js      # Time formatters
│   ├── fetchUtils.js       # CORS-proxy fetch
│   └── helpers.js          # Number/text formatters
│
├── features/               # Main pages ONLY
│   ├── dashboard/
│   │   ├── Dashboard.jsx   # Dashboard page
│   │   └── index.js
│   └── map/
│       ├── Map.jsx         # Map page
│       └── components/
│           └── GlobalMap/
│
└── feeds/                  # All 11 feed panels (flattened)
    ├── ai-race/
    │   ├── AiRacePanel.jsx
    │   └── aiRaceFeedService.js
    ├── blockchain/
    ├── good-news/
    ├── heatmap/
    ├── layoffs/
    ├── markets/            # Includes TickerStrip
    ├── news/
    ├── startups/
    ├── vc-activity/
    └── war-watch/
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
