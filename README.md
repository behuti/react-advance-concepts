# ⚛️ React Pro Concepts

> **Master React design patterns — one interactive example at a time.**

A hands-on study guide covering **14 essential React patterns** with live demos, concise code samples, and interview-ready Q&A.

---

## 📚 Patterns

### 🟢 Beginner
| # | Pattern | What it teaches |
|---|---------|----------------|
| 1 | **Component Composition** | `children`, slot props, polymorphic `as` prop |
| 8 | **Container / Presentational** | Separating logic from rendering |

### 🟡 Intermediate
| # | Pattern | What it teaches |
|---|---------|----------------|
| 2 | **Custom Hooks** | Logic reuse with `useLocalStorage`, `useDebounce`, `useMediaQuery` |
| 3 | **Render Props** | Sharing state via function props (`MouseTracker`, `Toggle`) |
| 4 | **Higher-Order Components** | `withLoading`, `withAuth`, `composeHocs` |
| 6 | **Controlled vs Uncontrolled** | Form state ownership, `FlexibleInput` dual-mode |
| 7 | **Provider Pattern** | Context + `useReducer` for global state (Auth, Theme) |
| 9 | **Error Boundaries** | Class-based error catching, custom fallbacks |
| 10 | **Memoization** | `React.memo`, `useMemo`, `useCallback` |
| 11 | **Portals** | `createPortal` for modals, tooltips, toasts |
| 12 | **Code Splitting** | `React.lazy` + `Suspense` for route/component splitting |

### 🔴 Advanced
| # | Pattern | What it teaches |
|---|---------|----------------|
| 5 | **Compound Components** | Implicit state via Context (`Tabs`, `Accordion`) |
| 13 | **State Reducer** | Inversion of control with custom reducers |
| 14 | **Props Getters** | Headless component APIs (`useSelect`, `useValidatedInput`) |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and pick a pattern from the sidebar.

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests (vitest) |

---

## 🎨 Features

- **Code examples** on every page with Monokai syntax highlighting
- **Live demos** — interact with each pattern directly in the browser
- **Interview questions** — common Q&A for each pattern
- **Dark theme** — easy on the eyes for late-night studying
- **Lazy-loaded routes** — each pattern is its own chunk

---

## 👥 Contributors

- [behuti](https://github.com/behuti) — creator
- [opencode](https://opencode.ai) — collaborator

---

<p align="center">Built with React 19, TypeScript, and Vite</p>
