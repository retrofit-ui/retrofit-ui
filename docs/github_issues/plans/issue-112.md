# HOC Overview Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `docs/guide/higher-order-components.md` introducing `PageSpec` and `TableFormWorkflowBundle` as HOCs, and add a back-reference callout to `docs/guide/workflow-bundle.md`.

**Architecture:** Two markdown file changes only — one new file, one insertion. No code changes. VitePress renders both as static pages in the existing `/guide/` section. The sidebar link for the new page belongs to issue #5 and is not part of this issue.

**Tech Stack:** VitePress 1.x, Markdown, TypeScript code blocks (illustrative only — not executed by VitePress).

## Global Constraints

- Do not modify `docs/.vitepress/config.ts` — sidebar links for this page are owned by issue #5.
- All TypeScript snippets must match the real `pageSpec` / `TableFormWorkflowBundle` API (see verification steps).
- VitePress callout syntax: `::: tip`, `::: info`, `::: warning` blocks.
- Cross-links between guide pages use root-relative paths: `/guide/higher-order-components` (no `.md` extension).

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `docs/guide/higher-order-components.md` | New HOC overview page |
| Modify | `docs/guide/workflow-bundle.md` | Add back-reference tip callout at the top |

---

## Task 1: Create `docs/guide/higher-order-components.md`

**Files:**
- Create: `docs/guide/higher-order-components.md`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: a page at `/guide/higher-order-components` that Task 2 cross-links to

### API notes (read before writing examples)

From `packages/builder-zod/src/page-builder.ts`:
- `pageSpec()` returns a `PageSpecBuilder`
- `.title(string)` sets the page title
- `.table(TableSpec)` adds a table child at root level
- `.form(FormSpec, title?)` adds a form child at root level
- `.add(ViewSpec)` adds any composed layout as a child
- `.layout(LayoutConfig)` sets the root layout (`{ direction: 'row' | 'column', gap?: string, columns?: number }`)
- `col(gap?)`, `row(gap?)`, `grid(n, gap?)` return `LayoutContainerBuilder` — use `.add(col()...build())` to nest layouts

**`PageSpecBuilder.layout()` takes a `LayoutConfig` object, NOT a `LayoutContainerBuilder`.** So `pageSpec().layout(col())` is wrong; use `pageSpec().layout({ direction: 'column' })` or `pageSpec().add(col().table(spec).build())`.

- [ ] **Step 1: Write the file**

Create `docs/guide/higher-order-components.md` with the following content:

```markdown
# Higher-Order Components

Higher-order components (HOCs) in retrofit-ui are builders that compose multiple specs into a
named unit. Where a view like `TableView` or `FormView` produces a single spec for a single
route, an HOC produces a spec — or a bundle of specs — that orchestrates several views in one
call.

Two HOCs ship today:

| HOC | Output | When to reach for it |
|-----|--------|----------------------|
| `pageSpec` | A single `PageSpec` | Multi-component pages: dashboards, filter+table, form+table on one screen |
| `TableFormWorkflowBundle` | A `tableSpec` + `formSpec` pair | Standard list → edit CRUD flow across two routes |

---

## `pageSpec` — composed pages

`pageSpec` assembles multiple views (tables, forms, filter forms, markdown) into one page spec
served from a single endpoint. The client renders them as a stacked or side-by-side layout.

**When to use it:**
- You want a filter bar above a table on the same page.
- You want a create form and a table visible at once (dashboard style).
- You want a page with a stats summary beside a detail table.

### Example: table on a page

```typescript
import { pageSpec, TableView } from '@retrofit-ui/builder-zod';

const tableSpec = TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' })
  .build();

app.get('/api/ui/posts-page', (_req, res) => {
  res.json(
    pageSpec()
      .title('Posts')
      .table(tableSpec)
      .build()
  );
});
```

### Example: form and table side by side

Use `row()` + `.add()` to compose a two-column dashboard:

```typescript
import { pageSpec, row, formSpec, TableView } from '@retrofit-ui/builder-zod';

