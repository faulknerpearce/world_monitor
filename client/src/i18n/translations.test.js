import { describe, it, expect } from 'vitest'
import { TRANSLATIONS } from './translations'

describe('translations', () => {
  it('Spanish map svgLabel is Spanish, not Portuguese', () => {
    const label = TRANSLATIONS.es.map.svgLabel
    expect(label).toContain('interactivo')
    expect(label).not.toContain('interativo')
    expect(label).not.toContain('inteligência')
  })

  it('Spanish map keyboardHint is Spanish', () => {
    const hint = TRANSLATIONS.es.map.keyboardHint
    expect(hint).toContain('Haz clic')
    expect(hint).not.toContain('Clique no mapa')
  })

  it('locales do not define duplicate keys in map overrides', () => {
    for (const [code, locale] of Object.entries(TRANSLATIONS)) {
      if (!locale.map) continue
      const keys = Object.keys(locale.map)
      expect(new Set(keys).size, `${code} map has duplicate keys`).toBe(keys.length)
    }
  })
})