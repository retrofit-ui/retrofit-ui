# Plan: Relative time display for date columns (issue #49)

## What must remain true after this change

- All existing column types render correctly with no change to default behavior.
- The existing fallback `<span>` rendering path in `DataRow` is preserved when `display` is absent or `'absolute'`.
- `CellInput` (edit mode) is completely unaffected — relative display is read-mode only.
- `display` is optional with no default, so all existing `TableSpec` payloads continue to parse without modification.
- `colorFormat` / `colorSwatches` and other field-specific extras stay untouched.
- `pnpm lint` exits zero after the change.

---

## Files to change

### 1. `packages/core/src/types/table.ts`

**Why:** This is the authoritative spec type. Every consumer (builder, SPA renderer, tests) derives `Column` from `ColumnSchema`.

**Change:** Add one optional field to `ColumnSchema`:

```typescript
export const ColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: ColumnTypeSchema,
  sortable: z.boolean().default(false),
  filterable: z.boolean().default(false),
  editable: z.boolean().default(false),
  width: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  options: z.array(FieldOptionSchema).optional(),
  display: z.enum(['absolute', 'relative']).optional(),  // ← add here
});
```

**Design notes:**

- No enforcement of `type === 'date'` in the schema — the same pattern as `options` (valid on any column, meaningful only on `'enum'` columns). Consumers are responsible for applying `display: 'relative'` to date-valued columns.
- `'absolute'` is the fallback behavior (current plain-string rendering), not a default value. Storing `undefined` and `'absolute'` are equivalent in the renderer.

---

### 2. `packages/spa-solid-shoelace/ui/TableView.tsx`

**Why:** This is the only render layer. The read-mode cell display is currently a single `<span>` in the `DataRow` fallback — it needs to branch for relative time.

**Change A — add two Shoelace imports** at the top alongside the existing imports:

```typescript
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
```

**Change B — extract a `CellDisplay` helper component** between the existing `CellInput` and `DataRow` functions. This keeps `DataRow`'s JSX clean and makes the rendering logic easy to read:

```tsx
function CellDisplay(props: { col: Column; value: unknown }) {
  const strVal = () => String(props.value ?? '');

  if (props.col.type === 'boolean') {
    return <span>{props.value ? '✓' : '✗'}</span>;
  }

  if (props.col.display === 'relative') {
    return (
      <sl-tooltip content={strVal()}>
        <sl-relative-time date={strVal()} />
      </sl-tooltip>
    );
  }

  return <span>{strVal()}</span>;
}
```

**Change C — replace the inline fallback `<span>` in `DataRow`** with `<CellDisplay>`:

```tsx
// Before:
fallback={
  <span>
    {col.type === 'boolean'
      ? props.row[col.key] ? '✓' : '✗'
      : String(props.row[col.key] ?? '')}
  </span>
}

// After:
fallback={<CellDisplay col={col} value={props.row[col.key]} />}
```

The `Show when={editing() && col.editable}` / `fallback` structure is otherwise unchanged. `CellInput` (the edit-mode path) is untouched.

**Edge case — `NewRow`:** The `NewRow` component renders a `<span />` (empty) for non-editable cells, not `CellDisplay`. No change needed there; the new-row placeholder cells are blank by design.

**Edge case — non-date value with `display: 'relative'`:** `sl-relative-time` silently shows nothing if `date` is an unparseable string. This is acceptable — it's a consumer error to apply `display: 'relative'` to a non-date column. No defensive guard needed.

**Edge case — null/undefined cell value:** `strVal()` already coerces to `''`. An empty `date` attribute on `sl-relative-time` causes it to silently show nothing. Consistent with existing behavior.

---

### 3. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** TypeScript needs JSX intrinsic element shapes for both `sl-relative-time` and `sl-tooltip`.

**Add inside the `IntrinsicElements` interface:**

```typescript
'sl-relative-time': JSX.HTMLAttributes<HTMLElement> & {
  date?: string | Date;
  lang?: string;
  format?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
  sync?: boolean;
};
'sl-tooltip': JSX.HTMLAttributes<HTMLElement> & {
  content?: string;
  placement?:
    | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'right' | 'right-start' | 'right-end'
    | 'left' | 'left-start' | 'left-end';
  trigger?: string;
  disabled?: boolean;
  hoist?: boolean;
  children?: JSX.Element;
  'on:sl-show'?: SlEventHandler;
  'on:sl-hide'?: SlEventHandler;
  'on:sl-after-show'?: SlEventHandler;
  'on:sl-after-hide'?: SlEventHandler;
};
```

