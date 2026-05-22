import { useReducer, type ReactNode } from 'react'

interface ToggleState {
  on: boolean
}

type ToggleAction =
  | { type: 'toggle' }
  | { type: 'set'; payload: boolean }
  | { type: 'reset' }

interface ToggleReducerProps {
  initialOn?: boolean
  reducer?: (state: ToggleState, action: ToggleAction) => ToggleState
  children: (api: {
    on: boolean
    toggle: () => void
    setOn: (val: boolean) => void
    reset: () => void
    getTogglerProps: <T extends Record<string, unknown>>(props?: T) => T & { 'aria-pressed': boolean; onClick: () => void }
  }) => ReactNode
}

const defaultToggleReducer = (state: ToggleState, action: ToggleAction): ToggleState => {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on }
    case 'set':
      return { on: action.payload }
    case 'reset':
      return { on: false }
    default:
      return state
  }
}

export function ToggleReducer({
  initialOn = false,
  reducer = defaultToggleReducer,
  children,
}: ToggleReducerProps) {
  const [state, dispatch] = useReducer(
    (prev: ToggleState, action: ToggleAction) => reducer(prev, action),
    { on: initialOn },
  )

  const toggle = () => dispatch({ type: 'toggle' })
  const setOn = (val: boolean) => dispatch({ type: 'set', payload: val })
  const reset = () => dispatch({ type: 'reset' })

  const getTogglerProps = <T extends Record<string, unknown>>(props?: T) => ({
    'aria-pressed': state.on,
    onClick: toggle,
    ...props,
  } as T & { 'aria-pressed': boolean; onClick: () => void })

  return <>{children({ on: state.on, toggle, setOn, reset, getTogglerProps })}</>
}

function maxToggleReducer(maxToggles: number) {
  return (state: ToggleState, action: ToggleAction): ToggleState => {
    if (action.type !== 'toggle') {
      return defaultToggleReducer(state, action)
    }

    const togglesSoFar = (state as ToggleState & { toggleCount?: number }).toggleCount ?? 0
    const newCount = togglesSoFar + 1

    if (newCount > maxToggles) {
      console.warn(`Max toggles (${maxToggles}) reached. Action blocked.`)
      return state
    }

    const newState = defaultToggleReducer(state, action)
    return { ...newState, toggleCount: newCount } as ToggleState & { toggleCount: number }
  }
}

interface CounterState {
  count: number
}

type CounterAction =
  | { type: 'increment'; payload?: number }
  | { type: 'decrement'; payload?: number }
  | { type: 'reset' }

interface CounterReducerProps {
  initialCount?: number
  min?: number
  max?: number
  reducer?: (state: CounterState, action: CounterAction) => CounterState
  children: (api: {
    count: number
    increment: () => void
    decrement: () => void
    reset: () => void
  }) => ReactNode
}

function defaultCounterReducer(min: number, max: number) {
  return (state: CounterState, action: CounterAction): CounterState => {
    switch (action.type) {
      case 'increment': {
        const next = state.count + (action.payload ?? 1)
        return { count: Math.min(next, max) }
      }
      case 'decrement': {
        const next = state.count - (action.payload ?? 1)
        return { count: Math.max(next, min) }
      }
      case 'reset':
        return { count: 0 }
      default:
        return state
    }
  }
}

const counterReducer = defaultCounterReducer(-10, 10)

export function CounterReducer({
  initialCount = 0,
  reducer = counterReducer,
  children,
}: CounterReducerProps) {
  const [state, dispatch] = useReducer(reducer, { count: initialCount })

  const increment = () => dispatch({ type: 'increment' })
  const decrement = () => dispatch({ type: 'decrement' })
  const reset = () => dispatch({ type: 'reset' })

  return <>{children({ count: state.count, increment, decrement, reset })}</>
}

export function StateReducerDemo() {
  return (
    <div className="pattern-example">
      <h1>State Reducer / Inversion of Control</h1>

      <pre><code>{`// Component accepts an optional custom reducer
function ToggleReducer({ reducer = defaultReducer, children }) {
  const [state, dispatch] = useReducer(
    (prev, action) => reducer(prev, action),
    { on: false }
  )
  return children({ on: state.on, toggle: () => dispatch({ type: 'toggle' }) })
}

// Consumer overrides behavior with a custom reducer
const maxToggleReducer = (max) => (state, action) => {
  if (action.type !== 'toggle') return state
  if (state.toggleCount >= max) return state  // block action
  return { ...defaultReducer(state, action), toggleCount: state.toggleCount + 1 }
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Toggle with Custom Reducer</h2>
          <ToggleReducer reducer={maxToggleReducer(3)}>
            {({ on, getTogglerProps }) => (
              <div>
                <p>State: <strong>{on ? 'ON' : 'OFF'}</strong></p>
                <button {...getTogglerProps()}>
                  Toggle (max 3 times)
                </button>
                <p className="hint">
                  Custom reducer blocks toggling after 3 attempts.
                </p>
              </div>
            )}
          </ToggleReducer>
        </div>

        <div className="demo-card">
          <h2>Counter with Boundaries</h2>
          <CounterReducer>
            {({ count, increment, decrement, reset }) => (
              <div>
                <p>Count: <strong>{count}</strong></p>
                <button onClick={increment}>+</button>
                <button onClick={decrement}>-</button>
                <button onClick={reset}>Reset</button>
                <p className="hint">
                  Clamped between -10 and 10 by the reducer.
                </p>
              </div>
            )}
          </CounterReducer>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What is the State Reducer pattern?</strong> A component accepts a custom reducer function that wraps its internal reducer, giving consumers control over state transitions.</li>
          <li><strong>What's the difference from a regular useReducer?</strong> In the normal pattern, the reducer is internal. Here, the consumer passes in a reducer that wraps the default one.</li>
          <li><strong>What library popularized this?</strong> Downshift for autocomplete/combobox inputs.</li>
          <li><strong>What's the downside?</strong> Complexity. For simple cases, a prop-based API is clearer.</li>
        </ol>
      </section>
    </div>
  )
}
