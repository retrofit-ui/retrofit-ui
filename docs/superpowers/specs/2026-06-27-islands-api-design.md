# Islands API Design

**Date:** 2026-06-27
**Branch:** feat/renderer-docs-pages
**Scope:** Refactor `mount()` into `RetrofitUI.init()` + declarative island scanning

---

## Context

PR #106 introduced `mount(spec, element, options)` as a standalone renderer entry point. The API has two bugs and a design mismatch:

1. `setBasePath()` is called on every `mount()` — harmless but wrong
2. `extraCss` is appended to `<head>` on every `mount()` — duplicates styles on multi-island pages
3. The signature puts one-time setup options (`theme`, `shoelacePath`) alongside per-call arguments (`spec`, `element`), making it awkward to mount multiple islands

The goal is to support **islands of UI** in a plain HTML page — a blog post, a docs page, an internal tool — where retrofit components are embedded among prose or other content, without requiring the full SPA.

---

## HTML Authoring Surface

Two `data-*` attributes on any block element:

```html
<!-- inline: full spec JSON in the attribute (single quotes wrap it so JSON double quotes don't need escaping) -->
<div data-retrofit='{"kind":"stat","stats":[{"label":"Revenue","value":48290,"format":"currency"}]}'></div>

<!-- src: path to a statically hosted spec JSON file -->
<div data-retrofit-src="/specs/orders-table.json"></div>

<!-- both: src is the base spec, data-retrofit is a shallow-merge patch (inline wins on every top-level key) -->
<div
  data-retrofit-src="/specs/kpi-template.json"
  data-retrofit='{"stats":[{"label":"Revenue","value":48290,"format":"currency"}]}'
></div>
```

The host page includes the renderer script and calls `init()` once — typically at the bottom of `<body>` or in a layout template. Content authors (blog posts, prose pages) only write the `data-retrofit` / `data-retrofit-src` attributes; they never touch JS.

---

## JavaScript API

```typescript
interface InitOptions {
  /** Mandatory. Scopes all island scanning and DOM observation. */
  rootElement: HTMLElement;
  apiBase: string;
  theme?: {
    cssVariables?: Record<string, string>;
    extraCss?: string;
  };
  shoelacePath?: string;
  /** Watch rootElement for dynamically added islands via MutationObserver. */
  observe?: boolean;
}

interface IslandController {
  mount(spec: RootSpec, element: HTMLElement): () => void;
  unmount(element: HTMLElement): void;
  unmountAll(): void;
}

function init(options: InitOptions): IslandController;
```

`RetrofitUI.init(options)` is the sole entry point exposed on the global. The old `RetrofitUI.mount()` is removed.

`IslandController.mount()` is for explicit JS-side islands — it just renders, no setup. Returns the SolidJS disposal function. `unmount(el)` tears down a specific island. `unmountAll()` tears down everything (useful for SPA route teardown).

---

## `init()` Behavior (in order)

1. **Guard double-init** — if called a second time, log a warning and return the existing controller unchanged. Setup side-effects (base path, CSS injection) must only fire once.
2. **Set Shoelace base path** via `setBasePath()`
3. **Inject theme** — apply `cssVariables` to `:root`, append `extraCss` as a `<style>` tag
4. **Scan `[data-retrofit]`** — parse JSON, mount each element
5. **Scan `[data-retrofit-src]`** — fetch each URL, mount on response
6. **If `observe: true`** — install a `MutationObserver` scoped to `rootElement`; process new `[data-retrofit]` and `[data-retrofit-src]` elements as they appear
7. **Return** the `IslandController`

Timing: `init()` is called after the DOM is ready. The caller controls script placement (bottom of `<body>`, or inside `DOMContentLoaded`). No automatic deferral inside `init()`.

---

## Merge Semantics (both attributes present)

When an element has both `data-retrofit-src` and `data-retrofit`:

```
finalSpec = { ...fetchedSpec, ...inlineSpec }
```

Shallow merge, top-level only. Inline wins on every conflicting key. Arrays are replaced, not concatenated. `kind` should live in the src file; an inline `kind` override would replace it (valid but unusual).

---

## Error Handling

Errors are rendered into the element rather than thrown — a broken island must not crash the page.

| Failure | Rendered output |
|---|---|
| Invalid JSON in `data-retrofit` | `<p class="retrofit-error-message">...</p>` in the element |
| Failed fetch for `data-retrofit-src` | `<p class="retrofit-error-message">...</p>` in the element |
| Unknown spec kind | Existing `"Unknown spec kind"` fallback in `SpecRenderer` |
| `init()` called twice | `console.warn`, return existing controller |

---

## Implementation Scope

**`packages/spa-solid-shoelace/ui/mount.tsx`** — full rewrite:
- Remove `mount(spec, element, options)` export
- Add `init(options): IslandController` which becomes the IIFE global entry point
- Internal `mountIsland(spec, element, apiBase)` handles the SolidJS render call and tracks disposals for `unmount`/`unmountAll`
- Scan helpers: `processDataRetrofit(el)`, `processDataRetrofitSrc(el)` — handle parse/fetch/merge/render

**`packages/spa-solid-shoelace/vite.renderer.config.ts`** — no change needed; entry is already `ui/mount.tsx` and `name: 'RetrofitUI'` maps to the global

**`docs/guide/stat-view.md`** and **`docs/guide/calendar-view.md`** — update `RetrofitUI.mount(...)` examples to `RetrofitUI.init({ apiBase }).mount(...)`

---

## What Is Not In Scope

- Markdown renderer plugins (remark, markdown-it) — separate future work
- Custom element `<retrofit-ui>` — can be layered on top later
- Fetching specs from dynamic API endpoints — caller should use SolidJS components directly for that
