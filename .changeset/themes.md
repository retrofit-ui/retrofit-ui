---
'@retrofit-ui/core': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

feat: theming system

Adds `ThemeConfig` and `ResolvedTheme` types to core. Renderers-solid exports `defaultTheme`, `resolveTheme`, `themeToClasses`, `ThemeProvider`, and `useTheme`. The ui-shell accepts an optional `theme` prop on `App` and applies it via SolidJS context. Tailwind CSS v3 is used for all styling with a safelist covering all possible theme class combinations.
