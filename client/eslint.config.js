// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [{
  files: ['src/**/*.{js,jsx}'],
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooks,
    'jsx-a11y': jsxA11y,
  },
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    ...jsxA11y.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // The recommended ruleset includes a few that are noisy in this
    // codebase. Keep them off until we have a deliberate policy.
    'jsx-a11y/anchor-is-valid': 'off',         // buttons-as-anchors pattern
    'jsx-a11y/no-autofocus': 'off',            // used in modals
    'jsx-a11y/label-has-associated-control': 'off', // tooltip-based controls
    'jsx-a11y/no-noninteractive-element-interactions': 'off', // div onClicks are common here
    'jsx-a11y/no-static-element-interactions': 'off',         // same
    'jsx-a11y/click-events-have-key-events': 'off',           // same
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}, ...storybook.configs["flat/recommended"]];
