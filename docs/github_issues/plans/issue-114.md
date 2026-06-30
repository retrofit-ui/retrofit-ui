# Plan: Update contacts demo to demonstrate layout composition — Issue #114

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the contacts collection route in a `PageSpec` with a `col()` layout, making `/#/contacts` demonstrate three-tier layout composition: `pageSpec().layout(col()) → table`.

**Architecture:** Four concerns must be addressed in order: (1) the builder API has a type gap — `col()` returns `LayoutContainerBuilder` but `layout()` takes `LayoutConfig`, so the issue's call won't compile; (2) the server route and data-fetch handler need updating; (3) the VitePress MSW mock must match; (4) docs copy and E2E tests need updating to reflect changed rendering (from full-featured `TableView` to the simpler `TablePane` inside `PageView`).

**Tech Stack:** TypeScript, Vitest (unit), Playwright (e2e), Vue 3 (VitePress mock), SolidJS SPA

## Global Constraints

- No new npm dependencies
- `pnpm -w typecheck` must pass after every task
- `pnpm -w test` (Vitest) must pass after every task
- Do not modify the `contacts-by-type` route or its E2E tests
- All existing passing E2E tests in other example directories must remain unaffected

---

## Files to change

| File | Action | Why |
|------|--------|-----|
| `packages/builder-zod/src/page-builder.ts` | Modify | `layout()` must accept `LayoutContainerBuilder`; add `layoutConfig()` to extract config |
| `packages/builder-zod/src/__tests__/page-builder.test.ts` | Modify | Add `PageSpecBuilder` unit tests (currently absent) |
| `examples/js/contacts/src/server.ts` | Modify | Collection route wraps in `PageSpec`; pagination handler fix for empty `page=` param |
| `docs/.vitepress/theme/ContactsDemo.vue` | Modify | Update MSW mock from flat `TableSpec` to `PageSpec` shape |
| `docs/examples/contacts.md` | Modify | Add layout bullet; update server snippet and route table |
| `examples/js/contacts/e2e/contacts.spec.ts` | Modify | Remove tests relying on `TableView`-only features; add layout-context assertions |

---

## Key design decisions

### 1. Making `layout(col())` compile

`col()` returns a `LayoutContainerBuilder`. `PageSpecBuilder.layout()` currently accepts only `LayoutConfig`. These are structurally incompatible — `LayoutContainerBuilder` has no public `direction` property, so TypeScript rejects the call.

**Fix:** Add a `layoutConfig()` method to `LayoutContainerBuilder` that returns `{ ...this._props } as LayoutConfig`. This is safe because `_props` is only ever set by the `col()`, `row()`, and `grid()` factory functions, which pass valid `LayoutConfig`-shaped objects. Then change `layout()`'s signature to `LayoutConfig | LayoutContainerBuilder` and branch on `instanceof`.

```typescript
// LayoutContainerBuilder — new method
layoutConfig(): LayoutConfig {
  return { ...this._props } as LayoutConfig;
}

// PageSpecBuilder — updated method
layout(config: LayoutConfig | LayoutContainerBuilder): this {
  this._layout =
    config instanceof LayoutContainerBuilder
      ? config.layoutConfig()
      : config;
  return this;
}
```

### 2. PageSpec title

`TableView` (used for top-level route rendering) falls back to `params.resource` (`"contacts"`) as the page heading when a `TableSpec` has no `metadata.title`. `PageView` only renders an `<h1>` when `spec.title` is set — there is no fallback. Without an explicit title, the "Contacts" heading disappears, breaking the existing E2E test and degrading the UX.

**Fix:** Call `.title('Contacts')` on the `pageSpec()` in `server.ts`.

### 3. Server pagination handler with empty `page=` param

`bundle.tableSpec.endpoints.list.url` is `/contacts?page={page}&pageSize={pageSize}`. Inside `PageView`, `TablePane` substitutes URL params from `useSearchParams()`. When the user first lands on `/#/contacts`, `page` and `pageSize` are not in the URL, so `firstParam(undefined) = ''` and the URL becomes `/contacts?page=&pageSize=`.

