# Plan: datetime, date, and time picker field types — Issue #93

## Goal

Add first-class `'datetime'` and `'time'` field/column types to every layer of the framework and formalise `'date'` handling. Currently `'date'` accidentally works via the catch-all `<sl-input type={field.type}>` in FormView.tsx; there is no `'datetime'` or `'time'` type at all, no ISO ↔ `datetime-local` conversion, and no localised formatting in tables or detail views.

---

## Wire format (canonical)

| Type | Wire format | Example | Zod schema |
|---|---|---|---|
| `date` | `YYYY-MM-DD` | `"2025-06-14"` | `z.string().date()` |
| `time` | `HH:mm:ss` | `"14:30:00"` | `z.string().time()` |
| `datetime` | Full ISO 8601 UTC | `"2025-06-14T14:30:00.000Z"` | `z.string().datetime()` or `z.date()` |

---

## Key design decisions

### ISO ↔ datetime-local conversion

HTML `<input type="datetime-local">` uses `YYYY-MM-DDTHH:mm` (local time, no timezone suffix). A stored ISO string like `"2025-06-14T14:30:00.000Z"` must be converted before setting the input value, and back on change.

```ts
function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  return local ? new Date(local).toISOString() : '';
}
```

`date` and `time` wire formats already match their HTML input formats — no conversion needed.

### `datetime` gets a dedicated branch; `date` and `time` stay in the catch-all

In FormView.tsx and PageView.tsx FormPane, the catch-all `<sl-input type={field.type}>` works for `'date'` (passes `type="date"`) and `'time'` (passes `type="time"`) because their wire formats match. `'datetime'` cannot use this path — `type="datetime"` is not a valid HTML input type; the correct value is `type="datetime-local"`, which also requires value conversion. So `'datetime'` must be excluded from the catch-all and given its own `<Show>` branch.

### `sl-change` vs `sl-input` for `datetime-local`

`sl-input` fires on every keystroke; `datetime-local` inputs only commit a complete value when the user fills all fields. Using `on:sl-change` on the datetime branch avoids firing the ISO conversion on partial input.

### `formatCellValue` duplication vs shared utility

`TableView.tsx` already imports from `PageView.tsx` (to render `PageView` for page specs). Importing from `TableView.tsx` into `PageView.tsx` would create a circular dependency. Rather than introducing a new shared utility file, the cell-formatting logic is small enough to define as a local function in each of the two files that need it (`TableView.tsx` and `PageView.tsx`). If a third call site appears, extract to a `cellUtils.ts` then.

### Zod v4 format string is `'date-time'` (hyphenated)

In Zod v4, `z.string().datetime()` creates a check with `{ check: 'string_format', format: 'date-time' }` — hyphenated. The `FieldType` enum value is `'datetime'` (no hyphen). These must not be confused in `mappers.ts`.

### `z.date()` maps to `'datetime'`

A native JS `Date` object always carries time, so mapping it to `'datetime'` (not `'date'`) is correct.

### Zod auto-mapper does not retroactively upgrade `z.string()` date fields

`z.string()` without `.date()` continues to map to `'text'`. Existing code like the expenses example (`date: z.string()`) is unaffected. Upgrading requires the user to add `.date()` to the schema (or use `fieldOverride`).

---

## Files to change

### 1. `packages/core/src/types/form.ts`

**What it currently does:** Defines `FieldTypeSchema` with `'date'` but not `'datetime'` or `'time'`.

**Change:** Add `'datetime'` and `'time'` to the `FieldTypeSchema` enum, after `'date'`:

```ts
export const FieldTypeSchema = z.enum([
  'text', 'email', 'password', 'number',
  'date', 'datetime', 'time',
  'select', 'multiselect', 'checkbox', 'switch',
  'radio', 'radio-group', 'textarea', 'markdown', 'file', 'color',
  'tags', 'rating',
]);
```

No other change in this file.

---

### 2. `packages/core/src/types/detail-view.ts`

**What it currently does:** Defines `DetailFieldTypeSchema` with `'date'` but not `'datetime'` or `'time'`.

**Change:** Add `'datetime'` and `'time'` to `DetailFieldTypeSchema`:

```ts
export const DetailFieldTypeSchema = z.enum([
  'text', 'number', 'date', 'datetime', 'time',
  'boolean', 'url', 'email', 'badge', 'custom',
]);
```

