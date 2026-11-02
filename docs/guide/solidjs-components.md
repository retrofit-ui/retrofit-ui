# SolidJS Components

**Best for:** SolidJS apps that embed retrofit-ui views as normal components, driven by signals or stores.

In this style you import a renderer from `@retrofit-ui/spa-solid-shoelace/components` and render specs like any other component. Specs come in as props, and Solid renders again when they change. You own the layout, the routing and the lifecycle around the views.

## Setup

```bash
pnpm add @retrofit-ui/spa-solid-shoelace @retrofit-ui/core solid-js @solidjs/router @shoelace-style/shoelace
```

`solid-js`, `@solidjs/router` and `@shoelace-style/shoelace` (`^2.20.0`) are peer dependencies (`solid-js` and `@shoelace-style/shoelace` are marked optional, because only `./components` uses them, but a `./components` app needs both): the `./components` build uses your app's copies. You need `@solidjs/router` installed even if your app has no router. The build imports the Shoelace elements it uses from your `@shoelace-style/shoelace`, so your app has one Shoelace copy.

The `./components` build has no CSS. Import the stylesheet once in your entry:

```typescript
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
```

It has the Shoelace light theme tokens and the retrofit-ui layout classes. Without it, the views have no styles.

::: warning Shoelace assets
Shoelace loads its icons from a base path. The views use your `@shoelace-style/shoelace`, so your `setBasePath()` applies to them. `createShell` and `createIslands` keep a base path your app set earlier with `setBasePath()`. Their `shoelacePath` option replaces it. With neither, they set the jsDelivr CDN. With `createRenderer` or `SpecRenderer` only, call it yourself, or icons load from `/assets/icons/` on your own origin:

```typescript
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/');
```

A `data-shoelace` attribute on a script tag in your page also sets it.
:::

## Rendering a spec

`SpecRenderer` renders one spec with the built-in kinds:

```tsx
import type { StatSpec } from '@retrofit-ui/core';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';

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

`SpecRenderer` takes `spec` and, optionally, `actions` (handlers for this subtree; see [Actions](/guide/actions)). There is no `apiBase`: endpoint urls in the spec are fetched exactly as written.

## A renderer with your kits: `createRenderer` and `Root`

To render kinds of your own, or to set handlers once for the whole app, make a renderer:

```tsx
import type { Spec } from '@retrofit-ui/core';
import { createRenderer, RenderSpec } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

const renderer = createRenderer({
  kits: [ratingKit],
  actions: { navigate: (action) => console.log('navigate to', action.to) },
});

// One spec
function OneView(props: { spec: Spec }) {
  return <renderer.SpecRenderer spec={props.spec} />;
}

// Several specs in one scope
function TwoViews(props: { left: Spec; right: Spec }) {
  return (
    <renderer.Root>
      <div class="two-columns">
        <RenderSpec spec={props.left} />
        <RenderSpec spec={props.right} />
      </div>
    </renderer.Root>
  );
}
```

| `createRenderer` option | Description |
|-------------------------|-------------|
| `kits` | Kinds and action handlers to add. A later kit's kind replaces an earlier one, and a kit kind with a built-in name replaces the built-in. |
| `actions` | Handlers that win over every kit's and the built-ins, for everything this renderer draws. |
| `fallback` | Drawn for a node whose kind is missing or not registered. Defaults to `Unsupported spec kind: "<kind>"`. |

`renderer.Root` and `renderer.SpecRenderer` both take an optional `actions` prop, for that subtree only. `<RenderSpec>` must be inside a `Root` (or a `SpecRenderer`): it throws otherwise. The plain `SpecRenderer` export, used inside a renderer's `Root`, uses that renderer's kinds. See [Negotiating a new kind](/guide/extending).

## Reactive specs

`SpecRenderer` takes a plain prop, so a signal, a store or a resource can drive it:

```tsx
import type { Spec } from '@retrofit-ui/core';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import { createResource, Show } from 'solid-js';

function LiveView(props: { resource: string }) {
  const [spec, { refetch }] = createResource(
    () => props.resource,
    async (resource) => {
      const res = await fetch(`/api/ui/${resource}`);
      return (await res.json()) as Spec;
    },
  );

  return (
    <Show when={spec()} fallback={<p>Loading…</p>}>
      {(s) => <SpecRenderer spec={s()} actions={{ refresh: () => void refetch() }} />}
    </Show>
  );
}
```

When `props.resource` changes, `createResource` fetches again and the view renders the new spec. Tables and forms dispatch `refresh` after a write. Your app owns this spec, so the `refresh` handler above fetches it again. Without one, `refresh` does nothing. See [Actions](/guide/actions#refresh).

## Navigation

Views never navigate on their own. A row link, a toolbar button and a form's `onDone` are `navigate` actions with a finished `to`, from the producer. The built-in `navigate` handler sets `location.hash` for a `#` link and `location` for other links, so **you do not need a router**. To use your own router, handle `navigate`:

```tsx
import type { TableSpec } from '@retrofit-ui/core';
import { useNavigate } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';

const itemsSpec: TableSpec = {
  kind: 'table',
  columns: [
    { key: 'id',   label: 'ID',   type: 'number' },
    { key: 'name', label: 'Name', type: 'string' },
  ],
  rowLinkField: 'link', // each row from GET /items has its own `link`, e.g. "/items/7"
  toolbar: [{ label: 'New', action: { type: 'navigate', to: '/items/new' } }],
  endpoints: { list: { method: 'GET', url: '/items' } },
};

function ItemsTable() {
  const navigate = useNavigate(); // inside your app's <Router>
  return <SpecRenderer spec={itemsSpec} actions={{ navigate: (action) => navigate(action.to) }} />;
}
```

A `page` spec keeps its filters in the url's search params when it is inside a router, and in memory when it is not.

## Rendering one view component

`TableViewComponent` and `FormViewComponent` are exported, for when you need only that view:

```tsx
import { TableViewComponent } from '@retrofit-ui/spa-solid-shoelace/components';

<TableViewComponent spec={myTableSpec} />
```

::: tip Note
Rendered on its own, a view component uses the built-in action handlers. To change them, put it inside `<Scope actions={...}>` or a renderer's `<Root>`.
:::

## Theme

`createShell` applies the `theme` from `/retrofit.json` for you. In your own app, set the CSS variables on `:root` yourself, or put them in your stylesheet. See [Theming](/guide/theming).

## When to choose this style

| Criterion | SolidJS Components |
|-----------|-------------------|
| Frontend code required | Yes: you own the SolidJS app |
| Reactive to SolidJS signals | Yes |
| Navigation between views | Hash links work as they are; pass a `navigate` handler to use your router |
| Layout and composition | Fully under your control |
| Custom kinds | Yes, with `createRenderer({ kits })` |
| Works in non-SolidJS apps | No |

To embed views without SolidJS, see [Script Islands](/guide/script-islands). For a standalone admin page, see [Hosted SPA](/guide/hosted-spa).