The current `/contacts` handler uses:
```typescript
if (req.query.page !== undefined || req.query.pageSize !== undefined) {
```
An empty string is not `undefined`, so the condition is true. Then `Number('') = 0`, giving `page = 0`, `start = (0 - 1) * 0 = 0`, `all.slice(0, 0) = []` — an empty table.

**Fix:** Change the condition to only paginate when numeric values are ≥ 1:
```typescript
const page = Number(req.query.page);
const pageSize = Number(req.query.pageSize);
if (page > 0 && pageSize > 0) {
  const start = (page - 1) * pageSize;
  res.json(all.slice(start, start + pageSize));
} else {
  res.json(all);
}
```

### 4. Behavior changes at `TABLE_URL = '/#/contacts'`

When `GET /api/ui/contacts` returned a `TableSpec`, `TableView` rendered it with its full feature set: `params.resource` heading fallback, "New" button, clickable rows (navigate to `/contacts/:id`), pagination controls.

When it returns a `PageSpec`, `TableView` detects `kind === 'page'` and delegates to `PageView` → `BoxPane` → `ViewRenderer` → `TablePane`. `TablePane` is the simpler embedded renderer: no "New" button, no row-click navigation, no pagination UI. All contacts render in one flat list (server pagination fix above ensures they appear).

E2E tests that relied on row-click nav, New button, and pagination must be removed or updated. Tests that navigate directly to `/contacts/new` or `/contacts/:id` are unaffected.

### 5. ContactsDemo.vue mock shape

`PageSpec` children are `ViewSpec[]`. A table `ViewSpec` is `{ kind: 'table', spec: TableSpec }` — the actual `TableSpec` is nested inside a `spec` property. The current mock is a flat `{ kind: 'table', ...columns, ...endpoints }` passed directly. After the change, the mock must wrap the `TableSpec` in the `ViewSpec` envelope inside a `PageSpec`.

---

## Task 1: Unit tests for `PageSpecBuilder` (TDD — write failing tests first)

**Files:**
- Modify: `packages/builder-zod/src/__tests__/page-builder.test.ts`
- Modify: `packages/builder-zod/src/__tests__/page-builder.test.ts` — add `pageSpec` to the import

**Interfaces:**
- Produces: failing tests until Task 2 fixes the API

- [ ] **Step 1: Add `pageSpec` to the import line**

In `packages/builder-zod/src/__tests__/page-builder.test.ts`, line 2, change:
```typescript
// Before:
import { col, grid, row } from '../page-builder';

// After:
import { col, grid, pageSpec, row } from '../page-builder';
```

- [ ] **Step 2: Add the PageSpecBuilder test suite at the end of the file**