Note: The detail-view renderer (outside this package) is not part of this issue. Adding the types to the schema is the necessary foundation; rendering improvements to detail views are a follow-up.

---

### 3. `packages/core/src/types/table.ts`

**What it currently does:** Defines `ColumnTypeSchema` with `'date'` but not `'datetime'` or `'time'`.

**Change:** Add `'datetime'` and `'time'` to `ColumnTypeSchema`:

```ts
export const ColumnTypeSchema = z.enum([
  'string', 'number', 'date', 'datetime', 'time',
  'boolean', 'enum', 'custom',
]);
```

---

### 4. `packages/core/src/types/page.ts`

**What it currently does:** `FilterField.type` is `'select' | 'text' | 'date'`.

**Change:** Extend the union to include `'datetime'` and `'time'`:

```ts
export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'datetime' | 'time';
  options?: FieldOption[];
  placeholder?: string;
}
```

---

### 5. `packages/schema-builder-zod/src/mappers.ts`

**What it currently does:** `toFieldType()` only checks for `email` among string formats; returns `'text'` for everything else. `toColumnType()` doesn't handle `z.date()` at all.

**Change — `toFieldType()`:** Add checks for `'date-time'`, `'date'`, and `'time'` string formats, plus handle the `'date'` Zod type (from `z.date()`):

```ts
function toFieldType(def: ZodDef): FieldType {
  const type = def.type as string;
  if (type === 'string') {
    const checks = getChecks(def);
    if (checks.some((c) => c.check === 'string_format' && c.format === 'email'))
      return 'email';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date-time'))
      return 'datetime';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date'))
      return 'date';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'time'))
      return 'time';
    return 'text';
  }
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'checkbox';
  if (type === 'enum') return 'select';
  if (type === 'date') return 'datetime'; // z.date() carries time — maps to datetime
  return 'text';
}
```

**Change — `toColumnType()`:** Add the same date/time/datetime checks:

```ts
function toColumnType(def: ZodDef): Column['type'] {
  const type = def.type as string;
  if (type === 'string') {
    const checks = getChecks(def);
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date-time'))
      return 'datetime';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date'))
      return 'date';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'time'))
      return 'time';
    return 'string';
  }
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'enum') return 'enum';
  if (type === 'date') return 'datetime';
  return 'string';
}
```

---

### 6. `packages/spa-solid-shoelace/ui/FormView.tsx`

**What it currently does:**
- `initialValues()` passes through existing entity values verbatim (no conversion for datetime).
- The catch-all `<sl-input type={field.type}>` handles `'date'` (works), but would misfire for `'datetime'` as `type="datetime"` (not a valid HTML input type).
- `'datetime'` is not in `FieldTypeSchema` yet, so this is currently a non-issue — but it becomes a bug the moment the type is added.

**Changes:**

#### 6a. Add ISO conversion helpers near the top of the file (after imports):

```ts
function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  return local ? new Date(local).toISOString() : '';
}
```

#### 6b. Fix `initialValues()` to downconvert ISO strings for `datetime` fields:

In `FormEditor`, inside `initialValues()`, add a branch before the fallback:

```ts
if (f.type === 'datetime') return [f.name, isoToDatetimeLocal(String(existing ?? ''))];
```

This ensures that when editing an existing record with a stored ISO datetime, the `datetime-local` input receives the correctly formatted local time string.

#### 6c. Add a dedicated `<Show when={field.type === 'datetime'}>` branch:

Insert this block **before** the catch-all `<Show>`, alongside the other dedicated blocks (checkbox, switch, color, etc.):

```tsx
<Show when={field.type === 'datetime'}>
  <sl-input
    label={hideLabel() ? undefined : fieldLabel()}
    aria-label={fieldLabel()}
    type="datetime-local"
    help-text={field.helpText ?? undefined}
    disabled={field.readOnly || undefined}
    prop:value={isoToDatetimeLocal(strVal())}
    invalid={!!err() || undefined}
    on:sl-change={(e: Event) => {
      const raw = (e.target as EventTarget & { value: string }).value;
      setValue(field.name, datetimeLocalToIso(raw));
    }}
  />
</Show>
```

Note: uses `on:sl-change` (not `on:sl-input`) — `datetime-local` only fires a complete, parseable value on commit, not on each partial keystroke.

#### 6d. Exclude `'datetime'` from the catch-all `<Show>` condition:

Update the existing catch-all block's `when` condition to add `field.type !== 'datetime'`:

