# Plan: Segmented control field type (`radio-group`) — Issue #43

## Goal

Add `'radio-group'` to `FieldType` so that small enums (2–4 options) can render as `sl-radio-group` + `sl-radio-button` — a segmented button control instead of a dropdown — saving the user a click.

---

## Files to change

### 1. `packages/core/src/types/form.ts`

**Why:** `FieldTypeSchema` is the authoritative Zod enum that defines every valid `FieldType`. Any new type must be added here first; every other package depends on it.

Add `'radio-group'` to the enum alongside the existing `'radio'`. Note: `'radio'` already exists in the enum but has never been rendered (it falls through to `<sl-input type="radio">` — invalid HTML). This plan does **not** implement `'radio'`; it only adds `'radio-group'`. Both can coexist until `'radio'` is either implemented or removed in a future issue.

```typescript
export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'password',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'switch',
  'radio',
  'radio-group',   // ← add this
  'textarea',
  'markdown',
  'file',
]);
```

No changes to `FieldSchema`, `FieldOption`, or any other type — `radio-group` reuses the existing `options: FieldOption[]` field exactly like `select` does.

---

### 2. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** TypeScript/JSX does not know about `<sl-radio-button>`. The file already declares `sl-radio-group` and `sl-radio` (lines 81–92), but `sl-radio-button` is missing. Without it, the JSX in `FormView.tsx` will produce type errors.

Add after the existing `'sl-radio'` block (after line 92):

```typescript
'sl-radio-button': JSX.HTMLAttributes<HTMLElement> & {
  value?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  pill?: boolean;
  children?: JSX.Element;
};
```

The `sl-radio-group` declaration (lines 81–88) already has the props needed (`prop:value`, `on:sl-change`, `disabled`). No change needed there.

---

### 3. `packages/spa-solid-shoelace/ui/FormView.tsx`

**Why:** This is where field types are conditionally rendered. Three distinct changes are required:

#### 3a. Add Shoelace component imports (top of file, after existing imports)

```typescript
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
```

#### 3b. Add a `<Show>` block for `radio-group` rendering

Insert after the `<Show when={field.type === 'select'}>` block (after line 300) and before the `<Show when={field.type === 'checkbox'}>` block:

```tsx
<Show when={field.type === 'radio-group'}>
  <sl-radio-group
    label={hideLabel() ? undefined : fieldLabel()}
    help-text={field.helpText ?? undefined}
    disabled={field.readOnly || undefined}
    prop:value={strVal()}
    invalid={!!err() || undefined}
    on:sl-change={(e: Event) =>
      setValue(
        field.name,
        (e.target as EventTarget & { value: string }).value,
      )
    }
  >
    <For each={field.options}>
      {(opt) => (
        <sl-radio-button value={String(opt.value)}>
          {opt.label}
        </sl-radio-button>
      )}
    </For>
  </sl-radio-group>
</Show>
```

Value handling is identical to `select`: `strVal()` returns the current string value, and `on:sl-change` reads `e.target.value`. No special initialisation needed — `initialValues()` already defaults non-boolean fields to `''`.

#### 3c. Exclude `radio-group` from the `<sl-input>` fallthrough guard

The catch-all `<Show>` block at lines 332–338 renders `<sl-input type={field.type}>` for anything not explicitly handled. Currently it excludes `textarea`, `markdown`, `select`, `checkbox`, and `switch`. Without an exclusion, `radio-group` would also try to render as `<sl-input type="radio-group">` — invalid HTML.

```tsx
// Before:
<Show
  when={
    !isTextarea() &&
    field.type !== 'select' &&
    field.type !== 'checkbox' &&
    field.type !== 'switch'
  }
>

// After:
<Show
  when={
    !isTextarea() &&
    field.type !== 'select' &&
    field.type !== 'radio-group' &&
    field.type !== 'checkbox' &&
    field.type !== 'switch'
  }
>
```

---

## Key decisions

### Why `'radio-group'` and not reuse `'radio'`?

The issue explicitly specifies `'radio-group'` as the new type name. Additionally, `sl-radio-button` (the segmented/button appearance) is different from `sl-radio` (a plain circle radio). Keeping them as separate types lets both eventually coexist: `'radio'` for traditional radio buttons, `'radio-group'` for the segmented control. Implementing `'radio'` is a separate concern.

### Why no new `Field` properties?

The `radio-group` type reuses `field.options: FieldOption[]`, which is already defined and used by `select`. No new fields on `Field` are needed for the basic feature. Optional additions like `size` (Shoelace supports `small`/`medium`/`large` on `sl-radio-button`) could be added later if needed.

### No changes to `schema-builder-zod`

The Zod-to-FieldType mapper (`packages/schema-builder-zod/src/mappers.ts`) maps `z.enum()` to `'select'` by default. That remains correct — `'radio-group'` is an opt-in override, not an auto-detected type. No mapper change is needed.

### No changes to `server-solid-shoelace` builder

