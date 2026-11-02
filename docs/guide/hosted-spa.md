# Hosted SPA

**Best for:** internal tools or admin panels where retrofit-ui owns the whole page at a url such as `/admin`.

In this style, your server serves the prebuilt app as static files. The browser loads it once, reads `/retrofit.json` to learn which screens exist and where their specs are, and renders each screen through a hash router. You write no frontend code: when the specs change on the server, the app shows the change on the next load.

## How it works

<figure class="rf-diagram">
  <img src="../diagrams/hosted-spa-flow.svg" alt="Hosted SPA request flow: browser fetches /admin bundle once, then /retrofit.json, then a spec per hash route (#/items → TableSpec, #/items/new → FormSpec)." />
  <figcaption class="rf-diagram__caption">
    The SPA routes the hash (<code>#/items</code>, <code>#/items/new</code>) using the route table in <code>/retrofit.json</code>. Each route triggers one spec fetch; the SPA replaces its content in place — no full page reload.
  </figcaption>
</figure>

The app has **no routes of its own**: no built-in list, create or edit screens, no landing page and no default sidebar. `/retrofit.json` declares every screen as a `{ path, spec }` pair:

- `path` is a hash route, and can have `:params`, for example `/items/:id`.
- `spec` is the endpoint that serves the screen's spec, relative to `apiBase`. Each `{name}` in it gets the value of the route's `:name` param, URI-encoded. For example, `/items/{id}` with the hash `#/items/42` fetches `/api/ui/items/42`.

Filling `{name}` from the route is the only templating the client does. Everything else in a spec arrives finished.

When the hash matches a route, the app fetches `apiBase + spec` and renders the result by its `kind` (a table, a form, a page, …). A hash that matches no route shows `No route for "<path>" in /retrofit.json.` A `/retrofit.json` without `routes` shows an error instead of the app: there is no default route table.

Each screen owns its spec. A `refresh` action from anything on the screen fetches the spec again, then passes `refresh` on to your `createShell({ actions })` handler, if any; tables and forms dispatch `refresh` after every save, create or delete.

Links between screens are data in the specs that your server returns: a table row's link, a toolbar's "New" button, a form's `onDone`. The client never builds a link. See [Actions](/guide/actions).

## Setup

### Install

```bash
pnpm add @retrofit-ui/builder-zod @retrofit-ui/spa-solid-shoelace zod
```

### Wire up the server

::: info Pick your own url prefix
`apiBase` is a prefix that the app puts before each route's `spec` when it fetches it. Set it to what fits your server: `/api/ui`, `/admin-ui`, `/ui/v2` or `/`. It defaults to `/api/ui`. Endpoint urls *inside* specs (`list`, `create`, …) get no prefix: they are fetched as written.
:::

```typescript
import { crudRoutes, type RetrofitConfig, TableView } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';

const app = express();

// /retrofit.json tells the app which screens exist and where their specs are
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  nav: [{ label: 'Items', href: '/items' }],
  routes: crudRoutes('items'), // #/items, #/items/new, #/items/:id
};
app.get('/retrofit.json', (_req, res) => res.json(config));

// The app itself: index.html, assets/, …
app.use(express.static(distPath));

// One spec endpoint per route
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.forRows(ItemSchema, items)
      .rowLink((row) => `#/items/${String(row.id)}`) // resolved here, per row
      .toolbar('New', { type: 'navigate', to: '#/items/new' })
      .delete({ method: 'DELETE', url: '/items/{id}' }) // {id} filled here, per row
      .build(),
  );
});
// …and /api/ui/items/new and /api/ui/items/:id, each returning a form spec

app.listen(3000);
```

Open `http://localhost:3000/#/items`. The app loads `/retrofit.json`, matches `/items`, and renders the spec from `/api/ui/items`.

The app does not care which language serves it. Any server that serves the files in `distPath`, a `/retrofit.json` and spec JSON works. See [The spec contract](/guide/contract).

### The route table

