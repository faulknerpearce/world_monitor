# World Monitor - Project Structure

## Overview
A real-time dashboard application built with React, Vite, and React Router for monitoring global events, markets, and technology trends.

## Directory Structure

```
world_monitor/
├── public/
│   └── dashboard.png              # Dashboard preview image
├── src/
│   ├── components/                # React components
│   │   ├── CategoryTabs/          # Category filter tabs
│   │   │   ├── CategoryTabs.css
│   │   │   └── CategoryTabs.jsx
│   │   ├── CommandModal/          # Command palette modal
│   │   │   ├── CommandModal.css
│   │   │   └── CommandModal.jsx
│   │   ├── Dashboard/             # Main dashboard view
│   │   │   ├── Dashboard.css
│   │   │   └── Dashboard.jsx
│   │   ├── DeveloperActivity/     # Chain developer activity graphs
│   │   │   ├── DeveloperActivity.css
│   │   │   └── DeveloperActivity.jsx
│   │   ├── ErrorBoundary/         # Error boundary wrapper
│   │   │   ├── ErrorBoundary.css
│   │   │   └── ErrorBoundary.jsx
│   │   ├── GlobalMap/             # Interactive world map
│   │   │   ├── GlobalMap.css
│   │   │   ├── GlobalMap.jsx
│   │   │   └── HotspotModal/      # Map hotspot details
│   │   │       ├── HotspotModal.css
│   │   │       └── HotspotModal.jsx
│   │   ├── Navbar/                # Top navigation bar
│   │   │   ├── Navbar.css
│   │   │   └── Navbar.jsx
│   │   ├── NewsWireFeed/          # Reusable news wire component
│   │   │   ├── NewsWireFeed.css
│   │   │   └── NewsWireFeed.jsx
│   │   ├── panels/                # Individual panel components
│   │   │   ├── AIRacePanel/       # AI development tracking
│   │   │   │   ├── AIRacePanel.css
│   │   │   │   └── AIRacePanel.jsx
│   │   │   ├── BlockchainPanel/   # Blockchain/crypto news
│   │   │   │   ├── BlockchainPanel.css
│   │   │   │   └── BlockchainPanel.jsx
│   │   │   ├── GoodNewsPanel/     # Positive news feed
│   │   │   │   ├── GoodNewsPanel.css
│   │   │   │   └── GoodNewsPanel.jsx
│   │   │   ├── HeatmapPanel/      # Sector performance heatmap
│   │   │   │   ├── HeatmapPanel.css
│   │   │   │   └── HeatmapPanel.jsx
│   │   │   ├── LayoffsPanel/      # Tech layoffs tracker
│   │   │   │   ├── LayoffsPanel.css
│   │   │   │   └── LayoffsPanel.jsx
│   │   │   ├── MarketsPanel/      # Markets overview
│   │   │   │   ├── MarketsPanel.css
│   │   │   │   └── MarketsPanel.jsx
│   │   │   ├── NewsPanel/         # General news feed
│   │   │   │   ├── NewsPanel.css
│   │   │   │   └── NewsPanel.jsx
│   │   │   ├── Panel/             # Generic panel wrapper
│   │   │   │   ├── Panel.css
│   │   │   │   └── Panel.jsx
│   │   │   ├── StartupsPanel/     # Startup funding tracker
│   │   │   │   ├── StartupsPanel.css
│   │   │   │   └── StartupsPanel.jsx
│   │   │   ├── VCPanel/           # VC activity tracker
│   │   │   │   ├── VCPanel.css
│   │   │   │   └── VCPanel.jsx
│   │   │   └── WarWatchPanel/     # Conflict/war monitoring
│   │   │       ├── WarWatchPanel.css
│   │   │       └── WarWatchPanel.jsx
│   │   ├── SettingsModal/         # User settings modal
│   │   │   ├── SettingsModal.css
│   │   │   └── SettingsModal.jsx
│   │   └── TickerStrip/           # Market ticker strip
│   │       ├── TickerStrip.css
│   │       └── TickerStrip.jsx
│   ├── config/                    # Configuration files
│   │   ├── panels.js              # Panel definitions & categories
│   │   ├── regions.js             # Geographic region config
│   │   └── themes.js              # Theme/color configurations
│   ├── context/                   # React context providers
│   │   ├── RefreshContext.jsx     # Refresh state management
│   │   └── ThemeContext.jsx       # Theme state management
│   ├── hooks/                     # Custom React hooks
│   │   ├── index.js               # Hook exports
│   │   ├── useDynamicRegions.js   # Dynamic region handling
│   │   ├── useFeedData.js         # Feed data fetching
│   │   ├── useLocalStorage.js     # LocalStorage utilities
│   │   └── usePanelSettings.js    # Panel configuration
│   ├── services/                  # API & data services
│   │   ├── feeds/                 # Feed services
│   │   │   ├── aiRaceFeedService.js
│   │   │   ├── baseFeedService.js
│   │   │   ├── blockchainFeedService.js
│   │   │   ├── feedConfig.js      # Feed configuration
│   │   │   ├── goodNewsFeedService.js
│   │   │   ├── index.js           # Service exports
│   │   │   ├── layoffsFeedService.js
│   │   │   ├── mapFeedService.js
│   │   │   ├── newsFeedService.js
│   │   │   ├── startupsFeedService.js
│   │   │   ├── vcFeedService.js
│   │   │   └── warWatchFeedService.js
│   │   ├── chainStats.js          # Blockchain statistics
│   │   └── index.js               # Service exports
│   ├── utils/                     # Utility functions
│   │   ├── dateHelpers.js         # Date formatting utilities
│   │   ├── fetchUtils.js          # HTTP fetch utilities
│   │   ├── helpers.js             # General helpers
│   │   └── index.js               # Utility exports
│   ├── App.css                    # App-level styles
│   ├── App.jsx                    # Main App component
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Application entry point
├── .gitignore                     # Git ignore rules
├── index.html                     # HTML entry point
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Locked dependencies
├── README.md                      # Project documentation
├── vite.config.js                 # Vite build configuration
└── PROJECT_STRUCTURE.md           # This file
```

## Key Components

### Panels
- **World / Geopolitical** - Global news and events
- **Technology / AI** - Tech and AI industry news
- **Financial** - Financial markets news
- **Startups** - Startup funding rounds and news
- **VC Activity** - Venture capital fund activity
- **Blockchain / Crypto** - Cryptocurrency and blockchain news
- **War Watch** - Conflict monitoring
- **Layoffs Tracker** - Tech industry layoffs

### Features
- Draggable and reorderable panels
- Category-based filtering
- Command palette for quick actions
- Real-time data refresh
- Dark theme with customizable colors
- GitHub-style contribution graphs for developer activity

## Tech Stack
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **CSS Variables** - Theming system
