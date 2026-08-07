/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        main: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'monospace'],
      },
      colors: {
        'bg-dark': 'var(--bg-dark)',
        'bg-panel': 'var(--bg-panel)',
        'bg-panel-hover': 'var(--bg-panel-hover)',
        'border-glass': 'var(--glass-border)',
        'border-glass-hover': 'var(--glass-border-hover)',
        'section-border': 'var(--section-border)',
        'border-main': 'var(--border-color)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-dim': 'var(--text-dim)',
        'status-green': 'var(--green)',
        'status-red': 'var(--red)',
        'status-yellow': 'var(--yellow)',
        'status-orange': 'var(--orange)',
        'status-purple': 'var(--purple)',
        'nav-bg': 'var(--nav-bg)',
        'panel-header-bg': 'var(--panel-header-bg)',
        'panel-item-bg': 'var(--panel-item-bg)',
        'panel-item-hover': 'var(--panel-item-hover)',
        'overlay-bg': 'var(--overlay-bg)',
        'ticker-bg': 'var(--ticker-bg)',
        'ticker-fade': 'var(--ticker-fade)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'panel-enter': 'panelEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'navbar-slide': 'navbarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 1s infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'ticker-scroll': 'ticker-scroll 100s linear infinite',
        'ticker-scroll-reverse': 'ticker-scroll-reverse 90s linear infinite',
        'ticker-scroll-slow': 'ticker-scroll 140s linear infinite',
        'spin': 'spin 1s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'pulse-opacity': 'pulse-opacity 2s infinite',
        'rotate-dash': 'rotate-dash 10s linear infinite',
        'pulse-critical': 'pulse-critical 1s ease-in-out infinite',
        'fast-pulse': 'fast-pulse 1.2s ease-out infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        panelEnter: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        navbarSlideIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.85)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ticker-scroll-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { strokeWidth: '2px', opacity: '0.8' },
          '100%': { strokeWidth: '8px', opacity: '0' },
        },
        'pulse-opacity': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'rotate-dash': {
          to: { strokeDashoffset: '-20' },
        },
        'pulse-critical': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fast-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.85' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
