# World Monitor - Project Structure

## Directory Structure
```
world_monitor/
├── public/
│   └── dashboard.png
│
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx                    # Main app with routing
│   ├── App.css
│   ├── rootProviders.jsx          # Root providers (Theme, Refresh)
│   ├── index.js                   # Barrel exports
│   │
│   ├── components/                # Shared/reusable components
│   │   ├── feedback/ErrorBoundary/
│   │   ├── layout/
│   │   │   ├── CategoryTabs/
│   │   │   ├── CommandModal/
│   │   │   ├── Navbar/
│   │   │   └── SettingsModal/
│   │   ├── ui/
│   │   │   ├── NewsWireFeed/
│   │   │   └── Panel/
│   │   └── visualization/
│   │       └── DeveloperActivity/
│   │
│   ├── config/
│   │   ├── panels.js
│   │   ├── regions.js
│   │   └── themes.js
│   │
│   ├── context/
│   │   ├── RefreshContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useDynamicRegions.js
│   │   ├── useFeedData.js
│   │   ├── useLocalStorage.js
│   │   └── usePanelSettings.js
│   │
│   ├── services/                  # All services flattened
│   │   ├── baseFeedService.js
│   │   ├── feedConfig.js
│   │   ├── mapFeedService.js
│   │   ├── chainStats.js
│   │   ├── githubActivity.js
│   │   ├── newsFeedService.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   ├── fetchUtils.js
│   │   ├── helpers.js
│   │   └── index.js
│   │
│   ├── features/                  # Main pages ONLY
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   └── index.js
│   │   │
│   │   └── map/
│   │       ├── Map.jsx
│   │       ├── Map.css
│   │       ├── index.js
│   │       └── components/
│   │           └── GlobalMap/
│   │               ├── GlobalMap.jsx
│   │               ├── GlobalMap.css
│   │               └── HotspotModal/
│   │
│   └── feeds/                     # All 11 feed panels (flattened)
│       ├── ai-race/
│       │   ├── index.js
│       │   ├── AiRacePanel.jsx
│       │   ├── AiRacePanel.css
│       │   └── aiRaceFeedService.js
│       ├── blockchain/
│       ├── good-news/
│       ├── heatmap/
│       ├── layoffs/
│       ├── markets/
│       │   ├── index.js
│       │   ├── MarketsPanel.jsx
│       │   └── TickerStrip/
│       ├── news/
│       ├── startups/
│       ├── vc-activity/
│       └── war-watch/
│
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## Import Aliases (vite.config.js)
```js
'@' → src/
'@components' → src/components/
'@features' → src/features/
'@feeds' → src/feeds/
'@config' → src/config/
'@context' → src/context/
'@hooks' → src/hooks/
'@services' → src/services/
'@utils' → src/utils/
```

## Architecture Overview

### Pages (features/)
Two main user-facing pages:
- **Dashboard** - Main dashboard with panel grid, drag-and-drop, hero section
- **Map** - Interactive global map with geopolitical hotspots

### Feed Panels (feeds/)
All 11 feed panels flattened - each contains:
- `Panel.jsx` - The panel UI component
- `Panel.css` - Panel styles
- `feedService.js` - Data fetching logic
- `index.js` - Barrel exports

Panels:
- **ai-race** - AI company news feed
- **blockchain** - Crypto news + on-chain metrics
- **good-news** - Positive news feed
- **heatmap** - Sector performance heatmap
- **layoffs** - Tech layoffs tracker
- **markets** - Stock & crypto prices (+ TickerStrip)
- **news** - General RSS news panel
- **startups** - Startup funding rounds
- **vc-activity** - VC fund activity
- **war-watch** - Defence & conflict news

### Shared Components (components/)
Reusable components used across pages:
- **feedback/** - Error boundaries
- **layout/** - Navbar, modals, tabs
- **ui/** - Panel chrome, news wire feed
- **visualization/** - Developer activity chart

### Services (services/)
All services flattened to root level:
- **baseFeedService.js** - Core RSS fetch/parse logic
- **feedConfig.js** - Centralized RSS feed URL registry
- **mapFeedService.js** - Map-specific data feeds
- **chainStats.js** - Blockchain on-chain metrics
- **githubActivity.js** - GitHub activity stats
- **newsFeedService.js** - News RSS feed service

## Example Imports

```jsx
// Import a feed panel
import { MarketsPanel } from '@feeds/markets'

// Import a shared component
import { Panel } from '@components/ui/Panel'

// Import a service
import { baseFeedService } from '@services/baseFeedService'

// Import a hook
import { useFeedData } from '@hooks/useFeedData'

// Import a page
import Dashboard from '@features/dashboard'
```
