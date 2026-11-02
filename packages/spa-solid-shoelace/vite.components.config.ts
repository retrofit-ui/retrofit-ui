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
      // Shoelace is a peer: the app's copy registers the elements and owns setBasePath.
      external: [
        /^solid-js/,
        /^@solidjs\//,
        /^@shoelace-style\/shoelace(\/|$)/,
      ],
    },
  },
});
