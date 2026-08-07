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

  it('applies the green accent to the source and theme text to the headline', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" />)
    const source = screen.getByText('Example')
    const headline = screen.getByText('A headline')
    expect(source.className).toMatch(/text-green-400/)
    expect(source.className).toMatch(/feed-source/)
    expect(headline.className).toMatch(/feed-headline/)
    expect(headline.className).toMatch(/text-text-primary/)
  })

  it('applies the requested accent', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" accent="purple" />)
    const source = screen.getByText('Example')
    expect(source.className).toMatch(/text-purple-400/)
  })

  it('renders a description snippet under the headline when available', () => {
    wrap(<PanelFeedItem
      item={{ ...baseItem, description: '<p>Summary of the article body.</p>' }}
      locale="en-US"
    />)
    expect(screen.getByText('Summary of the article body.')).toBeInTheDocument()
  })

  it('falls back to green for an unknown accent', () => {
    wrap(<PanelFeedItem item={baseItem} locale="en-US" accent="nonexistent" />)
    const source = screen.getByText('Example')
    expect(source.className).toMatch(/text-green-400/)
  })
})
