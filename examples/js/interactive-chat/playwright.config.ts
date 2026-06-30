import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3006',
    headless: true,
  },
  webServer: {
    command: 'PORT=3006 pnpm dev',
    port: 3006,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
