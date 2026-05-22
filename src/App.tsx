import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.css'
import { patternList } from './patterns'
import type { PatternMeta } from './patterns'

const patternComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'component-composition': lazy(() =>
    import('./patterns/01-component-composition/ComponentComposition').then(m => ({
      default: m.ComponentCompositionDemo,
    })),
  ),
  'custom-hooks': lazy(() =>
    import('./patterns/02-custom-hooks/CustomHooks').then(m => ({
      default: m.CustomHooksDemo,
    })),
  ),
  'render-props': lazy(() =>
    import('./patterns/03-render-props/RenderProps').then(m => ({
      default: m.RenderPropsDemo,
    })),
  ),
  'higher-order-components': lazy(() =>
    import('./patterns/04-higher-order-components/HigherOrderComponents').then(m => ({
      default: m.HigherOrderComponentsDemo,
    })),
  ),
  'compound-components': lazy(() =>
    import('./patterns/05-compound-components/CompoundComponents').then(m => ({
      default: m.CompoundComponentsDemo,
    })),
  ),
  'controlled-uncontrolled': lazy(() =>
    import('./patterns/06-controlled-uncontrolled/ControlledUncontrolled').then(m => ({
      default: m.ControlledUncontrolledDemo,
    })),
  ),
  'provider-pattern': lazy(() =>
    import('./patterns/07-provider-pattern/ProviderPattern').then(m => ({
      default: m.ProviderPatternDemo,
    })),
  ),
  'container-presentational': lazy(() =>
    import('./patterns/08-container-presentational/ContainerPresentational').then(m => ({
      default: m.ContainerPresentationalDemo,
    })),
  ),
  'error-boundaries': lazy(() =>
    import('./patterns/09-error-boundaries/ErrorBoundaries').then(m => ({
      default: m.ErrorBoundariesDemo,
    })),
  ),
  'memoization': lazy(() =>
    import('./patterns/10-memoization/Memoization').then(m => ({
      default: m.MemoizationDemo,
    })),
  ),
  'portals': lazy(() =>
    import('./patterns/11-portals/Portals').then(m => ({
      default: m.PortalsDemo,
    })),
  ),
  'code-splitting': lazy(() =>
    import('./patterns/12-code-splitting/CodeSplitting').then(m => ({
      default: m.CodeSplittingDemo,
    })),
  ),
  'state-reducer': lazy(() =>
    import('./patterns/13-state-reducer/StateReducer').then(m => ({
      default: m.StateReducerDemo,
    })),
  ),
  'props-getters': lazy(() =>
    import('./patterns/14-props-getters/PropsGetters').then(m => ({
      default: m.PropsGettersDemo,
    })),
  ),
}

const difficultyColors: Record<PatternMeta['difficulty'], string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1>React Patterns</h1>
        <p className="sidebar-subtitle">Interview Study Guide</p>
      </div>
      <ul className="sidebar-nav">
        {patternList.map(pattern => (
          <li key={pattern.slug}>
            <NavLink
              to={`/pattern/${pattern.slug}`}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
            >
              <span className="sidebar-link-order">{pattern.order}.</span>
              <span className="sidebar-link-title">{pattern.title}</span>
              <span
                className="sidebar-link-difficulty"
                style={{ backgroundColor: difficultyColors[pattern.difficulty] }}
              >
                {pattern.difficulty}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      <h1>React Patterns & Best Practices</h1>
      <p className="home-subtitle">
        A comprehensive guide to React design patterns for technical interview preparation.
        Each pattern includes a detailed explanation, live code examples, and common interview questions.
      </p>

      <div className="home-grid">
        {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
          <div key={level} className="home-section">
            <h2 className={`home-section-title level-${level}`}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </h2>
            <ul className="home-pattern-list">
              {patternList
                .filter(p => p.difficulty === level)
                .map(p => (
                  <li key={p.slug}>
                    <NavLink to={`/pattern/${p.slug}`}>
                      {p.order}. {p.title}
                    </NavLink>
                    <p>{p.description}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatternFallback() {
  return (
    <div className="pattern-loading">
      <div className="spinner">Loading pattern...</div>
    </div>
  )
}

function HighlightOnNavigate() {
  const location = useLocation()

  useEffect(() => {
    try {
      hljs.highlightAll()
    } catch {
      // highlight.js errors should not break the app
    }

    const main = document.querySelector('.main-content')
    if (!main) return

    const observer = new MutationObserver(() => {
      const blocks = main.querySelectorAll<HTMLElement>('pre code:not(.hljs)')
      blocks.forEach(block => {
        try {
          hljs.highlightElement(block)
        } catch {
          // individual block failures should not break the app
        }
      })
    })

    observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <HighlightOnNavigate />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Suspense fallback={<PatternFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {patternList.map(pattern => {
                const Component = patternComponents[pattern.slug]
                return (
                  <Route
                    key={pattern.slug}
                    path={`/pattern/${pattern.slug}`}
                    element={Component ? <Component /> : <PatternFallback />}
                  />
                )
              })}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}
