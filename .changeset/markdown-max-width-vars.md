---
'@retrofit-ui/spa-solid-shoelace': minor
---

Expose markdown typography as overridable CSS custom properties. `.retrofit-markdown`
now reads `--retrofit-markdown-max-width` (default `720px`), `--retrofit-markdown-line-height`
(default `1.7`), and `--retrofit-markdown-font-size` (default `var(--sl-font-size-medium)`),
so consumers can widen or restyle markdown globally, per-container, or per-instance without
`!important`. Defaults are unchanged.

Closes #134.