```tsx
<Show
  when={
    !isTextarea() &&
    field.type !== 'select' &&
    field.type !== 'radio-group' &&
    field.type !== 'checkbox' &&
    field.type !== 'switch' &&
    field.type !== 'color' &&
    field.type !== 'tags' &&
    field.type !== 'rating' &&
    field.type !== 'datetime'   // ← add this
  }
>
```

`'date'` and `'time'` remain in the catch-all — `type="date"` and `type="time"` are valid HTML input types and their wire formats match directly.

---

### 7. `packages/spa-solid-shoelace/ui/PageView.tsx`

**What it currently does:**

`FilterFormPane` handles `'text'` and `'date'` via a single `<Match>` that passes `type={field.type}` to `sl-input`. `FormPane` has its own catch-all that would misfire for `'datetime'` for the same reason as `FormView.tsx`. `TablePane` does an inline boolean check and `String(...)` fallback — no formatting for date/time types.

**Changes:**

#### 7a. Add ISO conversion helpers at the top of the file:

Define the same `isoToDatetimeLocal` / `datetimeLocalToIso` functions at module scope (duplicate from FormView.tsx — these are too small to justify a shared module, and TableView.tsx creates a circular import concern).

#### 7b. `FilterFormPane` — extend existing `<Match>` and add `datetime` branch:

Extend the existing Match for `text` and `date` to include `time` (no special handling needed):

```tsx
<Match when={field.type === 'text' || field.type === 'date' || field.type === 'time'}>
  <sl-input
    type={field.type}
    ...
  />
</Match>
```

Add a new Match before it for `datetime`:

```tsx
<Match when={field.type === 'datetime'}>
  <sl-input
    type="datetime-local"
    label={field.label}
    placeholder={field.placeholder}
    prop:value={isoToDatetimeLocal(firstParam(searchParams[field.name]))}
    on:sl-change={(e: Event) => {
      setSearchParams({
        [field.name]: datetimeLocalToIso(
          (e.target as EventTarget & { value: string }).value,
        ),
      });
    }}
  />
</Match>
```

The filter stores and reads ISO strings in search params (consistent with the API query parameters).

#### 7c. `FormPane` — add dedicated `datetime` branch and exclude from catch-all:

Same changes as FormView.tsx (6b, 6c, 6d), applied to the `FormPane` component in PageView.tsx:
- Add `datetime` branch with `isoToDatetimeLocal` / `datetimeLocalToIso`
- Use `on:sl-change`
- Exclude `'datetime'` from the catch-all `<Show>` condition