The `formSpec().fieldOverride()` API already accepts any partial `Field`, so passing `{ type: 'radio-group' }` works immediately once `FieldTypeSchema` accepts it. No builder-level change is needed.

---

## Edge cases to handle

| Edge case | How to handle |
|-----------|---------------|
| `field.options` is undefined or empty | The `<For each={field.options}>` renders nothing. The `sl-radio-group` still renders (showing an empty group). This is the same behaviour as `select`. No special guard needed — the server is responsible for providing options. |
| `field.readOnly === true` | Pass `disabled={field.readOnly \|\| undefined}` on `<sl-radio-group>`. Shoelace propagates `disabled` to all child `sl-radio-button` elements. |
| `field.required` validation | `sl-radio-group` supports a `required` attribute, but retrofit-ui's client-side validation runs in `validateField()` at form submission. The existing required-field check (`if (!v && v !== 0 && v !== false)`) will catch an empty string value — which `radio-group` will have when nothing is selected. No special case needed. |
| Pre-populated value (edit form) | `prop:value={strVal()}` on `sl-radio-group` sets the selected button reactively. When the entity is loaded, `values()[field.name]` is set and `strVal()` returns the correct string, which Shoelace uses to select the matching `sl-radio-button` by its `value` attribute. Works with the existing initialisation path. |
| Value is a number (e.g., priority: 1/2/3) | `String(opt.value)` on `<sl-radio-button value>` and `strVal()` on `<sl-radio-group prop:value>` both coerce to string. The `on:sl-change` handler stores the string. If the schema declares a numeric enum, the server receives a string — same behaviour as `select`. This is an existing limitation, not new. |
| `hideLabel()` is true (two-column layout) | `label={hideLabel() ? undefined : fieldLabel()}` matches the existing pattern used by `select`. |
| `invalid` display | `sl-radio-group` supports the `invalid` attribute. Passing `invalid={!!err() \|\| undefined}` follows the existing pattern. |

---

## Tests to write

### Unit tests — `packages/core/src/types/__tests__/form.test.ts`

1. **`'radio-group'` is a valid FieldType**: Parse a field with `type: 'radio-group'` through `FieldSchema.parse()` and assert it succeeds without error.
2. **`'radio-group'` with options parses correctly**: Provide `options: [{label: 'Low', value: 'low'}, ...]` alongside `type: 'radio-group'` and assert the parsed object preserves them.

### Unit tests — `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts`

3. **`fieldOverride` accepts `'radio-group'` type**: Call `.fieldOverride('priority', { type: 'radio-group' })` on a form builder and assert the resulting field has `type === 'radio-group'`. This verifies the new value flows through the builder without a TS error.

### Integration / rendering tests — (if vitest-based component tests exist, otherwise skip to e2e)

4. **`radio-group` renders `sl-radio-group` with `sl-radio-button` children**: Mount `FormView` (or the field-rendering sub-component if extracted) with a spec containing a `radio-group` field with three options, and assert the DOM contains one `sl-radio-group` and three `sl-radio-button` elements.
5. **Fallthrough guard**: Mount `FormView` with a `radio-group` field and assert no `<sl-input>` is rendered for that field.

### E2E tests — `examples/js/blog/e2e/*.spec.ts` (or a new example)

The blog example already has an `status` enum (`draft / published / archived`). The cleanest approach for an e2e test is to add `radio-group` to an existing example rather than creating a new one.

6. **Override `status` to `radio-group` in blog example server.ts**: Add `.fieldOverride('status', { type: 'radio-group' })`.
7. **E2E: segmented control renders**: Navigate to the post edit form, assert the `sl-radio-group` is visible with the three status buttons.
8. **E2E: selecting a button updates the value**: Click `sl-radio-button[value="published"]`, submit the form, re-open the entity, and assert the status shows `published`.
9. **E2E: pre-populated value selects the correct button**: Load an existing entity with `status: 'draft'`, open the edit form, and assert `sl-radio-button[value="draft"]` is visually selected.

---

## Docs update

Add a row to the field types table in `docs/guide/form-view.md`:

| Override type | Input |
|---|---|
| `radio-group` | `<sl-radio-group>` with `<sl-radio-button>` children (segmented control) |

And add a usage example under "Field overrides":

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('status', { type: 'radio-group' })
```

---

## Summary of changes

| File | Change |
|------|--------|
| `packages/core/src/types/form.ts` | Add `'radio-group'` to `FieldTypeSchema` enum |
| `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` | Add `sl-radio-button` JSX declaration |
| `packages/spa-solid-shoelace/ui/FormView.tsx` | Import radio-group/radio-button JS; add `<Show>` render block; exclude from `<sl-input>` fallthrough |
| `docs/guide/form-view.md` | Add `radio-group` row to field types table and a usage example |
| `packages/core/src/types/__tests__/form.test.ts` | 2 new unit tests |
| `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts` | 1 new unit test |
| `examples/js/blog/src/server.ts` | Add `fieldOverride('status', { type: 'radio-group' })` for e2e test coverage |
| `examples/js/blog/e2e/*.spec.ts` | 3 new e2e test cases |
