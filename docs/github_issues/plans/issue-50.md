# Plan: Issue #50 — Formatted number columns

## Design decision: client-side vs server-side formatting

The issue proposes a `format` enum on `Column` rendered by Shoelace web components
(`<sl-format-number>`, `<sl-format-bytes>`).

The comment from @thenomadlad proposes a server-side `format` function:

```typescript
.columnOverride('amount', {
  format: (price) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
})
```

**Client-side wins for this architecture** for one hard reason: `Column` is a Zod schema
that is serialized to JSON and sent over HTTP. Functions cannot cross the wire. Implementing
the function approach server-side would require `TableViewBuilder.build()` to apply formatters
to every row value, then store the column as `type: 'string'` — losing the fact that it's a
number and preventing any future client-side sorting or filtering on the raw value.

Client-side Shoelace components also get the user's locale for free.

---

## Files to change

### 1. `packages/core/src/types/table.ts`

**What the file currently does**: defines `ColumnSchema` (Zod), `ColumnType`, `TableMetadataSchema`,
`TableSchema` — all used as the JSON wire format shared between server and SPA.

**What to add** — two new optional fields on `ColumnSchema`:

```typescript
format: z.enum(['decimal', 'currency', 'percent', 'bytes']).optional(),
currency: z.string().optional(), // ISO 4217, only meaningful when format === 'currency'
```

Add them after `badgeVariants`. No existing field changes. The Zod `.optional()` keeps the
schema backward-compatible with existing JSON that omits these fields.

**Do NOT** add a cross-field validation like `currency requires format === 'currency'` at this
layer — Zod refinements add complexity and the SPA can tolerate a stray `currency` field
gracefully.

---

### 2. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**What the file currently does**: declares JSX intrinsic elements for every Shoelace component
used in the SPA so TypeScript doesn't complain about unknown custom elements.

**What to add** — two new entries inside the `IntrinsicElements` interface, after `'sl-badge'`:

```typescript
'sl-format-number': JSX.HTMLAttributes<HTMLElement> & {
  value?: number;
  type?: 'currency' | 'decimal' | 'percent';
  currency?: string;
  'currency-display'?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  'no-grouping'?: boolean;
  'minimum-fraction-digits'?: number;
  'maximum-fraction-digits'?: number;
};
'sl-format-bytes': JSX.HTMLAttributes<HTMLElement> & {
  value?: number;
  unit?: 'byte' | 'bit';
  display?: 'short' | 'long' | 'narrow';
};
```

Include only the props we will actually use in `CellDisplay`; this is not an exhaustive mirror
of the Shoelace docs.

---

### 3. `packages/spa-solid-shoelace/ui/TableView.tsx`

**What the file currently does**: fetches a `TableSpec` from the API, renders a `<table>`.
`CellDisplay` is the component that renders individual cells in read mode. It currently switches
on `col.type === 'boolean'` and `badgeVariant()`, falling back to `<span>{strVal()}</span>`.

**What to change** — two things:

**a) Add Shoelace imports** at the top of the file alongside the existing ones:

```typescript
import '@shoelace-style/shoelace/dist/components/format-number/format-number.js';
import '@shoelace-style/shoelace/dist/components/format-bytes/format-bytes.js';
```

**b) Extend `CellDisplay`** — add `Match` cases for each format value. Insert them between
the `badgeVariant` match and the fallback. Key implementation notes:

- Guard on `props.col.type === 'number' && props.col.format` so non-number columns are unaffected.
- `Number(props.value ?? 0)` coerces safely; `NaN` will render as `0` from Shoelace's
  perspective, which is better than crashing.
- Order: `bytes` and `percent` are unambiguous; `currency` requires `col.currency`.
  `decimal` is the catch-all for `type === 'number' && format === 'decimal'`.

Resulting `CellDisplay` structure:

