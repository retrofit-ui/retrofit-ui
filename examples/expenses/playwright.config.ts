import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3003',
    headless: true,
    actionTimeout: 15_000,
  },
  webServer: {
    command: 'PORT=3003 pnpm dev',
    port: 3003,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
