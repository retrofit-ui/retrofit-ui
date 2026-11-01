<p align="center">
  <img src="https://raw.githubusercontent.com/retrofit-ui/retrofit-ui/main/docs/public/logo.svg" alt="retrofit-ui" width="120" height="120" />
</p>

# @retrofit-ui/spa-solid-shoelace

[![npm](https://img.shields.io/npm/v/@retrofit-ui/spa-solid-shoelace.svg)](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace)
[![license](https://img.shields.io/npm/l/@retrofit-ui/spa-solid-shoelace.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)

The renderer for [retrofit-ui](https://retrofitui.dev). Your server (or a model) emits JSON specs; this package draws them with SolidJS and [Shoelace](https://shoelace.style). The frontend owns how a spec looks and behaves; the producer only says what to show.

It has four entries, for four ways to use it.

## Install

```bash
npm install @retrofit-ui/spa-solid-shoelace
```

Peer dependencies: `@solidjs/router` (required, `>=0.15.0`) and `solid-js` (optional, `>=1.9.0`; needed only for `./components`). The prebuilt bundles carry their own Solid, Shoelace and router.

## Entries

| Import | What it gives you |
|---|---|
| `@retrofit-ui/spa-solid-shoelace` | `distPath`: the folder of the prebuilt hosted app. Serve it from any backend. |
| `@retrofit-ui/spa-solid-shoelace/components` | `createShell`, `createRenderer`, `createIslands`, `defineKind`, `defineKit`, `builtinKinds`, `builtinActions`, `SpecRenderer`, `Scope`, `RenderSpec`, `configureMarked`, ... |
| `@retrofit-ui/spa-solid-shoelace/renderer` | Prebuilt script islands: `init()`. Built-in kinds only. |
| `@retrofit-ui/spa-solid-shoelace/renderer.css` | The stylesheet. Required by `./components` users; that build emits no CSS. |

## 1. Hosted app — serve the bundle

```ts
import express from "express";
import { distPath } from "@retrofit-ui/spa-solid-shoelace";

const app = express();
app.get("/retrofit.json", (_req, res) => res.json(config)); // must contain `routes`
app.use(express.static(distPath));
```

The app loads `/retrofit.json`, then fetches each route's spec. The build uses `base: "./"`, so it works at the root or under a subpath.

## 2. Script islands — drop into any HTML page

```html
<link rel="stylesheet"
      href="https://unpkg.com/@retrofit-ui/spa-solid-shoelace@<version>/dist/renderer/spa-solid-shoelace.css">
<div data-retrofit-src="/api/ui/users"></div>
<script type="module">
  import { init } from "https://unpkg.com/@retrofit-ui/spa-solid-shoelace@<version>/dist/renderer/retrofit-ui.js";
  init({ rootElement: document.body, observe: true });
</script>
```

`data-retrofit-src` fetches a spec from a URL; `data-retrofit` holds an inline spec as JSON. `init()` is callable once per page and returns a controller (`mount`, `unmount`, `unmountAll`).

## 3. Components — your own app, your own kinds

```tsx
import { createShell, defineKind, defineKit } from "@retrofit-ui/spa-solid-shoelace/components";
import "@retrofit-ui/spa-solid-shoelace/renderer.css";

// Declare the kind once, so the types know it (see the core README):
// declare module "@retrofit-ui/core" { interface SpecKinds { "acme.rating": { kind: "acme.rating"; score: number } } }
const rating = defineKind({ kind: "acme.rating", component: (props) => <b>{props.spec.score}</b> });

void createShell({ kits: [defineKit({ name: "acme", kinds: [rating] })] }).mount(document.getElementById("root")!);
```

`createRenderer({ kits })` gives you a renderer with `Root` and `SpecRenderer` members to embed specs in a Solid app; `createIslands({ kits })` gives islands with custom kinds. See [extending](https://retrofitui.dev/guide/extending).

> **Production tip:** replace `<version>` with an exact version you tested, and add [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) `integrity="sha384-..." crossorigin="anonymous"` attributes to CDN-loaded scripts and stylesheets. Generate hashes with `openssl dgst -sha384 -binary <file> | openssl base64 -A`.

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/core`](https://www.npmjs.com/package/@retrofit-ui/core) | The types and JSON Schema this renderer consumes |
| [`@retrofit-ui/builder-zod`](https://www.npmjs.com/package/@retrofit-ui/builder-zod) | Server-side builders for producing the specs this package renders |
| [retrofitui.dev](https://retrofitui.dev) | Guides, live demos, and the full API reference |

## License

MIT
