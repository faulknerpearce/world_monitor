import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TOLERANCE = 0.02 // 2% of pixels may differ before failing
const BASELINE_DIR = path.join(__dirname, 'baselines')

/**
 * Ensure a baseline exists; if missing, write the actual screenshot to
 * `tests/visual/baselines/<name>.png` and pass the test (so the next
 * run has something to compare against).
 */
export const ensureBaseline = async (baselineName, actualPng) => {
  if (!fs.existsSync(BASELINE_DIR)) fs.mkdirSync(BASELINE_DIR, { recursive: true })
  const baselinePath = path.join(BASELINE_DIR, `${baselineName}.png`)
  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, actualPng)
    // eslint-disable-next-line no-console
    console.log(`Created baseline: ${path.relative(process.cwd(), baselinePath)}`)
  }
  return baselinePath
}

/**
 * Compare two PNG buffers. Returns null when they match within
 * tolerance, or a `{ ratio, png }` object describing the diff.
 */
export const compareScreenshots = async (baselinePath, actualPng) => {
  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath))
  const actual = PNG.sync.read(actualPng)

  if (baselinePng.width !== actual.width || baselinePng.height !== actual.height) {
    return {
      ratio: 1,
      png: null,
      error: `Dimensions differ: baseline ${baselinePng.width}x${baselinePng.height}, actual ${actual.width}x${actual.height}`,
    }
  }

  const diff = new PNG({ width: actual.width, height: actual.height })
  const numDiff = pixelmatch(
    baselinePng.data,
    actual.data,
    diff.data,
    actual.width,
    actual.height,
    { threshold: 0.1 }
  )
  const total = actual.width * actual.height
  const ratio = numDiff / total
  return ratio > TOLERANCE ? { ratio, png: PNG.sync.write(diff) } : null
}

/** Write a diff PNG to disk for inspection. */
export const writeDiff = async (path_, diffPng) => {
  fs.writeFileSync(path_, diffPng)
}
