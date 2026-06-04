---
name: project-lighthouse-context
description: Lighthouse audit context for this SPA — deploy target, color-contrast traps, and what was already optimized
metadata:
  type: project
---

This is a client-rendered React Router SPA (no SSR). Goal: all-green Lighthouse (Perf/A11y/Best-Practices/SEO ≥ 90) on mobile + desktop.

**Deploy target:** https://reactpatterns.netlify.app/ (from README). Canonical/OG URLs and public/robots.txt sitemap point here — keep them in sync if the domain changes.

**Already well-optimized (don't redo):**
- App.tsx lazy-loads all 14 pattern components via React.lazy + a single Suspense boundary.
- highlight.js uses `highlight.js/lib/core` with only javascript/typescript/xml registered (avoids the ~1.1 MB full bundle). Highlighting is done via a rAF-batched MutationObserver in `HighlightOnNavigate`, not highlightAll().
- vite.config manualChunks splits `react-vendor` (~213 kB / 68 kB gz) and `highlight` (~36 kB) into cached vendor chunks.

**Color-contrast traps (WCAG AA 4.5:1) — these bright accent tokens FAIL with light text and must use deepened variants:**
- Badges/buttons with WHITE text: bright `#22c55e`/`#f59e0b`/`#ef4444`/`#60a5fa` only hit ~2.2–3.8:1. Use `--color-success-deep #15803d`, `--color-warning-deep #b45309`, `--color-error-deep #b91c1c`, `--color-action #2563eb`.
- Difficulty badge colors come from JS (`difficultyColors` in App.tsx), not CSS — fix them there too.
- Small error TEXT on the card surface: `#ef4444` = 3.89:1 (fails). Use `--color-error-text #f87171`.
- `--color-text-dim` was `#64748b` (3.07–3.75:1, fails); bumped to `#8593a8`.
- Bright accents as TEXT on the dark `--color-bg` (home section titles) DO pass — only light-on-color and text-on-surface combos fail.

**SPA caveat:** Lighthouse audits the rendered DOM at `/`. The teaching `console.log`/`console.error` calls live in lazy demo chunks (HOC, Memoization, ErrorBoundaries) and only fire on user interaction, not on initial load — they don't affect the audit on `/`. Left intact as educational content.
