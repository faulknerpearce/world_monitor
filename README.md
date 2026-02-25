# Alpha Monitor

![Alpha Monitor](public/dashboard.png)

A real-time monitoring dashboard for markets, news, and geopolitical events.

## Features

-  Real-time news aggregation from multiple sources
-  Live market data and sector heatmaps
-  Interactive global map with event markers
-  Customizable panels and layouts
-  Persistent settings and preferences
-  Drag-and-drop panel reordering
-  Resizable panels

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **Axios** - HTTP client

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal if 3000 is in use)


## Project Structure

```
src/
├── components/       # React components
│   ├── Navbar/       # Top navigation bar
│   ├── Dashboard/    # Main dashboard layout
│   ├── GlobalMap/    # Interactive world map
│   ├── SettingsModal/# Theme & settings modal
│   ├── CommandModal/ # Focus mode selector
│   ├── TickerStrip/  # Live market ticker
│   ├── CategoryTabs/ # Panel filter tabs
│   ├── ErrorBoundary/# Error boundary wrapper
│   └── panels/       # Individual panel implementations
├── hooks/            # Custom React hooks
├── services/
│   └── feeds/        # RSS feed services
├── utils/            # Helper functions
├── config/           # App configuration
└── context/          # React context providers
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your API keys
3. Customize panels in `src/config/panels.js`

## Features Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Advanced filtering and search
- [ ] Export/import panel configurations
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle

## License

MIT