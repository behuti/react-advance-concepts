import { type ElementType, type ReactNode } from 'react'

/**
 * ========================================
 * PATTERN: Component Composition
 * ========================================
 *
 * WHAT IT IS:
 * Component Composition is the practice of building complex UIs by
 * combining smaller, focused components. Instead of having one large
 * component that does everything, you break it into small pieces and
 * compose them together.
 *
 * WHY IT MATTERS (Interview):
 * - "Composition over inheritance" is a core React philosophy
 * - React has no built-in inheritance system — composition IS the
 *   mechanism for code reuse
 * - Enables flexible, maintainable component APIs
 * - Reduces prop drilling by letting parent components control layout
 *
 * SUB-PATTERNS COVERED:
 * 1. children prop — the most basic composition mechanism
 * 2. Slot props — named sections (header, footer, sidebar, etc.)
 * 3. "as" prop (Polymorphic) — change the rendered HTML element
 */

// ─── 1. CHILDREN PROP ────────────────────────────────────────────
// The simplest form of composition. Any component can render anything
// passed between its opening/closing tags via `props.children`.

interface CardProps {
  title: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <article className="card">
      <h2 className="card__title">{title}</h2>
      <div className="card__body">{children}</div>
    </article>
  )
}

// Usage:
// <Card title="Hello">
//   <p>This content is injected via children</p>
// </Card>

// ─── 2. SLOT PROPS ───────────────────────────────────────────────
// When a component needs multiple insertion points, pass them as
// named props rather than relying solely on `children`.

interface SplitPanelProps {
  left: ReactNode
  right: ReactNode
}

export function SplitPanel({ left, right }: SplitPanelProps) {
  return (
    <div className="split-panel">
      <aside className="split-panel__left">{left}</aside>
      <main className="split-panel__right">{right}</main>
    </div>
  )
}

// Usage:
// <SplitPanel
//   left={<Sidebar />}
//   right={<MainContent />}
// />

// ─── 3. "AS" PROP (Polymorphic Component) ───────────────────────
// Sometimes you want a component to render as a different HTML element
// depending on context (e.g., a `<Button>` that renders as `<a>` when
// given an href). The `as` prop makes this possible.

interface PolymorphicProps<C extends ElementType> {
  as?: C
  children: ReactNode
  className?: string
}

export function Box<C extends ElementType = 'div'>({
  as,
  children,
  className,
  ...rest
}: PolymorphicProps<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof PolymorphicProps<C>>) {
  const Component = as ?? 'div'
  return (
    <Component className={className} {...rest}>
      {children}
    </Component>
  )
}

// Usage:
// <Box as="section">Renders as <section></Box>
// <Box as="article">Renders as <article></Box>
// <Box>Renders as <div> by default</Box>

// ─── 4. FULL EXAMPLE: Layout with Multiple Composition Patterns ──

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
  footer: ReactNode
}

export function Layout({ header, sidebar, children, footer }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout__header">{header}</header>
      <div className="layout__body">
        <nav className="layout__sidebar">{sidebar}</nav>
        <main className="layout__main">{children}</main>
      </div>
      <footer className="layout__footer">{footer}</footer>
    </div>
  )
}

export function ListContainer({ children }: { children: ReactNode }) {
  return <ul className="list-container">{children}</ul>
}

export function ListItem({ children }: { children: ReactNode }) {
  return <li className="list-item">{children}</li>
}

// Usage:
// <ListContainer>
//   <ListItem>Item 1</ListItem>
//   <ListItem>Item 2</ListItem>
// </ListContainer>

// ─── DEMO COMPONENT ──────────────────────────────────────────────
export function ComponentCompositionDemo() {
  return (
    <div className="pattern-example">
      <h1>Component Composition</h1>

      <pre><code>{`// children prop
function Card({ title, children }) {
  return <div>{children}</div>
}

// slot props
function SplitPanel({ left, right }) {
  return <aside>{left}</aside>
}

// polymorphic "as" prop
function Box({ as: Tag = 'div', ...props }) {
  return <Tag {...props} />
}`}</code></pre>

      <Card title="What is Composition?">
        <p>
          Composition means building complex UIs from smaller pieces.
          This component receives <code>children</code> — anything you
          put between <code>{'<Card>'}</code> tags appears here.
        </p>
      </Card>

      <SplitPanel
        left={
          <Card title="Left Slot">
            <p>This comes via the <code>left</code> prop</p>
          </Card>
        }
        right={
          <Card title="Right Slot">
            <p>This comes via the <code>right</code> prop</p>
          </Card>
        }
      />

      <Box as="section" className="highlight-box">
        <p>I render as a {'<section>'} because of the <code>as</code> prop.</p>
      </Box>

      {/* ─── KEY INSIGHTS ─── */}
      <Card title="Interview Questions">
        <ol>
          <li><strong>Why composition over inheritance?</strong> React components use a "has-a" model, not an "is-a" model. Composition is more flexible, easier to test, and avoids tight coupling.</li>
          <li><strong>What is the "as" prop?</strong> It allows a component to render as a different HTML element or custom component, making it polymorphic.</li>
          <li><strong>When to use slot props vs children?</strong> Use <code>children</code> for a single content area. Use slots (named props) when you have multiple, distinct insertion points like header/sidebar/footer.</li>
          <li><strong>What are the downsides of composition?</strong> It can lead to "wrapper hell" with deeply nested JSX. Extract clean components to mitigate this.</li>
        </ol>
      </Card>
    </div>
  )
}
