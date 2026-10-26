import { defineConfig } from 'tsup';

// One self-contained declaration file per browser entry. A single file has no
// relative imports, so it resolves under every moduleResolution (node16 needs
// extensions on relative imports in ESM .d.ts files), and it is a reliable
// target for `declare module` augmentation.
export default defineConfig({
  entry: { components: 'ui/components.tsx', renderer: 'ui/mount.tsx' },
  outDir: 'dist/types',
  format: ['esm'],
  dts: { only: true },
  tsconfig: 'tsconfig.components.json',
  external: ['solid-js', '@retrofit-ui/core'],
});
