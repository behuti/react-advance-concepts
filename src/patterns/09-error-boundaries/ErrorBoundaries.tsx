/* eslint-disable react-refresh/only-export-components */
import { Component, useState, type ReactNode, type ErrorInfo, type ComponentType } from 'react'

/**
 * ========================================
 * PATTERN: Error Boundaries
 * ========================================
 *
 * WHAT IT IS:
 * Error boundaries are React components that catch JavaScript errors
 * anywhere in their child component tree, log those errors, and
 * display a fallback UI instead of the crashed component tree.
 *
 * WHY IT MATTERS (Interview):
 * - Prevents the entire app from unmounting when one component crashes
 * - Essential for production-grade applications
 * - Demonstrates understanding of React's error handling model
 *
 * KEY FACTS:
 * - Error boundaries MUST be class components (no Hook equivalent yet)
 * - They catch errors in render, lifecycle methods, and constructors
 * - They do NOT catch errors in event handlers, async code, or SSR
 * - Use try/catch for event handlers; error boundaries for rendering
 */

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    console.error('[ErrorBoundary] Caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset)
      }
      return this.props.fallback ?? (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: ErrorBoundaryProps['fallback'],
) {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WithErrorBoundary
}

function BuggyComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated render error!')
  }
  return <p>This component is working fine. Click "Trigger Error" to crash it.</p>
}

export function ErrorBoundariesDemo() {
  const [shouldThrow, setShouldThrow] = useState(false)

  const handleReset = () => setShouldThrow(false)

  return (
    <div className="pattern-example">
      <h1>Error Boundaries</h1>

      <pre><code>{`// Error boundary (must be a class component)
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) { /* log error */ }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// Usage: wraps risky components
<ErrorBoundary fallback={<p>Something crashed</p>}>
  <BuggyComponent />
</ErrorBoundary>`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Error Boundary Demo</h2>
          <ErrorBoundary
            onError={(error) => console.error('Custom handler:', error)}
            fallback={(error, reset) => (
              <div className="error-boundary-fallback">
                <h2>Oops! A crash occurred.</h2>
                <p><strong>Error:</strong> {error.message}</p>
                <button onClick={() => { reset(); handleReset() }}>
                  Try again
                </button>
              </div>
            )}
          >
            <BuggyComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
          <button onClick={() => setShouldThrow(true)} disabled={shouldThrow}>
            Trigger Error
          </button>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What does an error boundary catch?</strong> Errors during rendering, lifecycle methods, and constructors of the whole tree below them. It does NOT catch errors in event handlers, async code (setTimeout, Promises), or SSR.</li>
          <li><strong>Why must error boundaries be class components?</strong> Because only class components have <code>getDerivedStateFromError</code> and <code>componentDidCatch</code> lifecycle methods. There is no Hook equivalent yet.</li>
          <li><strong>How do you handle errors in event handlers?</strong> Use try/catch. Error boundaries won't catch those because event handlers execute outside React's render phase.</li>
          <li><strong>Where should you place error boundaries?</strong> At key layout boundaries: around each major route, around widgets, around the entire app as a last resort.</li>
        </ol>
      </section>
    </div>
  )
}
