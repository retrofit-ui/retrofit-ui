import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: './',
  root: '.',
  build: {
    outDir: 'dist/ui-shell',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: [
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
      '@fullcalendar/list',
    ],
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
