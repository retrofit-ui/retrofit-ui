import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'PORT=3000 pnpm dev',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
