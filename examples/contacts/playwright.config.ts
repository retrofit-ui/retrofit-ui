import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5175',
    headless: true,
  },
  webServer: [
    {
      command: 'PORT=3002 pnpm dev',
      port: 3002,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'API_PORT=3002 sh -c "cd ../../packages/ui-shell && pnpm exec vite --port 5175"',
      port: 5175,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
