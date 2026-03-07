import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES } from '@config/themes'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('alpha_monitor_theme')
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

            localStorage.setItem('alpha_monitor_theme', currentTheme)
        } catch (e) {
            console.error('Failed to apply theme:', e)
        }
    }, [currentTheme])

    return (
        <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes: THEMES }}>
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