```typescript
describe('pageSpec() — PageSpecBuilder', () => {
  it('layout(col()) accepts a LayoutContainerBuilder and records direction column', () => {
    const spec = pageSpec()
      .layout(col())
      .table({ kind: 'table', columns: [], endpoints: {} })
      .build();
    expect(spec.kind).toBe('page');
    expect(spec.layout).toEqual({ direction: 'column' });
    expect(spec.children).toHaveLength(1);
    expect((spec.children[0] as { kind: string }).kind).toBe('table');
  });

  it('layout(col(gap)) captures the gap', () => {
    const spec = pageSpec().layout(col('16px')).build();
    expect(spec.layout).toEqual({ direction: 'column', gap: '16px' });
  });

  it('layout(row()) records direction row', () => {
    const spec = pageSpec().layout(row()).build();
    expect(spec.layout).toEqual({ direction: 'row' });
  });

  it('layout(grid(3)) records columns', () => {
    const spec = pageSpec().layout(grid(3)).build();
    expect(spec.layout).toEqual({ columns: 3 });
  });

  it('still accepts a plain LayoutConfig object', () => {
    const spec = pageSpec().layout({ direction: 'column', gap: '8px' }).build();
    expect(spec.layout).toEqual({ direction: 'column', gap: '8px' });
  });

  it('title(), layout(), table() chain produces correct PageSpec', () => {
    const spec = pageSpec()
      .title('Contacts')
      .layout(col())
      .table({ kind: 'table', columns: [], endpoints: {} })
      .build();
    expect(spec.kind).toBe('page');
    expect(spec.title).toBe('Contacts');
    expect(spec.layout).toEqual({ direction: 'column' });
    expect(spec.children).toHaveLength(1);
  });

  it('omits title and layout when not set', () => {
    const spec = pageSpec().build();
    expect(spec.title).toBeUndefined();
    expect(spec.layout).toBeUndefined();
    expect(spec.children).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run tests — expect compile/type errors or test failures**

```bash
pnpm --filter @retrofit-ui/builder-zod test
```

Expected: TypeScript error — `Argument of type 'LayoutContainerBuilder' is not assignable to parameter of type 'LayoutConfig'`. The tests will not compile until Task 2.

---

## Task 2: Fix `layout()` to accept `LayoutContainerBuilder`

**Files:**
- Modify: `packages/builder-zod/src/page-builder.ts`

**Interfaces:**
- Consumes: `LayoutConfig` from `@retrofit-ui/core` (already imported)
- Produces: `pageSpec().layout(col())` compiles; Task 1 tests pass

- [ ] **Step 1: Add `layoutConfig()` to `LayoutContainerBuilder`**

In `packages/builder-zod/src/page-builder.ts`, inside the `LayoutContainerBuilder` class, add this method after `markdown()`:

```typescript
/** Extract the layout configuration for use with PageSpecBuilder.layout(). */
layoutConfig(): LayoutConfig {
  return { ...this._props } as LayoutConfig;
}
```

- [ ] **Step 2: Update `PageSpecBuilder.layout()` signature and body**

In `PageSpecBuilder`, replace:
```typescript
// Before:
layout(config: LayoutConfig): this {
  this._layout = config;
  return this;
}

// After:
layout(config: LayoutConfig | LayoutContainerBuilder): this {
  this._layout =
    config instanceof LayoutContainerBuilder
      ? config.layoutConfig()
      : config;
  return this;
}
```

- [ ] **Step 3: Run unit tests**

```bash
pnpm --filter @retrofit-ui/builder-zod test
```

Expected: All tests in `page-builder.test.ts` pass, including the six new `PageSpecBuilder` tests.

- [ ] **Step 4: Type-check**

```bash
pnpm -w typecheck
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/builder-zod/src/page-builder.ts packages/builder-zod/src/__tests__/page-builder.test.ts
git commit -m "feat(builder-zod): layout() accepts LayoutContainerBuilder from col()/row()/grid()"
```

---

## Task 3: Update the contacts server route

**Files:**
- Modify: `examples/js/contacts/src/server.ts`

**Interfaces:**
- Consumes: `pageSpec`, `col` from `@retrofit-ui/builder-zod` (both already imported at line 4)
- Produces: `GET /api/ui/contacts` returns `PageSpec`; `/contacts` list handler treats empty page param as "no pagination"

- [ ] **Step 1: Fix the `/contacts` list handler**

In `examples/js/contacts/src/server.ts`, replace the list route:

```typescript
// Before:
app.get('/contacts', (req, res) => {
  const type = req.query.type as string | undefined;
  const all = type ? store.byType(type) : store.all();
  if (req.query.page !== undefined || req.query.pageSize !== undefined) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 2);
    const start = (page - 1) * pageSize;
    res.json(all.slice(start, start + pageSize));
  } else {
    res.json(all);
  }
});

// After:
app.get('/contacts', (req, res) => {
  const type = req.query.type as string | undefined;
  const all = type ? store.byType(type) : store.all();
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  if (page > 0 && pageSize > 0) {
    const start = (page - 1) * pageSize;
    res.json(all.slice(start, start + pageSize));
  } else {
    res.json(all);
  }
});
```

Note: Explicit numeric pagination (`page=1&pageSize=2`) still works — only empty/zero values fall through to "return all."

- [ ] **Step 2: Update the collection route to return a `PageSpec`**

In `examples/js/contacts/src/server.ts`, replace line 89:

```typescript
// Before:
// Collection route → table spec (rows are fetched client-side via its list endpoint)
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));

