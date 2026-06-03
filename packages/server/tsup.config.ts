import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: {
      'adapters/express': 'src/adapters/express.ts',
      'adapters/nextjs': 'src/adapters/nextjs.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['express'],
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    sourcemap: true,
  },
])
