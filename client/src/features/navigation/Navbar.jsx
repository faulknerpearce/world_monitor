import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '@context/I18nContext'
import Clock from './Clock'

const navLinkBase = 'py-2.5 px-4 bg-panel-item-bg text-text-secondary no-underline border border-border-glass rounded text-[0.7rem] font-medium tracking-[0.03em] transition-all duration-200 hover:bg-panel-item-hover hover:text-text-primary hover:border-border-glass-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] max-[768px]:py-3 max-[768px]:px-4 max-[768px]:text-[0.75rem] max-[768px]:w-full max-[768px]:justify-center'
const navLinkActive = '!bg-[rgba(16,185,129,0.1)] !text-[var(--emerald)] !border-[rgba(16,185,129,0.2)]'
const navBtnBase = 'py-2.5 px-4 bg-panel-item-bg text-text-secondary border border-border-glass rounded cursor-pointer text-[0.7rem] font-medium tracking-[0.03em] transition-all duration-200 hover:enabled:bg-panel-item-hover hover:enabled:text-text-primary hover:enabled:border-border-glass-hover hover:enabled:-translate-y-px hover:enabled:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:enabled:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed max-[768px]:py-3 max-[768px]:px-4 max-[768px]:text-[0.75rem]'

const Navbar = ({ onRefresh, isRefreshing, onOpenSettings, onOpenCommand, currentMode }) => {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { t } = useI18n()

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
    const closeMobileMenu = () => setMobileMenuOpen(false)

    return (
        <nav className="bg-nav-bg backdrop-blur-[12px] border-b border-border-glass py-3 px-6 flex justify-between items-center sticky top-0 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-navbar-slide max-[768px]:py-2 max-[768px]:px-4">
            {/* Left section: Logo + Live indicator + Time + Navigation */}
            <div className="flex items-center gap-6 max-[768px]:gap-2">
                <div className="flex items-center gap-4 max-[768px]:gap-2">
                    <h1 className="text-base font-bold tracking-[0.1em] text-text-primary font-[family-name:var(--font-display)] max-[768px]:text-sm">{t('app.title')}</h1>
                    
                    {/* Desktop Live indicator */}
                    <span className={`flex max-[768px]:hidden items-center gap-1.5 py-1 px-2 bg-[rgba(16,185,129,0.1)] text-[var(--emerald)] rounded border border-[rgba(16,185,129,0.2)] text-[0.6rem] font-semibold tracking-[0.1em] ${isRefreshing ? '!bg-[rgba(245,158,11,0.15)] !text-[#f59e0b] !border-[rgba(245,158,11,0.25)] animate-pulse-slow' : ''}`}>
                        {!isRefreshing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>}
                        {isRefreshing ? t('common.refreshing') : t('common.live')}
                    </span>
                    
                    {/* Desktop time display */}
                    <div className="flex max-[768px]:hidden items-center gap-2 pl-3 border-l border-border-glass">
                        <Clock />
                    </div>


                </div>

                {/* Desktop Navigation - ONLY visible on desktop */}
                <div className="flex gap-2 max-[768px]:hidden pl-2 border-l border-border-glass">
                    <Link to="/" className={`${navLinkBase} ${location.pathname === '/' ? navLinkActive : ''}`}>
                        {t('nav.dashboard')}
                    </Link>
                    <Link to="/map" className={`${navLinkBase} ${location.pathname === '/map' ? navLinkActive : ''}`}>
                        {t('nav.map')}
                    </Link>
                </div>
            </div>

            {/* Right section: Desktop action buttons - ONLY visible on desktop */}
            <div className="flex gap-2 max-[768px]:hidden">
                <button className={navBtnBase} onClick={onRefresh} disabled={isRefreshing} aria-label={isRefreshing ? t('nav.refreshingData') : t('nav.refreshAllData')}>
                    {t('common.refresh')}
                </button>
                <button className={`${navBtnBase} !bg-[rgba(99,102,241,0.15)] !text-[var(--indigo)] !border-[rgba(99,102,241,0.25)] !flex !items-center gap-2`} onClick={onOpenCommand} aria-label={t('nav.openCommandSelector')}>
                    {currentMode && <span className="text-[0.55rem] py-1 px-1.5 bg-[rgba(255,255,255,0.15)] rounded-[4px] font-bold tracking-[0.05em]">{currentMode.toUpperCase()}</span>}
                    {t('common.command')}
                </button>
                <button className={navBtnBase} onClick={onOpenSettings} aria-label={t('nav.openSettings')}>
                    {t('common.settings')}
                </button>
            </div>

            {/* Mobile menu button - ONLY visible on mobile */}
            <button
                className="hidden max-[768px]:flex items-center justify-center w-10 h-10 bg-panel-item-bg border border-border-glass rounded-lg text-text-secondary hover:bg-panel-item-hover hover:text-text-primary transition-all duration-200"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile Menu - ONLY visible on mobile when open */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[rgba(10,14,20,0.98)] backdrop-blur-xl border-b border-border-glass shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-[99] hidden max-[768px]:flex flex-col animate-slide-in">
                    {/* Mobile header with Live indicator and time */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass">
                        <span className={`flex items-center gap-2 py-1.5 px-3 bg-[rgba(16,185,129,0.1)] text-[var(--emerald)] rounded border border-[rgba(16,185,129,0.2)] text-[0.65rem] font-semibold tracking-[0.1em] ${isRefreshing ? '!bg-[rgba(245,158,11,0.15)] !text-[#f59e0b] !border-[rgba(245,158,11,0.25)] animate-pulse-slow' : ''}`}>
                            {!isRefreshing && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>}
                            {isRefreshing ? t('common.refreshing') : t('common.live')}
                        </span>
                        <Clock />
                    </div>

                    {/* Navigation links */}
                    <div className="flex flex-col p-4 gap-2 border-b border-border-glass">
                        <Link to="/" className={`${navLinkBase} ${location.pathname === '/' ? navLinkActive : ''}`} onClick={closeMobileMenu}>
                            {t('nav.dashboard')}
                        </Link>
                        <Link to="/map" className={`${navLinkBase} ${location.pathname === '/map' ? navLinkActive : ''}`} onClick={closeMobileMenu}>
                            {t('nav.map')}
                        </Link>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col p-4 gap-2">
                        <button className={navBtnBase} onClick={() => { onRefresh(); closeMobileMenu(); }} disabled={isRefreshing} aria-label={isRefreshing ? t('nav.refreshingData') : t('nav.refreshAllData')}>
                            {t('common.refresh')}
                        </button>
                        <button className={`${navBtnBase} !bg-[rgba(99,102,241,0.15)] !text-[var(--indigo)] !border-[rgba(99,102,241,0.25)] !flex !items-center gap-2 justify-center`} onClick={() => { onOpenCommand(); closeMobileMenu(); }} aria-label={t('nav.openCommandSelector')}>
                            {currentMode && <span className="text-[0.55rem] py-1 px-1.5 bg-[rgba(255,255,255,0.15)] rounded-[4px] font-bold tracking-[0.05em]">{currentMode.toUpperCase()}</span>}
                            {t('common.command')}
                        </button>
                        <button className={navBtnBase} onClick={() => { onOpenSettings(); closeMobileMenu(); }} aria-label={t('nav.openSettings')}>
                            {t('common.settings')}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
