# @retrofit-ui/spa-solid-shoelace

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
