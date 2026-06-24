import { decorators } from './decorators'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'centered',
  backgrounds: {
    default: 'githubDark',
    values: [
      { name: 'githubDark', value: '#0d1117' },
      { name: 'light', value: '#f6f8fa' },
    ],
  },
}

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'i18n locale',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'es', title: 'Español' },
        { value: 'pt', title: 'Português' },
        { value: 'fr', title: 'Français' },
        { value: 'it', title: 'Italiano' },
        { value: 'de', title: 'Deutsch' },
      ],
      dynamicTitle: true,
    },
  },
}

export { decorators }
