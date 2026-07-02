# Extending retrofit-ui

**Best for:** teams that need a view type retrofit-ui doesn't ship — a rating widget, a map, a Gantt chart — without forking `@retrofit-ui/spa-solid-shoelace`.

retrofit-ui specs are transport-only JSON, so a "custom kind" is just a shape you and the client both agree on. The client extension seam is **composition**: import the stock `SpecRenderer`, wrap it in a `<Switch>` that handles your kinds first, and delegate everything else.

::: tip
This path assumes the [SolidJS Components](/guide/solidjs-components) adoption style. The prebuilt SPA bundle (`distPath` from `@retrofit-ui/spa-solid-shoelace`) can't render unknown kinds — its `SpecRenderer` is compiled with a fixed `<Switch>`. If you want a custom kind, you own the client build.
:::

## The three pieces

Extending retrofit-ui always looks the same:

1. **Declare the spec shape.** A TypeScript interface with a unique `kind` discriminator. Widen the union your app accepts.
2. **Write the component.** A SolidJS component that takes `{ spec }` and renders it.
3. **Compose a renderer.** A wrapper around `SpecRenderer` that dispatches on `kind`.

A working example lives in [`examples/js/custom-view`](https://github.com/retrofit-ui/retrofit-ui/tree/main/examples/js/custom-view).

## 1. Declare the spec shape

Put the type in a file both server and client can import. Nothing here touches `@retrofit-ui/core`.

```ts
// src/spec.ts
import type { RootSpec } from '@retrofit-ui/core';

export interface RatingItem {
  label: string;
  score: number; // 0..5, halves allowed
  note?: string;
}

export interface RatingSpec {
  kind: 'rating';
  items: RatingItem[];
  metadata?: { title?: string };
}

// The union your app's renderer accepts.
export type AppSpec = RootSpec | RatingSpec;
```

Pick a `kind` string that won't collide with built-ins (`table`, `form`, `stat`, `calendar`, `tree`, `timeline`, `markdown`, `card`, `page`). Namespace it if you're unsure — `'acme.rating'` is fine.

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

If your view needs data at render time, use `createResource` and read `apiBase` from `ApiBaseContext` — the same context the built-in views use.

## 3. Compose a renderer

The extension mechanism is a `<Switch>` with `SpecRenderer` as the fallback. Custom kinds match first; everything else delegates.

```tsx
// client/ExtendedRenderer.tsx
import type { RootSpec } from '@retrofit-ui/core';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import { Match, Switch } from 'solid-js';
import type { AppSpec, RatingSpec } from '../src/spec';
import { RatingView } from './RatingView';

export function ExtendedRenderer(props: { spec: AppSpec; apiBase: string }) {
  return (
    <Switch
      fallback={
        <SpecRenderer spec={props.spec as RootSpec} apiBase={props.apiBase} />
      }
    >
      <Match when={props.spec.kind === 'rating'}>
        <RatingView spec={props.spec as RatingSpec} />
      </Match>
    </Switch>
  );
}
```

Wire this into your app the same way you'd wire `SpecRenderer`:

```tsx
import { HashRouter, Route } from '@solidjs/router';
import { ExtendedRenderer } from './ExtendedRenderer';

<HashRouter>
  <Route
    path="/*all"
    component={() => <ExtendedRenderer spec={mySpec} apiBase="/api" />}
  />
</HashRouter>
```

That's it. Add another kind later? Add another `<Match>`. Remove a kind? Delete the `<Match>` and the fallback catches it (as "Unknown spec kind" from the stock renderer).

## Server side

The server just returns JSON matching your spec shape. There's no builder or schema requirement for a custom kind — that's a separate convenience `@retrofit-ui/builder-zod` provides for the built-ins.

```ts
app.get('/api/product-ratings', (_req, res) => {
  const spec: RatingSpec = {
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

If you want a builder for your kind, follow the pattern in `@retrofit-ui/builder-zod` — small classes with fluent `.metadata()` / `.build()` methods. There's no framework hook to register with; a builder is just ergonomic sugar over the JSON.

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

- **Adding a new field type to `FormView`** (e.g. a color picker). The field-type dispatch is baked into `FormView.tsx`. Options: submit an upstream PR, or replace `FormView` entirely in your `ExtendedRenderer` when `kind === 'form'`.
- **Adding a new column cell type to `TableView`**. Same story — the cell renderer is a hardcoded switch inside `TableView.tsx`.
- **Injecting middleware into the fetch calls the built-in views make.** They call `fetch` directly. If you need auth headers or retry logic globally, use a service worker or wrap `window.fetch`.

For everything spec-shaped, the composition pattern above is the answer.

## When to choose this style

| Criterion                              | Extending retrofit-ui         |
| -------------------------------------- | ----------------------------- |
| Frontend build required                | Yes — you own the SolidJS app |
| Changes to `@retrofit-ui/core`         | None                          |
| Changes to `spa-solid-shoelace`        | None                          |
| Works with prebuilt SPA (`distPath`)   | No                            |
| Mixes built-in and custom kinds        | Yes — freely                  |

If you don't need a new kind and just want to embed views, prefer [Script Islands](/guide/script-islands) or the [Hosted SPA](/guide/hosted-spa). Reach for extension only when the spec you need genuinely isn't in the catalog.
