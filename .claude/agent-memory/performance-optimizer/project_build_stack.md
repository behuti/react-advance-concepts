---
name: project-build-stack
description: This project runs on rolldown-vite (Vite 8) — esbuild-specific build options are NOT typed/supported
metadata:
  type: project
---

The project builds with Vite 8.0.x, which is the **rolldown-vite** flavor (oxc minifier, not esbuild).

**Why:** package.json pins `vite ^8.0.12`. The build pipeline is `tsc -b && vite build`.

**How to apply:**
- Do NOT add `esbuild: { drop: [...] }` to vite.config.ts — `drop` is not in the `ESBuildOptions` type here and `tsc -b` fails with TS2769 before the build runs.
- Use `build.minify: true` (oxc handles minification). To strip console in prod, find a rolldown/oxc-compatible mechanism, not the esbuild `drop` option.
- Test config is deliberately split into `vitest.config.ts` so the prod build's `tsc -b` is not type-checked against Vitest's UserConfig augmentation (which ships a broken self-referential `config.d.ts` in this Vitest version). Keep them separate.
- `tsc -b` runs before `vite build`, so any type error in config files blocks the whole build.
