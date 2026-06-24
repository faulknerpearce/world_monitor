import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@context/I18nContext'
import PanelFeedItem from './PanelFeedItem'

const wrap = (ui) => render(<I18nProvider>{ui}</I18nProvider>)

describe('PanelFeedItem', () => {
  const baseItem = {
    title: 'A headline',
    link: 'https://example.com/a',
    source: 'Example',
    date: new Date(),
  }

  it('renders the source, title, and link', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" />)
    expect(screen.getByText('Example')).toBeInTheDocument()
    expect(screen.getByText('A headline')).toBeInTheDocument()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/a')
  })

  it('renders nothing for an item without a link', () => {
    const { container } = wrap(<PanelFeedItem item={{ ...baseItem, link: undefined }} locale="en-US" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies the green accent by default', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" />)
    const source = screen.getByText('Example')
    expect(source.className).toMatch(/text-\[var\(--green\)\]/)
  })

  it('applies the requested accent', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" accent="purple" />)
    const source = screen.getByText('Example')
    expect(source.className).toMatch(/text-\[var\(--purple\)\]/)
  })

  it('falls back to green for an unknown accent', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" accent="nonexistent" />)
    const source = screen.getByText('Example')
    expect(source.className).toMatch(/text-\[var\(--green\)\]/)
  })
})
