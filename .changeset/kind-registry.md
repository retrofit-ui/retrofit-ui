---
'@retrofit-ui/core': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

Add a kind registry and typed actions. `createRenderer({ kits, actions })` builds a renderer whose built-in containers (`page`, `card`, `flex`, `grid`, `tabs`) render their children through the registry, so app-defined kinds nest anywhere and can replace built-ins. Specs carry action descriptors (`{ type, ... }`) that components dispatch with `useActions()`; handlers are registered per type by kits, the renderer, or a subtree, and built-in mutations now go through the `http` action. `SpecRenderer` and `ViewRenderer` share one dispatch table, `./components` ships type declarations, and `init()` accepts `kits`/`actions`.
