# Plan: Issue #50 — Formatted number columns

## Approach: server-side formatted strings

> **Previous plan used client-side `<sl-format-number>` / `<sl-format-bytes>` Shoelace components.
> That approach has been replaced per review feedback and the philosophy in `AGENTS.md`
> (§ *Display formatting philosophy*, commit 9b3afbf).**

Reasons for the change:
- Client-side `Intl` formatting produces locale-dependent output per browser — a user in Germany
  sees `1.234,56 €`, a US user sees `$1,234.56` for the same row. That is wrong for business tools.
- A closed `format` enum requires a schema change every time a new format type is added.
- The approach does not generalise to dates/timestamps, where cross-language inconsistencies
  are worse.

**New model**: every cell in the wire payload becomes `{ value: unknown; formatted?: string }`.
The server populates `formatted` when the developer provides a `format` function via
`columnOverride`. The function never crosses the wire — only the resulting string does.
The client renders `cell.formatted ?? String(cell.value ?? '')`.

---

## Files to change

### 1. `packages/core/src/types/table.ts`

**What the file currently does**: defines `ColumnSchema`, `ColumnType`, `TableMetadataSchema`,
`TableSchema` as the JSON wire format shared between server and SPA. Row data is
`z.array(z.record(z.string(), z.unknown()))`.

**What to add — `CellSchema` and `Cell`**:

```typescript
export const CellSchema = z.object({
  value: z.unknown(),
  formatted: z.string().optional(),
});
export type Cell = z.infer<typeof CellSchema>;
```

**What to change — `TableSchema`**:

```typescript
// before
data: z.array(z.record(z.string(), z.unknown())),
// after
data: z.array(z.record(z.string(), CellSchema)),
```

**What to revert** — remove `format` and `currency` fields from `ColumnSchema` that were added
in the current PR. Do not add them. No other `ColumnSchema` fields change.

**What must remain true**: all existing `ColumnSchema.parse()` calls still succeed; only
`TableSchema`'s `data` row shape changes.

---

### 2. `packages/schema-builder-zod/src/TableBuilder.ts`

**What the file currently does**: `columnOverride(key, overrides: Partial<Column>)` merges
partial column overrides. `build()` returns a `TableSpec` with columns and raw row data.

**What to change**:

`columnOverride` must accept an optional `format` function that is **not** part of `Column`
(it never goes on the wire). Store it in a parallel `Map<string, (v: unknown) => string>`.

```typescript
private formatters = new Map<string, (v: unknown) => string>();

columnOverride(key: string, override: Partial<Column> & { format?: (v: unknown) => string }) {
  const { format, ...columnOverride } = override;
  if (format) this.formatters.set(key, format);
  // existing merge logic with columnOverride
}
```

`build()` must wrap every cell in `{ value }` and add `formatted` where a formatter exists:

```typescript
// before (conceptual)
data: rows.map(row =>
  Object.fromEntries(columns.map(col => [col.key, row[col.key]]))
)

// after
data: rows.map(row =>
  Object.fromEntries(
    columns.map(col => {
      const value = row[col.key];
      const formatter = this.formatters.get(col.key);
      const cell: Cell = formatter
        ? { value, formatted: formatter(value) }
        : { value };
      return [col.key, cell];
    })
  )
)
```

Import `Cell` from `@retrofit-ui/core`.

**Developer API** (unchanged from the reviewer's example):

```typescript
TableView.schema(ExpenseSchema)
  .columnOverride('amount', {
    format: (v) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v)),
  })
  .columnOverride('createdAt', {
    format: (v) => new Date(String(v)).toLocaleDateString('en-US', { dateStyle: 'medium' }),
  })
```

Check whether `packages/server-solid-shoelace/src/view-builder.ts` re-exports or re-implements
this path and apply the same change there if so.

---

### 3. `packages/spa-solid-shoelace/ui/TableView.tsx`

**What the file currently does**: renders a `<table>` from a fetched `TableSpec`. `CellDisplay`
switches on `col.type === 'boolean'` and `badgeVariants`, falling back to
`<span>{strVal()}</span>`. Row data is accessed as `row[col.key]` (raw unknown).

**What to change**:

**a) Update all cell access** from `row[col.key]` to `row[col.key].value` /
`row[col.key].formatted` throughout the file. Any place that reads a cell's raw value for
sorting, filtering, or display must go through `.value`.

**b) Replace `CellDisplay`** — remove all `<sl-format-number>` and `<sl-format-bytes>` match
cases. The new display rule:

