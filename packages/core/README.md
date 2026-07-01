# @retrofit-ui/core

Zod type definitions for [retrofit-ui](https://github.com/retrofit-ui/retrofit-ui) component specs — the contract shared between a server that emits UI as JSON and a renderer that draws it.

This package contains only types and schemas. It has no runtime UI dependencies.

## Install

```bash
npm install @retrofit-ui/core zod
```

`zod` is a peer dependency.

## Usage

```ts
import { TableSpec } from "@retrofit-ui/core";

const spec: TableSpec = {
  type: "table",
  columns: [{ key: "name", label: "Name" }],
  rows: [{ name: "Ada" }],
};
```

See the [retrofit-ui docs](https://retrofit-ui.github.io/retrofit-ui/) for the full spec reference.

## License

MIT
