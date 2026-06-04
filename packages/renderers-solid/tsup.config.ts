import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['solid-js', '@retrofit-ui/core'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.jsxImportSource = 'solid-js';
  },
});
