import { lazy, Suspense, useState, type ComponentType, type ReactNode } from 'react'

/**
 * ========================================
 * PATTERN: Code Splitting & Lazy Loading
 * ========================================
 *
 * WHAT IT IS:
 * Code splitting is the practice of splitting your JavaScript bundle
 * into smaller chunks that are loaded on demand. React.lazy + Suspense
 * make this declarative: you tell React "render this placeholder until
 * the chunk arrives".
 *
 * WHY IT MATTERS (Interview):
 * - Critical for performance in large applications
 * - Reduces initial bundle size → faster time-to-interactive
 * - Route-based splitting is the most common approach
 * - Demonstrates understanding of React's loading states
 *
 * KEY TECHNIQUES:
 * 1. React.lazy — dynamically import a component
 * 2. Suspense — show a fallback while the chunk loads
 * 3. Route-based splitting — one chunk per route
 * 4. Component-based splitting — lazy-load heavy components
 *
 * NOTE ON REACT 19:
 * React 19 introduces the `use` Hook which integrates deeply with
 * Suspense. The lazy pattern below remains valid, but alternatives
 * are emerging.
 */

// ─── SIMULATED HEAVY COMPONENT ───────────────────────────────────
// In a real app, this would be `lazy(() => import('./HeavyComponent'))`
// Here we simulate a heavy component with a delay.

interface HeavyDashboardProps {
  userId: string
}

const HeavyDashboard: ComponentType<HeavyDashboardProps> = lazy(async () => {
  // Simulate a 2-second network delay for the chunk
  await new Promise(resolve => setTimeout(resolve, 2000))
  return {
    default: function Dashboard({ userId }: HeavyDashboardProps) {
      return (
        <div className="heavy-component">
          <h3>Dashboard loaded!</h3>
          <p>User ID: {userId}</p>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h4>Stats</h4>
              <p>Total visits: 12,847</p>
              <p>Active users: 342</p>
            </div>
            <div className="dashboard-card">
              <h4>Revenue</h4>
              <p>This month: $48,290</p>
              <p>Growth: +12.3%</p>
            </div>
            <div className="dashboard-card">
              <h4>Tasks</h4>
              <p>Completed: 28/42</p>
              <p>Pending: 14</p>
            </div>
          </div>
        </div>
      )
    },
  }
})

// ─── SUSPENSE WRAPPER ────────────────────────────────────────────
// A reusable component that wraps lazy components with Suspense.

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
}

export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className="suspense-fallback">
            <div className="spinner">Loading chunk...</div>
            <p className="hint">This simulates a 2-second network delay.</p>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}

// ─── ROUTE-BASED SPLITTING DEMO ──────────────────────────────────
// Simulates route-based code splitting.

type Route = 'home' | 'dashboard' | 'settings'

function HomePage() {
  return (
    <div>
      <h3>Home Page</h3>
      <p>This page is always bundled (critical path).</p>
    </div>
  )
}

function SettingsPage() {
  return (
    <div>
      <h3>Settings Page</h3>
      <p>Settings would normally be lazily loaded.</p>
    </div>
  )
}

// ─── DEMO ────────────────────────────────────────────────────────

export function CodeSplittingDemo() {
  const [route, setRoute] = useState<Route>('home')

  const renderRoute = () => {
    switch (route) {
      case 'home':
        return <HomePage />
      case 'dashboard':
        return (
          <LazyLoad>
            <HeavyDashboard userId="user-42" />
          </LazyLoad>
        )
      case 'settings':
        return <SettingsPage />
    }
  }

  return (
    <div className="pattern-example">
      <h1>Code Splitting & Lazy Loading</h1>

      <pre><code>{`// Lazy-load a component
const Dashboard = lazy(() => import('./Dashboard'))

// Suspense shows a fallback while loading
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>

// Route-based splitting (most common)
<Route path="/dashboard" element={
  <Suspense fallback={<PageSkeleton />}>
    <DashboardPage />
  </Suspense>
} />`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Route-Based Splitting Simulation</h2>
          <div className="route-nav">
            <button onClick={() => setRoute('home')}>Home</button>
            <button onClick={() => setRoute('dashboard')}>
              Dashboard (lazy)
            </button>
            <button onClick={() => setRoute('settings')}>
              Settings (lazy)
            </button>
          </div>
          <div className="route-content">{renderRoute()}</div>
          <p className="hint">
            The Dashboard route uses React.lazy with a 2s delay
            simulation. In production, the chunk would be a separate file.
          </p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>How does React.lazy work?</strong> It calls a dynamic import (<code>import()</code>) and returns a new component type that can be rendered inside a <code>Suspense</code> boundary.</li>
          <li><strong>What does Suspense do?</strong> Suspense "catches" the promise thrown by React.lazy and renders a fallback until the chunk resolves.</li>
          <li><strong>Who should code-split?</strong> Start with route-based splitting (one chunk per route). Then split heavy components (charts, editors, PDF viewers) that aren't immediately visible.</li>
          <li><strong>What are the downsides of code splitting?</strong> Extra network requests, layout shift if fallback is sized differently, and complexity in managing loading states.</li>
          <li><strong>Can you use Suspense for data fetching?</strong> Yes, React 19's <code>use</code> Hook integrates with Suspense for data fetching. In React 18, use libraries like Relay or React Query which support Suspense.</li>
        </ol>
      </section>
    </div>
  )
}
