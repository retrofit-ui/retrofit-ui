# @retrofit-ui/builder-zod

[![npm](https://img.shields.io/npm/v/@retrofit-ui/builder-zod.svg)](https://www.npmjs.com/package/@retrofit-ui/builder-zod)
[![license](https://img.shields.io/npm/l/@retrofit-ui/builder-zod.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)

Fluent builders for [retrofit-ui](https://retrofitui.dev) specs. Instead of hand-writing JSON objects that match the `@retrofit-ui/core` schemas, you compose them with typed methods that catch mistakes at compile time and produce specs the renderer can consume directly.

Every builder returns Zod-validated output, so what you send over the wire is guaranteed to conform to the retrofit-ui contract.

## Install

```bash
npm install @retrofit-ui/builder-zod zod
```

`zod` is a peer dependency. `@retrofit-ui/core` is pulled in transitively.

## Usage

```ts
import { table } from "@retrofit-ui/builder-zod";

app.get("/api/users", (req, res) => {
  const spec = table()
    .column("name", { label: "Name", type: "text" })
    .column("email", { label: "Email", type: "text" })
    .column("role", { label: "Role", type: "badge" })
    .rows(await db.users.findAll())
    .endpoint("list", "GET", "/api/users")
    .build();

  res.json(spec);
});
```

Builders exist for `table`, `form`, `page`, `stat`, `timeline`, `tree`, `calendar`, and full workflow bundles. See the [builder API reference](https://retrofitui.dev/reference/js-api) for the complete surface.

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/core`](https://www.npmjs.com/package/@retrofit-ui/core) | The type + schema definitions these builders produce |
| [`@retrofit-ui/spa-solid-shoelace`](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace) | The prebuilt browser renderer for the specs you build |
| [retrofitui.dev](https://retrofitui.dev) | Guides, live demos, and the full API reference |

## License

MIT
