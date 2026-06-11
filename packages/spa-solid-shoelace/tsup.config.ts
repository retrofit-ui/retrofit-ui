import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  platform: 'node',
  clean: true,
  treeshake: true,
  shims: true,
});