| `RetrofitConfig` field | Type | Description |
|------------------------|------|-------------|
| `routes` | `{ path: string; spec: string }[]` | **Required.** Every screen that the app can show. |
| `apiBase` | `string` | Prefix for each route's `spec`. Defaults to `/api/ui`. |
| `title` | `string` | Sidebar heading and document title. |
| `nav` | `{ label, href, icon? }[]` | Sidebar links. `href` is a hash route, for example `/items`. `icon` is a Shoelace icon name. Omit `nav`, or send `[]`, for no sidebar. |
| `theme` | `{ cssVariables?, extraCss? }` | See [Theming](#theming). |

`@retrofit-ui/builder-zod` has two helpers for `routes`:

```typescript
import { crudRoutes, route } from '@retrofit-ui/builder-zod';

route('/dashboard');               // { path: '/dashboard',  spec: '/dashboard' }
route('/posts/:id/preview');       // { path: '/posts/:id/preview', spec: '/posts/{id}/preview' }
route('/reports', '/reports/v2');  // an explicit spec endpoint

crudRoutes('posts');
// [{ path: '/posts',     spec: '/posts' },
//  { path: '/posts/new', spec: '/posts/new' },
//  { path: '/posts/:id', spec: '/posts/{id}' }]
```

`route(path)` makes `spec` from the path, with each `:name` as `{name}`. The client router picks the best match in any order. Your server's spec handlers are different: register a specific path such as `/new` before a `:param` path that also matches it, so that `new` is never read as an id. `crudRoutes` lists `/new` before `/:id` to match.

## Your own client entry

The prebuilt app (`distPath`) is exactly `createShell().mount(root)` from `@retrofit-ui/spa-solid-shoelace/components`, with the built-in kinds and handlers only. To add [kinds of your own](/guide/extending) or [action handlers](/guide/actions), build the same app from a small entry of your own:

```tsx
// client/main.tsx
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { createShell } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

void createShell({
  kits: [ratingKit],
  actions: {
    http: (action, input) => {
      const headers = new Headers(input?.init?.headers);
      headers.set('Authorization', `Bearer ${getToken()}`);
      return fetch(action.url, { ...input?.init, method: action.method, headers });
    },
  },
}).mount(document.getElementById('root')!);
```

| `createShell` option | Description |
|----------------------|-------------|
| `kits` | Kits whose kinds render besides the built-in ones, and whose action handlers apply. |
| `actions` | Action handlers that win over every kit's and the built-ins. They also apply to the `/retrofit.json` request. |
| `configUrl` | Where the config is served. Defaults to `/retrofit.json`. |
| `shoelacePath` | Base path for Shoelace's icons and assets. Defaults to the jsDelivr CDN. |

`.mount(root)` fetches the config, applies its `theme` and `title`, and renders the app into `root`. It returns a promise of a function that removes the app. If the config does not load, or has no `routes`, `root` shows the error.

Build this entry with your own bundler (for example, Vite with `vite-plugin-solid`). It needs `solid-js` and `@solidjs/router` installed. Serve its output instead of `distPath`. The server side stays the same: `/retrofit.json` with `routes`, and the spec endpoints.

## Theming

Send `theme` in `/retrofit.json` to change CSS variables without a rebuild:

```json
{
  "apiBase": "/api/ui",
  "routes": [{ "path": "/items", "spec": "/items" }],
  "theme": {
    "cssVariables": {
      "--sl-color-primary-600": "#7c3aed"
    }
  }
}
```

The app sets `cssVariables` on `:root` and adds `extraCss` to the document as a `<style>`, as-is. Send `extraCss` only from a producer that you trust. See [Theming](/guide/theming).

## When to choose this style

| Criterion | Hosted SPA |
|-----------|-----------|
| Frontend code required | None (or one `createShell` entry, for custom kinds or handlers) |
| Routing | Hash router, driven by the `routes` in `/retrofit.json` |
| Works with any server language | Yes: any server that serves the app's files, a `/retrofit.json` and spec JSON |
| Embeds into an existing page | No: it owns the full page |
| Reactive to SolidJS state | No |

To embed views in an existing app, see [Script Islands](/guide/script-islands) or [SolidJS Components](/guide/solidjs-components).
