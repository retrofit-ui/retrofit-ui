# SolidJS Components

**Best for:** SolidJS apps that want to embed retrofit-ui views as native components, driven by reactive signals or stores rather than data attributes.

In this style you import `SpecRenderer` directly and render it like any other SolidJS component. Specs flow in as props; SolidJS's reactive graph handles re-renders when the spec changes. This is the only adoption style where you control the surrounding layout, routing, and component lifecycle from within your own application.

## Setup

```bash
pnpm add @retrofit-ui/spa-solid-shoelace @retrofit-ui/core
pnpm add @shoelace-style/shoelace
```

In your app's entry point, configure Shoelace before mounting your SolidJS app:

```typescript
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/');
```

## Rendering a spec as a component

```tsx
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { StatSpec } from '@retrofit-ui/core';

const dashboardStats: StatSpec = {
  kind: 'stat',
  stats: [
    { label: 'Active users', value: 1482, format: 'number' },
    { label: 'Revenue',      value: 94200, format: 'currency', currency: 'USD' },
    { label: 'Error rate',   value: 0.003, format: 'percent' },
  ],
};

function Dashboard() {
  return (
    <section>
      <h1>Dashboard</h1>
      <SpecRenderer spec={dashboardStats} apiBase="/api/ui" />
    </section>
  );
}
```

`SpecRenderer` inspects `spec.kind` and renders the appropriate view component. The `apiBase` prop tells it where to make any data-fetching requests.

## Reactive specs with signals

Because `SpecRenderer` accepts a plain prop, you can drive it from a `createSignal` or a store:

```tsx
import { createResource, createSignal } from 'solid-js';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { RootSpec } from '@retrofit-ui/core';

function LiveView(props: { resource: string }) {
  const [spec] = createResource(
    () => props.resource,
    async (resource) => {
      const res = await fetch(`/api/ui/${resource}`);
      return res.json() as Promise<RootSpec>;
    },
  );

  return (
    <Show when={spec()} fallback={<p>Loading…</p>}>
      {(s) => <SpecRenderer spec={s()} apiBase="/api/ui" />}
    </Show>
  );
}
```

When `props.resource` changes, `createResource` refetches and the view re-renders automatically.

## Table and form views with navigation

`TableViewComponent` calls `useNavigate()` to handle row clicks (navigating from a table row to a form). If you render a table spec that has `find` wired up, you need a router context:

```tsx
import { HashRouter, Route } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

const itemsSpec: TableSpec = {
  kind: 'table',
  columns: [
    { key: 'id',   label: 'ID',   type: 'number' },
    { key: 'name', label: 'Name', type: 'string' },
  ],
  endpoints: {
    list:   { method: 'GET',    url: '/items' },
    find:   { method: 'GET',    url: '/items/{id}' },  // enables row click → navigation
    create: { method: 'POST',   url: '/items' },
    delete: { method: 'DELETE', url: '/items/{id}' },
  },
};

function ItemsApp() {
  return (
    // Router context is required when find is set — rows navigate on click
    <HashRouter>
      <Route path="/" component={() => <SpecRenderer spec={itemsSpec} apiBase="/api/ui" />} />
    </HashRouter>
  );
}
```

For read-only views — stats, timelines, calendars, markdown — no router is needed.

## Rendering individual view components

If you only need one specific view type, import its component directly instead of going through `SpecRenderer`:

```tsx
import { TableViewComponent } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

// TableViewComponent takes the spec as a prop and renders the table
<TableViewComponent spec={myTableSpec} />
```

:::warning Note
`TableViewComponent` still calls `useNavigate()` internally and requires a router context when `spec.endpoints.find` is set.
:::

## When to choose this style

| Criterion | SolidJS Components |
|-----------|-------------------|
| Frontend code required | Yes — you own the SolidJS app |
| Reactive to SolidJS signals | Yes |
| Navigation between views | Your router (wrap with `<HashRouter>` if needed) |
| Layout and composition | Fully under your control |
| Works in non-SolidJS apps | No |

For embedding views without adopting SolidJS, see [Script Islands](/guide/script-islands). For a standalone admin page, see [Hosted SPA](/guide/hosted-spa).
