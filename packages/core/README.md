# @retrofit-ui/core

[![npm](https://img.shields.io/npm/v/@retrofit-ui/core.svg)](https://www.npmjs.com/package/@retrofit-ui/core)
[![license](https://img.shields.io/npm/l/@retrofit-ui/core.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)
[![provenance](https://img.shields.io/npm/collaborators/@retrofit-ui/core.svg?label=provenance&color=green)](https://www.npmjs.com/package/@retrofit-ui/core)

The types package for [retrofit-ui](https://retrofitui.dev) — a server-driven UI framework where your server describes screens as JSON and the browser renders them without any frontend code. This package defines the **contract** that both sides of the wire agree on: TypeScript interfaces and matching Zod schemas for every kind of view retrofit-ui knows about.

Install it on the server side to get typed spec objects, runtime validation, and autocomplete on every field. The renderer package (`@retrofit-ui/spa-solid-shoelace`) reuses the same schemas at build time to validate incoming specs.

## Install

```bash
npm install @retrofit-ui/core zod
```

`zod` is a peer dependency.

## Usage

```ts
import type { TableSpec } from "@retrofit-ui/core";

const users: TableSpec = {
  kind: "table",
  columns: [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "role", label: "Role", type: "badge" },
  ],
  rows: [
    { name: "Ada Lovelace", email: "ada@example.com", role: "admin" },
    { name: "Grace Hopper", email: "grace@example.com", role: "user" },
  ],
  endpoints: {
    list: { method: "GET", url: "/api/users" },
  },
};
```

Return that object as JSON from your API endpoint. The retrofit-ui renderer draws it as an interactive table.

Same package also ships `FormSpec`, `PageSpec`, `TreeSpec`, `TimelineSpec`, `CalendarSpec`, `StatSpec`, `MarkdownViewSpec` — one for each renderable view. See [the spec reference on retrofitui.dev](https://retrofitui.dev/reference/js-api).

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/builder-zod`](https://www.npmjs.com/package/@retrofit-ui/builder-zod) | Fluent builders that produce these spec objects in typed code |
| [`@retrofit-ui/spa-solid-shoelace`](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace) | The prebuilt browser renderer that reads these specs |
| [retrofitui.dev](https://retrofitui.dev) | Guides, live demos, and the full API reference |

## License

MIT
