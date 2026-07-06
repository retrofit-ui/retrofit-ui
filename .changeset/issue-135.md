---
'@retrofit-ui/spa-solid-shoelace': minor
---

Allow `SpecRenderer` to be extended with custom component and container kinds via a new optional `extensions` prop.

Pass a `kind → renderer` map to render your own spec kinds alongside the built-ins; container renderers receive a `Dispatch` component so their children route back through the merged registry. Also exports the new `Renderer`, `ExtensionRegistry`, `Dispatch`, and `AnySpec` types to support authoring custom renderers.
