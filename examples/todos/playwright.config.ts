import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
  },
  webServer: [
    {
      command: 'PORT=3001 pnpm dev',
      port: 3001,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'API_PORT=3001 sh -c "cd ../../packages/ui-shell && pnpm exec vite --port 5174"',
      port: 5174,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
