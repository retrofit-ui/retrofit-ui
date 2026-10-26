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
      <SpecRenderer spec={dashboardStats} />
    </section>
  );
}
```

`SpecRenderer` inspects `spec.kind` and renders the appropriate view component. It takes `spec` and, optionally, `actions` (handlers for this subtree). There is no `apiBase`: endpoint urls in the spec are fetched exactly as written.

## Reactive specs with signals

Because `SpecRenderer` accepts a plain prop, you can drive it from a `createSignal` or a store:

```tsx
import { createResource, Show } from 'solid-js';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { Spec } from '@retrofit-ui/core';

function LiveView(props: { resource: string }) {
  const [spec] = createResource(
    () => props.resource,
    async (resource) => {
      const res = await fetch(`/api/ui/${resource}`);
      return res.json() as Promise<Spec>;
    },
  );

  return (
    <Show when={spec()} fallback={<p>Loading…</p>}>
      {(s) => <SpecRenderer spec={s()} />}
    </Show>
  );
}
```

When `props.resource` changes, `createResource` refetches and the view re-renders automatically.

## Table and form views with navigation

Views never navigate on their own: a row link, a toolbar button or a form's `onDone` is a `navigate` action in the spec (e.g. `{ type: 'navigate', to: '#/items/42' }`), resolved by the server. The built-in `navigate` handler sets `location.hash` for a `#` link and `location` otherwise, so **no router context is required**. To route with your own router, handle `navigate` yourself:

```tsx
import { useNavigate } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

const itemsSpec: TableSpec = {
  kind: 'table',
  columns: [
    { key: 'id',   label: 'ID',   type: 'number' },
    { key: 'name', label: 'Name', type: 'string' },
  ],
  rowLinkField: 'link', // each row from GET /items carries its own `link`
  toolbar: [{ label: 'New', action: { type: 'navigate', to: '/items/new' } }],
  endpoints: {
    list:   { method: 'GET',    url: '/items' },
    delete: { method: 'DELETE', url: '/items/{id}' },
  },
};

function ItemsTable() {
  const navigate = useNavigate(); // inside your app's <Router>
  return (
    <SpecRenderer
      spec={itemsSpec}
      actions={{ navigate: (action) => navigate(action.to) }}
    />
  );
}
```

Whatever owns a spec can also handle `refresh`, which tables and forms dispatch after a write — e.g. to refetch the spec you fetched with `createResource`.

## Rendering individual view components

If you only need one specific view type, import its component directly instead of going through `SpecRenderer`:

```tsx
import { TableViewComponent } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

// TableViewComponent takes the spec as a prop and renders the table
<TableViewComponent spec={myTableSpec} />
```

:::tip Note
Rendered on its own, `TableViewComponent` uses the built-in action handlers (and kinds); wrap it in `<Scope actions={...}>` or a renderer's `<Root>` to override them.
:::

## When to choose this style

| Criterion | SolidJS Components |
|-----------|-------------------|
| Frontend code required | Yes — you own the SolidJS app |
| Reactive to SolidJS signals | Yes |
| Navigation between views | Hash links work as-is; pass a `navigate` handler to use your router |
| Layout and composition | Fully under your control |
| Works in non-SolidJS apps | No |

For embedding views without adopting SolidJS, see [Script Islands](/guide/script-islands). For a standalone admin page, see [Hosted SPA](/guide/hosted-spa).
