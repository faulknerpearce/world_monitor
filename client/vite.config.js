import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

const parsePort = (value, fallback) => {
  const port = Number.parseInt(value, 10)
  return Number.isInteger(port) && port > 0 ? port : fallback
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaultPort = parsePort(env.PORT, 3000)
  const devPort = parsePort(env.DEV_SERVER_PORT, defaultPort)
  const previewPort = parsePort(env.PREVIEW_SERVER_PORT, defaultPort)

  return {
    plugins: [
      react(),
      // Emit a `dist/stats.html` treemap of every chunk when ANALYZE=1.
      // Open it after `npm run build` to see what's bloating the bundles.
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
        enabled: env.ANALYZE === '1',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@features': path.resolve(__dirname, './src/features'),
        '@config': path.resolve(__dirname, './src/config'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@i18n': path.resolve(__dirname, './src/i18n'),
        '@utils': path.resolve(__dirname, './src/utils'),
      }
    },
    server: {
      port: devPort,
      open: true,
      proxy: {
        '/api/yahoo': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        },
        '/api/gdelt': {
          target: 'http://data.gdeltproject.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gdelt/, ''),
        }
      }
    },
    preview: {
      port: previewPort,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Rollup chunks larger than this get split off as their own files.
      // Helps break the Map bundle (152 KB) into smaller pieces.
      chunkSizeWarningLimit: 120,
      rollupOptions: {
        output: {
          // Split d3 and topojson off the map vendor chunk.
          manualChunks: {
            d3: ['d3', 'd3-array', 'd3-geo', 'd3-selection', 'd3-zoom', 'd3-drag', 'topojson-client'],
          },
        },
      },
    },
  }
})
