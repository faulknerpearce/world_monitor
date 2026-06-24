import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@context/I18nContext'
import ErrorBoundary from './ErrorBoundary'

const ThrowError = () => {
  throw new Error('boom')
}

const HappyChild = () => <div>happy child</div>

const renderWithProviders = (ui) => render(
  <I18nProvider>
    {ui}
  </I18nProvider>
)

describe('ErrorBoundary', () => {
  let consoleSpy

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('renders children when no error is thrown', () => {
    renderWithProviders(
      <ErrorBoundary>
        <HappyChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('happy child')).toBeInTheDocument()
  })

  it('renders the default error UI when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('displays the thrown error message', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('boom')).toBeInTheDocument()
  })

  it('shows a retry button after a child error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})
