import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for visual regression tests.
 *
 * The dev server is started automatically. Tests render real pages
 * with mocked network responses (see tests/visual/) and compare
 * screenshots against a baseline in tests/visual/baselines/.
 *
 * Update baselines with: `npx playwright test --update-snapshots`
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? {
        // CI: build + start preview server fresh.
        command: 'npm run build && npm run preview',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 180_000,
      }
    : {
        // Local: assume the dev/preview server is already running
        // (developer starts it manually so the snapshot iteration loop
        // is fast). Reuse an existing server.
        command: 'npm run preview',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60_000,
      },
})
