# @retrofit-ui/spa-solid-shoelace

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
