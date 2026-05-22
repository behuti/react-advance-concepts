import { useState, type ReactNode, type MouseEvent } from 'react'

/**
 * ========================================
 * PATTERN: Render Props
 * ========================================
 *
 * WHAT IT IS:
 * A render prop is a function prop that a component uses to know
 * what to render. The component calls the function with its own
 * state/behavior, and the consumer returns JSX.
 */

interface MousePosition {
  x: number
  y: number
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode
}

export function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="mouse-tracker" onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  )
}

interface ToggleRenderProps {
  on: boolean
  toggle: () => void
  setOn: (value: boolean) => void
}

interface ToggleProps {
  initial?: boolean
  children?: ReactNode
  render?: (api: ToggleRenderProps) => ReactNode
}

export function Toggle({ initial = false, children, render }: ToggleProps) {
  const [on, setOn] = useState(initial)

  const toggle = () => setOn(prev => !prev)

  if (render) {
    return <>{render({ on, toggle, setOn })}</>
  }

  return <>{on ? children : null}</>
}

export function RenderPropsDemo() {
  return (
    <div className="pattern-example">
      <h1>Render Props</h1>

      <pre><code>{`// Component shares state via a function prop
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)}
    </div>
  )
}

// Consumer controls the rendering
<MouseTracker render={({ x, y }) => (
  <p>Position: {x}, {y}</p>
)} />`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>MouseTracker</h2>
          <MouseTracker
            render={({ x, y }) => (
              <p>
                Mouse position: <strong>{x}, {y}</strong>
              </p>
            )}
          />
        </div>

        <div className="demo-card">
          <h2>Toggle via Render Prop</h2>
          <Toggle
            render={({ on, toggle }) => (
              <div>
                <p>State: <strong>{on ? 'ON' : 'OFF'}</strong></p>
                <button onClick={toggle}>Toggle</button>
              </div>
            )}
          />
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What problem do render props solve?</strong> They let a component share behavior (state + logic) while giving the consumer full control over rendering — no assumptions about markup.</li>
          <li><strong>Render props vs Hooks — which is better?</strong> Hooks are simpler and avoid nesting. But render props are useful when the <em>parent</em> must control the rendered output and you need a named function for the consumer.</li>
          <li><strong>What is "wrapper hell"?</strong> Deeply nested components when using multiple render-prop components. Hooks flatten this.</li>
          <li><strong>Is <code>children</code> as a function the same as a render prop?</strong> Yes! Passing a function as children is just a render prop named <code>children</code>.</li>
        </ol>
      </section>
    </div>
  )
}
