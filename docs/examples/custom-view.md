# Custom View Example

**Pattern: a custom spec kind, rendered by a kit next to the built-in kinds**

The server sends a `rating` spec that core does not know. The client registers a SolidJS component for it and renders it, and every built-in kind, with `createRenderer({ kits })`.

Run it locally (Vite on `:5173`, proxying `/api` and `/retrofit.json` to Express on `:3000`):

```bash
just example custom-view
# or: pnpm --filter @retrofit-ui-examples/custom-view dev
```

## What it demonstrates

- Declaring a kind: a spec interface plus `SpecKinds` augmentation
- A kit: `defineKit` with `defineKind`, passed to `createRenderer`
- A custom kind nested in built-in containers (`card` inside `page`)
- One theme from `/retrofit.json` shared by built-in and custom views through Shoelace tokens

This example has its own client, so it serves no route table. It fetches the `/api/*` specs directly. An app that only adds kinds to the hosted app would use `createShell({ kits })` instead; see [Extending](/guide/extending).

## Specs served

From `src/server.ts`:

| Endpoint | Kind |
| --- | --- |
| `/api/hello-stat` | `stat` |
| `/api/hello-text` | `text` |
| `/api/hello-tabs` | `tabs` |
| `/api/hello-details` | `details` |
| `/api/product-ratings` | `rating` (custom) |
| `/api/rated-card` | `page` > `card` > `rating` |

## Declare the kind

From `src/spec.ts`. Server and client both import this file.

```typescript
export interface RatingSpec extends SpecNode<'rating'> {
  items: RatingItem[];
  metadata?: { title?: string };
}

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    rating: RatingSpec;
  }
}
```

## Register a component

From `client/ExtendedRenderer.tsx`:

```tsx
export const ratingKit = defineKit({
  name: 'rating',
  kinds: [defineKind({ kind: 'rating', component: RatingView })],
});

const renderer = createRenderer({ kits: [ratingKit] });

export function ExtendedRenderer(props: { spec: AppSpec }) {
  return <renderer.SpecRenderer spec={props.spec} />;
}
```

The imports come from `@retrofit-ui/spa-solid-shoelace/components`. That entry emits no CSS, so `client/main.tsx` also imports `@retrofit-ui/spa-solid-shoelace/renderer.css`.

## Theming

`RatingView` reuses `retrofit-view` and `retrofit-page-title`, and namespaces its own classes as `custom-rating-*`. The colors use `--sl-color-primary-*`, so the theme in `/retrofit.json` styles both kinds, under `pnpm dev` and under the built client alike. `client/main.tsx` applies the theme itself, because it does not use the hosted shell.
