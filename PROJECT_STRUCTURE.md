# World Monitor - Project Structure

## Directory Structure
```
world_monitor/                         # Root: Real-time monitoring dashboard
│
├── client/                            # React frontend application (Vite)
│   │
│   ├── public/                        # Static assets served at root
│   │   └── dashboard.png              # Dashboard preview image
│   │
│   ├── src/                           # Application source code
│   │   │
│   │   ├── app/                       # Application entry point and routing
│   │   │   ├── App.jsx                # Main component with route definitions
│   │   │   ├── App.css                # App-level styles
│   │   │   ├── main.jsx               # React DOM render entry
│   │   │   └── index.css              # Global styles and font imports
│   │   │
│   │   ├── config/                    # App configuration
│   │   │   ├── panels.js              # Panel definitions, categories, command modes
│   │   │   ├── regions.js             # Geographic hotspots and markers
│   │   │   └── themes.js              # Color theme definitions
│   │   │
│   │   ├── context/                   # React Context providers for global state
│   │   │   ├── RefreshContext.jsx      # Global refresh trigger
│   │   │   └── ThemeContext.jsx        # Theme state management
│   │   │
│   │   ├── features/                  # Feature-based modules (domain-driven)
│   │   │   │
│   │   │   ├── ai-race/               # AI company news feed
│   │   │   │   ├── AiRacePanel.jsx
│   │   │   │   ├── AiRacePanel.css
│   │   │   │   ├── aiRaceFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── blockchain/            # Crypto news + on-chain metrics
│   │   │   │   ├── BlockchainPanel.jsx
│   │   │   │   ├── BlockchainPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── dashboard/             # Main dashboard page
│   │   │   │   ├── Dashboard.jsx      # Dashboard page with panel grid
│   │   │   │   ├── Dashboard.css
│   │   │   │   ├── Panel.jsx          # Collapsible panel wrapper
│   │   │   │   ├── Panel.css
│   │   │   │   ├── CategoryTabs.jsx   # Category filter tabs
│   │   │   │   ├── CategoryTabs.css
│   │   │   │   ├── ErrorBoundary.jsx  # Error boundary for panels
│   │   │   │   ├── ErrorBoundary.css
│   │   │   │   ├── DeveloperActivity.jsx # Dev activity chart
│   │   │   │   ├── DeveloperActivity.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── good-news/             # Positive news feed
│   │   │   │   ├── GoodNewsPanel.jsx
│   │   │   │   ├── GoodNewsPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── heatmap/               # Sector performance heatmap
│   │   │   │   ├── HeatmapPanel.jsx
│   │   │   │   ├── HeatmapPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── layoffs/               # Tech layoffs tracker
│   │   │   │   ├── LayoffsPanel.jsx
│   │   │   │   ├── LayoffsPanel.css
│   │   │   │   ├── layoffsFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── map/                   # Interactive global map
│   │   │   │   ├── Map.jsx            # Map page wrapper
│   │   │   │   ├── Map.css
│   │   │   │   ├── GlobalMap.jsx      # D3 globe map component
│   │   │   │   ├── GlobalMap.css
│   │   │   │   ├── HotspotModal.jsx   # Hotspot detail popup
│   │   │   │   ├── HotspotModal.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── markets/               # Stock & crypto prices
│   │   │   │   ├── MarketsPanel.jsx
│   │   │   │   ├── MarketsPanel.css
│   │   │   │   ├── TickerStrip.jsx    # Scrolling ticker strip
│   │   │   │   ├── TickerStrip.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── navigation/            # Navigation and app-level modals
│   │   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── CommandModal.jsx   # Focus mode selector
│   │   │   │   ├── CommandModal.css
│   │   │   │   ├── SettingsModal.jsx  # Theme settings
│   │   │   │   └── SettingsModal.css
│   │   │   │
│   │   │   ├── news/                  # General RSS news panel
│   │   │   │   ├── NewsPanel.jsx
│   │   │   │   ├── NewsPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── startups/              # Startup funding rounds
│   │   │   │   ├── StartupsPanel.jsx
│   │   │   │   ├── StartupsPanel.css
│   │   │   │   ├── startupsFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── vc-activity/           # VC fund activity
│   │   │   │   ├── VCPanel.jsx
│   │   │   │   ├── VCPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── war-watch/             # Defence & conflict news
│   │   │       ├── WarWatchPanel.jsx
│   │   │       ├── WarWatchPanel.css
│   │   │       └── index.js
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── index.js               # Barrel exports
│   │   │   ├── useDynamicRegions.js   # Dynamic region loading
│   │   │   ├── useFeedData.js         # Polling hook for all feeds
│   │   │   ├── useLocalStorage.js     # localStorage persistence
│   │   │   └── usePanelSettings.js    # Panel visibility settings
│   │   │
│   │   ├── services/                  # Data fetching services
│   │   │   ├── index.js               # Barrel exports
│   │   │   ├── baseFeedService.js     # Core RSS fetch/parse logic
│   │   │   ├── createFeedFetcher.js   # Factory for simple feed fetchers
│   │   │   ├── feedConfig.js          # Centralized RSS feed URL registry
│   │   │   ├── mapFeedService.js      # Map-specific data feeds
│   │   │   ├── chainStats.js          # Blockchain on-chain metrics
│   │   │   └── githubActivity.js      # GitHub activity stats
│   │   │
│   │   └── utils/                     # Utility functions
│   │       ├── index.js               # Barrel exports
│   │       ├── dateHelpers.js         # Date formatting
│   │       ├── fetchUtils.js          # CORS proxy fetch
│   │       └── helpers.js             # General helpers
│   │
│   ├── .env.example                   # Environment variable template
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies and npm scripts
│   ├── package-lock.json              # Locked dependency tree
│   └── vite.config.js                 # Vite bundler configuration
│
├── .gitignore                         # Root git ignore rules
├── PROJECT_STRUCTURE.md               # This file
└── README.md                          # Project documentation
```

