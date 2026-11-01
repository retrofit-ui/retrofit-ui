# Script Islands

**Best for:** embedding retrofit-ui views into an existing HTML page or app, without SolidJS and without a change to your routing.

In this style you load one script and one stylesheet, call `init()` once, and put `<div>` elements with `data-retrofit-src` or `data-retrofit` where you want a view. The renderer finds those elements, fetches their specs (or reads inline JSON), and mounts a view in each one, independently. The host page keeps its own routing and layout.

<figure class="rf-diagram">
  <img src="../diagrams/script-islands.svg" alt="Script islands: a host HTML page owns its own header, sidebar, and footer; only one div annotated with data-retrofit-src is taken over by the renderer, which scans, fetches the spec, and mounts a view inside just that div." />
  <figcaption class="rf-diagram__caption">
    You own the header, sidebar, and footer. retrofit-ui takes over one specific <code>&lt;div&gt;</code> — as many as you want on a page, each independently.
  </figcaption>
</figure>

## Setup

The prebuilt islands bundle is `@retrofit-ui/spa-solid-shoelace/renderer`. It contains its own Solid and Shoelace, so the host page needs nothing else. It does not load CSS: also load `@retrofit-ui/spa-solid-shoelace/renderer.css`, which has the Shoelace light theme and the retrofit-ui layout classes. Without it, the views have no styles.

::: code-group

```typescript [With a bundler]
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { init } from '@retrofit-ui/spa-solid-shoelace/renderer';

init({ rootElement: document.body });
```

```html [Plain HTML]
<link rel="stylesheet" href="/vendor/retrofit-ui/spa-solid-shoelace.css" />
<script type="module">
  import { init } from '/vendor/retrofit-ui/retrofit-ui.js';
  init({ rootElement: document.body });
</script>
```

:::

For plain HTML, serve the files in the package's `dist/renderer/` folder: `retrofit-ui.js` (an ES module), `retrofit-ui.iife.js` (a classic script that sets the global `RetrofitUI`) and `spa-solid-shoelace.css`. With Express, that folder is next to `distPath`:

```typescript
import { join } from 'node:path';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';

app.use('/vendor/retrofit-ui', express.static(join(distPath, '..', 'renderer')));
```

Call `init()` once per page, after the elements are in the DOM. A second call logs a warning and returns the first controller.

| `init` option | Description |
|---------------|-------------|
| `rootElement` | **Required.** The element to search for islands, and to watch with `observe`. |
| `theme` | `{ cssVariables?, extraCss? }`, applied as the hosted app applies the `theme` from `/retrofit.json`. See [Theming](/guide/theming). |
| `shoelacePath` | Base path for Shoelace's icons and assets. Defaults to the jsDelivr CDN. |
| `observe` | `true` to also mount islands added to `rootElement` later. |
| `actions` | Action handlers for every island, for example an `http` handler that adds auth headers. See [Actions](/guide/actions). |

