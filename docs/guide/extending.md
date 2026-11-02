# Negotiating a new kind

**Best for:** a screen that needs something the built-in kinds do not have, such as a rating widget, a map or a Gantt chart, without a fork of `@retrofit-ui/spa-solid-shoelace`.

A kind is a contract between two teams. The producer (a backend or a model) agrees to send specs of that shape. The renderer team agrees to draw them. The contract is a TypeScript type that both sides import, plus a JSON Schema fragment for producers in other languages. retrofit-ui's own kinds work the same way: `table` and `form` are entries in the same registry as yours.

There are four steps:

1. **Declare** the spec type, and register it in `SpecKinds`.
2. **Emit** it from the producer.
3. **Implement** it as a component, in a kit.
4. **Ship** the kit with `createShell`, `createIslands` or `createRenderer`.

A runnable version is in [`examples/js/custom-view`](https://github.com/retrofit-ui/retrofit-ui/tree/main/examples/js/custom-view); see also the [custom view example](/examples/custom-view).

::: tip You build the client
The prebuilt bundles, the hosted app (`distPath`) and the islands script (`./renderer`), carry their own copy of Solid and render the built-in kinds only. A custom kind needs a client entry that you build, from `@retrofit-ui/spa-solid-shoelace/components`. That entry can still be the full hosted app; see [step 4](#_4-ship-it).
:::

## 1. Declare the spec type

Put the type in a file that the producer and the client both import. Give the kind a namespace, so that it cannot collide with a built-in kind now or later.

```ts
// src/spec.ts
import type { ActionDescriptor, ActionEntry, SpecNode } from '@retrofit-ui/core';

export interface RatingItem {
  id: string;
  label: string;
  score: number; // 0..5, halves allowed
  note?: string;
}

/** Saves one rating. `url` arrives finished from the producer, e.g. `/ratings`. */
export interface RateAction extends ActionDescriptor<'acme.rate'> {
  url: string;
}

export interface RatingSpec extends SpecNode<'acme.rating'> {
  items: RatingItem[];
  /** When present, each item gets star buttons that dispatch it. */
  onRate?: RateAction;
  metadata?: { title?: string };
}

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'acme.rating': RatingSpec;
  }
  interface ActionKinds {
    // ActionEntry<descriptor, input from the component, result of the handler>
    'acme.rate': ActionEntry<RateAction, { itemId: string; stars: number }, boolean>;
  }
}
```

`SpecKinds` maps each `kind` to its spec type, and `Spec` is the union of all its entries. The key of each entry must equal its `kind`. After the registration, `acme.rating` is a `Spec`, so it type-checks in every place a spec can go, also inside the built-in containers:

```ts
import type { Spec } from '@retrofit-ui/core';

const page: Spec = {
  kind: 'page',
  children: [{ kind: 'card', children: [{ kind: 'acme.rating', items: [] }] }],
};
```

An unregistered kind, or a rating with a wrong field, is a compile error.

`ActionKinds` does the same for action types. `onRate` is a custom action: the spec says *what* to save, and the client's handler decides *how*. See [Actions](/guide/actions#custom-action-types).

Use the conventions of the built-in kinds where they fit. For example, `metadata.title` is the screen title in most built-in kinds.

## 2. Emit it from the producer

A TypeScript producer imports the same `src/spec.ts`, so its specs are checked against the registration:

```ts
import type { Spec } from '@retrofit-ui/core';
import './spec'; // the SpecKinds registration

app.get('/api/ui/product-ratings', (_req, res) => {
  const spec: Spec = {
    kind: 'acme.rating',
    metadata: { title: 'Product ratings' },
    onRate: { type: 'acme.rate', url: '/ratings' },
    items: [
      { id: 'aeropress', label: 'Aeropress', score: 4.5, note: 'Reliable, easy to clean.' },
      { id: 'v60', label: 'V60', score: 4, note: 'Great when you dial it in.' },
    ],
  };
  res.json(spec);
});
```

A producer in another language, or a model, sends the same JSON:

```json
{
  "kind": "acme.rating",
  "metadata": { "title": "Product ratings" },
  "onRate": { "type": "acme.rate", "url": "/ratings" },
  "items": [
    { "id": "aeropress", "label": "Aeropress", "score": 4.5, "note": "Reliable, easy to clean." }
  ]
}
```

`@retrofit-ui/core/schema.json` covers the built-in kinds only. For producers that validate against a schema, the team that owns the kind publishes a fragment for it:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RatingSpec",
  "type": "object",
  "required": ["kind", "items"],
  "properties": {
    "kind": { "const": "acme.rating" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "label", "score"],
        "properties": {
          "id": { "type": "string" },
          "label": { "type": "string" },
          "score": { "type": "number", "minimum": 0, "maximum": 5 },
          "note": { "type": "string" }
        }
      }
    },
    "onRate": {
      "type": "object",
      "required": ["type", "url"],
      "properties": { "type": { "const": "acme.rate" }, "url": { "type": "string" } }
    },
    "metadata": { "type": "object", "properties": { "title": { "type": "string" } } }
  }
}
```

The core schema is generated from the TypeScript types with `ts-json-schema-generator`, and you can generate a fragment for your type in the same way. In the core schema, the `children` of a built-in container accept built-in kinds only. Thus a `page` that contains `acme.rating` does not validate against `schema.json` alone. See [The spec contract](/guide/contract).

## 3. Implement it in a kit

The component is a plain SolidJS component that takes `{ spec }`. To draw the kind, `useActions()` gives it the same `dispatch` that the built-in views use:

```tsx
// client/RatingView.tsx
import { useActions } from '@retrofit-ui/spa-solid-shoelace/components';
import { For, Show } from 'solid-js';
import type { RatingSpec } from '../src/spec';

