import { useEffect, useRef, useCallback } from 'react'

/**
 * Focus trap for modal dialogs.
 *
 * - Focuses the first focusable element inside the modal on mount
 * - Loops Tab/Shift+Tab inside the modal
 * - Closes on Escape
 * - Restores focus to the previously focused element on unmount
 *
 * @param {React.RefObject<HTMLElement>} containerRef - the modal root
 * @param {boolean} isOpen - whether the modal is currently open
 * @param {() => void} onEscape - handler called when Escape is pressed
 */
export const useFocusTrap = (containerRef, isOpen, onEscape) => {
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // Remember which element had focus before the modal opened so we
    // can restore it when the modal closes.
    previouslyFocused.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    // Move focus into the modal. Prefer an explicit `data-autofocus` attr
    // so consumers control the entry point; fall back to the first
    // tabbable element.
    const explicit = container.querySelector('[data-autofocus]')
    const tabbables = getTabbableElements(container)
    const target = explicit || tabbables[0]
    if (target) {
      // requestAnimationFrame avoids the focus call being lost when the
      // modal just mounted in the same tick.
      requestAnimationFrame(() => target.focus())
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return

      const list = getTabbableElements(container)
      if (list.length === 0) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the element that opened the modal.
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus()
      }
    }
  }, [isOpen, containerRef, onEscape])
}

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** @param {HTMLElement} root */
const getTabbableElements = (root) => {
  const all = Array.from(root.querySelectorAll(TABBABLE_SELECTOR))
  return all.filter((el) => {
    if (el.hasAttribute('disabled')) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    // Skip elements with display:none or visibility:hidden.
    const style = window.getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none') return false
    return true
  })
}
