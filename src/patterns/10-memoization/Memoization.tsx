import { useState, useMemo, useCallback, memo } from 'react'

/**
 * ========================================
 * PATTERN: Memoization
 * ========================================
 *
 * WHAT IT IS:
 * Memoization is an optimization technique that caches the result
 * of an expensive operation and returns the cached result when the
 * same inputs occur again. In React, three tools provide this:
 *
 * 1. React.memo — prevents component re-render if props haven't changed
 * 2. useMemo — caches the result of an expensive calculation
 * 3. useCallback — caches a function reference between renders
 *
 * WHY IT MATTERS (Interview):
 * - Performance optimization is a senior engineer's responsibility
 * - Misuse of memoization can be WORSE than not using it (memory + CPU)
 * - Understanding referential equality (===) is critical in React
 *
 * RULE OF THUMB:
 * Don't optimize prematurely. Profile first, then memoize.
 * Every memoization has a cost (comparison + memory).
 */

// ─── 1. React.memo ───────────────────────────────────────────────
// Prevents re-render when props haven't changed (shallow comparison).

interface ExpensiveItemProps {
  name: string
  count: number
  onIncrement: () => void
}

export const ExpensiveItem = memo(function ExpensiveItem({
  name,
  count,
  onIncrement,
}: ExpensiveItemProps) {
  console.log(`[ExpensiveItem] Rendering: ${name}`)
  return (
    <div className="memo-item">
      <span>
        {name}: {count}
      </span>
      <button onClick={onIncrement}>+</button>
    </div>
  )
})

// Without memo: every parent render re-renders all children.
// With memo: only re-renders children whose props actually changed.

// ─── 2. useMemo ──────────────────────────────────────────────────
// Caches the result of an expensive computation.

function expensiveCalculation(num: number): number {
  console.log('[expensiveCalculation] Running...')
  let result = 0
  for (let i = 0; i < 10000000; i++) {
    result += num * Math.random()
  }
  return Math.round(result)
}

function FibonacciDisplay({ n }: { n: number }) {
  // Memoize to avoid recalculating on every render
  const fib = useMemo(() => {
    console.log('[FibonacciDisplay] Computing fib...')
    if (n <= 1) return n
    let a = 0, b = 1
    for (let i = 2; i <= n; i++) {
      ;[a, b] = [b, a + b]
    }
    return b
  }, [n])

  return (
    <p>
      fib({n}) = <strong>{fib}</strong>
    </p>
  )
}

// ─── 3. useCallback ──────────────────────────────────────────────
// Returns a stable function reference between renders.

interface Todo {
  id: number
  text: string
  done: boolean
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number) => void
}

const TodoItem = memo(function TodoItem({ todo, onToggle }: TodoItemProps) {
  console.log(`[TodoItem] Rendering: ${todo.text}`)
  return (
    <li>
      <label className={todo.done ? 'done' : ''}>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        {todo.text}
      </label>
    </li>
  )
})

// ─── 4. PUTTING IT ALL TOGETHER ──────────────────────────────────
// Demonstrates why useCallback is needed with memoized children.

const INITIAL_TODOS: Todo[] = [
  { id: 1, text: 'Learn React patterns', done: false },
  { id: 2, text: 'Study memoization', done: false },
  { id: 3, text: 'Practice interviews', done: false },
]

export function MemoizationDemo() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [count, setCount] = useState(0)
  const [fibN, setFibN] = useState(10)

  // WITHOUT useCallback: every render creates a NEW function,
  // so React.memo sees the onToggle prop as "changed" and re-renders.
  // WITH useCallback: stable reference, memoized children skip re-render.
  const handleToggle = useCallback((id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }, [])

  // Without memo: this recomputes on every render (try removing useMemo)
  // With memo: only recomputes when fibN changes
  const fibResult = useMemo(() => {
    console.log('[Demo] Computing expensive value...')
    return expensiveCalculation(fibN)
  }, [fibN])

  return (
    <div className="pattern-example">
      <h1>Memoization</h1>

      <pre><code>{`// React.memo: skip re-render if props unchanged
const TodoItem = memo(({ todo, onToggle }) => (
  <li><input checked={todo.done} onChange={onToggle} />{todo.text}</li>
))

// useMemo: cache expensive calculation
const fib = useMemo(() => computeFibonacci(n), [n])

// useCallback: stable function reference
const handleToggle = useCallback(
  (id) => setTodos(prev => prev.map(t => /* ... */)),
  []
)`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>React.memo + useCallback</h2>
          <p>
            <strong>Counter:</strong> {count}
            {' '}
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </p>
          <p className="hint">
            Watch the console. Incrementing counter does NOT re-render
            TodoItems because of memo + useCallback.
          </p>
          <ul>
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
            ))}
          </ul>
        </div>

        <div className="demo-card">
          <h2>useMemo</h2>
          <FibonacciDisplay n={fibN} />
          <button onClick={() => setFibN(n => n + 1)}>Increase N</button>
          <button onClick={() => setFibN(n => Math.max(0, n - 1))}>Decrease N</button>
          <hr />
          <p>
            <strong>Expensive calculation result:</strong> {fibResult}
          </p>
          <p className="hint">
            Check the console — the calculation only runs when N changes.
          </p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>React.memo vs useMemo vs useCallback — what's the difference?</strong> React.memo wraps a component to skip re-render if props haven't changed. useMemo caches a computed value. useCallback caches a function reference (it's <code>{`useMemo(() => fn, deps)`}</code>).</li>
          <li><strong>When should you NOT use memoization?</strong> When the comparison cost exceeds the render cost, or for simple/lightweight components. Don't optimize prematurely.</li>
          <li><strong>Why does useCallback matter for children?</strong> Without it, parent re-renders create new function references, causing memoized children to re-render anyway (since props "changed" by reference).</li>
          <li><strong>Does useMemo guarantee the value won't be recomputed?</strong> No. React may discard cached values (e.g., to free memory). It's an optimization hint, not a guarantee.</li>
          <li><strong>What's referential equality and why does it matter?</strong> In JavaScript, <code>{} === {}</code> is false. React.memo uses shallow comparison, so new object/function references always appear as "changed".</li>
        </ol>
      </section>
    </div>
  )
}
