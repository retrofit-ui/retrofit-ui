# @retrofit-ui/builder-zod

Zod-driven UI spec builders for [retrofit-ui](https://github.com/retrofit-ui/retrofit-ui). Compose specs for table, form, page, stat, timeline, tree, calendar, and workflow components without hand-writing JSON.

## Install

```bash
npm install @retrofit-ui/builder-zod @retrofit-ui/core zod
```

`@retrofit-ui/core` and `zod` are peer dependencies.

## Usage

```ts
import { table } from "@retrofit-ui/builder-zod";

const spec = table()
  .column("name", { label: "Name" })
  .column("email", { label: "Email" })
  .rows(users)
  .build();
```

See the [retrofit-ui docs](https://retrofit-ui.github.io/retrofit-ui/) for the full builder API.

## License

MIT
