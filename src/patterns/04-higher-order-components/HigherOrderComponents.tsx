/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, type ComponentType } from 'react'

/**
 * ========================================
 * PATTERN: Higher-Order Components (HOC)
 * ========================================
 *
 * WHAT IT IS:
 * A Higher-Order Component is a function that takes a component
 * and returns a new component with additional props or behavior.
 *
 *   const EnhancedComponent = hoc(BaseComponent)
 */

interface WithLoadingProps {
  loading: boolean
}

export function withLoading<P extends object>(
  Component: ComponentType<P>,
) {
  const WithLoading = (props: WithLoadingProps & P) => {
    if (props.loading) {
      return <div className="spinner">Loading...</div>
    }
    return <Component {...props as unknown as P} />
  }

  WithLoading.displayName = `withLoading(${Component.displayName || Component.name || 'Component'})`

  return WithLoading
}

interface UserData {
  name: string
  email: string
}

function UserProfile({ user }: { user: UserData }) {
  return (
    <div>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  )
}

export const UserProfileWithLoading = withLoading(
  (props: { user: UserData } & WithLoadingProps) => <UserProfile user={props.user} />
)

export function withLogging<P extends object>(Component: ComponentType<P>) {
  const WithLogging = (props: P) => {
    useEffect(() => {
      console.log(`[${Component.name}] mounted`)
      return () => console.log(`[${Component.name}] unmounted`)
    }, [])

    useEffect(() => {
      console.log(`[${Component.name}] rendered with props:`, props)
    })

    return <Component {...props} />
  }

  WithLogging.displayName = `withLogging(${Component.displayName || Component.name || 'Component'})`

  return WithLogging
}

interface AuthUser {
  id: string
  name: string
}

export function withAuth<P extends { user: AuthUser | null }>(
  Component: ComponentType<Omit<P, 'user'> & { user: AuthUser }>,
) {
  const WithAuth = (props: P) => {
    if (!props.user) {
      return <p>Please log in to view this content.</p>
    }
    return <Component {...(props as P)} user={props.user as AuthUser} />
  }

  WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`

  return WithAuth
}

function Dashboard({ user }: { user: AuthUser }) {
  return <h2>Welcome back, {user.name}!</h2>
}

export const DashboardWithAuth = withAuth(Dashboard)

export function composeHocs<T>(...hocs: Array<(c: ComponentType<T>) => ComponentType<T>>) {
  return (BaseComponent: ComponentType<T>) =>
    hocs.reduceRight((acc, hoc) => hoc(acc), BaseComponent)
}

export function HigherOrderComponentsDemo() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setUser({ id: '1', name: 'Alice Johnson' })
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pattern-example">
      <h1>Higher-Order Components</h1>

      <pre><code>{`// HOC: function that wraps a component with extra behavior
function withLoading(Component) {
  return function WithLoading(props) {
    if (props.loading) return <Spinner />
    return <Component {...props} />
  }
}

// Usage
const UserProfileWithLoading = withLoading(UserProfile)

// Compose multiple HOCs
const Enhanced = compose(withLogging, withLoading)(BaseComponent)`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>withLoading</h2>
          <UserProfileWithLoading
            loading={loading}
            user={{ name: 'Alice', email: 'alice@example.com' }}
          />
          <p className="hint">Shows loading for 1.5s, then data.</p>
        </div>

        <div className="demo-card">
          <h2>withAuth</h2>
          <DashboardWithAuth user={user} />
          <button onClick={() => setUser(null)}>Log Out</button>
          <button onClick={() => setUser({ id: '1', name: 'Alice' })}>Log In</button>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What is a Higher-Order Component?</strong> A function that takes a component and returns a new component with additional props or behavior.</li>
          <li><strong>HOCs vs Hooks — which is better?</strong> Hooks compose without adding wrapper components, have no naming collisions, and are simpler. Prefer Hooks for new code. HOCs are for legacy interop.</li>
          <li><strong>What are the downsides of HOCs?</strong> Prop naming collisions, wrapper hell in DevTools, static methods aren't forwarded, refs don't pass through.</li>
          <li><strong>How do you compose multiple HOCs?</strong> <code>{`withLogging(withLoading(MyComponent))`}</code> or use a <code>compose</code> utility.</li>
          <li><strong>How do you fix the ref forwarding problem?</strong> Use <code>React.forwardRef</code> inside the HOC.</li>
        </ol>
      </section>
    </div>
  )
}
