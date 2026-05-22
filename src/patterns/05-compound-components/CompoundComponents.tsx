import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from 'react'

/**
 * ========================================
 * PATTERN: Compound Components
 * ========================================
 *
 * WHAT IT IS:
 * Compound Components are a set of related components that work together
 * and share implicit state. Think of HTML's <select> and <option> —
 * they share state (which option is selected) without you passing it
 * explicitly.
 *
 * In React, we achieve this with Context. The parent component
 * (e.g., <Tabs>) provides state to its children (<Tab>, <TabPanel>)
 * through React Context, so they synchronize automatically.
 *
 * WHY IT MATTERS (Interview):
 * - One of the most elegant APIs in React
 * - Used by major libraries: Reach UI, Radix UI, Chakra UI, Headless UI
 * - Demonstrates mastery of Context + composition
 * - Gives consumers a declarative, HTML-like API
 */

// ─── 1. TABS ─────────────────────────────────────────────────────
// Classic example: Tabs, TabList, Tab, TabPanel

interface TabsContextValue {
  activeIndex: number
  setActiveIndex: (index: number) => void
  tabId: (index: number) => string
  panelId: (index: number) => string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>')
  return ctx
}

interface TabsProps {
  defaultIndex?: number
  children: ReactNode
}

export function Tabs({ defaultIndex = 0, children }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  const ctx: TabsContextValue = {
    activeIndex,
    setActiveIndex,
    tabId: (i: number) => `tab-${i}`,
    panelId: (i: number) => `panel-${i}`,
  }

  return (
    <TabsContext.Provider value={ctx}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>
}

interface TabProps {
  index: number
  children: ReactNode
}

export function Tab({ index, children }: TabProps) {
  const { activeIndex, setActiveIndex, tabId, panelId } = useTabsContext()
  const isActive = index === activeIndex

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      setActiveIndex(index)
    },
    [index, setActiveIndex],
  )

  return (
    <button
      id={tabId(index)}
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId(index)}
      className={`tab ${isActive ? 'tab--active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

interface TabPanelProps {
  index: number
  children: ReactNode
}

export function TabPanel({ index, children }: TabPanelProps) {
  const { activeIndex, tabId, panelId } = useTabsContext()
  if (index !== activeIndex) return null

  return (
    <div
      id={panelId(index)}
      role="tabpanel"
      aria-labelledby={tabId(index)}
      className="tab-panel"
    >
      {children}
    </div>
  )
}

// ─── 2. ACCORDION ────────────────────────────────────────────────
// Another compound component: only one section open at a time.

interface AccordionContextValue {
  openIndex: number | null
  toggleIndex: (index: number) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('Accordion compound components must be used within <Accordion>')
  return ctx
}

interface AccordionProps {
  defaultOpen?: number | null
  children: ReactNode
}

export function Accordion({ defaultOpen = null, children }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen)

  const toggleIndex = useCallback((index: number) => {
    setOpenIndex(prev => (prev === index ? null : index))
  }, [])

  return (
    <AccordionContext.Provider value={{ openIndex, toggleIndex }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ index, children }: { index: number; children: ReactNode }) {
  const { openIndex, toggleIndex } = useAccordionContext()
  const isOpen = openIndex === index

  return (
    <div className={`accordion-item ${isOpen ? 'accordion-item--open' : ''}`}>
      {typeof children === 'function'
        ? (children as (props: { isOpen: boolean; toggle: () => void }) => ReactNode)({
            isOpen,
            toggle: () => toggleIndex(index),
          })
        : children}
    </div>
  )
}

export function AccordionHeader({
  index,
  children,
}: {
  index: number
  children: ReactNode
}) {
  const { openIndex, toggleIndex } = useAccordionContext()
  const isOpen = openIndex === index

  return (
    <button
      className={`accordion-header ${isOpen ? 'accordion-header--open' : ''}`}
      onClick={() => toggleIndex(index)}
      aria-expanded={isOpen}
    >
      {children}
      <span className="accordion-chevron">{isOpen ? '▲' : '▼'}</span>
    </button>
  )
}

export function AccordionPanel({ index, children }: { index: number; children: ReactNode }) {
  const { openIndex } = useAccordionContext()
  if (openIndex !== index) return null

  return <div className="accordion-panel">{children}</div>
}

// ─── DEMO ────────────────────────────────────────────────────────

export function CompoundComponentsDemo() {
  return (
    <div className="pattern-example">
      <h1>Compound Components</h1>

      <pre><code>{`// Parent provides shared state via Context
function Tabs({ children }) {
  const [active, setActive] = useState(0)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

// Children consume context automatically
function Tab({ index, children }) {
  const { active, setActive } = useTabsContext()
  return <button onClick={() => setActive(index)}>{children}</button>
}

function TabPanel({ index, children }) {
  const { active } = useTabsContext()
  return active === index ? <div>{children}</div> : null
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Tabs</h2>
          <Tabs defaultIndex={0}>
            <TabList>
              <Tab index={0}>React</Tab>
              <Tab index={1}>Vue</Tab>
              <Tab index={2}>Angular</Tab>
            </TabList>
            <TabPanel index={0}>
              <p>A library for building user interfaces.</p>
            </TabPanel>
            <TabPanel index={1}>
              <p>The Progressive JavaScript Framework.</p>
            </TabPanel>
            <TabPanel index={2}>
              <p>A platform for building mobile and desktop web applications.</p>
            </TabPanel>
          </Tabs>
        </div>

        <div className="demo-card">
          <h2>Accordion</h2>
          <Accordion>
            <AccordionItem index={0}>
              <AccordionHeader index={0}>What is compound components?</AccordionHeader>
              <AccordionPanel index={0}>
                <p>A pattern where multiple components share implicit state via Context, giving consumers a declarative API.</p>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem index={1}>
              <AccordionHeader index={1}>How does it work?</AccordionHeader>
              <AccordionPanel index={1}>
                <p>The parent creates Context with shared state. Children read that Context and synchronize their behavior automatically.</p>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem index={2}>
              <AccordionHeader index={2}>When should I use it?</AccordionHeader>
              <AccordionPanel index={2}>
                <p>When you have a group of components that are always used together and need to share internal state (Tabs, Accordions, Menus, Selects).</p>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What are compound components?</strong> A set of components that work together by sharing implicit state via Context. They give consumers an HTML-like declarative API.</li>
          <li><strong>How do compound components share state?</strong> Through React Context. The parent provides state/methods, children consume them.</li>
          <li><strong>What's the alternative to compound components?</strong> A single component with many props (e.g., <code>{'<Tabs tabs={[...]} activeIndex={0} onTabChange={fn} />'}</code>). Compound components are more flexible but require more code.</li>
          <li><strong>Compound vs Render Props — which is better?</strong> They solve different problems. Compound is for groups of related components that share state. Render props is for giving consumers control over a single component's output.</li>
        </ol>
      </section>
    </div>
  )
}
