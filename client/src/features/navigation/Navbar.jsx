import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '@context/I18nContext'
import './Navbar.css'

const Navbar = ({ onRefresh, isRefreshing, onOpenSettings, onOpenCommand, currentMode }) => {
    const location = useLocation()
    const [currentTime, setCurrentTime] = useState(new Date())
    const { t, locale, formatDate, formatTime } = useI18n()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1 className="title">{t('app.title')}</h1>
                <div className="status-container">
                    <span className={`status ${isRefreshing ? 'loading' : ''}`}>
                        {!isRefreshing && <span className="live-dot"></span>}
                        {isRefreshing ? t('common.refreshing') : t('common.live')}
                    </span>
                </div>
                <div className="navbar-time">
                    <span className="time-date">{formatDate(currentTime, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }).toUpperCase()}</span>
                    <span className="time-clock">{formatTime(currentTime, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: locale === 'en-US'
                    })}</span>
                </div>
            </div>
            <div className="nav-links">
                <Link
                    to="/"
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    {t('nav.dashboard')}
                </Link>
                <Link
                    to="/map"
                    className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
                >
                    {t('nav.map')}
                </Link>
            </div>
            <div className="navbar-right">
                <button
                    className="refresh-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label={isRefreshing ? t('nav.refreshingData') : t('nav.refreshAllData')}
                >
                    {t('common.refresh')}
                </button>
                <button
                    className="command-btn"
                    onClick={onOpenCommand}
                    aria-label={t('nav.openCommandSelector')}
                >
                    {currentMode && <span className="command-mode-badge">{currentMode.toUpperCase()}</span>}
                    {t('common.command')}
                </button>
                <button
                    className="settings-btn"
                    onClick={onOpenSettings}
                    aria-label={t('nav.openSettings')}
                >
                    {t('common.settings')}
                </button>
            </div>
        </nav>
    )
}

export default Navbar
