# custom-view example

Shows how to extend retrofit-ui with a **custom spec kind** and a **custom
SolidJS component**, composed with the stock `SpecRenderer`.

The example ships two endpoints:

| Endpoint                | Kind         | Rendered by                      |
| ----------------------- | ------------ | -------------------------------- |
| `/api/hello-stat`       | `stat`       | built-in `SpecRenderer`          |
| `/api/product-ratings`  | `rating` ⭐  | our `RatingView` (userland code) |

## Files

- `src/spec.ts` — declares `RatingSpec` and `AppSpec = RootSpec | RatingSpec`.
  No changes to `@retrofit-ui/core` required.
- `src/server.ts` — Express API returning both a built-in and a custom spec,
  plus a themed `/retrofit.json`.
- `client/RatingView.tsx` + `client/rating-view.css` — custom view. Styles
  read Shoelace tokens (`--sl-color-primary-*`, `--sl-spacing-*`), so the
  same theme drives both built-in and custom surfaces.
- `client/ExtendedRenderer.tsx` — a `defineKit` kit that holds the `rating`
  kind, passed to `createRenderer({ kits })`. The built-in kinds stay in the
  same registry.
- `client/main.tsx` — imports `@retrofit-ui/spa-solid-shoelace/renderer.css`
  (retrofit layout + Shoelace tokens), fetches `/retrofit.json`, applies the
  theme at `:root`, then mounts.

## Theming

One theme, both surfaces. `/retrofit.json` returns the same `cssVariables` +
`extraCss` shape the prebuilt SPA understands. At boot the client writes the
variables to `document.documentElement` and appends `extraCss` as a
`<style>` — after that, the built-in stat view AND the custom rating view
pick up the theme through the shared Shoelace tokens they both consume.

Custom classes are namespaced as `custom-rating-*` so they can never collide
with retrofit-ui's `retrofit-*` prefix (which the library owns).

## Run

```sh
pnpm install
pnpm dev
```

Vite serves the client on `:5173` and proxies `/api` and `/retrofit.json` to Express on `:3000`.

## Why this shape?

A kind is a component plus a name. `defineKind` binds them, `defineKit` groups
kinds, and `createRenderer({ kits })` from
`@retrofit-ui/spa-solid-shoelace/components` builds a renderer whose registry
holds the built-in kinds and yours. Built-in containers render custom kinds as
children too.

See [Extending retrofit-ui](../../../docs/guide/extending.md) for the full
walkthrough.
