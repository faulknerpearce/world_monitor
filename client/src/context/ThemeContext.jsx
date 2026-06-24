import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { THEMES } from '@config/themes'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('world_monitor_theme')
            return (saved && THEMES[saved]) ? saved : 'githubDark'
        } catch {
            return 'githubDark'
        }
    })

    useEffect(() => {
        try {
            const theme = THEMES[currentTheme]
            if (!theme) return

            const root = document.documentElement
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(key, value)
            })

            localStorage.setItem('world_monitor_theme', currentTheme)
        } catch (e) {
            console.error('Failed to apply theme:', e)
        }
    }, [currentTheme])

    const value = useMemo(
        () => ({ currentTheme, setCurrentTheme, themes: THEMES }),
        [currentTheme]
    )

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
