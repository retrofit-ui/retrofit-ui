<p align="center">
  <img src="https://raw.githubusercontent.com/retrofit-ui/retrofit-ui/main/docs/public/logo.svg" alt="retrofit-ui" width="120" height="120" />
</p>

# @retrofit-ui/core

[![npm](https://img.shields.io/npm/v/@retrofit-ui/core.svg)](https://www.npmjs.com/package/@retrofit-ui/core)
[![license](https://img.shields.io/npm/l/@retrofit-ui/core.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)

The spec contract for [retrofit-ui](https://retrofitui.dev). Frontend, backend, and AI teams keep blocking each other: every new screen needs all three. retrofit-ui puts a typed spec between them. The backend or a model says what to show. The frontend owns how it looks and behaves. They meet only at the spec — so each side can change without waiting on the others.

This package is that spec: **TypeScript types only, no runtime code**, plus a generated JSON Schema for producers that are not written in TypeScript.

## Install

```bash
npm install @retrofit-ui/core
```

`@retrofit-ui/builder-zod` and `@retrofit-ui/spa-solid-shoelace` depend on this package, so you rarely install it on its own.

## Types

```ts
import type { Spec, TableSpec } from "@retrofit-ui/core";

const users: TableSpec = {
  kind: "table",
  columns: [
    { key: "name", label: "Name", type: "string" },
    { key: "role", label: "Role", type: "enum", badgeVariants: { admin: "primary" } },
  ],
  rows: [
    { name: { value: "Ada Lovelace" }, role: { value: "admin" } },
  ],
  endpoints: {},
};
```

Return that object as JSON from your API. The renderer draws it as a table. Every spec is a flat `{ kind, ... }` object; containers (`page`, `card`, `flex`, `grid`, `tabs`) nest specs directly.

## Registries

`BuiltinSpecKinds` lists the 15 built-in kinds by `kind`. `SpecKinds` extends it, and `Spec` is the union of every entry. An app adds its own kind by augmenting `SpecKinds` once; `ActionKinds` works the same way for action types.

```ts
declare module "@retrofit-ui/core" {
  interface SpecKinds {
    "acme.rating": RatingSpec; // RatingSpec.kind must be "acme.rating"
  }
}
```

The renderer needs a matching component (a *kit*) to draw a custom kind. See [extending](https://retrofitui.dev/guide/extending).

## JSON Schema

```ts
import schema from "@retrofit-ui/core/schema.json" with { type: "json" };
```

`schema.json` is generated from these types (JSON Schema draft-07). It covers the built-in kinds and actions only, with `BuiltinSpec` discriminated on `kind`. Custom kinds are app-owned: add your own definitions next to it. Use it to validate specs from a backend in any language; see [the contract guide](https://retrofitui.dev/guide/contract).

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/builder-zod`](https://www.npmjs.com/package/@retrofit-ui/builder-zod) | Fluent builders that produce these spec objects in typed code |
| [`@retrofit-ui/spa-solid-shoelace`](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace) | The prebuilt browser renderer that reads these specs |
| [retrofitui.dev](https://retrofitui.dev) | Guides, live demos, and the full API reference |

## License

MIT