---

### 4. `examples/js/blog/src/server.ts` (required for e2e coverage)

**Why:** The blog example already has an `updatedAt` date column and the existing e2e suite runs against it. Adding `columnOverride('updatedAt', { display: 'relative' })` is the minimal change to exercise the full render path in a real browser.

**Change** — in the `/api/ui/posts` handler, extend the builder chain:

```typescript
TableView.forRows(PostSchema, store.all())
  .columnOverride('title', { sortable: true })
  .columnOverride('status', { filterable: true })
  .columnOverride('updatedAt', { display: 'relative' })  // ← add
  .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
  .find({ method: 'GET', url: '/posts/{id}' })
  .create({ method: 'POST', url: '/posts' })
  .build(),
```

No other files in the blog example need changing.

---

## Files with NO changes needed

- **`packages/server-solid-shoelace/src/view-builder.ts`** — `columnOverride(key, Partial<Column>)` already accepts any `Partial<Column>`, so `{ display: 'relative' }` is valid immediately once `Column` gains the field.
- **`packages/schema-builder-zod/src/mappers.ts`** — `zodFieldToColumn` auto-derives columns from Zod shapes; `display` is always set manually via `columnOverride`, never auto-derived.
- **`packages/core/src/types/index.ts`** — re-exports `table.ts` already; no change needed.
- **`packages/spa-solid-shoelace/ui/FormView.tsx`** — forms do not render table columns.

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/table.test.ts`

Add to the `ColumnSchema` describe block:

```typescript
it('accepts display: relative on a date column', () => {
  const result = ColumnSchema.safeParse({
    key: 'createdAt',
    label: 'Created At',
    type: 'date',
    display: 'relative',
  });
  expect(result.success).toBe(true);
});

it('accepts display: absolute', () => {
  const result = ColumnSchema.safeParse({
    key: 'createdAt',
    label: 'Created At',
    type: 'date',
    display: 'absolute',
  });
  expect(result.success).toBe(true);
});

it('rejects an invalid display value', () => {
  const result = ColumnSchema.safeParse({
    key: 'createdAt',
    label: 'Created At',
    type: 'date',
    display: 'fuzzy',
  });
  expect(result.success).toBe(false);
});

it('display is optional and omitting it parses successfully', () => {
  const result = ColumnSchema.safeParse({
    key: 'createdAt',
    label: 'Created At',
    type: 'string',
  });
  expect(result.success).toBe(true);
  if (result.success) expect(result.data.display).toBeUndefined();
});
```

No existing tests are broken by this change — the existing `'rejects unknown column type'` test uses `'json'` as the invalid value, which is still invalid.

### E2E — `examples/js/blog/e2e/blog.spec.ts`

Add a new describe block:

```typescript
test.describe('Relative time display', () => {
  test('updatedAt column renders sl-relative-time element', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await expect(page.locator('tbody sl-relative-time').first()).toBeVisible();
  });

  test('sl-relative-time is wrapped in an sl-tooltip', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    // The tooltip wraps the relative-time element
    await expect(
      page.locator('sl-tooltip sl-relative-time').first(),
    ).toBeVisible();
  });

  test('sl-relative-time date attribute contains an ISO string', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    const dateAttr = await page
      .locator('sl-relative-time')
      .first()
      .getAttribute('date');
    expect(dateAttr).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
```

---

## Key decisions and rationale

| Decision | Rationale |
|---|---|
| `display` is optional with no default | Existing `TableSpec` payloads are valid unchanged; `undefined` renders the existing plain-string path |
| No `type === 'date'` enforcement in Zod schema | Mirrors the `options` field pattern (valid on any column, meaningful only on enum); avoids coupling display concerns to type inference |
| Extract `CellDisplay` component | Keeps `DataRow`'s JSX readable; centralises the boolean/relative/absolute branching in one place |
| `sl-tooltip` wraps `sl-relative-time` | Provides the raw ISO timestamp on hover, matching the issue spec and common admin-UI convention |
| Use blog example for e2e | Blog already has `updatedAt: z.string()` updated on every write, so the relative-time value is realistic; minimal change to existing server |
| `'absolute'` is not the Zod default | Using `.optional()` rather than `.default('absolute')` avoids adding a field to every serialised column in existing responses |
