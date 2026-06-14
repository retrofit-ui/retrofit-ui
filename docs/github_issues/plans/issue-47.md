# Plan: Status badges on enum columns (`sl-badge`) — Issue #47

## Goal

Add an optional `badgeVariants` map to `Column` so enum cells (and any other column) can render as a coloured `<sl-badge>` instead of plain text, enabling at-a-glance status scanning.

---

## Files to change

### 1. `packages/core/src/types/table.ts`

**Why:** `ColumnSchema` is the Zod source-of-truth for `Column`. Any new field must land here first; the inferred `Column` type and all downstream consumers (builders, renderer) derive from it.

Add a `badgeVariants` field using a constrained `z.record`:

```typescript
const BadgeVariantSchema = z.enum([
  'primary',
  'success',
  'neutral',
  'warning',
  'danger',
]);

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
  badgeVariants: z.record(z.string(), BadgeVariantSchema).optional(), // ← add this
});
```

`BadgeVariantSchema` does **not** need to be exported — it is a private implementation detail. The public surface is the inferred `Column` type, which will include `badgeVariants?: Record<string, 'primary' | 'success' | 'neutral' | 'warning' | 'danger'>`.

---

### 2. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** SolidJS/TypeScript needs an intrinsic element declaration for `<sl-badge>` or the JSX in `TableView.tsx` will produce type errors.

Add after the existing `'sl-skeleton'` block (after line 127):

```typescript
'sl-badge': JSX.HTMLAttributes<HTMLElement> & {
  variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
  pill?: boolean;
  pulse?: boolean;
  children?: JSX.Element;
};
```

`pill` and `pulse` are valid Shoelace badge attributes — declare them for future use even though this issue doesn't need them.

---

### 3. `packages/spa-solid-shoelace/ui/TableView.tsx`

**Why:** This is where column cells are rendered. The read-only cell display currently lives as an inline ternary in the `<Show>` fallback inside `DataRow`. Two changes are needed:

#### 3a. Add the Shoelace badge component import

At the top of the file, after the existing Shoelace side-effect imports:

```typescript
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
```

#### 3b. Extract a `CellDisplay` component and add badge rendering

Currently the read-only display is inlined in `DataRow` (lines 218–225):

```tsx
fallback={
  <span>
    {col.type === 'boolean'
      ? props.row[col.key]
        ? '✓'
        : '✗'
      : String(props.row[col.key] ?? '')}
  </span>
}
```

Extract this into a `CellDisplay` function component (parallel to `CellInput`) placed above `DataRow`:

```tsx
function CellDisplay(props: { col: Column; value: unknown }) {
  const strVal = () => String(props.value ?? '');
  const badgeVariant = () => props.col.badgeVariants?.[strVal()];

  return (
    <Switch fallback={<span>{strVal()}</span>}>
      <Match when={props.col.type === 'boolean'}>
        <span>{props.value ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => <sl-badge variant={variant()}>{strVal()}</sl-badge>}
      </Match>
    </Switch>
  );
}
```

Then replace the fallback in `DataRow`:

```tsx
// Before:
fallback={
  <span>
    {col.type === 'boolean'
      ? props.row[col.key]
        ? '✓'
        : '✗'
      : String(props.row[col.key] ?? '')}
  </span>
}

// After:
fallback={<CellDisplay col={col} value={props.row[col.key]} />}
```

`Switch`/`Match` is used instead of nested `Show` for clarity and SolidJS correctness — `Switch` short-circuits at the first truthy `when`, which is the right semantic here. The `Match when={badgeVariant()}` accessor form ensures SolidJS tracks reactivity correctly when the row value changes during inline editing.

---

## No changes needed in builders

`TableViewBuilder.columnOverride()` (`packages/server-solid-shoelace/src/view-builder.ts` line 66) already accepts `Partial<Column>` and merges it with spread. Once `Column` has `badgeVariants`, the builder automatically accepts it — no code change needed.

