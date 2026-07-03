# @retrofit-ui/builder-zod

## 0.0.6

### Patch Changes

- 083cffd: Add `configureMarked` to `@retrofit-ui/spa-solid-shoelace` for tweaking the shared `marked` singleton used by `MarkdownView` / `MarkdownViewComponent`. Import it from the package root and call before rendering:

  ```ts
  import { configureMarked } from "@retrofit-ui/spa-solid-shoelace";

  configureMarked({ gfm: true, breaks: true });
  ```

  Also bumps `@retrofit-ui/builder-zod` past `0.0.4` (unpublished due to a `workspace:^` leak from a prior `npm publish` — see #128 fallout). No functional change to builder-zod.

## 0.0.4

### Patch Changes

- Updated dependencies [31c8154]
  - @retrofit-ui/core@0.2.0

## 0.0.3

### Patch Changes

- 0339835: chore: improve npm package listings

  Sharpen descriptions, refine keywords for discoverability under "server-driven-ui" / "sdui" search terms, repoint homepage links to https://retrofitui.dev, upgrade author metadata to object form, and rewrite package READMEs with clearer hero paragraphs, realistic usage examples, and cross-links between sibling packages.

  No API or behavior changes.

- Updated dependencies [0339835]
  - @retrofit-ui/core@0.1.1

## 0.0.2

### Patch Changes

- Updated dependencies [67afe65]
  - @retrofit-ui/core@0.1.0
