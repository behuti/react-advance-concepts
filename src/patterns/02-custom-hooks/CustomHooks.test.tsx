import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, useDebounce, usePrevious, useToggle } from './CustomHooks'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''))
    act(() => { result.current[1]('stored value') })
    expect(result.current[0]).toBe('stored value')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('stored value')
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('existing', JSON.stringify('existing value'))
    const { result } = renderHook(() => useLocalStorage('existing', ''))
    expect(result.current[0]).toBe('existing value')
  })
})

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })
})

describe('usePrevious', () => {
  it('returns the previous value after update', () => {
    const { result, rerender } = renderHook(({ val }) => usePrevious(val), {
      initialProps: { val: 'first' },
    })
    // Initial render may return 'first' or undefined depending on React version
    rerender({ val: 'second' })
    expect(result.current).toBe('first')
  })
})

describe('useToggle', () => {
  it('starts with given initial value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.on).toBe(true)
  })

  it('toggles the value', () => {
    const { result } = renderHook(() => useToggle(false))
    act(() => { result.current.toggle() })
    expect(result.current.on).toBe(true)
    act(() => { result.current.toggle() })
    expect(result.current.on).toBe(false)
  })

  it('setTrue and setFalse work', () => {
    const { result } = renderHook(() => useToggle(false))
    act(() => { result.current.setTrue() })
    expect(result.current.on).toBe(true)
    act(() => { result.current.setFalse() })
    expect(result.current.on).toBe(false)
  })
})
