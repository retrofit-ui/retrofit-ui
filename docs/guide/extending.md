# Extending retrofit-ui

**Best for:** teams that need a view type retrofit-ui doesn't ship — a rating widget, a map, a Gantt chart — without forking `@retrofit-ui/spa-solid-shoelace`.

retrofit-ui specs are transport-only JSON, so a "custom kind" is a shape you and the client agree on. You **register** it in two places: its type in `SpecKinds` (so specs that use it type-check everywhere, including inside built-in containers), and its component in a **kit** (so the renderer can draw it). Built-in containers — `page`, `card`, `flex`, `grid`, `tabs` — render their children through the same registry, so your kind nests anywhere a built-in can, and built-ins nest inside yours.

::: tip
This path assumes the [SolidJS Components](/guide/solidjs-components) adoption style: you build the client. The prebuilt bundles — the hosted SPA (`distPath`) and script islands (`./renderer`) — carry their own copy of Solid, which a component built elsewhere can't share, so they render the built-in kinds only.
:::

## The four pieces

1. **Declare the spec shape** and register it in `SpecKinds`.
2. **Write the component.** A SolidJS component that takes `{ spec }`.
3. **Put it in a kit** and build a renderer with `createRenderer({ kits })`.
4. Optionally, **declare actions** the component dispatches, and register their handlers.

