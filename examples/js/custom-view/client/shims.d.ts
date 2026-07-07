// Ambient shims for imports where upstream types aren't shipped.

// The `@retrofit-ui/spa-solid-shoelace/components` subpath ships JS without
// matching .d.ts (the tsup build only emits types for the Node entry).
declare module '@retrofit-ui/spa-solid-shoelace/components' {
  import type {
    DetailsSpec,
    RootSpec,
    TabsSpec,
    TextSpec,
  } from '@retrofit-ui/core';
  import type { Component } from 'solid-js';

  // Mirrors SpecRenderer's real prop type: RootSpec plus the standalone
  // ViewSpec-only kinds it renders directly (text/tabs/details).
  export const SpecRenderer: Component<{
    spec: RootSpec | TextSpec | TabsSpec | DetailsSpec;
    apiBase: string;
  }>;
}

// The `/renderer.css` subpath is a plain stylesheet — declared so TS accepts
// the side-effect import.
declare module '@retrofit-ui/spa-solid-shoelace/renderer.css';

// Plain .css side-effect imports (Vite handles these at runtime).
declare module '*.css';