```tsx
function CellDisplay(props: { col: Column; value: unknown }) {
  const strVal = () => String(props.value ?? '');
  const badgeVariant = () => props.col.badgeVariants?.[strVal()];
  const numVal = () => Number(props.value ?? 0);

  return (
    <Switch fallback={<span>{strVal()}</span>}>
      <Match when={props.col.type === 'boolean'}>
        <span>{props.value ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => <sl-badge variant={variant()}>{strVal()}</sl-badge>}
      </Match>
      <Match when={props.col.format === 'bytes'}>
        <sl-format-bytes value={numVal()} />
      </Match>
      <Match when={props.col.format === 'percent'}>
        <sl-format-number value={numVal()} type="percent" />
      </Match>
      <Match when={props.col.format === 'currency'}>
        <sl-format-number value={numVal()} type="currency" currency={props.col.currency ?? 'USD'} />
      </Match>
      <Match when={props.col.format === 'decimal'}>
        <sl-format-number value={numVal()} />
      </Match>
    </Switch>
  );
}
```

`numVal` is a derived accessor (not a `createMemo`) because `CellDisplay` is not a reactive
component in a hot loop — accessor is idiomatic SolidJS here and matches the existing `strVal`.

---

## Server-side builder — no changes needed

`TableViewBuilder.columnOverride(key, override: Partial<Column>)` already accepts any
`Partial<Column>`. Once `Column` grows `format` and `currency`, callers can do:

```typescript
TableView.schema(ExpenseSchema)
  .columnOverride('amount', { format: 'currency', currency: 'USD' })
  .columnOverride('fileSize', { format: 'bytes' })
```

No changes to `packages/server-solid-shoelace/src/view-builder.ts` or
`packages/schema-builder-zod/src/TableBuilder.ts` are required.

---

## Edge cases

| Case | Behavior |
|------|----------|
| `format: 'currency'` with no `currency` field | Defaults to `'USD'` in `CellDisplay` |
| `format` set on a non-`number` column | The `Match` conditions for `bytes/percent/currency/decimal` still fire (no type guard on `col.type`); `numVal()` will be `NaN` → Shoelace renders `0` or empty. Acceptable; don't add a guard now. |
| `value` is `null` or `undefined` | `Number(null)` = 0, `Number(undefined)` = NaN → coerced to 0 by the `?? 0` |
| `value` is a string `"1234"` | `Number("1234")` = 1234 — works as expected |
| Shoelace component not yet defined (SSR / hydration) | Not applicable; this is a pure SPA |

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/table.test.ts`

Add a `describe('format field')` block:

- `format: 'decimal'` with no other fields → parses OK
- `format: 'currency'` + `currency: 'USD'` → parses OK, both fields round-trip
- `format: 'percent'` → parses OK
- `format: 'bytes'` → parses OK
- `format: 'invalid'` → `safeParse` returns `success: false`
- `currency` without `format` → still parses OK (no cross-field requirement)
- Existing column without `format` → `col.format` is `undefined` (backward compat)

### Unit — `packages/schema-builder-zod/src/__tests__/TableBuilder.test.ts`

Add one test to the existing `describe('tableFromSchema')` block:

- `withColumnOverrides({ amount: { format: 'currency', currency: 'EUR' } })` → `build()` does
  not throw and the column has `format: 'currency'`, `currency: 'EUR'`

### E2E — `examples/js/expenses/e2e/expenses.spec.ts`

Add a new `describe('Formatted number columns')` block. Requires a temporary route in
`examples/js/expenses/src/server.ts` (or reuse `/api/ui/expenses` after adding the override):

```typescript
// In the /api/ui/expenses handler, add columnOverride for amount:
.columnOverride('amount', { format: 'currency', currency: 'USD' })
```

Tests:
- The `amount` cell contains an `<sl-format-number>` element (not a plain `<span>`)
- The rendered text includes a currency symbol (check for `$` or `USD` in the element's
  shadow DOM text — or just assert the element exists and is a `sl-format-number`)

Note: Shoelace custom elements render in shadow DOM, so asserting on computed visible text
(e.g., `$1,234.56`) may require `page.locator('sl-format-number').evaluate(el => el.textContent)`.
If that proves brittle, fall back to asserting element presence only.

---

## What must remain true after the change

- All existing `ColumnSchema.parse()` calls continue to succeed (format fields are optional)
- `TableSchema.parse()` round-trips unchanged data unchanged
- The `CellDisplay` fallback (`<span>{strVal()}</span>`) is still reached for columns with no
  `format` and no `badgeVariant` — i.e., the happy path for strings/dates/etc.
- The boolean branch still fires before the format branches
- Existing E2E tests in `examples/js/expenses/e2e/expenses.spec.ts` all pass without
  modification (the expenses server doesn't use `format` yet unless we add a test route)
