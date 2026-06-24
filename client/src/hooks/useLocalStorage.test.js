import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

const wrapper = ({ children }) => children

describe('useLocalStorage key migration', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('migrates situationMonitorPanels → world_monitor_panels on first read', () => {
    window.localStorage.setItem('situationMonitorPanels', JSON.stringify({ politics: false }))

    const { result } = renderHook(() => useLocalStorage('world_monitor_panels', {}), { wrapper })

    expect(result.current[0]).toEqual({ politics: false })
    expect(window.localStorage.getItem('world_monitor_panels')).toBe(JSON.stringify({ politics: false }))
    expect(window.localStorage.getItem('situationMonitorPanels')).toBeNull()
  })

  it('migrates situationMonitorPanelOrder → world_monitor_panel_order', () => {
    window.localStorage.setItem('situationMonitorPanelOrder', JSON.stringify(['tech', 'finance']))

    const { result } = renderHook(() => useLocalStorage('world_monitor_panel_order', []), { wrapper })

    expect(result.current[0]).toEqual(['tech', 'finance'])
    expect(window.localStorage.getItem('world_monitor_panel_order')).toBe(JSON.stringify(['tech', 'finance']))
    expect(window.localStorage.getItem('situationMonitorPanelOrder')).toBeNull()
  })

  it('does not overwrite an existing new-key value', () => {
    window.localStorage.setItem('situationMonitorPanels', JSON.stringify({ old: true }))
    window.localStorage.setItem('world_monitor_panels', JSON.stringify({ new: true }))

    const { result } = renderHook(() => useLocalStorage('world_monitor_panels', {}), { wrapper })

    expect(result.current[0]).toEqual({ new: true })
    // Legacy key is left in place when new-key already has data; the next
    // migration attempt is a no-op. Users can clear it manually.
    expect(window.localStorage.getItem('situationMonitorPanels')).not.toBeNull()
  })

  it('returns the initial value when no legacy or new key exists', () => {
    const { result } = renderHook(() => useLocalStorage('world_monitor_panels', { default: true }), { wrapper })
    expect(result.current[0]).toEqual({ default: true })
  })

  it('writes updates to the new key', () => {
    const { result } = renderHook(() => useLocalStorage('world_monitor_panels', {}), { wrapper })

    act(() => {
      result.current[1]({ politics: false })
    })

    expect(window.localStorage.getItem('world_monitor_panels')).toBe(JSON.stringify({ politics: false }))
  })
})
