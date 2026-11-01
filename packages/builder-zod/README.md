<p align="center">
  <img src="https://raw.githubusercontent.com/retrofit-ui/retrofit-ui/main/docs/public/logo.svg" alt="retrofit-ui" width="120" height="120" />
</p>

# @retrofit-ui/builder-zod

[![npm](https://img.shields.io/npm/v/@retrofit-ui/builder-zod.svg)](https://www.npmjs.com/package/@retrofit-ui/builder-zod)
[![license](https://img.shields.io/npm/l/@retrofit-ui/builder-zod.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)

Fluent builders for [retrofit-ui](https://retrofitui.dev) specs. Instead of hand-writing JSON that matches the `@retrofit-ui/core` types, you compose it with typed methods that catch mistakes at compile time. Zod schemas describe your data; the builders derive columns and form fields from them.

The builders return plain spec objects. They do not validate at runtime. To check a spec, validate it against `@retrofit-ui/core/schema.json`.

## Install

```bash
npm install @retrofit-ui/builder-zod zod
```

`zod` (v4) is a peer dependency. `@retrofit-ui/core` is a regular dependency, installed for you.

## Usage

```ts
import { TableView, crudRoutes, type RetrofitConfig } from "@retrofit-ui/builder-zod";
import { z } from "zod";

const User = z.object({ id: z.string(), name: z.string(), email: z.string() });

// /retrofit.json: the route table the hosted app reads
const config: RetrofitConfig = {
  apiBase: "/api/ui",
  nav: [{ label: "Users", href: "/users" }],
  routes: crudRoutes("users"),
};
app.get("/retrofit.json", (_req, res) => res.json(config));

// GET /api/ui/users: the table spec for the /users route
app.get("/api/ui/users", async (_req, res) => {
  res.json(
    TableView.forRows(User, await db.users.findAll())
      .rowLink((row) => `#/users/${String(row.id)}`)
      .toolbar("New", { type: "navigate", to: "#/users/new" })
      .build(),
  );
});
```

## Exports

| Export | Builds |
|---|---|
| `TableView` (`TableViewBuilder`) | `TableSpec` — inline `rows()` or a fetched `list()` |
| `formSpec` (`FormSpecBuilder`) | `FormSpec` |
| `pageSpec`, `row`, `col`, `grid`, `filterForm` | `PageSpec`, layout containers and `FilterFormSpec` |
| `StatView`, `TimelineView`, `TreeView`, `CalendarView`, `CardView` | the matching spec |
| `WorkflowBundle` | a table plus its create/edit forms |
| `route`, `crudRoutes` | `RouteSpec` entries for `/retrofit.json` |
| `withRowActions` | adds per-row `_actions` (`update` / `delete`) to rows |

The package also re-exports the spec types from `@retrofit-ui/core`. See the [API reference](https://retrofitui.dev/reference/js-api).

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/core`](https://www.npmjs.com/package/@retrofit-ui/core) | The types and JSON Schema these builders produce |
| [`@retrofit-ui/spa-solid-shoelace`](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace) | The prebuilt browser renderer for the specs you build |
| [retrofitui.dev](https://retrofitui.dev) | Guides, live demos, and the full API reference |

## License

MIT
