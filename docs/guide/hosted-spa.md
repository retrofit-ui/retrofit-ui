# Hosted SPA

**Best for:** dedicated internal tools or admin panels where retrofit-ui owns the entire page at a URL like `/admin`.

In this style, your server serves the pre-built SPA bundle as static files. The browser loads it once, reads `/retrofit.json` to learn which screens exist and where their specs live, and renders each screen through a hash router. You never touch frontend code — every change to your schema is immediately reflected in the UI on the next page load.

## How it works

<figure class="rf-diagram">
  <img src="../diagrams/hosted-spa-flow.svg" alt="Hosted SPA request flow: browser fetches /admin bundle once, then /retrofit.json, then a spec per hash route (#/items → TableSpec, #/items/new → FormSpec)." />
  <figcaption class="rf-diagram__caption">
    The SPA routes the hash (<code>#/items</code>, <code>#/items/new</code>) using the route table in <code>/retrofit.json</code>. Each route triggers one spec fetch; the SPA replaces its content in place — no full page reload.
  </figcaption>
</figure>

The SPA has **no routes of its own** — no built-in list/new/edit screens, no landing page, no default nav. `/retrofit.json` declares every screen as a `{ path, spec }` pair:

- `path` is a hash route, with `:params` — e.g. `/items/:id`.
- `spec` is the endpoint that serves that screen's spec, relative to `apiBase`. Each `{name}` in it is filled from the route's `:name` param — e.g. `/items/{id}`.

When the hash matches a route, the SPA fetches `apiBase + spec` and renders the result by its `kind` (a table, a form, a page, …). A `refresh` action dispatched by anything on the screen — tables and forms do after every save, create or delete — refetches that spec. A hash that matches no route shows a "No route" message, and a `/retrofit.json` without `routes` shows an error instead of the app: there is no fallback route table.

Links between screens are data in the specs your server returns — a table row's link, a toolbar's "New" button, a form's `onDone` — never something the client works out. See [Event Handling](/guide/event-handling).

## Setup

### Install

```bash
pnpm add @retrofit-ui/builder-zod @retrofit-ui/spa-solid-shoelace
```

### Wire up the server

::: info Pick your own URL prefix
`apiBase` is a prefix retrofit-ui prepends to each route's `spec` when it fetches it — nothing else magic about it. Set it to whatever fits your server: `/api/ui`, `/admin-ui`, `/ui/v2`, or just `/`. It defaults to `/api/ui`, which is only a convention that reads well. Endpoint urls *inside* specs (`list`, `create`, …) are not prefixed: they are fetched as written.
:::

```typescript
import {
  crudRoutes,
  type RetrofitConfig,
  TableView,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';

const app = express();

// /retrofit.json tells the SPA which screens exist and where their specs live
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  nav: [{ label: 'Items', href: '/items' }],
  routes: crudRoutes('items'), // #/items, #/items/new, #/items/:id
};
app.get('/retrofit.json', (_req, res) => res.json(config));

// Serve the SPA bundle — index.html, assets/, etc.
app.use(express.static(distPath));

// Your spec endpoints: one per route
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.forRows(ItemSchema, items)
      .rowLink((row) => `#/items/${String(row.id)}`) // resolved here, per row
      .toolbar('New', { type: 'navigate', to: '#/items/new' })
      .delete({ method: 'DELETE', url: '/items/{id}' })
      .build(),
  );
});
// ...and /api/ui/items/new and /api/ui/items/:id, each returning a FormSpec

app.listen(3000);
```

Open `http://localhost:3000/#/items` — the SPA loads `/retrofit.json`, matches `/items`, and renders the spec from `/api/ui/items`.

### The route table

| `RetrofitConfig` field | Type | Description |
|------------------------|------|-------------|
| `routes` | `{ path: string; spec: string }[]` | **Required.** Every screen the app can show. |
| `apiBase` | `string` | Prefix for each route's `spec`. Defaults to `/api/ui`. |
| `title` | `string` | Sidebar heading and document title. |
| `nav` | `{ label, href, icon? }[]` | Sidebar links (`href` is a hash route, e.g. `/items`). Omit, or pass `[]`, for no sidebar. |
| `theme` | `RetrofitTheme` | See [Theming](#theming). |

`@retrofit-ui/builder-zod` has two helpers for building `routes`:

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

`route(path)` defaults `spec` to the path with each `:name` turned into `{name}`. List more specific paths before a `:param` path that would also match them — `crudRoutes` puts `/new` before `/:id` for that reason — and register your server's spec handlers in the same order, so `new` is never read as an id.

## Keeping the hosted app with custom kinds

The prebuilt bundle (`distPath`) renders the built-in kinds only. It is exactly `createShell()` from `@retrofit-ui/spa-solid-shoelace/components`, so an app with [custom kinds](/guide/extending) keeps the same hosted app — route table, sidebar, theme — with a tiny client entry of its own:

```tsx
// client/main.tsx
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { createShell } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './ExtendedRenderer';

void createShell({ kits: [ratingKit] }).mount(document.getElementById('root')!);
```

`.mount(root)` fetches `/retrofit.json` (or `configUrl`), applies its `theme` and `title`, and renders the app. `createShell` also takes `actions` (handlers that override every kit's and the built-ins — e.g. an `http` handler that adds auth headers) and `shoelacePath`. Build this entry with your own bundler (it needs `solid-js` and `@solidjs/router` installed) and serve its output instead of `distPath`.

## Theming

Pass `theme` in `/retrofit.json` to customise CSS variables without touching the bundle:

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

See [Theming](/guide/theming) for the full variable reference.

## When to choose this style

| Criterion | Hosted SPA |
|-----------|-----------|
| Frontend code required | None (or one `createShell` entry, for custom kinds) |
| Routing | Hash router, driven by the `routes` in `/retrofit.json` |
| Works with any server language | Yes — any server that serves the bundle, a `/retrofit.json` and spec JSON |
| Embeds into an existing page | No — owns the full page |
| Reactive to SolidJS state | No |

For embedding views inside an existing app, see [Script Islands](/guide/script-islands) or [SolidJS Components](/guide/solidjs-components).
