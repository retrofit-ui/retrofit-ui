import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5176',
    headless: true,
    actionTimeout: 15_000,
  },
  webServer: [
    {
      command: 'PORT=3003 pnpm dev',
      port: 3003,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'API_PORT=3003 sh -c "cd ../../packages/ui-shell && pnpm exec vite --port 5176"',
      port: 5176,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
