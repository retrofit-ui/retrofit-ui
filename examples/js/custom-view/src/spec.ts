import type { Spec, SpecNode } from '@retrofit-ui/core';

/**
 * A custom spec kind, defined entirely in userland: declare its wire shape,
 * register it in `SpecKinds`, and give the client renderer a component for
 * it (see client/ExtendedRenderer.tsx). No patch to retrofit-ui required.
 */
export interface RatingItem {
  label: string;
  score: number; // 0..5, halves allowed
  note?: string;
}

export interface RatingSpec extends SpecNode<'demo.rating'> {
  items: RatingItem[];
  metadata?: { title?: string };
}

// Registering the kind makes it part of `Spec`, so it type-checks anywhere a
// spec can go, including inside built-in containers like `card` and `page`.
// Server and client both import this file, so both see the registration.
declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'demo.rating': RatingSpec;
  }
}

/** Any spec this app serves: the built-in kinds plus `demo.rating`. */
export type AppSpec = Spec;
