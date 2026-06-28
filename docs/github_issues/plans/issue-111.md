# Plan: layouts guide page (flex + grid) — Issue #111

## Goal

Create `docs/guide/layouts.md` — the first documentation page for retrofit-ui's layout system. Users currently have no way to discover `row()`, `col()`, or `grid()`, or understand that layouts are purely positional containers with no data or endpoints.

This is a docs-only issue. No TypeScript packages are modified.

---

## Dependency

**Blocked by #109** — the `flex`/`grid` `ViewSpec` kinds and the `row()`, `col()`, `grid()` builder functions must already exist in `packages/builder-zod` and `packages/core` before the examples in this page can be considered accurate. Do not publish or link this page until #109 is merged.

**Feeds #113** — that issue adds the sidebar link to this page. Issue #111 only needs to create the file; #113 handles `docs/.vitepress/config.ts`.

---

## Files to change

| File | Action | Why |
|---|---|---|
| `docs/guide/layouts.md` | **Create** | The guide page itself — main deliverable |
| `docs/.vitepress/config.ts` | **Note only** | Sidebar entry belongs to #113; no change in this issue |

---

## Implementation approach

### Structure of `docs/guide/layouts.md`

Follow the established guide-page pattern exactly as seen in `table-view.md` and `stat-view.md`:

1. Opening paragraph — one or two sentences establishing what layouts are and are not (positional containers; no data; no endpoints).
2. **Flex layout** section — `row()` and `col()` with inline HTML `<PreviewBlock>` preview, then `:::details Spec` with the builder call, then a props table.
3. **Grid layout** section — `grid(columns, gap?)` with preview, spec details, and props table.
4. **Nesting** section — `col()` containing a `row()` of a form and a table side-by-side, with a preview and spec.
5. **Quick reference** table — `row(gap?)`, `col(gap?)`, `grid(columns, gap?)` signatures in one place.

### Section 1 — Flex layout

Show two sub-examples: `col()` (stacked layout) and `row()` (side-by-side).

**`col()` example** — a filter form stacked above a table. This is the most common real-world use case: a filter bar on top and a data table below.

Preview HTML: two stacked boxes (labelled "Filter form" and "Table") inside a flex-column container, styled with `var(--vp-c-bg-soft)` / `var(--vp-c-divider)` to convey the layout without full interactivity.

Builder code:
```typescript
import { col, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    col('16px')
      .filterForm(filterSpec)
      .table(tableSpec)
      .build()
  )
  .build();
```

**Props table for flex containers:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `direction` | `'row' \| 'column'` | `'row'` / `'column'` | Set by `row()` / `col()` |
| `gap` | `string` | (none) | Any CSS gap value, e.g. `'16px'` |
| `wrap` | `boolean` | `false` | Whether flex children wrap to next line |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | (none) | CSS `align-items` |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | (none) | CSS `justify-content` |

Note: `wrap`, `align`, and `justify` are not set by `row()`/`col()` — they must be passed to a `LayoutContainerBuilder` directly if needed (or via `add()` on a spec built with the raw object form). Since the current builder API only exposes `gap` as a shorthand arg, document that `wrap`/`align`/`justify` are available on the underlying spec type but are not surfaced by the builder helpers yet. Keep this note brief — don't suggest a workaround that doesn't exist in the codebase.

### Section 2 — Grid layout

**`grid(columns, gap?)` example** — two stat cards + a content area arranged in a 2-column grid with `grid(2, '16px')`.

Preview HTML: two boxes side-by-side inside a CSS grid container, styled to convey a 2-column equal-width layout.

Builder code:
```typescript
import { grid, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    grid(2, '16px')
      .add(statSpec1)
      .add(statSpec2)
      .build()
  )
  .build();
```

**Props table for grid containers:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `number` | — | Number of equal-width columns (`repeat(n, 1fr)`) |
| `columnTemplate` | `string` | — | Raw `grid-template-columns` value; overrides `columns` |
| `gap` | `string` | (none) | Any CSS gap value |

Note: `columns` and `columnTemplate` are mutually exclusive. When both are set, `columnTemplate` wins (the renderer uses it directly as the `grid-template-columns` CSS value).

### Section 3 — Nesting

Show a `col()` outer container containing a `row()` inner container that holds two children (a form and a table) side-by-side. This demonstrates that `flex`/`grid` containers can be composed to arbitrary depth.

Preview HTML: outer flex-column → inner flex-row → two equal boxes labelled "Form" and "Table".

Builder code:
```typescript
import { col, row, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    col('24px')
      .filterForm(filterSpec)      // stacked above
      .add(
        row('16px')
          .form(formSpec)          // side-by-side
          .table(tableSpec)
          .build()
      )
      .build()
  )
  .build();
```

### Section 4 — Quick reference

A minimal table at the bottom:

