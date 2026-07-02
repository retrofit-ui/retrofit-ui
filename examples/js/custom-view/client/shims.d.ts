// Ambient shims for imports where upstream types aren't shipped.

// The `@retrofit-ui/spa-solid-shoelace/components` subpath ships JS without
// matching .d.ts (the tsup build only emits types for the Node entry).
declare module '@retrofit-ui/spa-solid-shoelace/components' {
  import type { RootSpec } from '@retrofit-ui/core';
  import type { Component } from 'solid-js';

  export const SpecRenderer: Component<{ spec: RootSpec; apiBase: string }>;
}

// The `/renderer.css` subpath is a plain stylesheet — declared so TS accepts
// the side-effect import.
declare module '@retrofit-ui/spa-solid-shoelace/renderer.css';

// Plain .css side-effect imports (Vite handles these at runtime).
declare module '*.css';
