/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react'

/**
 * ========================================
 * PATTERN: Custom Hooks
 * ========================================
 *
 * WHAT IT IS:
 * A custom Hook is a JavaScript function whose name starts with "use"
 * and that may call other Hooks. It lets you extract component logic
 * into reusable functions.
 *
 * WHY IT MATTERS (Interview):
 * - Fundamental to React's composition model since Hooks were introduced
 * - Eliminates class component complexity (this, bind, lifecycle noise)
 * - Enables logic reuse WITHOUT changing component hierarchy (unlike HOCs/render-props)
 * - Each call to a hook gets isolated state — no sharing conflicts
 *
 * KEY RULES:
 * 1. Only call Hooks at the top level (not inside loops, conditions, or nested functions)
 * 2. Only call Hooks from React function components or other custom Hooks
 * 3. Name must start with "use" (convention enforced by lint rules)
 */

// ─── 1. useLocalStorage ──────────────────────────────────────────
// Persists state to localStorage and syncs across tabs.

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      console.warn(`Error reading localStorage key "${key}"`)
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}"`, error)
    }
  }

  return [storedValue, setValue] as const
}

// ─── 2. useDebounce ──────────────────────────────────────────────
// Delays updating a value until after a specified delay.
// Critical for search-as-you-type inputs to avoid excessive API calls.

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ─── 3. useMediaQuery ────────────────────────────────────────────
// Tracks whether a CSS media query matches. Essential for responsive
// components without a resize event listener.

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// ─── 4. usePrevious ──────────────────────────────────────────────
// Tracks the previous value of a state/prop.
// Useful for detecting changes or implementing "did update" logic.

export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>(undefined)
  const currentRef = useRef(value)

  useEffect(() => {
    setPrevious(currentRef.current)
    currentRef.current = value
  }, [value])

  return previous
}

// ─── 5. useToggle ────────────────────────────────────────────────
// A simple boolean toggle with convenience methods.

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn(prev => !prev), [])
  const setTrue = useCallback(() => setOn(true), [])
  const setFalse = useCallback(() => setOn(false), [])

  return { on, toggle, setTrue, setFalse, setOn }
}

// ─── 6. useFetch (simplified) ────────────────────────────────────
// Generic data fetching hook with loading/error states.

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFetch<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!url) return

    let cancelled = false

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as T
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) })
        }
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [url])

  return state
}

// ─── DEMO COMPONENT ──────────────────────────────────────────────
export function CustomHooksDemo() {
  const [name, setName] = useLocalStorage('demo-name', '')
  const debouncedName = useDebounce(name, 300)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prevName = usePrevious(debouncedName)
  const { on: visible, toggle } = useToggle(true)

  return (
    <div className="pattern-example">
      <h1>Custom Hooks</h1>

      <pre><code>{`// Hook: encapsulates stateful logic
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  })
  return [value, setValue] as const
}

// Usage in a component
function Profile() {
  const [name, setName] = useLocalStorage('name', '')
  return <input value={name} onChange={e => setName(e.target.value)} />
}`}</code></pre>

      <section className="demo-grid">
        {/* useLocalStorage + useDebounce */}
        <div className="demo-card">
          <h2>useLocalStorage + useDebounce</h2>
          <label>
            Type here (persisted in localStorage):
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </label>
          <p><strong>Raw value:</strong> {name}</p>
          <p><strong>Debounced (300ms):</strong> {debouncedName}</p>
          <p><strong>Previous value:</strong> {prevName ?? '(none)'}</p>
        </div>

        {/* useMediaQuery */}
        <div className="demo-card">
          <h2>useMediaQuery</h2>
          <p>
            <strong>Mobile (width {'<='} 768px):</strong>{' '}
            {isMobile ? 'Yes 📱' : 'No 💻'}
          </p>
          <p>Resize the browser to see it change.</p>
        </div>

        {/* useToggle */}
        <div className="demo-card">
          <h2>useToggle</h2>
          <p><strong>Visible:</strong> {visible ? 'Yes' : 'No'}</p>
          <button onClick={toggle}>Toggle</button>
          {visible && <p className="fade-in">This content toggles visibility</p>}
        </div>
      </section>

      {/* ─── KEY INSIGHTS ─── */}
      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>Why use custom Hooks instead of HOCs or render props?</strong> Custom Hooks do not alter the component tree, have no wrapper hell, and compose naturally. They share logic, not UI.</li>
          <li><strong>What's the difference between custom Hooks and utility functions?</strong> Custom Hooks can use React Hooks (useState, useEffect, etc.). Plain utility functions cannot.</li>
          <li><strong>How do you test a custom Hook?</strong> Use <code>renderHook</code> from <code>@testing-library/react</code> or test the components that use the hook.</li>
          <li><strong>What's the "Rules of Hooks" lint rule?</strong> It ensures hooks are called in the same order on every render by forbidding them inside conditions, loops, or callbacks.</li>
          <li><strong>Can a custom Hook return JSX?</strong> Technically yes, but it breaks the convention. Custom Hooks return values/ functions; components return JSX.</li>
        </ol>
      </section>
    </div>
  )
}
