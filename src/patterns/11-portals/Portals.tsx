/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * ========================================
 * PATTERN: Portals
 * ========================================
 *
 * WHAT IT IS:
 * Portals let you render a React tree into a DOM node that exists
 * OUTSIDE the parent component's DOM hierarchy, while keeping it
 * inside the React component hierarchy (events, context, etc. work).
 *
 *   createPortal(children, domNode)
 *
 * WHY IT MATTERS (Interview):
 * - Essential for modals, tooltips, dropdowns, toasts
 * - Avoids z-index/overflow/clipping issues from parent containers
 * - Events bubble through React tree, not DOM tree
 * - Server-rendered portals need extra care (no `document` on server)
 */

// ─── 1. MODAL PORTAL ─────────────────────────────────────────────
// Renders a modal overlay outside the root div to avoid stacking
// context and z-index issues.

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

// ─── 2. TOOLTIP PORTAL ───────────────────────────────────────────
// Renders a tooltip that follows a target element, but renders
// at the document body level to avoid overflow clipping.

interface TooltipProps {
  content: ReactNode
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const targetRef = useRef<HTMLDivElement>(null)

  const show = () => {
    if (!targetRef.current) return
    const rect = targetRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    })
    setIsVisible(true)
  }

  const hide = () => setIsVisible(false)

  return (
    <>
      <div
        ref={targetRef}
        className="tooltip-target"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="tooltip-portal"
            style={{
              top: position.top,
              left: position.left,
            }}
            role="tooltip"
          >
            {content}
            <div className="tooltip-arrow" />
          </div>,
          document.body,
        )}
    </>
  )
}

// ─── 3. TOAST PORTAL ─────────────────────────────────────────────
// Manages a stack of toast notifications rendered at the document level.

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toastIdCounter = 0
let addToastGlobal: ((message: string, type?: Toast['type']) => void) | null = null

export function triggerToast(message: string, type: Toast['type'] = 'info') {
  addToastGlobal?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastGlobal = (message: string, type: Toast['type'] = 'info') => {
      const id = `toast-${++toastIdCounter}`
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
    return () => { addToastGlobal = null }
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  )
}

// ─── DEMO ────────────────────────────────────────────────────────

export function PortalsDemo() {
  const [isModalOpen, setModalOpen] = useState(false)

  return (
    <div className="pattern-example">
      <h1>Portals</h1>

      <pre><code>{`// Render children into a different DOM node
import { createPortal } from 'react-dom'

function Modal({ isOpen, children }) {
  if (!isOpen) return null
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body  // renders outside the React root
  )
}

// Events still bubble through the React tree,
// not the DOM tree — context works normally.`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Modal Portal</h2>
          <p>
            The modal renders in <code>document.body</code> via
            createPortal, so it's not affected by parent container styles.
          </p>
          <button onClick={() => setModalOpen(true)}>Open Modal</button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            title="Portal Example"
          >
            <p>
              This content is rendered via <code>createPortal</code> into
              <code> document.body</code>. Open DevTools to see it outside
              the React root!
            </p>
            <p>
              Events, context, and React state still work normally because
              portals preserve the React component hierarchy.
            </p>
          </Modal>
        </div>

        <div className="demo-card">
          <h2>Tooltip Portal</h2>
          <p>
            Hover the text below. The tooltip renders at the document
            root to avoid overflow clipping.
          </p>
          <Tooltip content="This tooltip is rendered via createPortal!">
            <span className="tooltip-trigger">Hover me</span>
          </Tooltip>
        </div>

        <div className="demo-card">
          <h2>Toast Portal</h2>
          <p>Notifications stack at the document level.</p>
          <button onClick={() => triggerToast('Operation successful!', 'success')}>
            Success Toast
          </button>
          <button onClick={() => triggerToast('Something went wrong.', 'error')}>
            Error Toast
          </button>
          <button onClick={() => triggerToast('New update available.', 'info')}>
            Info Toast
          </button>
        </div>
      </section>

      <ToastContainer />

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What problem do portals solve?</strong> They let you render content outside the parent's DOM subtree (solving z-index, overflow, clip issues) while keeping it inside the React tree (events bubble correctly, context works).</li>
          <li><strong>Do portal events bubble through the React tree or the DOM tree?</strong> React tree. An event dispatched inside a portal will bubble to ancestors in the React tree, NOT the DOM ancestors.</li>
          <li><strong>What's the server rendering concern with portals?</strong> On the server, <code>document.body</code> doesn't exist. You need to conditionally render or use a different approach. Next.js handles this with <code>useEffect</code> gating.</li>
          <li><strong>How do you test portal components?</strong> The portal renders to <code>document.body</code> in test environments as well. Use <code>screen.getByText()</code> to find portal content.</li>
        </ol>
      </section>
    </div>
  )
}
