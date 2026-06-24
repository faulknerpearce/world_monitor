import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals'
import { API } from '@config/api'

/**
 * Web Vitals + error reporting client.
 *
 * Wires `web-vitals` to a configurable reporting endpoint and captures
 * unhandled errors and promise rejections. Both are no-ops in dev (the
 * default) and in tests (where `navigator.sendBeacon` is not mocked).
 *
 * Reporting endpoint contract (POST application/json):
 *   {
 *     metric?: { name, value, id, rating, delta, navigationType },
 *     event?: 'error' | 'unhandledrejection',
 *     message?: string,
 *     stack?: string,
 *     url?: string,
 *     userAgent?: string,
 *     timestamp?: number
 *   }
 *
 * Set `VITE_TELEMETRY_URL` in `.env` to enable reporting in production.
 */

const REPORT_URL = import.meta.env.VITE_TELEMETRY_URL
const ENABLED = Boolean(REPORT_URL)

const send = (payload) => {
  if (!ENABLED) return
  try {
    // Beacon is fire-and-forget and survives page unload. JSON-stringified
    // body fits the same contract the rest of the app uses.
    const body = JSON.stringify({
      ...payload,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    })
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon && navigator.sendBeacon(REPORT_URL, blob)) return
    // Fallback to fetch with keepalive so the request survives unload.
    fetch(REPORT_URL, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {})
  } catch {
    // Telemetry must never break the app.
  }
}

const ratingFor = (name, value) => {
  // web-vitals 4+ ships its own `rating` field, but compute a fallback
  // for safety.
  switch (name) {
    case 'LCP': return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
    case 'INP': return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
    case 'CLS': return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
    case 'FCP': return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
    case 'TTFB': return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
    default: return 'unknown'
  }
}

let initialized = false

export const initTelemetry = () => {
  if (initialized) return
  initialized = true
  if (!ENABLED) return

  // Web Vitals
  onLCP((m) => send({ metric: { ...m, rating: m.rating ?? ratingFor('LCP', m.value) } }))
  onINP((m) => send({ metric: { ...m, rating: m.rating ?? ratingFor('INP', m.value) } }))
  onCLS((m) => send({ metric: { ...m, rating: m.rating ?? ratingFor('CLS', m.value) } }))
  onFCP((m) => send({ metric: { ...m, rating: m.rating ?? ratingFor('FCP', m.value) } }))
  onTTFB((m) => send({ metric: { ...m, rating: m.rating ?? ratingFor('TTFB', m.value) } }))

  // Runtime errors
  window.addEventListener('error', (e) => {
    send({
      event: 'error',
      message: e.message,
      stack: e.error?.stack,
    })
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    send({
      event: 'unhandledrejection',
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    })
  })
}

// API key is exported for the typecheck to confirm the API module is
// still imported (catches accidental removal of the dependency).
export const _apiModuleCheck = API
