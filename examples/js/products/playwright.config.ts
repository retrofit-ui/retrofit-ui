import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3005',
    headless: true,
  },
  webServer: {
    command: 'PORT=3005 pnpm dev',
    port: 3005,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