The prebuilt bundle renders the built-in kinds only. For kinds of your own, see [Islands with your own kinds](#islands-with-your-own-kinds).

::: info Pick your own url prefix
Islands have no `apiBase`. Each `data-retrofit-src` is fetched exactly as written, and so is every endpoint url inside a spec. `/api/ui` below is only a convention.
:::

## Mounting views with data attributes

### `data-retrofit-src`: fetch the spec from a url

Point an element at a spec endpoint, and the renderer fetches it:

```html
<!-- A table, from the spec at /api/ui/items -->
<div data-retrofit-src="/api/ui/items"></div>

<!-- A form -->
<div data-retrofit-src="/api/ui/items/new"></div>

<!-- Stat cards -->
<div data-retrofit-src="/api/ui/dashboard/stats"></div>
```

The request is an `http` action, so your `actions.http` handler applies to it. If the request fails, the element shows `Failed to load spec from <url>: …`.

### `data-retrofit`: inline spec JSON

When the page already has the spec, for example from server-side rendering, put it in the attribute:

```html
<div data-retrofit='{
  "kind": "stat",
  "stats": [
    { "label": "Users", "value": 1482, "format": "number" },
    { "label": "Revenue", "value": 94200, "format": "currency", "currency": "USD" }
  ]
}'></div>
```

Invalid JSON shows an error message in the element.

### Both: a fetched spec with a local patch

With both attributes, the renderer fetches the spec from `data-retrofit-src`, then applies `data-retrofit` over it:

```html
<div
  data-retrofit-src="/api/ui/items"
  data-retrofit='{"toolbar": []}'
></div>
```

The patch is **shallow**: each top-level key in the patch replaces that key of the fetched spec as a whole. A patch of `{"metadata": {"title": "My Items"}}` replaces the full `metadata` object, so the table also loses its `metadata.pagination`. To change one nested field, send the full value of its top-level key, or change the spec on the server.

## Programmatic mounting with `IslandController`

`init()` returns an `IslandController`. Use it when your own code decides when a view appears:

```typescript
import type { Spec } from '@retrofit-ui/core';
import { init } from '@retrofit-ui/spa-solid-shoelace/renderer';

const controller = init({ rootElement: document.body });

const spec: Spec = {
  kind: 'timeline',
  events: [
    { timestamp: '2026-06-01T10:00:00Z', title: 'Order placed', variant: 'primary' },
    { timestamp: '2026-06-03T14:30:00Z', title: 'Shipped', variant: 'success' },
  ],
};
const el = document.getElementById('order-timeline')!;
controller.mount(spec, el); // returns a function that disposes this island

controller.unmount(el);     // unmount one island
controller.unmountAll();    // unmount every island of this controller
```

`mount` on an element that already has an island replaces it.

## Watching for elements added later

Pass `observe: true` to mount islands that are added to `rootElement` after `init()`, for example by a framework that renders after the page loads:

```typescript
init({
  rootElement: document.body,
  observe: true, // a MutationObserver watches for new [data-retrofit*] elements
});
```

## Navigation and refresh

Each island has its own hash router. When an island dispatches `navigate` (a row click, a "New" button, a form's `onDone`), the built-in handler sets the host page's `location.hash` for a `#` link, and `location` for other links. Islands have no route table, so what the new hash shows is up to the host page. To send links to your own router, pass a `navigate` handler:

```typescript
init({
  rootElement: document.body,
  actions: { navigate: (action) => myRouter.go(action.to) },
});
```

Nothing owns an island's spec, so the built-in `refresh` handler does nothing. A table or tree loads its own rows again after a write. To fetch an island's spec again, unmount it and mount it again. See [Actions](/guide/actions#refresh).

## Islands with your own kinds

`createIslands` from `@retrofit-ui/spa-solid-shoelace/components` is the same island renderer, built against your app's Solid, so it also takes `kits`:

```typescript
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { createIslands } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

const controller = createIslands({ rootElement: document.body, kits: [ratingKit] });
```

It takes the same options as `init()`, plus `kits`, and returns an `IslandController`. Each call is independent: it has its own islands and its own observer, and there is no once-per-page check. Your bundle needs `solid-js` and `@solidjs/router`. See [Negotiating a new kind](/guide/extending).

## When to choose this style

| Criterion | Script Islands |
|-----------|---------------|
| Frontend code required | Minimal (one `init()` call) |
| Works in any framework | Yes: Vue, React, plain HTML, anything |
| Each view is independent | Yes |
| Spec fetched at runtime | Yes (`data-retrofit-src`) or inline (`data-retrofit`) |
| Reactive to external state | No: mount again to update |
| Navigation between views | Not built in. A link sets the host page's `location.hash` (or `location`), unless you pass a `navigate` handler |
| Custom kinds | Only with `createIslands({ kits })` |

For a dedicated admin page with built-in routing, see [Hosted SPA](/guide/hosted-spa). For SolidJS apps that want reactive props, see [SolidJS Components](/guide/solidjs-components).