app.get('/api/ui/expenses-dashboard', (_req, res) => {
  res.json(
    pageSpec()
      .title('Expenses')
      .add(
        row()
          .form(createFormSpec, 'New Expense')
          .table(tableSpec)
          .build()
      )
      .build()
  );
});
```

Layout helpers — `col()`, `row()`, `grid(n)` — return a `LayoutContainerBuilder`. Call `.build()`
on them before passing to `.add()`.

---

## `TableFormWorkflowBundle` — CRUD route pairs

`TableFormWorkflowBundle` produces **two specs at once** for a standard list-then-edit flow: a
`TableSpec` for the collection route and a `FormSpec` for the item route. Clicking a table row
navigates to the form automatically.

**When to use it:**
- Standard admin CRUD: list page with a row that opens an edit form.
- You want the table and form to share one schema definition.

```typescript
import { TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';

const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .list({ method: 'GET', url: '/contacts' })
  .find({ method: 'GET', url: '/contacts/{id}' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// Two routes, two specs, one builder call
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/api/ui/contacts/:id', (req, res) => {
  // bake entity values onto form fields for the edit case
  const entity = store.find(req.params.id);
  const fields = bundle.formSpec.fields.map((f) =>
    entity?.[f.name] !== undefined ? { ...f, value: entity[f.name] } : f
  );
  res.json({ ...bundle.formSpec, fields });
});
```

For full configuration options (column overrides, form field overrides, inline editing comparison),
see the [Workflow Bundle guide](/guide/workflow-bundle).
```

- [ ] **Step 2: Verify VitePress can build the file**

Run from the repo root:

```bash
pnpm --filter @retrofit-ui/docs run build
```

Expected: build completes with no errors. Warnings about the missing sidebar entry for `/guide/higher-order-components` are acceptable (that is issue #5's responsibility). Build output goes to `docs/.vitepress/dist/`.

- [ ] **Step 3: Commit**

```bash
git add docs/guide/higher-order-components.md
git commit -m "docs: add higher-order components overview page (PageSpec + WorkflowBundle)"
```

---

## Task 2: Add back-reference to `docs/guide/workflow-bundle.md`

**Files:**
- Modify: `docs/guide/workflow-bundle.md`

**Interfaces:**
- Consumes: `/guide/higher-order-components` URL produced by Task 1
- Produces: a tip callout at the top of `workflow-bundle.md` linking to the HOC page

### Current state of `workflow-bundle.md`

Line 1 is `# Workflow Bundle`. The first paragraph (line 3) is:

```
`TableFormWorkflowBundle` combines a table view and a form view into a single builder,
producing two complementary specs you serve on a collection route and an item route. ...
```

- [ ] **Step 1: Insert the tip callout**

Insert the following block between line 1 (`# Workflow Bundle`) and line 3 (the opening paragraph). There should be a blank line before and after the callout block.

```markdown
::: tip Part of the Higher-Order Components family
`TableFormWorkflowBundle` is one of retrofit-ui's HOCs — builders that compose multiple specs
into a single unit. See the [Higher-Order Components overview](/guide/higher-order-components)
for how it relates to `pageSpec`.
:::
```

After the edit, the top of the file should look like:

```markdown
# Workflow Bundle

::: tip Part of the Higher-Order Components family
`TableFormWorkflowBundle` is one of retrofit-ui's HOCs — builders that compose multiple specs
into a single unit. See the [Higher-Order Components overview](/guide/higher-order-components)
for how it relates to `pageSpec`.
:::

`TableFormWorkflowBundle` combines a table view and a form view into a single builder, ...
```

- [ ] **Step 2: Verify build still passes**

```bash
pnpm --filter @retrofit-ui/docs run build
```

Expected: no new errors. The link `/guide/higher-order-components` resolves to the file created in Task 1.

- [ ] **Step 3: Commit**

```bash
git add docs/guide/workflow-bundle.md
git commit -m "docs: add HOC overview back-reference to workflow-bundle page"
```

---

## Edge cases

| Concern | Handling |
|---------|----------|
| VitePress dead-link detection | VitePress logs dead links as warnings by default. With Task 1 and 2 done together the cross-link `/guide/higher-order-components` → `workflow-bundle.md` resolves in both directions. Run the build after both tasks to confirm no warnings appear. |
| Code examples using wrong API | `pageSpec().layout(col())` is invalid (`.layout()` takes `LayoutConfig`, not `LayoutContainerBuilder`). The plan uses `pageSpec().add(row()...build())` for nested layouts. Do not change this to match the issue description verbatim. |
| Missing sidebar entry | Intentional — issue #5 owns the sidebar. The page is reachable at `/guide/higher-order-components` by URL; the tip callout in `workflow-bundle.md` makes it discoverable in the meantime. |
| `.md` extension in links | VitePress cross-links must omit `.md`. Use `/guide/higher-order-components`, not `/guide/higher-order-components.md`. |

---

## Tests

This is a documentation-only change. There are no unit or integration tests. Verification is:

1. **Build passes** — `pnpm --filter @retrofit-ui/docs run build` completes with no errors after both tasks.
2. **Cross-links resolve** — no dead-link warnings in the build output for `/guide/higher-order-components` or `/guide/workflow-bundle`.
3. **Spot-check rendered output** — run `pnpm --filter @retrofit-ui/docs run preview` (after build), open the workflow-bundle page and confirm the tip callout links to the HOC overview; open the HOC overview and confirm the `workflow-bundle` link at the bottom works.

```bash
# Full verification sequence
pnpm --filter @retrofit-ui/docs run build
pnpm --filter @retrofit-ui/docs run preview
# then open http://localhost:4173/guide/workflow-bundle
# and  http://localhost:4173/guide/higher-order-components
```

---

## Implementation order

1. Task 1 (create HOC page) — must exist before Task 2's link resolves cleanly in the build.
2. Task 2 (add back-reference) — depends on the URL established in Task 1.
