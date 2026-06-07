import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: '/',
  root: '.',
  build: {
    outDir: 'dist/ui-shell',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? '3000'}`,
        changeOrigin: true,
      },
    },
  },
});
