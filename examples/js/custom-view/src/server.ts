import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { AppSpec, RatingSpec } from './spec';

const app = express();
app.use(express.json());

const __dir = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(__dir, '../dist/client');

// Config the client SPA reads on boot. `apiBase` tells retrofit-ui where to
// resolve endpoint URLs referenced inside specs. `theme` is applied client-
// side and flows through both built-in views and our custom RatingView.
const theme = {
  cssVariables: {
    // Violet primary scale — same tokens the built-in views consume, so our
    // custom view can pick up `var(--sl-color-primary-*)` without knowing
    // anything about the theme payload.
    '--sl-color-primary-50': '#f5f3ff',
    '--sl-color-primary-100': '#ede9fe',
    '--sl-color-primary-200': '#ddd6fe',
    '--sl-color-primary-300': '#c4b5fd',
    '--sl-color-primary-400': '#a78bfa',
    '--sl-color-primary-500': '#8b5cf6',
    '--sl-color-primary-600': '#7c3aed',
    '--sl-color-primary-700': '#6d28d9',
    '--sl-color-primary-800': '#5b21b6',
    '--sl-color-primary-900': '#4c1d95',
    '--sl-color-primary-950': '#2e1065',
  },
  // extraCss deliberately targets BOTH surfaces:
  //   - `.retrofit-page-title` is used by built-in views AND our custom one
  //   - `.retrofit-stat-value` is built-in
  //   - `.custom-rating-star--filled` is our own, namespaced class
  extraCss: `
    .retrofit-page-title { color: var(--sl-color-primary-700); }
    .retrofit-stat-value { color: var(--sl-color-primary-700); }
    .custom-rating-star--filled { color: var(--sl-color-primary-600); }
  `,
};
app.get('/retrofit.json', (_req, res) => res.json({ apiBase: '/api', theme }));

// A "regular" retrofit-ui spec (built-in kind). Renders via the stock
// SpecRenderer — nothing custom required.
app.get('/api/hello-stat', (_req, res) => {
  const spec: AppSpec = {
    kind: 'stat',
    stats: [
      { label: 'Reviews', value: 128, format: 'number' },
      { label: 'Average score', value: 4.35, format: 'number' },
    ],
    metadata: { title: 'Built-in stat view' },
  };
  res.json(spec);
});

// A custom spec (kind: 'rating'). The stock SpecRenderer would emit
// "Unknown spec kind"; our client's ExtendedRenderer handles it.
app.get('/api/product-ratings', (_req, res) => {
  const spec: RatingSpec = {
    kind: 'rating',
    metadata: { title: 'Product ratings' },
    items: [
      { label: 'Aeropress', score: 4.5, note: 'Reliable, easy to clean.' },
      { label: 'V60', score: 4, note: 'Great when you dial it in.' },
      { label: 'French press', score: 3, note: 'Silty.' },
      { label: 'Moka pot', score: 3.5 },
    ],
  };
  res.json(spec);
});

// Serve the built Vite client (after `pnpm build`). During dev the SPA is
// served by Vite on a different port; this only kicks in for e2e / prod.
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`custom-view API running at http://localhost:${PORT}`);
});