`TableBuilder.withColumnOverrides()` (`packages/schema-builder-zod/src/TableBuilder.ts` line 38) is the same — already typed as `Record<string, Partial<Column>>`.

The resulting `TableSpec` is JSON-serialised and sent over the wire; `badgeVariants` is just another field in the JSON. No serialisation change needed.

---

## Key decisions

### Why `Partial<Column>` propagation is free

Both `columnOverride` and `withColumnOverrides` spread arbitrary `Partial<Column>` on top of derived defaults. The TypeScript type check is the only gate. Adding `badgeVariants` to `ColumnSchema` is sufficient — the builder API is already open.

### Why not restrict `badgeVariants` to `type === 'enum'` columns?

The column type is not enforced at the `badgeVariants` level. A string column could have badge variants too (e.g., a free-text status field). Keeping `badgeVariants` type-agnostic avoids a needless constraint. The renderer simply checks `col.badgeVariants?.[strVal()]` — if the value isn't in the map, it falls through to plain text regardless of column type.

### Why fall through to plain text when value is not in the map?

Silently missing an enum value is more useful than crashing or rendering an empty badge. Plain text is the existing behaviour. This means partial maps are valid: only some values need a variant (e.g., only `'published': 'success'` could be specified — `draft` and `archived` would still render as text).

### Why `Switch`/`Match` instead of nested ternaries?

The boolean check and badge check are independent render paths, not nested conditions. `Switch`/`Match` is idiomatic SolidJS for mutually exclusive branches and is more readable when a third branch (e.g., a future `url` column type) is added later. The `Match when={badgeVariant()}` form also correctly exposes the matched value as a typed accessor for the variant string, avoiding the nullable `col.badgeVariants?.[strVal()]` call twice.

### Why extract `CellDisplay`?

The existing inline ternary was already near its readability limit. Adding badge logic inline would push it past the point where a reader can follow it. `CellDisplay` mirrors `CellInput` and gives a clear parallel structure. It also makes the display path independently testable.

### `pill` on badges — leave it to a future opt-in

The Shoelace `sl-badge` supports `pill` (rounded) and `pulse` (animated dot). Neither is in scope for this issue. The type declaration includes them for completeness, but `CellDisplay` does not set them. A future `badgePill?: boolean` column property could be added if users want it.

---

## Edge cases

| Edge case | How to handle |
|-----------|---------------|
| Value not in `badgeVariants` map | `badgeVariant()` returns `undefined`; `Match when={badgeVariant()}` is falsy; falls through to `Switch fallback` which renders plain text. Same behaviour as before `badgeVariants` was added. |
| `badgeVariants` is an empty object `{}` | Same as above — every value falls through to plain text. Valid configuration. |
| Value is `null` or `undefined` | `strVal()` returns `''`; `col.badgeVariants?.['']` is `undefined`; falls through to plain text showing `''`. Consistent with existing behaviour. |
| Boolean column with `badgeVariants` | `Match when={props.col.type === 'boolean'}` wins first; boolean display takes priority over badge variants. The `badgeVariants` map is ignored for boolean columns. This is the right default. |
| Editable column in edit mode | When `editing() && col.editable`, the `<Show>` renders `CellInput` — `CellDisplay` is not shown. Badge display only applies in read-only mode. No change from existing behaviour. |
| `badgeVariants` passes Zod validation | `z.record(z.string(), BadgeVariantSchema)` validates both keys and values. Invalid variant strings (e.g. `'info'`) will fail `ColumnSchema.parse()` at build time on the server, surfacing the error early. |
| Java consumers | `badgeVariants` is an optional JSON field. Java `Column` deserialization will ignore it unless explicitly added to the Java `Column` model. No Java change is needed for this issue. |

---

## Tests to write

### Unit tests — `packages/core/src/types/__tests__/table.test.ts`

