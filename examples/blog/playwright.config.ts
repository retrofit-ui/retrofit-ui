import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5177',
    headless: true,
  },
  webServer: [
    {
      command: 'PORT=3004 pnpm dev',
      port: 3004,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'API_PORT=3004 sh -c "cd ../../packages/ui-shell && pnpm exec vite --port 5177"',
      port: 5177,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