`FormPane` does not pre-populate from an existing entity (it's for create forms in page views), so there's no `initialValues()` to fix. The `makeInitValues()` function in `FormPane` returns `''` for unknown types, which is correct — `isoToDatetimeLocal('')` returns `''`.

#### 7d. `TablePane` — add `formatCellValue` and use it:

Add a module-level helper (before `TablePane`):

```ts
function formatCellValue(col: Column, row: Record<string, unknown>): string {
  const raw = row[col.key];
  if (raw == null) return '';
  if (col.type === 'boolean') return raw ? '✓' : '✗';
  if (col.type === 'date') {
    const d = new Date(`${String(raw)}T00:00:00`);
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
  }
  if (col.type === 'datetime') {
    const d = new Date(String(raw));
    return isNaN(d.getTime())
      ? String(raw)
      : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  if (col.type === 'time') {
    const parts = String(raw).split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : String(raw);
  }
  return String(raw);
}
```

The `T00:00:00` suffix on date parsing prevents UTC offset from shifting the displayed day (a date-only value parsed as UTC midnight will render as the previous day in negative-offset timezones).

Replace the inline cell content in `TablePane`'s body:

```tsx
// Before:
{col.type === 'boolean'
  ? row[col.key] ? '✓' : '✗'
  : String(row[col.key] ?? '')}

// After:
{formatCellValue(col, row)}
```

---

### 8. `packages/spa-solid-shoelace/ui/TableView.tsx`

**What it currently does:**

`CellDisplay` handles `boolean` and badge variants, falls back to `String(...)`. `CellInput` always passes `type="number"` for number columns, `type="text"` for everything else — `date` and `datetime` columns in edit mode render as plain text inputs.

**Changes:**

#### 8a. Add `formatCellValue` and use it in `CellDisplay`:

Add the same `formatCellValue` function (module-level, same implementation as PageView.tsx):

Update `CellDisplay`'s `Switch` fallback to use `formatCellValue`:

```tsx
function CellDisplay(props: { col: Column; value: unknown }) {
  const display = () => formatCellValue(props.col, { [props.col.key]: props.value });
  const badgeVariant = () => props.col.badgeVariants?.[String(props.value ?? '')];

  return (
    <Switch fallback={<span>{display()}</span>}>
      <Match when={props.col.type === 'boolean'}>
        <span>{props.value ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => <sl-badge variant={variant()}>{String(props.value ?? '')}</sl-badge>}
      </Match>
    </Switch>
  );
}
```

The boolean `Match` is kept separate from `formatCellValue` because `CellDisplay` already uses `Switch/Match` for it — the boolean check within `formatCellValue` is for `TablePane`/`PageView` where `Switch/Match` isn't used.

#### 8b. Fix `CellInput` to use correct types for date/time/datetime:

Replace the final `<sl-input>` fallback block in `CellInput`:

```tsx
// Before:
return (
  <sl-input
    type={props.col.type === 'number' ? 'number' : 'text'}
    prop:value={strVal()}
    ...
    on:sl-input={(e: Event) => {
      const raw = ...;
      props.onChange(props.col.type === 'number' && raw !== '' ? Number(raw) : raw);
    }}
  />
);

// After: handle datetime separately
if (props.col.type === 'datetime') {
  return (
    <sl-input
      type="datetime-local"
      prop:value={isoToDatetimeLocal(strVal())}
      style={{ 'min-width': '160px' }}
      on:sl-change={(e: Event) => {
        props.onChange(datetimeLocalToIso(
          (e.target as EventTarget & { value: string }).value,
        ));
      }}
    />
  );
}

return (
  <sl-input
    type={
      props.col.type === 'number' ? 'number'
      : props.col.type === 'date' ? 'date'
      : props.col.type === 'time' ? 'time'
      : 'text'
    }
    prop:value={strVal()}
    style={{ 'min-width': '80px' }}
    on:sl-input={(e: Event) => {
      const raw = (e.target as EventTarget & { value: string }).value;
      props.onChange(props.col.type === 'number' && raw !== '' ? Number(raw) : raw);
    }}
  />
);
```

Add `isoToDatetimeLocal` / `datetimeLocalToIso` helpers at module scope in `TableView.tsx`.

#### 8c. `NewRow.emptyValues()` — no change needed:

The existing `col.type === 'boolean' ? false : col.type === 'number' ? 0 : ''` fallback returns `''` for date/time/datetime columns, which is the correct initial state for an empty input.

---

## Edge cases

| Edge case | How to handle |
|-----------|---------------|
| `isoToDatetimeLocal` receives empty string or `undefined` | Guard with `return iso ? iso.slice(0, 16) : ''` — returns `''`, which is valid for an empty `datetime-local` input. |
| `datetimeLocalToIso` receives empty string | Guard with `return local ? new Date(local).toISOString() : ''` — returns `''`, which is the correct wire value for a cleared datetime field. |
| `new Date(local)` receives an invalid date string | `new Date('invalid').toISOString()` throws. The `datetimeLocalToIso` function should guard: `const d = new Date(local); return isNaN(d.getTime()) ? '' : d.toISOString()`. |
| `date` parsed as UTC midnight shifts the day in negative-offset timezones | Fixed by appending `T00:00:00` before constructing the Date in `formatCellValue` for `date` columns, forcing local time interpretation. |
| `datetime` column with invalid ISO string in row data | `new Date(String(raw))` → `isNaN(d.getTime())` → fall back to `String(raw)`. Displays the raw value rather than crashing. |
| `time` column with only hours (`HH`) or hours+minutes (`HH:mm`) | `split(':')` on `HH:mm:ss` gives `['HH', 'mm', 'ss']`; `parts[0]:parts[1]` is fine. For `HH` input, `parts.length >= 2` is false, returns raw string. |
| `z.string().datetime().optional()` in mapper | `unwrapOptional` unwraps to `z.string().datetime()` before calling `toFieldType`, so the optional wrapper does not affect format detection. |
| `'datetime-local'` as a FieldType | `FieldTypeSchema` does not include `'datetime-local'` — only `'datetime'`. A test should assert that `'datetime-local'` is rejected, guarding against the easy confusion between the HTML attribute value and the field type enum. |
| FilterFormPane stores/reads ISO in search params | `datetimeLocalToIso` converts back to ISO when writing to search params; `isoToDatetimeLocal` converts when reading from params into the input. The API receives ISO strings consistently. |
| Inline editing of datetime column (CellInput) | `CellInput` gets the stored ISO value from `values()[col.key]`; `isoToDatetimeLocal` converts for display; `datetimeLocalToIso` converts on `sl-change`. Saved payload sends ISO back to the server. |

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/form.test.ts`

```
- FieldSchema accepts 'datetime' type
- FieldSchema accepts 'time' type
- FieldSchema rejects 'datetime-local' (guard against confusing HTML attribute with field type)
```

### Unit — `packages/core/src/types/__tests__/detail-view.test.ts`

```
- DetailFieldSchema accepts 'datetime' type
- DetailFieldSchema accepts 'time' type
```

### Unit — `packages/core/src/types/__tests__/table.test.ts`

```
- ColumnSchema accepts 'datetime' type
- ColumnSchema accepts 'time' type
- ColumnSchema rejects 'datetime-local'
```

### Unit — `packages/schema-builder-zod/src/__tests__/mappers.test.ts`

All four Zod → FieldType mappings:
```
- zodFieldToField('ts', z.string().datetime()) → type === 'datetime'
- zodFieldToField('d', z.string().date()) → type === 'date'
- zodFieldToField('t', z.string().time()) → type === 'time'
- zodFieldToField('createdAt', z.date()) → type === 'datetime'
```

Same four cases for `zodFieldToColumn`:
```
- zodFieldToColumn('ts', z.string().datetime()) → type === 'datetime'
- zodFieldToColumn('d', z.string().date()) → type === 'date'
- zodFieldToColumn('t', z.string().time()) → type === 'time'
- zodFieldToColumn('createdAt', z.date()) → type === 'datetime'
```

Optional wrappers (regression — ensure `unwrapOptional` doesn't strip format info):
```
- zodFieldToField('ts', z.string().datetime().optional()) → type === 'datetime', required === false
- zodFieldToColumn('d', z.string().date().optional()) → type === 'date'
```

Confirm existing `email` mapping is unaffected:
```
- zodFieldToField('email', z.string().email()) → type === 'email'  (unchanged)
```

---

## Implementation order

1. Core types first (`form.ts`, `detail-view.ts`, `table.ts`, `page.ts`) — everything downstream depends on these.
2. `mappers.ts` — depends on core types being expanded.
3. `FormView.tsx` — standalone, depends only on core types.
4. `PageView.tsx` — depends on core types; touches FilterFormPane, FormPane, TablePane.
5. `TableView.tsx` — depends on core types; touches CellDisplay and CellInput.
6. Tests — write alongside or immediately after each step.

---

## Summary of changes

| File | Change |
|---|---|
| `packages/core/src/types/form.ts` | Add `'datetime'`, `'time'` to `FieldTypeSchema` |
| `packages/core/src/types/detail-view.ts` | Add `'datetime'`, `'time'` to `DetailFieldTypeSchema` |
| `packages/core/src/types/table.ts` | Add `'datetime'`, `'time'` to `ColumnTypeSchema` |
| `packages/core/src/types/page.ts` | Add `'datetime'`, `'time'` to `FilterField.type` union |
| `packages/schema-builder-zod/src/mappers.ts` | Update `toFieldType()` and `toColumnType()` for date/time/datetime/z.date() |
| `packages/spa-solid-shoelace/ui/FormView.tsx` | Add ISO helpers; fix `initialValues()` for datetime; add dedicated datetime branch; exclude datetime from catch-all |
| `packages/spa-solid-shoelace/ui/PageView.tsx` | Add ISO helpers; fix FilterFormPane for time/datetime; fix FormPane (dedicated branch + catch-all exclusion); add `formatCellValue` to TablePane |
| `packages/spa-solid-shoelace/ui/TableView.tsx` | Add ISO helpers; add `formatCellValue`; update `CellDisplay` to use it; fix `CellInput` for date/time/datetime-local |
| `packages/core/src/types/__tests__/form.test.ts` | 3 new tests |
| `packages/core/src/types/__tests__/detail-view.test.ts` | 2 new tests |
| `packages/core/src/types/__tests__/table.test.ts` | 3 new tests |
| `packages/schema-builder-zod/src/__tests__/mappers.test.ts` | 10 new tests |