| Builder | Kind | Description |
|---|---|---|
| `row(gap?)` | `flex` | Horizontal flex container (`direction: 'row'`) |
| `col(gap?)` | `flex` | Vertical flex container (`direction: 'column'`) |
| `grid(columns, gap?)` | `grid` | CSS grid with `n` equal columns |

All three return a `LayoutContainerBuilder` with these chainable methods:
- `.add(spec)` — append any `ViewSpec` (leaf or nested layout)
- `.form(spec, title?)` — shorthand for `.add({ kind: 'form', spec, title })`
- `.table(spec)` — shorthand for `.add({ kind: 'table', spec })`
- `.filterForm(spec)` — shorthand for `.add({ kind: 'filter-form', spec })`
- `.markdown(spec)` — shorthand for `.add({ kind: 'markdown', spec })`

Call `.build()` to produce the `ViewSpec` object to pass to `pageSpec().add(...)`.

### Key callout (info block)

Use a VitePress `::: info` block to state clearly:

> Layouts carry no data of their own and have no endpoints. They are positional containers only — the leaf specs they contain (`table`, `form`, `stat`, etc.) handle their own data fetching via their own endpoint config.

---

## Key decisions

### Use `:::details Spec` for all code examples

Every guide page collapses the full builder spec behind a `:::details Spec` block. This keeps visual previews front and centre. Follow this pattern without exception.

### Preview HTML uses VitePress CSS variables, not Tailwind or hard-coded colours

All inline HTML in `<PreviewBlock>` blocks uses `var(--vp-c-bg)`, `var(--vp-c-divider)`, `var(--vp-c-text-1)`, etc. so previews adapt to both light and dark mode. Look at how `table-view.md` and `stat-view.md` do this and follow the same approach.

### Don't document `wrap`, `align`, `justify` builder methods that don't exist

The current `row(gap?)` and `col(gap?)` signatures only accept `gap`. The props `wrap`, `align`, and `justify` exist on the underlying `ViewSpec` type but are not exposed as builder shorthand args. Document them in the props table (with a note that they come from the underlying spec), but don't show code examples implying you can call `.wrap(true)` — those methods don't exist.

### Sidebar entry is out of scope

`docs/.vitepress/config.ts` is not modified here. Issue #113 adds the "Layouts" link to the "Views" sidebar section. If the implementer also wants to add the sidebar entry in this PR, they should note the decision and coordinate with whoever owns #113 to avoid a conflict.

### No Java section needed

The existing guide pages for views include a Java section (showing `TableSpec.builder()`, etc.). Layouts are TypeScript-builder-only — there is currently no Java equivalent for `row()`/`col()`/`grid()`. Omit a Java section entirely. If one is added later, it belongs in a follow-up issue.

---

## Edge cases

| Case | How to handle |
|---|---|
| `grid()` without `gap` | The `gap` argument is optional. In examples, always show it with a gap to make the visual clearer, but note in the table that it's optional. |
| Nesting to arbitrary depth | One level of nesting is enough for the docs example. Don't try to show 3+ levels — it becomes visually confusing. State in prose that nesting works to arbitrary depth. |
| `columnTemplate` vs `columns` | Note in the grid props table that they're mutually exclusive, but don't add a separate sub-section. One sentence is enough. |
| Readers on mobile or narrow viewport | The `<PreviewBlock>` HTML previews should use `overflow-x: auto` or `min-width` values that don't cause horizontal scroll. Look at how `table-view.md` handles wide tables and follow the same approach. |
| Dependency on #109 not yet merged | If this page is being drafted before #109 lands, the TypeScript snippets in `:::details Spec` blocks will not be runnable. That's fine for the docs — the plan specifies that the page should not be linked in the sidebar until #109 is merged. |

---

## Tests to write

This is a documentation-only change. There are no TypeScript files, no runtime behaviour, and no Vitest test targets.

**Manual verification** (not automated):

1. Run `cd docs && pnpm dev` and confirm the page renders at `http://localhost:5173/guide/layouts`.
2. Confirm all `<PreviewBlock>` sections render correctly in both light and dark mode.
3. Confirm the `:::details Spec` blocks collapse and expand.
4. Confirm there are no broken internal links.
5. Confirm `pnpm build` in the `docs/` directory completes without errors (VitePress catches broken links at build time).

**VitePress build check** (closest to automated):
```bash
cd docs && pnpm build
```
This catches: broken links, malformed frontmatter, unknown custom components used in Markdown, and syntax errors in code blocks.

---

## Implementation order

1. Create `docs/guide/layouts.md` with all four sections.
2. Run `cd docs && pnpm dev` to visually verify the page.
3. Run `cd docs && pnpm build` to confirm the build passes.
4. Do NOT modify `docs/.vitepress/config.ts` — that belongs to #113.