export function RatingView(props: { spec: RatingSpec }) {
  const { dispatch } = useActions();
  const rate = async (itemId: string, stars: number) => {
    const onRate = props.spec.onRate;
    if (!onRate) return;
    const saved = await dispatch(onRate, { itemId, stars }); // boolean
    if (saved) void dispatch({ type: 'refresh' });
  };
  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        {(title) => <h1 class="retrofit-page-title">{title()}</h1>}
      </Show>
      <ul class="acme-rating-list">
        <For each={props.spec.items}>
          {(item) => (
            <li class="acme-rating-row">
              <strong>{item.label}</strong> {item.score} / 5
              <Show when={props.spec.onRate}>
                <For each={[1, 2, 3, 4, 5]}>
                  {(stars) => (
                    <button type="button" onClick={() => void rate(item.id, stars)}>
                      {stars}★
                    </button>
                  )}
                </For>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
```

A kit is the unit that you ship: its kinds, and handlers for the action types they dispatch. `defineKind` checks that the component takes the spec of its `kind`.

```ts
// client/rating-kit.ts
import { defineKind, defineKit } from '@retrofit-ui/spa-solid-shoelace/components';
import { RatingView } from './RatingView';

export const ratingKit = defineKit({
  name: 'acme.rating',
  kinds: [defineKind({ kind: 'acme.rating', component: RatingView })],
  actions: {
    'acme.rate': async (action, input) => {
      const res = await fetch(action.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return res.ok;
    },
  },
});
```

A kit handler does not go through the app's `http` handlers (for example, auth headers). When an action only sends a request, make the spec field an `HttpAction` (`{ method, url }`) instead, and send it with `useHttp()` in the component. See [Actions](/guide/actions#dispatching-from-your-own-components).

To fetch data at render time, put the endpoint in the spec and fetch it with `useHttp()`. Urls in a spec are fetched as written, with no `apiBase` prefix.

### Containers of your own

A kind that lays out other specs extends `ContainerSpec`, whose `children` are `Spec[]`. It draws each child with `<RenderSpec>`, which uses the component that the surrounding renderer has for the child's kind:

```tsx
import type { ContainerSpec } from '@retrofit-ui/core';
import { RenderSpec } from '@retrofit-ui/spa-solid-shoelace/components';
import { For } from 'solid-js';

export interface PanelSpec extends ContainerSpec<'acme.panel'> {
  accent?: string;
}
// Register it: interface SpecKinds { 'acme.panel': PanelSpec }

export function PanelView(props: { spec: PanelSpec }) {
  return (
    <section class="acme-panel" style={{ 'border-color': props.spec.accent }}>
      <For each={props.spec.children}>{(child) => <RenderSpec spec={child} />}</For>
    </section>
  );
}
```

Built-in kinds nest inside your container, and your kinds nest inside built-in containers, at any depth.

## 4. Ship it

Give the kit to the entry that fits how the app is adopted. Each one also takes `actions`; see [Actions](/guide/actions#where-to-register-handlers).

::: code-group

```tsx [Hosted app]
// client/main.tsx: the hosted app, with your kit
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { createShell } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

void createShell({ kits: [ratingKit] }).mount(document.getElementById('root')!);
```

```ts [Islands]
// client/islands.ts: islands, with your kit
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import { createIslands } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

createIslands({ rootElement: document.body, kits: [ratingKit] });
```

```tsx [SolidJS components]
// client/AppSpec.tsx: inside your own SolidJS app
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import type { Spec } from '@retrofit-ui/core';
import { createRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import { ratingKit } from './rating-kit';

const renderer = createRenderer({ kits: [ratingKit] });

export function AppSpec(props: { spec: Spec }) {
  return <renderer.SpecRenderer spec={props.spec} />;
}
```

:::

- `createShell({ kits })` is the hosted app: it loads `/retrofit.json` and renders its routes, sidebar, title and theme. A route whose spec is `kind: 'acme.rating'`, or a page that contains one, draws your component. Serve the built entry instead of `distPath`. See [Hosted SPA](/guide/hosted-spa#your-own-client-entry).
- `createIslands({ rootElement, kits })` takes the same options as `init()` from `./renderer`, plus `kits`. See [Script Islands](/guide/script-islands#islands-with-your-own-kinds).
- `createRenderer({ kits })` returns `SpecRenderer` (one spec) and `Root` (a scope for several `<RenderSpec>`s). See [SolidJS Components](/guide/solidjs-components).

All three need `solid-js`, `@solidjs/router` and `@shoelace-style/shoelace` in your app, and the stylesheet `@retrofit-ui/spa-solid-shoelace/renderer.css`.

Kits apply in order. A node whose kind no kit and no built-in has draws the renderer's `fallback`: `Unsupported spec kind: "<kind>"` by default. To change it, pass `createRenderer({ fallback })`.

## Overriding or wrapping a built-in kind

A kit kind with a built-in name (`form`, `card`, `markdown`, …) replaces the built-in. `builtinKinds` exports the built-in components, so an override can wrap one and does not have to rewrite it:

```tsx
import {
  builtinKinds,
  defineKind,
  defineKit,
} from '@retrofit-ui/spa-solid-shoelace/components';
import type { MarkdownViewSpec } from '@retrofit-ui/core';

const BuiltinMarkdown = builtinKinds.markdown;

function FramedMarkdown(props: { spec: MarkdownViewSpec }) {
  return (
    <div class="acme-frame">
      <BuiltinMarkdown spec={props.spec} />
    </div>
  );
}

export const framedKit = defineKit({
  name: 'acme.framed-markdown',
  kinds: [defineKind({ kind: 'markdown', component: FramedMarkdown })],
});
```

## Styling your kind

- Load `@retrofit-ui/spa-solid-shoelace/renderer.css` once. It has the Shoelace light theme tokens and the retrofit-ui layout classes. The `./components` build has no CSS of its own.
- Use the shared layout classes (`retrofit-view`, `retrofit-page-title`) on your outer element, so that your kind gets the same padding and type as the built-in views.
- Give every color as a token (`var(--sl-color-primary-600)`), not as a literal value. Then the `theme` in `/retrofit.json` changes your kind and the built-in kinds together. See [Theming](/guide/theming).
- Do not start your own class names with `retrofit-`. That prefix belongs to retrofit-ui. Use your namespace, for example `acme-rating-row`.

## What you cannot extend

These are not extension points:

- **A new form field type** (for example, a color picker). The field types are fixed in the `form` component. Replace the `form` kind in your kit, or send a change upstream.
- **A new table cell type.** The same applies to the `table` component.

The requests that built-in views make are not in this list: they all go through the `http` action, so a handler can change them. See [Actions](/guide/actions).

## The example

`examples/js/custom-view` has the full set: a `rating` kind registered in `src/spec.ts`, a kit in `client/ExtendedRenderer.tsx`, a rating inside a built-in `card` and `page`, and a theme in `/retrofit.json` that colors the built-in views and the custom view together. The example uses the bare kind name `rating`; for your own kinds, use a namespace. It has its own client shell instead of `createShell`, so it reads `/retrofit.json` only for the theme.
