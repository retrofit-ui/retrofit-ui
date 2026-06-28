import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'ui/mount.tsx',
      name: 'RetrofitUI',
      formats: ['es', 'iife'],
      fileName: (fmt) =>
        fmt === 'es' ? 'retrofit-ui.js' : 'retrofit-ui.iife.js',
    },
    outDir: 'dist/renderer',
    emptyOutDir: true,
    optimizeDeps: {
      include: [
        '@fullcalendar/core',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/list',
      ],
    },
  },
});
