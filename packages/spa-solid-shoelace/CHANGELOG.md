# @retrofit-ui/spa-solid-shoelace

## 0.4.0

### Minor Changes

- 25626e7: Add a drawer-based navigation to the SPA, driven by `/retrofit.json`.

  `retrofit.json` gains three optional fields:

  - `title` — sets the drawer header title and document title
  - `nav` — list of `{ label, href, icon? }` items rendered inside the drawer. `undefined` uses a built-in default (a single "Home" link at `/`); pass `null`, `false`, or `[]` to hide the nav entirely
  - The drawer is **hidden by default**. A floating hamburger button (top-left) opens it; Shoelace's built-in close button, backdrop click, or Escape key closes it again. Clicking a nav item also closes the drawer

  Example server config:

  ```ts
  app.get("/retrofit.json", (_req, res) =>
    res.json({
      apiBase: "/api/ui",
      title: "Blog Admin",
      theme: blogTheme,
      nav: [
        { label: "Posts", href: "/posts", icon: "file-text" },
        { label: "Reviews", href: "/reviews", icon: "star" },
      ],
    })
  );
  ```

  The drawer overlays content (with backdrop) rather than pushing it, so the main pane never reflows on toggle. Backends that don't need a nav at all can set `nav: false` (or `nav: []`) — the SPA renders full-width with no toggle button. The active nav item is highlighted based on the current hash-router path (including nested routes like `/posts/1`).

  Built on `sl-drawer` for focus trap, keyboard navigation, and ARIA plumbing.

- a410786: Expose markdown typography as overridable CSS custom properties. `.retrofit-markdown`
  now reads `--retrofit-markdown-max-width` (default `720px`), `--retrofit-markdown-line-height`
  (default `1.7`), and `--retrofit-markdown-font-size` (default `var(--sl-font-size-medium)`),
  so consumers can widen or restyle markdown globally, per-container, or per-instance without
  `!important`. Defaults are unchanged.

  Closes #134.

### Patch Changes

- 8bcd504: SpecRenderer now renders `text`, `tabs`, and `details` specs (previously
  "Unknown spec kind"). The fallback error now names the offending kind.

## 0.3.0

### Minor Changes

- 083cffd: Add `configureMarked` to `@retrofit-ui/spa-solid-shoelace` for tweaking the shared `marked` singleton used by `MarkdownView` / `MarkdownViewComponent`. Import it from the package root and call before rendering:

  ```ts
  import { configureMarked } from "@retrofit-ui/spa-solid-shoelace";

  configureMarked({ gfm: true, breaks: true });
  ```

  Also bumps `@retrofit-ui/builder-zod` past `0.0.4` (unpublished due to a `workspace:^` leak from a prior `npm publish` — see #128 fallout). No functional change to builder-zod.

## 0.2.0

### Minor Changes

- 31c8154: **Breaking:** `MarkdownViewSpec` now carries markdown inline via a required `content: string` field. The previous `entityEndpoint` + `field` pointer indirection has been removed — `MarkdownViewComponent` no longer makes a second fetch and renders `spec.content` directly.

  This aligns `MarkdownViewSpec` with every other spec type (`TimelineSpec`, `StatSpec`, `CalendarSpec`) that embeds its data with the spec, and unblocks client-side use cases with no server to call back (streaming LLM output, client-generated content).

  Migration: servers that previously returned `{ kind: 'markdown', entityEndpoint, field }` must now fetch the entity themselves and return `{ kind: 'markdown', content }`.

### Patch Changes

- Updated dependencies [31c8154]
  - @retrofit-ui/core@0.2.0

## 0.1.1

### Patch Changes

- 0339835: chore: improve npm package listings

  Sharpen descriptions, refine keywords for discoverability under "server-driven-ui" / "sdui" search terms, repoint homepage links to https://retrofitui.dev, upgrade author metadata to object form, and rewrite package READMEs with clearer hero paragraphs, realistic usage examples, and cross-links between sibling packages.

  No API or behavior changes.

- Updated dependencies [0339835]
  - @retrofit-ui/core@0.1.1

## 0.1.0

### Minor Changes

- 67afe65: feat: theming system

  Adds `ThemeConfig` and `ResolvedTheme` types to core. Renderers-solid exports `defaultTheme`, `resolveTheme`, `themeToClasses`, `ThemeProvider`, and `useTheme`. The ui-shell accepts an optional `theme` prop on `App` and applies it via SolidJS context. Tailwind CSS v3 is used for all styling with a safelist covering all possible theme class combinations.

### Patch Changes

- Updated dependencies [67afe65]
  - @retrofit-ui/core@0.1.0
