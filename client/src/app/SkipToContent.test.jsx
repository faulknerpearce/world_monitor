import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import SkipToContent from './SkipToContent'

describe('SkipToContent', () => {
  it('renders a link to #main-content', () => {
    const { container } = render(<SkipToContent />)
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).toBe('#main-content')
  })

  it('is visually hidden by default (sr-only)', () => {
    const { container } = render(<SkipToContent />)
    const link = container.querySelector('a')
    expect(link.className).toMatch(/sr-only/)
  })

  it('becomes visible when focused (focus:not-sr-only)', () => {
    const { container } = render(<SkipToContent />)
    const link = container.querySelector('a')
    expect(link.className).toMatch(/focus:not-sr-only/)
  })

  it('has a clearly visible accessible name', () => {
    const { container } = render(<SkipToContent />)
    const link = container.querySelector('a')
    expect(link.textContent.toLowerCase()).toContain('skip')
  })
})