A working example lives in [`examples/js/custom-view`](https://github.com/retrofit-ui/retrofit-ui/tree/main/examples/js/custom-view).

## 1. Declare and register the spec shape

Put the type in a file both server and client import.

```ts
// src/spec.ts
import type { Spec, SpecNode } from '@retrofit-ui/core';

export interface RatingItem {
  label: string;
  score: number; // 0..5, halves allowed
  note?: string;
}

export interface RatingSpec extends SpecNode<'rating'> {
  items: RatingItem[];
  metadata?: { title?: string };
}

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    rating: RatingSpec;
  }
}

// Every spec your app serves: the built-ins plus `rating`.
export type AppSpec = Spec;
```

`SpecKinds` maps each `kind` to its spec type, and `Spec` is the union of all of them. Registering `rating` makes it a `Spec`, so this type-checks — and an unregistered kind, or a rating with a wrong field, is a compile error:

```ts
const page: Spec = {
  kind: 'page',
  children: [{ kind: 'card', children: [{ kind: 'rating', items: [] }] }],
};
```

Each entry's key must equal its `kind`. Pick one that won't collide with a built-in (`table`, `form`, `filter-form`, `stat`, `calendar`, `tree`, `timeline`, `markdown`, `text`, `details`, `card`, `page`, `flex`, `grid`, `tabs`); namespace it if unsure — `'acme.rating'` is fine.

A container of your own extends `ContainerSpec`, whose `children` are `Spec[]`:

```ts
import type { ContainerSpec } from '@retrofit-ui/core';

export interface PanelSpec extends ContainerSpec<'acme.panel'> {
  accent?: string;
}
```

Follow existing conventions where sensible: `metadata.title` at the top means the user gets the familiar page-title behaviour for free.

## 2. Write the component

A plain SolidJS component. Follow the layout hooks used by built-in views (`retrofit-view`, `retrofit-page-title`) so themes and CSS variables keep working.

```tsx
// client/RatingView.tsx
import { For, Show } from 'solid-js';
import type { RatingSpec } from '../src/spec';

export function RatingView(props: { spec: RatingSpec }) {
  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <ul>
        <For each={props.spec.items}>
          {(item) => (
            <li>
              <strong>{item.label}</strong> — {'★'.repeat(item.score)}
              <Show when={item.note}> — {item.note}</Show>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
```

If your view needs data at render time, use `createResource` and read `apiBase` from `ApiBaseContext` — the same context the built-in views use. A container renders each child with `<RenderSpec spec={child} />`, which draws it with whatever the surrounding renderer has registered for its kind.

## 3. Put it in a kit and build a renderer

A kit is the unit you contribute: its kinds, and handlers for the action types they dispatch. `defineKind` infers `props.spec` from the kind.

```tsx
// client/ExtendedRenderer.tsx
import {
  createRenderer,
  defineKind,
  defineKit,
} from '@retrofit-ui/spa-solid-shoelace/components';
import type { AppSpec } from '../src/spec';
import { RatingView } from './RatingView';

export const ratingKit = defineKit({
  name: 'rating',
  kinds: [defineKind({ kind: 'rating', component: RatingView })],
});

const renderer = createRenderer({ kits: [ratingKit] });

export function ExtendedRenderer(props: { spec: AppSpec; apiBase: string }) {
  return <renderer.SpecRenderer spec={props.spec} apiBase={props.apiBase} />;
}
```

`createRenderer` returns `SpecRenderer` (one spec) and `Root` (a scope to render several `<RenderSpec>`s in). Kits apply in order; a kit kind registered under a built-in name replaces the built-in — and `builtinKinds` exports the built-in components, so an override can wrap one instead of rewriting it. A node whose kind isn't registered draws `fallback` ("Unsupported spec kind" by default).

## 4. Actions

When a component needs something to happen — add to cart, open a record — the spec carries an **action**: plain data with a `type`, never a template. The component dispatches it with the runtime values as a separate input, and the handler registered for that type decides what to do. Register the type in `ActionKinds` with its descriptor, input and result:

```ts
import type { ActionDescriptor, ActionEntry } from '@retrofit-ui/core';

export interface RateAction extends ActionDescriptor<'acme.rate'> {
  stars: number;
}

declare module '@retrofit-ui/core' {
  interface ActionKinds {
    'acme.rate': ActionEntry<RateAction, { itemId: string }, boolean>;
  }
}
```

```tsx
const { dispatch } = useActions();
const saved = await dispatch(props.spec.onRate, { itemId: item.id }); // boolean
```

Handlers are registered per type — in a kit, in `createRenderer({ actions })`, or for one subtree with `<renderer.Root actions={...}>` — and the innermost wins. Each receives `next()`, the handler further out, so it can wrap rather than replace it:

```ts
createRenderer({
  kits: [ratingKit],
  actions: {
    'acme.rate': async (action, input) => saveRating(input.itemId, action.stars),
    // Every write a built-in form or table makes goes through `http`.
    http: async (action, input, next) => {
      const response = await next();
      if (response.ok && action.method !== 'GET') refetchPage();
      return response;
    },
  },
});
```

Built-in types are `http`, `navigate` (`{ type: 'navigate', to }`) and `refresh` (refetches the surrounding page). Dispatching an unregistered type, a descriptor missing a field, or the wrong input is a compile error; dispatching a type nothing handles rejects at runtime.

## Server side

The server just returns JSON matching your spec shape. Import the same `src/spec.ts` and the registration applies there too, so the server's specs are checked against it:

```ts
app.get('/api/product-ratings', (_req, res) => {
  const spec: AppSpec = {
    kind: 'rating',
    metadata: { title: 'Product ratings' },
    items: [
      { label: 'Aeropress', score: 4.5, note: 'Reliable, easy to clean.' },
      { label: 'V60',       score: 4,   note: 'Great when you dial it in.' },
    ],
  };
  res.json(spec);
});
```

A server in another language just emits the JSON. If you want a builder for your kind, follow the pattern in `@retrofit-ui/builder-zod` — small classes with fluent methods and `.build()`.

## Theming: one theme, both surfaces

The extension contract also covers theming — the goal is a single theme payload that reaches both built-in views and your custom views without either fighting the other. Two rules make this work:

**Load the retrofit stylesheet.** The `/components` subpath deliberately ships without CSS side effects (consumers control load order). Import it once in your app entry:

```ts
// client/main.tsx
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
```

That gives you Shoelace's design tokens (`--sl-color-*`, `--sl-spacing-*`, `--sl-font-*`) plus retrofit-ui's layout classes (`.retrofit-view`, `.retrofit-page-title`, `.retrofit-stat-card`, ...). Skip this import and the built-in views render unstyled.

**Apply the theme at `:root`.** The prebuilt SPA reads `/retrofit.json` at boot and writes `cssVariables` to `document.documentElement` + appends `extraCss` as a `<style>`. When you own the client, reimplement the same helper:

```ts
function applyTheme(theme?: { cssVariables?: Record<string, string>; extraCss?: string }) {
  if (!theme) return;
  if (theme.cssVariables) {
    for (const [k, v] of Object.entries(theme.cssVariables)) {
      document.documentElement.style.setProperty(k, v);
    }
  }
  if (theme.extraCss) {
    const style = document.createElement('style');
    style.setAttribute('data-retrofit-theme', '');
    style.textContent = theme.extraCss;
    document.head.appendChild(style);
  }
}

const cfg = await fetch('/retrofit.json').then((r) => r.json());
applyTheme(cfg.theme);
```

**Reference tokens in your custom CSS, never hard-coded colours.** As long as every colour in your component's stylesheet goes through `var(--sl-color-*)`, the same theme that re-tints the built-in `stat` view will re-tint your custom `rating` view.

```css
/* rating-view.css */
.custom-rating-star--filled { color: var(--sl-color-primary-600); }
.custom-rating-star--empty  { color: var(--sl-color-neutral-300); }
.custom-rating-row          { border-bottom: 1px solid var(--sl-color-neutral-200); }
```

### Avoiding class-name collisions

retrofit-ui owns the `retrofit-*` prefix. **Namespace your own classes under a different prefix** — a project name, a component name, anything but `retrofit-`. If a future release adds `.retrofit-rating-*` and your example already uses that name, the two will silently overwrite each other's rules.

| Class origin        | Prefix           | Example                          |
| ------------------- | ---------------- | -------------------------------- |
| retrofit-ui         | `retrofit-*`     | `.retrofit-view`, `.retrofit-stat-card` |
| Your custom view    | `<yourprefix>-*` | `.custom-rating-row`, `.acme-map-marker` |

It's fine — encouraged, even — to *reuse* retrofit's shared layout classes (`.retrofit-view`, `.retrofit-page-title`) on your own component's outer container. That's how you inherit the shell's padding and typography for free. Just don't invent new `retrofit-*` classes yourself.

### End-to-end example

The `examples/js/custom-view` project is a runnable version of all of this: violet theme in `/retrofit.json`, `renderer.css` imported client-side, `RatingView` styled purely with `--sl-*` tokens, and Playwright assertions that both `.retrofit-page-title` (built-in and custom pages) resolve to the same computed colour.

## What you cannot extend

Some things live inside the built-in components and aren't seams:

- **Adding a new field type to `FormView`** (e.g. a color picker). The field-type dispatch is baked into `FormView.tsx`. Options: submit an upstream PR, or replace the `form` kind in your kit.
- **Adding a new column cell type to `TableView`**. Same story — the cell renderer is a hardcoded switch inside `TableView.tsx`.
- **Intercepting the reads the built-in views make.** Writes (form submits, row edits and deletes) go through the `http` action, so an `http` handler sees them; data loads and spec fetches still call `fetch` directly.

## When to choose this style

| Criterion                              | Extending retrofit-ui         |
| -------------------------------------- | ----------------------------- |
| Frontend build required                | Yes — you own the SolidJS app |
| Changes to `@retrofit-ui/core`         | None (you augment its registries) |
| Changes to `spa-solid-shoelace`        | None                          |
| Works with the prebuilt SPA or islands | No — they render built-in kinds only |
| Mixes built-in and custom kinds        | Yes — at any depth            |

If you don't need a new kind and just want to embed views, prefer [Script Islands](/guide/script-islands) or the [Hosted SPA](/guide/hosted-spa). Reach for extension only when the spec you need genuinely isn't in the catalog.
