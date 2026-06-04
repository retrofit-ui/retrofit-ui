import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  jsx: 'react-jsx',
  treeshake: true,
  external: ['react', 'react-dom', '@retrofit-ui/core'],
});
