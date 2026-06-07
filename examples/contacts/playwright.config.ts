import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
  },
  webServer: {
    command: 'PORT=3002 pnpm dev',
    port: 3002,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
