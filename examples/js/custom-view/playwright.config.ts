import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    // Build the SPA once, then boot Express which serves both the API and
    // the built client on a single port.
    command: 'pnpm exec vite build && PORT=3000 pnpm exec tsx src/server.ts',
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
