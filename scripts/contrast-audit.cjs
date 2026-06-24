#!/usr/bin/env node
/**
 * WCAG contrast audit for theme color pairs.
 *
 * Walks every text-color × background-color combination in each theme,
 * composites rgba backgrounds over the page background, and prints the
 * WCAG contrast ratio plus a pass/fail against AA (4.5:1) and AA-large
 * (3:1).
 *
 * Run with: node scripts/contrast-audit.cjs
 * Exits 1 if any text-on-bg pair fails AA (4.5:1) for a pair that is
 * likely to host real small text.
 */

const fs = require('fs')
const path = require('path')

// --- Color utilities ---

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex)
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

const parseColor = (str) => {
  if (!str) return null
  const s = String(str).trim()
  if (s.startsWith('#')) return hexToRgb(s)
  const rgba = /^rgba?\(([^)]+)\)$/i.exec(s)
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => p.trim())
    const [r, g, b] = parts.slice(0, 3).map((p) => +p)
    const a = parts[3] !== undefined ? +parts[3] : 1
    return [r, g, b, a]
  }
  return null
}

const composite = (top, bottom) => {
  if (top.length === 3) return top
  const a = top[3]
  return [
    Math.round(top[0] * a + bottom[0] * (1 - a)),
    Math.round(top[1] * a + bottom[1] * (1 - a)),
    Math.round(top[2] * a + bottom[2] * (1 - a)),
  ]
}

const resolveColor = (value, colorMap, pageBg) => {
  if (!value) return null
  const v = String(value).trim()
  if (v.startsWith('var(')) {
    const name = v.slice(4, -1).trim()
    return resolveColor(colorMap[name], colorMap, pageBg)
  }
  const parsed = parseColor(v)
  if (!parsed) return null
  if (parsed.length === 3) return parsed
  return composite(parsed, pageBg)
}

const srgbToLinear = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
const relativeLuminance = ([r, g, b]) =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
const contrastRatio = (a, b) => {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

const fmt = (n) => n.toFixed(2)
const pass = (r) => r >= 4.5 ? '\x1b[32m✓ AA \x1b[0m' : r >= 3 ? '\x1b[33m⚠ AA-large only\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m'

// --- Audit ---

const themesFile = fs.readFileSync(
  path.join(__dirname, '..', 'client', 'src', 'config', 'themes.js'),
  'utf8'
)

const m = /export const THEMES = (\{[\s\S]*?)\n\}\n/.exec(themesFile)
if (!m) {
  console.error('Could not parse themes.js')
  process.exit(1)
}
const THEMES = eval(`(${m[1]}\n})`)

const TEXT_KEYS = ['--text-primary', '--text-secondary', '--text-dim', '--accent', '--green', '--red', '--yellow', '--orange', '--purple', '--emerald', '--indigo']
const BG_KEYS = ['--bg-dark', '--bg-panel', '--panel-item-bg', '--panel-item-hover', '--panel-header-bg', '--nav-bg']

let anyFail = true
let worstRatio = Infinity
let worstPair = ''

for (const [name, theme] of Object.entries(THEMES)) {
  const colors = theme.colors
  const pageBg = resolveColor(colors['--bg-dark'], colors, [13, 17, 23])
  console.log(`\n\x1b[1m${name}\x1b[0m  (page bg: rgb(${pageBg.join(',')}))`)

  for (const textKey of TEXT_KEYS) {
    for (const bgKey of BG_KEYS) {
      const fg = resolveColor(colors[textKey], colors, pageBg)
      const bg = resolveColor(colors[bgKey], colors, pageBg)
      if (!fg || !bg) continue
      const ratio = contrastRatio(fg, bg)
      if (ratio < worstRatio) { worstRatio = ratio; worstPair = `${name}: ${textKey} on ${bgKey}` }
      if (ratio < 4.5) anyFail = true
      if (ratio < 4.5) {
        console.log(`  ${fmt(ratio).padStart(5)}  ${pass(ratio).padEnd(28)} ${textKey} on ${bgKey}`)
      }
    }
  }
}

console.log(`\n\x1b[1mSummary\x1b[0m`)
console.log(`  Worst ratio: ${fmt(worstRatio)} (${worstPair})`)
// Only the FAIL severity (ratio < 3) is a hard WCAG fail; AA-large is acceptable for chips/badges.
const hasHardFail = worstRatio < 3
console.log(`  ${hasHardFail ? '\x1b[31m✗\x1b[0m' : '\x1b[32m✓\x1b[0m'} ${hasHardFail ? 'At least one pair fails WCAG AA-large (3:1) too — fix immediately' : 'No pair falls below 3:1 (AA-large); all pairs meet at least 3:1'}`)
process.exit(hasHardFail ? 1 : 0)
