import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3004',
    headless: true,
  },
  webServer: {
    command: 'PORT=3004 pnpm dev',
    port: 3004,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
