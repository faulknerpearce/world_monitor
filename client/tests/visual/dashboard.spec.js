import { test, expect } from '@playwright/test'
import { compareScreenshots, ensureBaseline, writeDiff } from './helpers'

/**
 * The dashboard renders several panels in a grid. Visual regressions
 * here would catch:
 *   - Panel grid breaking (column count, gap, alignment)
 *   - Theme color regressions
 *   - Font/typography changes
 *   - Missing or broken panel headers
 */
test('dashboard renders cleanly', async ({ page }, testInfo) => {
  // Block network calls that would make the test flaky or slow.
  await page.route('**/*', (route) => {
    const url = route.request().url()
    if (url.includes('/api/') || url.includes('.rss') || url.includes('yahoo')) {
      return route.abort()
    }
    return route.continue()
  })

  await page.goto('/')
  // Wait for the page to settle: the dashboard renders after the lazy
  // load completes, the panels show loading then content, and the
  // ticker would normally start scrolling. We give it a moment.
  await page.waitForSelector('main#main-content', { state: 'visible' })
  await page.waitForTimeout(500)

  const actual = await page.screenshot({ fullPage: true })
  const baseline = await ensureBaseline('dashboard', actual)

  const diff = await compareScreenshots(baseline, actual)
  if (diff) {
    await writeDiff(testInfo.outputPath('dashboard-diff.png'), diff)
    throw new Error(`Dashboard screenshot diff exceeds tolerance (ratio: ${diff.ratio.toFixed(3)})`)
  }
})
