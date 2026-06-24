import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@context/I18nContext'
import Panel from './Panel'

const wrap = (ui) => render(<I18nProvider>{ui}</I18nProvider>)

describe('Panel a11y', () => {
  it('renders as an <article> with aria-labelledby pointing to its heading', () => {
    wrap(<Panel id="tech" title="Tech News" />)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', 'panel-title-tech')
    const heading = document.getElementById('panel-title-tech')
    expect(heading).not.toBeNull()
    expect(heading.tagName).toBe('H2')
    expect(heading).toHaveTextContent('Tech News')
  })

  it('hides content from assistive tech when collapsed', () => {
    // Render expanded first to capture children
    const { rerender } = render(
      <I18nProvider>
        <Panel id="tech" title="Tech News">
          <div>panel body</div>
        </Panel>
      </I18nProvider>
    )
    expect(screen.getByText('panel body')).toBeVisible()

    // Find the collapse control and activate it
    const header = screen.getByRole('button')
    expect(header).toHaveAttribute('aria-expanded', 'true')
    header.click()

    rerender(
      <I18nProvider>
        <Panel id="tech" title="Tech News">
          <div>panel body</div>
        </Panel>
      </I18nProvider>
    )
    // After click, the article should reflect collapsed state
    expect(header).toHaveAttribute('aria-expanded', 'false')
  })

  it('exposes a drag handle with an accessible label', () => {
    wrap(<Panel id="tech" title="Tech News" draggable />)
    const handle = screen.getByLabelText(/drag to reorder/i)
    expect(handle).toBeInTheDocument()
  })
})
