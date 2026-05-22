/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'

/**
 * ========================================
 * PATTERN: Provider Pattern
 * ========================================
 *
 * WHAT IT IS:
 * The Provider pattern uses React Context to share state and
 * behaviors across the entire component tree without manually
 * passing props at every level (prop drilling).
 *
 * WHY IT MATTERS (Interview):
 * - Context + useReducer is the "poor man's Redux" — a common
 *   state management approach in real projects
 * - Eliminates prop drilling through deeply nested components
 * - Combines naturally with custom Hooks for clean consumption
 * - Every major library uses this pattern (ThemeProvider, etc.)
 *
 * CAVEATS:
 * - Context triggers re-renders in ALL consumers when ANY value changes
 * - Split contexts by domain (auth, theme, cart) to avoid unnecessary
 *   re-renders — don't put everything in one Provider
 * - For high-frequency updates, consider external state libraries
 *   or use-useReducer with context selectors
 */

// ─── 1. AUTH PROVIDER ────────────────────────────────────────────
// Uses useReducer for predictable state transitions.

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, error: null }
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isAuthenticated: true, error: null }
    case 'LOGIN_FAILURE':
      return { user: null, isAuthenticated: false, error: action.payload }
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, error: null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

interface AuthContextValue {
  state: AuthState
  dispatch: Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (email === 'admin@test.com' && password === 'password') {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { id: '1', name: 'Admin', email, role: 'admin' },
        })
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err instanceof Error ? err.message : 'Login failed' })
    }
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

// ─── 2. THEME PROVIDER ───────────────────────────────────────────
// Simple theme context with toggle functionality.

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useReducer(
    (state: Theme, action: Theme | 'toggle'): Theme =>
      action === 'toggle' ? (state === 'light' ? 'dark' : 'light') : action,
    'light',
  )

  const toggleTheme = () => setTheme('toggle')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={`theme-${theme}`}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

// ─── 3. USE-CONTEXT COMPONENTS ───────────────────────────────────

function LoginForm() {
  const { state, login } = useAuth()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    login(form.get('email') as string, form.get('password') as string)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" defaultValue="admin@test.com" />
        </label>
        <label>
          Password:
          <input type="password" name="password" defaultValue="password" />
        </label>
        <button type="submit" disabled={state.isAuthenticated}>
          {state.isAuthenticated ? 'Logged in' : 'Login'}
        </button>
      </form>
      {state.error && <p className="error-message">{state.error}</p>}
    </div>
  )
}

function UserProfile() {
  const { state, logout } = useAuth()

  if (!state.isAuthenticated || !state.user) return <p>Not logged in.</p>

  return (
    <div>
      <p><strong>Name:</strong> {state.user.name}</p>
      <p><strong>Email:</strong> {state.user.email}</p>
      <p><strong>Role:</strong> {state.user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  )
}

// ─── DEMO ────────────────────────────────────────────────────────

export function ProviderPatternDemo() {
  return (
    <div className="pattern-example">
      <h1>Provider Pattern</h1>

      <pre><code>{`// Create context with state + actions
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const login = async (email, password) => { /* ... */ }
  return (
    <AuthContext.Provider value={{ state, login }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom consumer hook
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Auth Provider</h2>
          <AuthProvider>
            <LoginForm />
            <hr />
            <UserProfile />
          </AuthProvider>
          <p className="hint">
            Try: <code>admin@test.com</code> / <code>password</code>
          </p>
        </div>

        <div className="demo-card">
          <h2>Theme Provider</h2>
          <ThemeProvider>
            <ThemeToggle />
            <p>This content re-renders when theme changes.</p>
          </ThemeProvider>
          <p className="hint">The Provider wraps this entire card.</p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What problem does the Provider Pattern solve?</strong> Prop drilling — passing data through components that don't need it just to reach deep descendants.</li>
          <li><strong>Provider vs Redux — when to use which?</strong> Context + useReducer is fine for low-to-medium frequency updates and small apps. For high-frequency updates, large state, or middleware needs, reach for Zustand/Redux.</li>
          <li><strong>What's the biggest performance issue with Context?</strong> Every consumer re-renders when ANY context value changes, even if it only reads a small part. Solution: split contexts by domain or use memoization.</li>
          <li><strong>How do you make a custom Hook for consuming context?</strong> Create a wrapper like <code>useAuth()</code> that calls <code>useContext</code> and throws a descriptive error if used outside the provider. This is the standard pattern.</li>
        </ol>
      </section>
    </div>
  )
}