```tsx
function CellDisplay(props: { col: Column; cell: Cell }) {
  const display = () => props.cell.formatted ?? String(props.cell.value ?? '');
  const badgeVariant = () => props.col.badgeVariants?.[display()];

  return (
    <Switch fallback={<span>{display()}</span>}>
      <Match when={props.col.type === 'boolean'}>
        <span>{props.cell.value ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => <sl-badge variant={variant()}>{display()}</sl-badge>}
      </Match>
    </Switch>
  );
}
```

Note: `display()` is used for the badge variant lookup (so a formatted string like `"Active"`
still maps to its variant) and for fallback text. The boolean branch still reads `.value`
directly for truthiness.

**c) Remove Shoelace format-component imports** added in the current PR:

```typescript
// remove these two lines
import '@shoelace-style/shoelace/dist/components/format-number/format-number.js';
import '@shoelace-style/shoelace/dist/components/format-bytes/format-bytes.js';
```

---

### 4. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**What the file currently does**: declares JSX intrinsic elements for Shoelace components.

**What to revert** — remove the `sl-format-number` and `sl-format-bytes` declarations added
in the current PR. No other entries change.

---

## Edge cases

| Case | Behavior |
|------|----------|
| No `format` function configured for a column | `build()` emits `{ value }` with no `formatted` field; `CellDisplay` renders `String(cell.value ?? '')` |
| `format` function throws | Let it propagate at `build()` time — server error, not a client concern |
| `value` is `null` or `undefined` | `String(null ?? '')` = `''`; `String(undefined ?? '')` = `''` |
| Boolean column with a formatter | `display()` would be the formatted string, but the boolean `Match` fires first on `.value` |
| Sorting / filtering | Must use `cell.value`, not `cell.formatted`, to preserve numeric/date ordering |

---

## Tests to write / update

### Unit — `packages/core/src/types/__tests__/table.test.ts`

Replace the `format field` describe block added in the current PR with a `CellSchema` block:

- `{ value: 1234.56 }` → parses OK; `cell.formatted` is `undefined`
- `{ value: 1234.56, formatted: "$1,234.56" }` → parses OK; both fields round-trip
- `{ value: "Acme Corp" }` → parses OK
- `{}` → `safeParse` returns `success: false` (`value` is required)
- `TableSchema` with cells in `{ value }` shape → parses OK
- Existing column without `formatted` data → backward compat is irrelevant (this is a breaking
  shape change, acknowledged as acceptable)

### Unit — `packages/schema-builder-zod/src/__tests__/TableBuilder.test.ts`

Replace / extend the current format-related test:

- `columnOverride('amount', { format: fn })` → `build()` emits `{ value: 1234.56, formatted: "$1,234.56" }` for that column
- Column without a formatter → `build()` emits `{ value: rawValue }` (no `formatted` key)
- `build()` does not put `format` on the serialised `Column` object (it stays server-only)

### Unit — `CellDisplay` (if a component test file exists)

- Renders `cell.formatted` when present, not raw value
- Renders `String(cell.value)` when `formatted` is absent
- Boolean branch reads `cell.value` for truthiness regardless of `formatted`

### E2E — `examples/js/expenses/e2e/expenses.spec.ts`

Update any existing cell-value assertions to account for the `{ value, formatted? }` wire
shape (they likely operate on rendered text so may not need changes).

Add a `describe('Server-side formatting')` block. Requires updating the `/api/ui/expenses`
handler to include a format function:

```typescript
.columnOverride('amount', {
  format: (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v)),
})
```

Tests:
- The `amount` cell displays `$` + formatted number (rendered text, not element type)
- No `<sl-format-number>` element appears anywhere in the table
- Other cells (string, boolean) render as before

---

## What must remain true after the change

- `ColumnSchema.parse()` calls succeed for columns with no `format`/`currency` fields
  (those fields are gone; existing data that omits them is fine)
- `TableSchema.parse()` accepts row data in the new `{ value, formatted? }` cell shape
- `CellDisplay` fallback (`<span>{display()}</span>`) still fires for plain string/number cells
  with no formatter configured
- The boolean branch (`✓` / `✗`) still fires before the fallback
- Badge variant lookup still works, using the display string (formatted if present)
- Sorting and filtering logic uses `cell.value`, not `cell.formatted`
- No `<sl-format-number>` or `<sl-format-bytes>` elements remain in the codebase
- All existing E2E tests pass (cell text assertions should be unaffected if the server is
  updated to emit formatted strings for the same columns under test)
