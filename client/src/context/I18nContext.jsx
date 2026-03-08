import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TRANSLATIONS } from '@i18n/translations'

const I18nContext = createContext(null)

const LANGUAGE_STORAGE_KEY = 'alpha_monitor_language'

const languageMap = Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [language.code, language]))

const getNestedValue = (obj, key) => key.split('.').reduce((acc, part) => acc?.[part], obj)

const interpolate = (template, values = {}) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`)

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved && languageMap[saved]) return saved
  } catch {
    // Ignore storage failures and fall through to navigator detection.
  }

  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language?.slice(0, 2)?.toLowerCase()
    if (browserLanguage && languageMap[browserLanguage]) return browserLanguage
  }

  return DEFAULT_LANGUAGE
}

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Ignore storage failures.
    }
  }, [language])

  const locale = languageMap[language]?.locale ?? languageMap[DEFAULT_LANGUAGE].locale

  const value = useMemo(() => {
    const dictionary = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE]
    const fallbackDictionary = TRANSLATIONS[DEFAULT_LANGUAGE]

    const t = (key, values) => {
      const translatedValue = getNestedValue(dictionary, key) ?? getNestedValue(fallbackDictionary, key) ?? key
      return typeof translatedValue === 'string' ? interpolate(translatedValue, values) : translatedValue
    }

    const formatDate = (date, options) => new Intl.DateTimeFormat(locale, options).format(date)
    const formatTime = (date, options) => new Intl.DateTimeFormat(locale, options).format(date)

    const formatRelativeTime = (date) => {
      const target = new Date(date)
      const elapsedSeconds = Math.round((target.getTime() - Date.now()) / 1000)
      const divisions = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
      ]

      for (const [unit, secondsInUnit] of divisions) {
        if (Math.abs(elapsedSeconds) >= secondsInUnit) {
          return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }).format(
            Math.round(elapsedSeconds / secondsInUnit),
            unit,
          )
        }
      }

      return t('common.now')
    }

    return {
      language,
      locale,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      t,
      formatDate,
      formatTime,
      formatRelativeTime,
    }
  }, [language, locale])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