// After:
// Collection route → PageSpec: demonstrates layout (col) → component (table) composition
app.get('/api/ui/contacts', (_req, res) =>
  res.json(
    pageSpec()
      .title('Contacts')
      .layout(col())
      .table(bundle.tableSpec)
      .build(),
  ),
);
```

- [ ] **Step 3: Type-check**

```bash
pnpm -w typecheck
```

Expected: No errors. `col` and `pageSpec` are already imported at the top of `server.ts`.

- [ ] **Step 4: Commit**

```bash
git add examples/js/contacts/src/server.ts
git commit -m "feat(contacts): collection route returns PageSpec with col() layout"
```

---

## Task 4: Update E2E tests for changed `TABLE_URL` rendering

**Files:**
- Modify: `examples/js/contacts/e2e/contacts.spec.ts`

**Context:** After Task 3, `GET /api/ui/contacts` returns a `PageSpec`. `TableView` (App-level router) detects `kind === 'page'` (line 79 of `TableView.tsx`) and delegates to `PageView`. Inside `PageView`, the table child is rendered by `TablePane` — not `TableViewComponent`. `TablePane` is simpler:

- **Has:** correct column headers in `<thead>`, row data via `list` endpoint, `<table class="retrofit-table">`, `.retrofit-thead`/`.retrofit-th` CSS classes
- **Does not have:** "New" button, row-click navigation, pagination controls

Tests at `TABLE_URL` that depend on the removed features must be updated. Tests that navigate directly to `/contacts/new` or `/contacts/:id` are unaffected.

- [ ] **Step 1: Replace the `'Contacts table view'` describe block**

Remove the original block and replace with:

```typescript
test.describe('Contacts table view', () => {
  test('renders table with Contacts heading and column headers', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(
      page.getByRole('heading', { name: 'Contacts' }),
    ).toBeVisible();

    await expect(
      page.locator('th').filter({ hasText: 'Name' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Email' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Type' }),
    ).toBeVisible();
  });

  test('table header has deep green background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(20, 83, 45)'); // #14532d green-900
  });

  test('all seed contacts are visible without pagination', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    // TablePane inside PageView shows all contacts (no pagination controls)
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();
  });
});
```

Removed tests: `'table rows are clickable'` (TablePane has no row-click nav), `'renders … page-1 seed data, and New button'` (New button is a TableView feature).

- [ ] **Step 2: Delete the entire `'Contacts table — pagination'` describe block**

Remove all seven tests in `test.describe('Contacts table — pagination', ...)`. `TablePane` does not render `sl-icon-button[name="chevron-left"]` or `sl-icon-button[name="chevron-right"]` controls — pagination is intentionally absent in the layout-embedded renderer.

- [ ] **Step 3: Update the first `'Create new contact'` test**

The original test clicks the "New" button on the table view. Replace it with direct URL navigation:

```typescript
// Before:
test('navigates to new form and shows Shoelace fields', async ({ page }) => {
  await page.goto(TABLE_URL);
  await page.locator('sl-button[variant="primary"]').click();
  await page.waitForURL(`**${NEW_URL}`);
  await waitForForm(page);

  await expect(
    page.getByRole('heading', { name: 'New Contact' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name *' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible();
});

// After:
test('new contact form shows Shoelace fields', async ({ page }) => {
  await page.goto(NEW_URL);
  await waitForForm(page);

  await expect(
    page.getByRole('heading', { name: 'New Contact' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name *' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible();
});
```

- [ ] **Step 4: Update `'Edit existing contact'` tests to navigate directly**

Both tests currently click a table row to reach the edit form. Replace with direct navigation to `/contacts/1`:

```typescript
test.describe('Edit existing contact', () => {
  test('shows edit form with pre-populated values at /#/contacts/1', async ({
    page,
  }) => {
    await page.goto('/#/contacts/1');
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Contact' }),
    ).toBeVisible();

    const nameInput = page.getByRole('textbox', { name: 'Name *' });
    await expect(nameInput).toBeVisible();
    const nameVal = await nameInput.inputValue();
    expect(nameVal.length).toBeGreaterThan(0);

    await expect(
      page.locator('sl-button[variant="primary"][type="submit"]'),
    ).toBeVisible();
    await expect(
      page.locator('sl-button[variant="danger"]:not([slot="footer"])'),
    ).toBeVisible();
  });

  test('submits an edit at /#/contacts/1 and navigates back to the table', async ({
    page,
  }) => {
    await page.goto('/#/contacts/1');
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Name *' }).fill('Updated via E2E');

    await page.locator('sl-button[type="submit"]').click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});
```

Note: id=1 is Alice Johnson in the seed data. The table now shows all contacts, so "Updated via E2E" will be visible after redirect.

- [ ] **Step 5: Run the full E2E suite to confirm it passes**

```bash
cd examples/js/contacts
pnpm exec playwright test
```

Expected: All remaining tests pass. Specifically check that:
- `'Contacts by Type — stacked layout'` suite is unaffected
- `'Delete contact'` suite (uses `/#/contacts/3` directly) still passes
- `'Stats view'` suite still passes

- [ ] **Step 6: Commit**

```bash
git add examples/js/contacts/e2e/contacts.spec.ts
git commit -m "test(contacts): update e2e suite for PageSpec layout on collection route"
```

---

## Task 5: Update the VitePress demo and docs copy

**Files:**
- Modify: `docs/.vitepress/theme/ContactsDemo.vue`
- Modify: `docs/examples/contacts.md`

**Context:** `ContactsDemo.vue` calls `controller.mount(spec, root.value)`. After the change, `spec` must be a `PageSpec` (`RootSpec` includes `PageSpec`, so the call is type-safe). Inside a `PageSpec`, table children use the `ViewSpec` envelope `{ kind: 'table', spec: TableSpec }` — the actual `TableSpec` goes inside a `spec` property, one level deeper than the current flat mock.

`PageView` renders the `PageSpec.title` in an `<h1>`. `TablePane` fetches from `endpoints.list` and renders rows — the MSW handler for `GET /contacts` stays unchanged.

- [ ] **Step 1: Update the `spec` object in `ContactsDemo.vue`**

Replace the `spec` const (lines 41–67) with:

```typescript
const spec = {
  kind: 'page',
  title: 'Contacts',
  layout: { direction: 'column' },
  children: [
    {
      kind: 'table',
      spec: {
        kind: 'table',
        columns: [
          { key: 'id', label: 'ID', type: 'number' },
          { key: 'name', label: 'Name', type: 'string', sortable: true },
          { key: 'email', label: 'Email', type: 'string', filterable: true },
          { key: 'phone', label: 'Phone', type: 'string' },
          {
            key: 'type',
            label: 'Type',
            type: 'enum',
            options: [
              { label: 'Customer', value: 'customer' },
              { label: 'Partner', value: 'partner' },
              { label: 'Lead', value: 'lead' },
            ],
            editable: true,
          },
        ],
        endpoints: {
          list: { method: 'GET', url: '/contacts' },
          create: { method: 'POST', url: '/contacts' },
          update: { method: 'PUT', url: '/contacts/{id}' },
          delete: { method: 'DELETE', url: '/contacts/{id}' },
        },
      },
    },
  ],
};
```

The `controller.mount(spec, root.value)` call on line 100 does not change.

- [ ] **Step 2: Add a bullet to "What it demonstrates" in `docs/examples/contacts.md`**

In `docs/examples/contacts.md`, update the `## What it demonstrates` section:

```markdown
## What it demonstrates

- `TableFormWorkflowBundle` for zero-boilerplate table+form registration
- Column and field customisation via the `table()` and `form()` callbacks
- Custom field validation (`pattern`) and display overrides (`placeholder`, `helpText`)
- `updateSchema` to keep `id` read-only on the edit form
- Using `pageSpec().layout(col())` to plug a table component into a column layout container
```

- [ ] **Step 3: Update the server snippet in `docs/examples/contacts.md`**

In the `## Server` section, replace the two lines that serve the collection and item routes:

```typescript
// Before:
// Serve the two specs on a collection route and an item route
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/api/ui/contacts/:id', (req, res) => {
  ...
});

// After:
// Collection: PageSpec with col() layout wrapping the table
app.get('/api/ui/contacts', (_req, res) =>
  res.json(
    pageSpec()
      .title('Contacts')
      .layout(col())
      .table(bundle.tableSpec)
      .build(),
  ),
);
app.get('/api/ui/contacts/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? store.find(id) : undefined;
  const fields = entity
    ? bundle.formSpec.fields.map((f) =>
        entity[f.name] !== undefined ? { ...f, value: entity[f.name] } : f,
      )
    : bundle.formSpec.fields;
  res.json({ ...bundle.formSpec, fields });
});
```

- [ ] **Step 4: Update the route table in `docs/examples/contacts.md`**

Replace the `## What the two routes serve` table:

```markdown
## What the two routes serve

| Route | Spec | Behaviour |
|-------|------|-----------|
| `GET /api/ui/contacts` | `PageSpec` (`layout: col`, child: table) | Column layout wrapping a contacts table. Rows fetched client-side from `/contacts`. |
| `GET /api/ui/contacts/:id` | `FormSpec` | Edit form when id is a number. Create form when id is `"new"`. Delete button present (delete is wired). |
```

- [ ] **Step 5: Type-check**

```bash
pnpm -w typecheck
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/ContactsDemo.vue docs/examples/contacts.md
git commit -m "docs(contacts): update demo and docs to show pageSpec().layout(col()) composition"
```

---

## Edge cases

| Edge case | Handling |
|-----------|----------|
| `page=&pageSize=` from `TablePane` (empty search params) | Server fix: `Number('') = 0`, condition `page > 0 && pageSize > 0` is false → returns all contacts |
| `page=1&pageSize=2` from explicit navigation (contacts-by-type table still pageable) | Numeric values > 0 → condition true → pagination still works for routes that set these params |
| `PageSpec.title` missing → no `<h1>` | Fixed by adding `.title('Contacts')` to the `pageSpec()` call |
| VitePress `spec` type — `controller.mount` expects `RootSpec` | `PageSpec` is in the `RootSpec` union (`packages/core/src/types/index.ts` line 27); no cast needed |
| E2E delete test at `/#/contacts/3` (Carol White) | Navigates directly — unaffected by collection route change; all contacts now visible post-delete at `TABLE_URL` so `toHaveCount(0)` assertion still holds |
| `col` not imported in server.ts | `col` is already imported at line 4: `import { ..., pageSpec, ... } from '@retrofit-ui/builder-zod'` — but `col` may not be there yet; verify the import includes `col` and add it if missing |

---

## Self-review

**Spec coverage:**
- ✓ Collection route change with `pageSpec().layout(col()).table(bundle.tableSpec).build()` — Task 3
- ✓ `docs/examples/contacts.md` "What it demonstrates" bullet — Task 5
- ✓ `ContactsDemo.vue` mock updated to `PageSpec` shape — Task 5
- ✓ `layout(col())` type issue resolved — Tasks 1–2

**Gap identified and addressed beyond the issue spec:**
- Server pagination handler fix (empty `page=` → empty table) — Task 3
- `.title('Contacts')` on `PageSpec` to preserve heading — Task 3
- E2E test suite update for changed rendering behavior — Task 4
- `col` import check in `server.ts` — edge cases

**Type consistency:**
- `layoutConfig()` returns `LayoutConfig`; `PageSpecBuilder._layout` is `LayoutConfig | undefined` ✓
- `pageSpec().layout(col())` — `col()` is `LayoutContainerBuilder`; `layout()` accepts `LayoutConfig | LayoutContainerBuilder` ✓
- `ContactsDemo.vue` `spec.children[0]` is `{ kind: 'table', spec: TableSpec }` matching `ViewSpec` ✓
- `bundle.tableSpec` is `TableSpec`; `PageSpecBuilder.table(spec: TableSpec)` ✓
