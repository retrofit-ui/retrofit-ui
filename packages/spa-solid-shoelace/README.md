# @retrofit-ui/spa-solid-shoelace

SolidJS + Shoelace SPA bundle for [retrofit-ui](https://github.com/retrofit-ui/retrofit-ui) — the prebuilt browser renderer for retrofit-ui specs, plus a Node-side export of the asset directory for server integration.

## Install

```bash
npm install @retrofit-ui/spa-solid-shoelace
```

## What you get

- **`./renderer`** — the bundled renderer entry (`retrofit-ui.js`) you can `<script>` into a page.
- **`./renderer.css`** — the renderer's stylesheet.
- **`./components`** — the `<spec-renderer>` web component for embedding in any frontend.
- **Default export `distPath`** — absolute path to the built SPA shell, for Node servers that want to serve it as static assets:

  ```ts
  import { distPath } from "@retrofit-ui/spa-solid-shoelace";
  import express from "express";

  const app = express();
  app.use("/retrofit-ui", express.static(distPath));
  ```

The SPA is built with Vite using `base: "./"`, so assets resolve correctly whether mounted at `/` or any subpath.

## License

MIT
