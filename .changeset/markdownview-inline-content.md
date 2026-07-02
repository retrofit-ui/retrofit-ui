---
'@retrofit-ui/core': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

**Breaking:** `MarkdownViewSpec` now carries markdown inline via a required `content: string` field. The previous `entityEndpoint` + `field` pointer indirection has been removed — `MarkdownViewComponent` no longer makes a second fetch and renders `spec.content` directly.

This aligns `MarkdownViewSpec` with every other spec type (`TimelineSpec`, `StatSpec`, `CalendarSpec`) that embeds its data with the spec, and unblocks client-side use cases with no server to call back (streaming LLM output, client-generated content).

Migration: servers that previously returned `{ kind: 'markdown', entityEndpoint, field }` must now fetch the entity themselves and return `{ kind: 'markdown', content }`.
