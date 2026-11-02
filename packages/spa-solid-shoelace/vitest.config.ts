import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  // Solid's default export condition is its SSR build; components need the DOM one.
  resolve: { conditions: ['development', 'browser'] },
  test: {
    globals: true,
    passWithNoTests: true,
    // Process the prebuilt bundle's ?inline CSS so its injection can be tested.
    css: { include: [/renderer-styles/] },
    // vite-plugin-solid defaults vitest to jsdom; plain .ts tests run in node.
    environment: 'node',
    // Component tests (.tsx) opt into jsdom with a `@vitest-environment` comment.
    include: ['ui/**/*.test.ts', 'ui/**/*.test.tsx'],
  },
});
