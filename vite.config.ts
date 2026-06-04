import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Test configuration lives in vitest.config.ts so the production build config
// stays free of Vitest's UserConfig type augmentation (which ships a broken
// self-referential `config.d.ts` shim in this Vitest version and breaks
// `tsc -b`).
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers so the minifier can drop legacy transpilation
    // overhead — shrinks bundles and improves TBT on the main thread.
    target: 'es2020',
    cssCodeSplit: true,
    // Inline assets under 4 KB as base64 data URIs to save HTTP round trips
    // (helps LCP on throttled mobile); larger assets stay as cached files.
    assetsInlineLimit: 4096,
    // Reserve the chunk-size warning for genuinely large chunks.
    chunkSizeWarningLimit: 600,
    minify: true,
    rollupOptions: {
      output: {
        // Split long-lived vendor code into its own cache-friendly chunks so
        // that app changes don't bust the React/router/highlight.js caches.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('highlight.js')) return 'highlight'
            if (
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})
