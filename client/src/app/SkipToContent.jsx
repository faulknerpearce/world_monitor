import { memo } from 'react'

/**
 * Skip-to-content link. The first focusable element on the page; appears
 * when focused via keyboard and jumps the user past the navbar and any
 * other repeated chrome directly to <main id="main-content">.
 *
 * Rendered as the first child of <body> by App.jsx.
 */
const SkipToContent = memo(() => (
  <a
    href="#main-content"
    className="
      sr-only focus:not-sr-only
      focus:absolute focus:top-2 focus:left-2 focus:z-[9999]
      focus:px-4 focus:py-2 focus:rounded
      focus:bg-accent focus:text-bg-dark focus:font-semibold
      focus:outline-none focus:shadow-[0_0_0_2px_var(--accent),0_0_0_4px_var(--bg-dark)]
    "
  >
    Skip to main content
  </a>
))

SkipToContent.displayName = 'SkipToContent'

export default SkipToContent
