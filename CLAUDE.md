# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build (tsc -b && vite build)
npm run preview      # Serve the dist/ folder locally
npm run lint         # ESLint
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Run tests in watch mode
```

Run a single test file:
```bash
npx vitest run src/patterns/01-component-composition/ComponentComposition.test.tsx
```

## Architecture

This is a **React 19 + Vite 8 SPA** — a study guide for 14 React design patterns. There is no backend.

### Routing and code splitting

`src/App.tsx` owns all routing. Each of the 14 pattern routes is a `React.lazy` import wrapped in a single `<Suspense>` at the app level. This means each pattern ships as its own chunk; the `patternComponents` map in `App.tsx` is the canonical place to register a new pattern route.

### Pattern structure

Each pattern lives under `src/patterns/<NN>-<slug>/`. A pattern directory contains:
- A `<PatternName>.tsx` — implementation + demo, with the `Demo` component exported as a named export (e.g. `ComponentCompositionDemo`)
- A `<PatternName>.test.tsx` — Vitest + Testing Library tests

The registry of all patterns (slug, title, description, difficulty, order) is in `src/patterns/patternList.ts`. The `PatternMeta` type is in `src/patterns/types.ts`. Both are re-exported from `src/patterns/index.ts`.

### highlight.js

`App.tsx` imports **only the highlight.js core** (`highlight.js/lib/core`) and registers three languages: `javascript`, `typescript`, and `xml` (for JSX). Do not switch to the default `highlight.js` entry — it bundles ~190 grammars and balloons the main chunk by ~1 MB.

Syntax highlighting is applied by `HighlightOnNavigate` (in `App.tsx`), which uses a `MutationObserver` + `requestAnimationFrame` to highlight only `pre code:not(.hljs)` blocks so already-processed blocks are never re-highlighted on navigation.

### Build config split

`vite.config.ts` is **build-only** — it contains no Vitest config. `vitest.config.ts` is **test-only**. This separation exists because Vitest's config type augmentation breaks `tsc -b` when mixed into `vite.config.ts` in this version of Vitest.

### Bundle chunking

`vite.config.ts` splits vendor code into two manual chunks:
- `react-vendor` — React, React DOM, React Router, scheduler
- `highlight` — highlight.js

Pattern components are automatically split by the lazy imports in `App.tsx`.

### Adding a new pattern

1. Create `src/patterns/<NN>-<slug>/<PatternName>.tsx` with a named `<PatternName>Demo` export.
2. Add the metadata entry to `src/patterns/patternList.ts`.
3. Add a `React.lazy` entry to the `patternComponents` map in `src/App.tsx`.
4. Add a `<PatternName>.test.tsx` alongside the implementation.
