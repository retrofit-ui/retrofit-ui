import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    globals: true,
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['ui/**/*.test.ts', 'ui/**/*.test.tsx'],
  },
});