1. **`badgeVariants` is optional**: Parse a column without `badgeVariants` through `ColumnSchema.parse()` and assert it succeeds.
2. **`badgeVariants` with valid variants parses**: Parse `{ ..., badgeVariants: { draft: 'neutral', published: 'success' } }` and assert the parsed object has the correct map.
3. **`badgeVariants` with an invalid variant string fails**: Parse `{ ..., badgeVariants: { draft: 'info' } }` and assert `ColumnSchema.safeParse()` returns `success: false`.
4. **`badgeVariants` survives `TableSchema.parse()` round-trip**: Build a table with a column that has `badgeVariants` and pass it through `TableSchema.parse()` — assert no error thrown.

### Unit tests — `packages/schema-builder-zod/src/__tests__/TableBuilder.test.ts`

5. **`withColumnOverrides` accepts `badgeVariants`**: Call `.withColumnOverrides({ priority: { badgeVariants: { low: 'neutral', high: 'danger' } } })` and assert the resulting column has the map.

### Unit tests — (server-solid-shoelace) `packages/server-solid-shoelace/src/__tests__/`

6. **`columnOverride` passes `badgeVariants` through to spec**: Call `TableView.schema(TodoSchema).columnOverride('priority', { badgeVariants: { low: 'neutral', high: 'danger' } }).list(...).build()` and assert the `priority` column in the output has the correct `badgeVariants`.

### E2E tests — `examples/js/blog/e2e/blog.spec.ts`

First, update `examples/js/blog/src/server.ts` to add a `badgeVariants` override to the posts table:

```typescript
TableView.forRows(PostSchema, store.all())
  .columnOverride('status', {
    filterable: true,
    badgeVariants: {
      draft:     'neutral',
      published: 'success',
      archived:  'warning',
    },
  })
  // ... rest unchanged
```

Then add a new `test.describe('Badge variants on enum column')` block:

7. **Badge renders for known status values**: Navigate to `/#/posts`, wait for table, and assert that at least one `sl-badge[variant="success"]` or `sl-badge[variant="neutral"]` is visible in the `status` column.
8. **Badge text matches the enum value**: Locate the first `sl-badge` in the status column and assert its text content is one of `draft`, `published`, or `archived`.
9. **Badge variant matches the configured mapping**: For a known post with `status: 'published'`, assert the status cell contains `sl-badge[variant="success"]` with text `published`.
10. **Value not in map renders as plain text**: If a post's status is an unrecognised value (inject a test row with `status: 'unknown'`), assert the status cell contains plain text — no `sl-badge` element.

---

## Docs update

Add a row to the column overrides table in `docs/guide/table-view.md`:

| Override field | Type | Effect |
|----------------|------|--------|
| `badgeVariants` | `Record<string, 'primary' \| 'success' \| 'neutral' \| 'warning' \| 'danger'>` | Renders the cell as `<sl-badge>` with the mapped variant; values absent from the map render as plain text |

Add a usage example under "Column overrides":

```typescript
TableView.schema(PostSchema)
  .columnOverride('status', {
    badgeVariants: {
      draft:     'neutral',
      published: 'success',
      archived:  'warning',
    },
  })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

---

## Summary of changes

| File | Change |
|------|--------|
| `packages/core/src/types/table.ts` | Add `badgeVariants` field to `ColumnSchema` (optional `z.record`) |
| `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` | Add `sl-badge` JSX intrinsic element declaration |
| `packages/spa-solid-shoelace/ui/TableView.tsx` | Import `badge.js`; extract `CellDisplay` component with `Switch`/`Match` badge rendering; replace inline ternary in `DataRow` |
| `packages/core/src/types/__tests__/table.test.ts` | 4 new unit tests |
| `packages/schema-builder-zod/src/__tests__/TableBuilder.test.ts` | 1 new unit test |
| `packages/server-solid-shoelace/src/__tests__/` | 1 new unit test |
| `examples/js/blog/src/server.ts` | Add `badgeVariants` to `status` column override |
| `examples/js/blog/e2e/blog.spec.ts` | 4 new e2e test cases |
| `docs/guide/table-view.md` | Add `badgeVariants` row to override table + usage example |
