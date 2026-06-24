# World Monitor Client

A React-based dashboard for monitoring world data with real-time updates, interactive maps, and customizable panels.

## Tech Stack

- **React 18** — UI framework
- **Vite 6** — Build tool and dev server
- **React Router** — Client-side routing
- **D3.js** — Data visualization
- **Axios** — HTTP client
- **TopoJSON** — Map data handling
- **TypeScript** — incrementally adopted (see `client/tsconfig.json`)
- **Vitest** — test runner

## Project Structure

```
client/src/
├── app/              # Main application component and entry
├── config/           # Static configuration (API, panels, regions, themes)
│   └── regions/      # Region data split into focused modules
├── context/          # React context providers (Theme, I18n, Refresh)
├── features/         # Domain modules (Dashboard, Map, Navigation, ...)
│   └── <feature>/
│       └── index.js  # Barrel exporting the feature's public API
├── hooks/            # Custom React hooks
├── i18n/             # Translations for 6 languages
└── utils/            # Pure utility functions
```

## Getting Started

### Prerequisites

- Node.js **v20 or later** (enforced by `package.json#engines`)

### Installation

```bash
cd client
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Optional variables:
- `VITE_GITHUB_TOKEN` — GitHub Personal Access Token for increased API rate limits
- `DEV_SERVER_PORT` — Development server port (default: 3000)
- `PREVIEW_SERVER_PORT` — Preview server port (default: 3000)

### Development

```bash
npm run dev
```

Opens the dev server at http://localhost:3000 (or configured port).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src/` |
| `npm run typecheck` | `tsc --noEmit` against `tsconfig.json` |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run verify` | Run lint + typecheck + test + build (used in CI) |

## Contributing

1. **Path aliases** — Use the existing `@features`, `@hooks`, `@config`, `@context`, `@i18n`, `@utils`, `@app` aliases. Never use relative paths that escape the current feature folder.
2. **Barrel imports** — Cross-feature imports go through the feature's barrel (`from '@features/<feature>'`), not direct file paths.
3. **localStorage namespace** — All keys live under `world_monitor_*`. Use the `useLocalStorage` hook (which has a one-shot migration for legacy `situationMonitor*` keys).
4. **Feed data** — Feeds that appear in more than one panel (e.g. `VentureBeat`, `Defense One`) are defined once in `feedConfig.js` and referenced via spread. Don't re-declare the same URL.
5. **State across panels** — Polling data shared between the dashboard and the map (currently: ticker symbols) lives in a module-level cache inside a custom hook. Use the same pattern for new shared data.
6. **List keys** — Always use a stable id (`item.link`, `item.guid`, `repo`), never the array index.
7. **Mock data** — Hardcoded numbers are labeled as DEMO or sourced from a real API. Don't ship silent mock data.
8. **Before opening a PR** — Run `npm run verify` and ensure it passes.

## API Proxy

The dev server includes a proxy for Yahoo Finance API at `/api/yahoo`.

## Releases

[`release-please`](https://github.com/googleapis/release-please) runs on every push to `main` and opens a PR titled `chore: release vX.Y.Z`. Merging that PR:

1. Bumps `client/package.json#version` per [Conventional Commits](https://www.conventionalcommits.org/) since the last release
2. Updates `CHANGELOG.md`
3. Creates a git tag and a GitHub release

Commit prefixes that drive version bumps:

- `feat:` → minor (`0.X.0`)
- `feat!:` or footer `BREAKING CHANGE:` → major (`X.0.0`)
- `fix:` → patch (`0.0.X`)
- `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `ci:` → no bump on their own

See `CHANGELOG.md` for the latest release notes.

## License

MIT
