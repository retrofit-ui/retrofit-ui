import { defineConfig } from 'tsup';

const sharedNodeConfig = {
  platform: 'node' as const,
  sourcemap: true,
};

export default defineConfig([
  {
    ...sharedNodeConfig,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    treeshake: true,
    external: ['zod', '@retrofit-ui/core'],
  },
  {
    ...sharedNodeConfig,
    entry: {
      'adapters/express': 'src/adapters/express.ts',
      'adapters/nextjs': 'src/adapters/nextjs.ts',
      'adapters/ui-shell': 'src/adapters/ui-shell.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    treeshake: true,
    external: ['express', 'zod', '@retrofit-ui/core'],
  },
  {
    ...sharedNodeConfig,
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    external: ['express', 'zod', '@retrofit-ui/core'],
  },
]);
