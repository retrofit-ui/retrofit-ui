# Script Islands

**Best for:** embedding isolated retrofit-ui views into an existing HTML page or app, without adopting SolidJS or changing your routing.

In this style you load a single script, call `init()` once, then drop `<div>` elements annotated with `data-retrofit-src` or `data-retrofit` wherever you want a view to appear. The renderer scans the DOM, fetches specs (or reads inline JSON), and mounts each view independently. The host page owns its own routing and layout — retrofit-ui fills specific containers.

<ScriptIslands />

## Setup

### Load the renderer

::: code-group

```html [Via CDN / script tag]
<script type="module">
  import { init } from 'https://cdn.example.com/@retrofit-ui/spa-solid-shoelace/renderer';
  import '@shoelace-style/shoelace/dist/themes/light.css';

  document.addEventListener('DOMContentLoaded', () => {
    init({ rootElement: document.body, apiBase: '/api/ui' });
  });
</script>
```

```typescript [Via npm import]
import { init } from '@retrofit-ui/spa-solid-shoelace/renderer';
import '@shoelace-style/shoelace/dist/themes/light.css';

init({ rootElement: document.body, apiBase: '/api/ui' });
```

:::

`init()` returns an `IslandController` you can hold onto for programmatic mounting and teardown later.

## Mounting views with data attributes

### `data-retrofit-src` — fetch spec from URL

The most common pattern: point an element at a spec endpoint and the renderer fetches it.

```html
<!-- Renders a table view driven by the spec at /api/ui/items -->
<div data-retrofit-src="/api/ui/items"></div>

<!-- Renders a form at /api/ui/items/new -->
<div data-retrofit-src="/api/ui/items/new"></div>

<!-- Renders stat cards from /api/ui/dashboard/stats -->
<div data-retrofit-src="/api/ui/dashboard/stats"></div>
```

### `data-retrofit` — inline spec JSON

When you already have the spec (e.g., server-rendered into the HTML), embed it directly:

```html
<div data-retrofit='{
  "kind": "stat",
  "stats": [
    { "label": "Users", "value": 1482, "format": "number" },
    { "label": "Revenue", "value": 94200, "format": "currency", "currency": "USD" }
  ]
}'></div>
```

### Combining both — remote spec with a local patch

`data-retrofit-src` fetches the base spec; `data-retrofit` is then merged on top as a patch:

```html
<!-- Load the spec from the server, then override its title client-side -->
<div
  data-retrofit-src="/api/ui/items"
  data-retrofit='{"metadata": {"title": "My Items"}}'
></div>
```

## Programmatic mounting with `IslandController`

Hold the controller returned by `init()` to mount views imperatively — useful when your framework controls when DOM nodes appear:

```typescript
import { init } from '@retrofit-ui/spa-solid-shoelace/renderer';
import type { RootSpec } from '@retrofit-ui/spa-solid-shoelace/renderer';

const controller = init({ rootElement: document.body, apiBase: '/api/ui' });

// Mount a spec onto a specific element
const spec: RootSpec = {
  kind: 'timeline',
  events: [
    { timestamp: '2026-06-01T10:00:00Z', title: 'Order placed', variant: 'primary' },
    { timestamp: '2026-06-03T14:30:00Z', title: 'Shipped', variant: 'success' },
  ],
};
const el = document.getElementById('order-timeline')!;
const dispose = controller.mount(spec, el);

// Unmount a single island
controller.unmount(el);

// Unmount everything
controller.unmountAll();
```

## Watching for dynamically added elements

Pass `observe: true` to scan new elements as they are added to the DOM — useful in SPA frameworks that insert content after the initial render:

```typescript
init({
  rootElement: document.body,
  apiBase: '/api/ui',
  observe: true,           // MutationObserver watches for new [data-retrofit*] elements
});
```

## Custom Shoelace path

By default the renderer loads Shoelace icons and assets from the jsDelivr CDN. Override it if you self-host:

```typescript
init({
  rootElement: document.body,
  apiBase: '/api/ui',
  shoelacePath: '/assets/shoelace/',
});
```

## When to choose this style

| Criterion | Script Islands |
|-----------|---------------|
| Frontend code required | Minimal (one `init()` call) |
| Works in any framework | Yes — Vue, React, vanilla HTML, anything |
| Each view is independent | Yes |
| Spec fetched at runtime | Yes (`data-retrofit-src`) or inline (`data-retrofit`) |
| Reactive to external state | No — re-mount to update |
| Navigation between views | Not built-in; host page manages routing |

For a dedicated admin page with built-in routing, see [Hosted SPA](/guide/hosted-spa). For SolidJS apps that want reactive props and lifecycle hooks, see [SolidJS Components](/guide/solidjs-components).
