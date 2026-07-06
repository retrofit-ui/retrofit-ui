import type {
  DetailsSpec,
  RootSpec,
  TabsSpec,
  TextSpec,
} from '@retrofit-ui/core';

/**
 * A custom spec kind, defined entirely in userland. Extending retrofit-ui
 * does not require patching @retrofit-ui/core — we just declare the wire
 * shape here and teach one renderer to handle it (see client/RatingView.tsx).
 */
export interface RatingItem {
  label: string;
  score: number; // 0..5, halves allowed
  note?: string;
}

export interface RatingSpec {
  kind: 'rating';
  items: RatingItem[];
  metadata?: { title?: string };
}

/**
 * The union our app's renderer accepts: everything retrofit-ui already knows
 * about, plus our custom kind. Server code returns this; client dispatches on
 * `spec.kind`.
 */
export type AppSpec = RootSpec | RatingSpec | TextSpec | TabsSpec | DetailsSpec;
