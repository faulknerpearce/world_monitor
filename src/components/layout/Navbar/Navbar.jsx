import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ onRefresh, isRefreshing, onOpenSettings, onOpenCommand, currentMode }) => {
    const location = useLocation()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).toUpperCase()
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1 className="title">ALPHA MONITOR</h1>
                <div className="status-container">
                    <span className={`status ${isRefreshing ? 'loading' : ''}`}>
                        {!isRefreshing && <span className="live-dot"></span>}
                        {isRefreshing ? 'REFRESHING...' : 'LIVE'}
                    </span>
                </div>
                <div className="navbar-time">
                    <span className="time-date">{formatDate(currentTime)}</span>
                    <span className="time-clock">{formatTime(currentTime)}</span>
                </div>
            </div>
            <div className="nav-links">
                <Link
                    to="/"
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Dashboard
                </Link>
                <Link
                    to="/map"
                    className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
                >
                    Map
                </Link>
            </div>
            <div className="navbar-right">
                <button
                    className="refresh-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label={isRefreshing ? 'Refreshing data' : 'Refresh all data'}
                >
                    REFRESH
                </button>
                <button
                    className="command-btn"
                    onClick={onOpenCommand}
                    aria-label="Open command mode selector"
                >
                    {currentMode && <span className="command-mode-badge">{currentMode.toUpperCase()}</span>}
                    COMMAND
                </button>
                <button
                    className="settings-btn"
                    onClick={onOpenSettings}
                    aria-label="Open application settings"
                >
                    SETTINGS
                </button>
            </div>
        </nav>
    )
}

export default Navbar