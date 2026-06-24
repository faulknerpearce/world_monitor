import { I18nProvider } from '@context/I18nContext'
import { ThemeProvider } from '@context/ThemeContext'
import { RefreshProvider } from '@context/RefreshContext'

/**
 * Default Storybook decorator: wraps every story in the same provider
 * stack the app uses so stories render with i18n, theme, and refresh
 * context available. Stories that need a different locale can read it
 * from the `locale` global via `useGlobals()`.
 */
export const decorators = [
  (Story, context) => (
    <ThemeProvider>
      <I18nProvider>
        <RefreshProvider>
          <Story />
        </RefreshProvider>
      </I18nProvider>
    </ThemeProvider>
  ),
]
