// Root type for scripts/gen-schema.mjs only; not exported from the package.
import type { RetrofitConfig } from './config';
import type { ListRow } from './resource-spec';
import type { BuiltinSpecKinds } from './spec';

/** Any built-in spec node. */
export type BuiltinSpec = BuiltinSpecKinds[keyof BuiltinSpecKinds];

/**
 * The retrofit-ui wire format: one spec, the app config, and the rows a
 * table's `list` or a tree's `endpoint` returns. Covers the
 * built-in spec kinds and actions only; an app with custom kinds or actions
 * adds its own definitions for them.
 */
export interface SchemaRoot {
  spec: BuiltinSpec;
  config: RetrofitConfig;
  listResponse: ListRow[];
}
