import { useState, useEffect } from 'react'

const KEY_MIGRATIONS = {
  'world_monitor_panels': 'situationMonitorPanels',
  'world_monitor_panel_order': 'situationMonitorPanelOrder',
}

/**
 * One-shot migration: when a new key is requested, copy the value from the
 * legacy key (if present) into the new key, then remove the legacy key.
 * Keeps existing users' settings intact across the rename.
 */
const migrateLegacyKey = (newKey) => {
  const legacyKey = KEY_MIGRATIONS[newKey]
  if (!legacyKey) return
  try {
    if (window.localStorage.getItem(newKey) !== null) return
    const legacyValue = window.localStorage.getItem(legacyKey)
    if (legacyValue === null) return
    window.localStorage.setItem(newKey, legacyValue)
    window.localStorage.removeItem(legacyKey)
  } catch (error) {
    console.error(`Error migrating ${legacyKey} → ${newKey}:`, error)
  }
}

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      migrateLegacyKey(key)
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      if (value === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, value])

  return [value, setValue]
}
