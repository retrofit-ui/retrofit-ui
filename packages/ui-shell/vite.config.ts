import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: '/retrofit-ui/',
  build: { outDir: 'dist' },
});
