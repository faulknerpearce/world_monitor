import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('telemetry send', () => {
  const originalBeacon = navigator.sendBeacon
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_TELEMETRY_URL', 'https://telemetry.example/collect')
  })

  afterEach(() => {
    navigator.sendBeacon = originalBeacon
    global.fetch = originalFetch
    vi.unstubAllEnvs()
  })

  it('sendBeacon uses a JSON Blob body', async () => {
    const beacon = vi.fn().mockReturnValue(true)
    navigator.sendBeacon = beacon

    const { initTelemetry } = await import('./telemetry')
    initTelemetry()

    window.dispatchEvent(new ErrorEvent('error', { message: 'test failure' }))

    expect(beacon).toHaveBeenCalled()
    const [, body] = beacon.mock.calls[0]
    expect(body).toBeInstanceOf(Blob)
    expect(body.type).toBe('application/json')
  })

  it('fetch fallback sets Content-Type application/json', async () => {
    navigator.sendBeacon = vi.fn().mockReturnValue(false)
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const { initTelemetry } = await import('./telemetry')
    initTelemetry()

    window.dispatchEvent(new ErrorEvent('error', { message: 'test failure' }))

    expect(global.fetch).toHaveBeenCalledWith(
      'https://telemetry.example/collect',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })
})