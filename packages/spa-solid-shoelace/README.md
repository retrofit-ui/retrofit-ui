<p align="center">
  <img src="https://raw.githubusercontent.com/retrofit-ui/retrofit-ui/main/docs/public/logo.svg" alt="retrofit-ui" width="120" height="120" />
</p>

# @retrofit-ui/spa-solid-shoelace

[![npm](https://img.shields.io/npm/v/@retrofit-ui/spa-solid-shoelace.svg)](https://www.npmjs.com/package/@retrofit-ui/spa-solid-shoelace)
[![license](https://img.shields.io/npm/l/@retrofit-ui/spa-solid-shoelace.svg)](https://github.com/retrofit-ui/retrofit-ui/blob/main/LICENSE)

The prebuilt browser renderer for [retrofit-ui](https://retrofitui.dev). Your server emits JSON specs; this package draws them. Built on SolidJS + [Shoelace](https://shoelace.style) web components, shipped as static assets — no frontend build step in your project, no bundler config, no framework buy-in.

Three ways to consume it depending on what your server looks like.

## Install

```bash
npm install @retrofit-ui/spa-solid-shoelace
```

No peer dependencies required for the prebuilt bundle. The compiled SolidJS, Shoelace, and Zod runtime are all included.

## Usage

### 1. Node server — serve the bundle as static assets

```ts
import express from "express";
import { distPath } from "@retrofit-ui/spa-solid-shoelace";

const app = express();
app.use("/retrofit-ui", express.static(distPath));

// Your API returns retrofit-ui specs; the SPA at /retrofit-ui/ renders them
app.get("/api/users", (_, res) => res.json({ /* your TableSpec */ }));
```

`distPath` is the absolute path to the built SPA. The Vite build uses `base: "./"` so it works both at the root path and under any subpath.

### 2. Standalone renderer — drop into any HTML page

```html
<link rel="stylesheet"
      href="https://unpkg.com/@retrofit-ui/spa-solid-shoelace@0.1.0/dist/renderer/spa-solid-shoelace.css">
<script type="module"
        src="https://unpkg.com/@retrofit-ui/spa-solid-shoelace@0.1.0/dist/renderer/retrofit-ui.js">
</script>

<retrofit-ui endpoint="/api/users"></retrofit-ui>
```

### 3. Web component — embed inside an existing frontend

```html
<script type="module"
        src="https://unpkg.com/@retrofit-ui/spa-solid-shoelace@0.1.0/dist/components/spec-renderer.js">
</script>

<spec-renderer endpoint="/api/products"></spec-renderer>
```

Works inside React, Vue, Svelte, Angular, or any other frontend that speaks HTML.

> **Production tip:** always pin a specific version (as shown above) and add [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) `integrity="sha384-..." crossorigin="anonymous"` attributes to CDN-loaded scripts and stylesheets. This protects against a compromised CDN serving modified assets. You can generate hashes with `openssl dgst -sha384 -binary <file> | openssl base64 -A` or via [srihash.org](https://www.srihash.org).

## See also

| Package | What it does |
|---|---|
| [`@retrofit-ui/core`](https://www.npmjs.com/package/@retrofit-ui/core) | The type + schema definitions this renderer consumes |
| [`@retrofit-ui/builder-zod`](https://www.npmjs.com/package/@retrofit-ui/builder-zod) | Server-side builders for producing the specs this package renders |
| [retrofitui.dev](https://retrofitui.dev) | Live demos, integration guides, and the full API reference |

## License

MIT
