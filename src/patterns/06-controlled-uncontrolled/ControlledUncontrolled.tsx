import { useState, type ChangeEvent, type FormEvent } from 'react'

/**
 * ========================================
 * PATTERN: Controlled vs Uncontrolled Components
 * ========================================
 *
 * WHAT IT IS:
 * This pattern describes who "owns" the state of a form element:
 *
 * - **Uncontrolled**: The DOM manages the state. You use a ref to
 *   read the value when needed (like `document.querySelector`).
 *
 * - **Controlled**: React manages the state. You store the value
 *   in a state variable and pass it back to the input via `value`.
 *
 * WHY IT MATTERS (Interview):
 * - Every form-related interview question touches this concept
 * - Understanding the distinction proves you know where React
 *   boundaries lie vs the DOM
 * - It affects performance, UX (instant validation), and testing
 */

// ─── 1. UNCONTROLLED ─────────────────────────────────────────────
// The DOM handles the input state. We use a ref to read it on submit.

export function UncontrolledForm() {
  const [submittedValue, setSubmittedValue] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSubmittedValue(formData.get('username') as string)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Username (uncontrolled):
          <input
            name="username"
            type="text"
            defaultValue=""    // <-- initial value only, not updated
            placeholder="Type and submit"
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      {submittedValue && <p>Submitted: <strong>{submittedValue}</strong></p>}
    </div>
  )
}

// When to use uncontrolled:
// - Simple forms where you only need values on submit
// - Integrating with non-React code
// - File inputs (they MUST be uncontrolled)

// ─── 2. CONTROLLED ───────────────────────────────────────────────
// React owns the state. Every keystroke updates state, which
// flows back to the input's `value` prop (single source of truth).

export function ControlledForm() {
  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // You can transform, validate, or reject values in real time
    setUsername(e.target.value)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(username)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Username (controlled):
          <input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="Type here..."
          />
        </label>
        <p>Live preview: <strong>{username || '(empty)'}</strong></p>
        <button type="submit">Submit</button>
      </form>
      {submitted && <p>Submitted: <strong>{submitted}</strong></p>}
    </div>
  )
}

// ─── 3. FLEXIBLE: Controlled + Uncontrolled in One Component ─────

interface FlexibleInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

export function FlexibleInput({ value, defaultValue = '', onChange }: FlexibleInputProps) {
  // If `value` is provided, we're controlled. If not, uncontrolled.
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)

  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!isControlled) setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div>
      <label>
        Flexible input:
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={isControlled ? 'Controlled mode' : 'Uncontrolled mode'}
        />
      </label>
      <p>
        Mode: <strong>{isControlled ? 'Controlled' : 'Uncontrolled'}</strong>
        {' | '}Value: <strong>{currentValue || '(empty)'}</strong>
      </p>
    </div>
  )
}

// ─── 4. REAL-WORLD: Controlled Input with Validation ─────────────

export function ValidatedEmailInput() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Instant validation — only possible because we control the value
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address')
    } else {
      setError(null)
    }
  }

  return (
    <div>
      <label>
        Email (controlled + validation):
        <input
          type="email"
          value={email}
          onChange={handleChange}
          className={error ? 'input--error' : ''}
          placeholder="you@example.com"
        />
      </label>
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

// ─── DEMO ────────────────────────────────────────────────────────

export function ControlledUncontrolledDemo() {
  const [controlledValue, setControlledValue] = useState('')

  return (
    <div className="pattern-example">
      <h1>Controlled vs Uncontrolled</h1>

      <pre><code>{`// Uncontrolled: DOM owns state
<input defaultValue="" name="email" />

// Controlled: React owns state
<input value={email} onChange={e => setEmail(e.target.value)} />

// Flexible: supports both modes
function FlexibleInput({ value, defaultValue, onChange }) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const current = isControlled ? value : internal
  return <input value={current} onChange={e => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e.target.value)
  }} />
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Uncontrolled Form</h2>
          <UncontrolledForm />
          <p className="hint">State lives in the DOM. Read on submit.</p>
        </div>

        <div className="demo-card">
          <h2>Controlled Form</h2>
          <ControlledForm />
          <p className="hint">State lives in React. Every keystroke updates it.</p>
        </div>

        <div className="demo-card">
          <h2>Flexible Input</h2>
          <FlexibleInput />
          <FlexibleInput
            value={controlledValue}
            onChange={setControlledValue}
          />
          <button onClick={() => setControlledValue('')}>
            Reset Controlled
          </button>
        </div>

        <div className="demo-card">
          <h2>Validation (controlled)</h2>
          <ValidatedEmailInput />
          <p className="hint">Instant validation is only possible with controlled inputs.</p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>Controlled vs Uncontrolled — what's the difference?</strong> Controlled: React manages the value via state. Uncontrolled: the DOM manages the value, React reads it via a ref on demand.</li>
          <li><strong>When would you use an uncontrolled component?</strong> Simple forms with submit-only access, file inputs (which have no controlled API), or integrating with non-React libraries.</li>
          <li><strong>When would you use a controlled component?</strong> When you need instant validation, conditional disabling of submit, live preview, or any case where you need to react to changes before submission.</li>
          <li><strong>How do you make a component that supports both modes?</strong> Check if <code>value</code> is provided vs <code>undefined</code>. If <code>value !== undefined</code>, use internal state. This is how many form libraries work.</li>
        </ol>
      </section>
    </div>
  )
}