---

## Key Directories Summary

| Directory | Purpose |
|-----------|---------|
| `client/src/app/` | Application bootstrap and routing |
| `client/src/config/` | Configuration, constants, and command modes |
| `client/src/context/` | React Context providers for global state management |
| `client/src/features/` | Feature modules organized by domain (co-located components) |
| `client/src/hooks/` | Custom React hooks for reusable logic |
| `client/src/services/` | Data fetching services and feed factory |
| `client/src/utils/` | Utility functions |

## Import Aliases (vite.config.js)
```js
'@'         → src/
'@app'      → src/app/
'@features' → src/features/
'@config'   → src/config/
'@context'  → src/context/
'@hooks'    → src/hooks/
'@services' → src/services/
'@utils'    → src/utils/
```

## Architecture Overview

### Feature Modules (features/)
Each feature is self-contained with its own components, styles, and data logic:

- **ai-race** - AI company news feed (custom keyword filtering)
- **blockchain** - Crypto news + on-chain metrics
- **dashboard** - Main dashboard page (includes Panel, ErrorBoundary, CategoryTabs, DeveloperActivity)
- **good-news** - Positive news feed
- **heatmap** - Sector performance heatmap
- **layoffs** - Tech layoffs tracker
- **map** - Interactive global map (includes GlobalMap, HotspotModal)
- **markets** - Stock & crypto prices (includes TickerStrip)
- **navigation** - Navbar, CommandModal, SettingsModal
- **news** - General RSS news panel
- **startups** - Startup funding rounds (custom funding extraction)
- **vc-activity** - VC fund activity
- **war-watch** - Defence & conflict news

### Services (services/)
- **baseFeedService.js** - Core RSS fetch/parse logic
- **createFeedFetcher.js** - Factory that creates feed fetchers from config keys
- **feedConfig.js** - Centralized RSS feed URL registry
- **mapFeedService.js** - Map-specific data feeds
- **chainStats.js** - Blockchain on-chain metrics
- **githubActivity.js** - GitHub activity stats

## Example Imports

```jsx
// Import a feature panel
import { MarketsPanel } from '@features/markets'

// Import a co-located component
import Panel from './Panel'

// Use the feed factory
import { createFeedFetcher } from '@services/createFeedFetcher'
const fetchNews = createFeedFetcher('blockchain', 15)

// Import a hook
import { useFeedData } from '@hooks/useFeedData'

// Import a page
import Dashboard from '@features/dashboard'
```
