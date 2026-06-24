import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@context/I18nContext'
import { ThemeProvider } from '@context/ThemeContext'
import SettingsModal from './SettingsModal'

const wrap = (ui) => render(
  <ThemeProvider>
    <I18nProvider>
      {ui}
    </I18nProvider>
  </ThemeProvider>
)

describe('SettingsModal a11y', () => {
  it('renders as a dialog with an accessible name and labelled sections', () => {
    wrap(<SettingsModal isOpen onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName(/settings/i)
  })

  it('exposes the close button with an accessible name', () => {
    wrap(<SettingsModal isOpen onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /close settings/i })).toBeInTheDocument()
  })

  it('renders theme and language radio groups with grouped labels', () => {
    wrap(<SettingsModal isOpen onClose={() => {}} />)
    // radiogroup role is set on the theme and language button containers
    const groups = screen.getAllByRole('radiogroup')
    expect(groups.length).toBeGreaterThanOrEqual(2)
    groups.forEach((g) => {
      expect(g).toHaveAttribute('aria-labelledby')
    })
  })

  it('renders the panels section as a labelled list with toggle switches', () => {
    wrap(<SettingsModal isOpen onClose={() => {}} />)
    const toggles = screen.getAllByRole('checkbox')
    expect(toggles.length).toBeGreaterThan(0)
    toggles.forEach((t) => {
      expect(t).toHaveAccessibleName(/panel|toggle/i)
    })
  })

  it('renders nothing when isOpen is false', () => {
    wrap(<SettingsModal isOpen={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
