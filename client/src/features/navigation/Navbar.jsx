import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '@context/I18nContext'
import { branding } from '@config/env'

const navLinkBase = 'py-[0.45rem] px-3.5 bg-panel-item-bg text-text-secondary no-underline border border-border-glass rounded text-[0.7rem] font-medium tracking-[0.03em] transition-all duration-200 hover:bg-panel-item-hover hover:text-text-primary hover:border-border-glass-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] max-[768px]:py-[0.35rem] max-[768px]:px-2.5 max-[768px]:text-[0.6rem]'
const navLinkActive = '!bg-[rgba(16,185,129,0.1)] !text-[#10b981] !border-[rgba(16,185,129,0.2)]'

const navBtnBase = 'py-[0.45rem] px-3.5 bg-panel-item-bg text-text-secondary border border-border-glass rounded cursor-pointer text-[0.7rem] font-medium tracking-[0.03em] transition-all duration-200 hover:enabled:bg-panel-item-hover hover:enabled:text-text-primary hover:enabled:border-border-glass-hover hover:enabled:-translate-y-px hover:enabled:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:enabled:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed max-[768px]:py-[0.35rem] max-[768px]:px-2.5 max-[768px]:text-[0.6rem]'

const Navbar = ({ onRefresh, isRefreshing, onOpenSettings, onOpenCommand, currentMode }) => {
    const location = useLocation()
    const [currentTime, setCurrentTime] = useState(new Date())
    const { t, locale, formatDate, formatTime } = useI18n()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <nav className="bg-nav-bg backdrop-blur-[12px] border-b border-border-glass py-3 px-6 flex justify-between items-center sticky top-0 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-navbar-slide max-[768px]:py-2.5 max-[768px]:px-4 max-[768px]:flex-wrap max-[768px]:gap-2">
            <div className="flex items-center gap-5 max-[768px]:gap-3">
                <h1 className={`text-base font-bold tracking-[0.1em] text-text-primary font-[family-name:var(--font-display)] max-[768px]:text-[0.8rem] ${branding.cssClass}`}>{branding.title}</h1>
                <div className="flex items-center">
                    <span className={`flex items-center gap-1.5 py-[0.3rem] px-2.5 bg-[rgba(16,185,129,0.1)] text-[#10b981] rounded border border-[rgba(16,185,129,0.2)] text-[0.65rem] font-semibold tracking-[0.1em] ${isRefreshing ? '!bg-[rgba(245,158,11,0.15)] !text-[#f59e0b] !border-[rgba(245,158,11,0.25)] animate-pulse-slow' : ''}`}>
                        {!isRefreshing && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-live-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>}
                        {isRefreshing ? t('common.refreshing') : t('common.live')}
                    </span>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-border-glass max-[768px]:hidden">
                    <span className="text-[0.6rem] text-text-secondary tracking-[0.05em] font-medium">{formatDate(currentTime, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }).toUpperCase()}</span>
                    <span className="text-[0.75rem] text-text-primary font-[family-name:var(--font-mono)] font-semibold tracking-[0.05em]">{formatTime(currentTime, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: locale === 'en-US'
                    })}</span>
                </div>
            </div>
            <div className="flex gap-2 max-[768px]:order-3 max-[768px]:w-full max-[768px]:justify-center max-[768px]:mt-2">
                <Link
                    to="/"
                    className={`${navLinkBase} ${location.pathname === '/' ? navLinkActive : ''}`}
                >
                    {t('nav.dashboard')}
                </Link>
                <Link
                    to="/map"
                    className={`${navLinkBase} ${location.pathname === '/map' ? navLinkActive : ''}`}
                >
                    {t('nav.map')}
                </Link>
            </div>
            <div className="flex gap-2 max-[768px]:gap-1.5">
                <button
                    className={navBtnBase}
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label={isRefreshing ? t('nav.refreshingData') : t('nav.refreshAllData')}
                >
                    {t('common.refresh')}
                </button>
                <button
                    className={`${navBtnBase} !bg-[rgba(99,102,241,0.15)] !text-[#818cf8] !border-[rgba(99,102,241,0.25)] !flex !items-center gap-2`}
                    onClick={onOpenCommand}
                    aria-label={t('nav.openCommandSelector')}
                >
                    {currentMode && <span className="text-[0.5rem] py-[0.15rem] px-[0.35rem] bg-[rgba(255,255,255,0.15)] rounded-[3px] font-bold tracking-[0.05em]">{currentMode.toUpperCase()}</span>}
                    {t('common.command')}
                </button>
                <button
                    className={navBtnBase}
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
