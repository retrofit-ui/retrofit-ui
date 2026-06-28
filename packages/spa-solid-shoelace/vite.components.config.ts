import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'ui/components.tsx',
      formats: ['es'],
      fileName: () => 'spec-renderer.js',
    },
    outDir: 'dist/components',
    emptyOutDir: true,
    rollupOptions: {
      external: [/^solid-js/, /^@solidjs\//],
    },
  },
});
