import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Exact match, so subpaths like `@retrofit-ui/core/schema.json` resolve normally.
    alias: [
      {
        find: /^@retrofit-ui\/core$/,
        replacement: path.resolve(__dirname, '../core/src/index.ts'),
      },
    ],
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.ts'],
    },
  },
});
