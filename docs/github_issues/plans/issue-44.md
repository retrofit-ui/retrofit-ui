# Plan: Color picker field type (issue #44)

## What must remain true after this change

- All existing field types continue to parse and render correctly.
- The fallback `sl-input` block in FormView.tsx does not accidentally render for `'color'` fields.
- The test "rejects unknown field type" in `form.test.ts` still tests rejection of an invalid type (just not `'color'` anymore).
- `colorFormat` and `colorSwatches` are optional and have no effect when `type !== 'color'`.
- The stored field value is the string emitted by `sl-color-picker` (e.g. `#7c3aed`).

---

## Files to change

### 1. `packages/core/src/types/form.ts`

**Why:** This is the authoritative spec type. All consumers (SPA, server builder, schema mapper) derive their types from `FieldTypeSchema`.

**Changes:**

a) Add `'color'` to `FieldTypeSchema`:
```typescript
export const FieldTypeSchema = z.enum([
  'text', 'email', 'password', 'number', 'date',
  'select', 'multiselect', 'checkbox', 'switch', 'radio',
  'textarea', 'markdown', 'file',
  'color',   // ← add here
]);
```

b) Add two optional color-specific fields to `FieldSchema`:
```typescript
export const FieldSchema = z.object({
  // ... existing fields ...
  colorFormat: z.enum(['hex', 'rgb', 'hsl']).optional(),
  colorSwatches: z.array(z.string()).optional(),
});
```

`colorFormat` maps to `sl-color-picker`'s `format` attribute (Shoelace default is `'hex'`).  
`colorSwatches` maps to `sl-color-picker`'s `swatches` attribute; the SPA joins the array with `'; '`.

---

### 2. `packages/spa-solid-shoelace/ui/FormView.tsx`

**Why:** This is the only SPA render layer. No other files render form fields.

**Changes:**

a) Add Shoelace component import at the top (alongside the other imports):
```typescript
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
```

b) Add a `<Show>` block for the color picker, inside the `<For each={visibleFields()}>` render, after the switch block and before the fallback `sl-input` block:
```tsx
<Show when={field.type === 'color'}>
  {/* sl-color-picker has no built-in visible label — render one manually */}
  <div>
    <Show when={!hideLabel()}>
      <label style={{ display: 'block', 'margin-bottom': 'var(--sl-spacing-2x-small)', 'font-size': 'var(--sl-font-size-medium)', 'font-weight': 'var(--sl-font-weight-semibold)' }}>
        {fieldLabel()}
      </label>
    </Show>
    <sl-color-picker
      aria-label={fieldLabel()}
      format={field.colorFormat ?? 'hex'}
      swatches={field.colorSwatches?.join('; ') ?? undefined}
      disabled={field.readOnly || undefined}
      prop:value={strVal() || '#000000'}
      on:sl-change={(e: Event) =>
        setValue(field.name, (e.target as EventTarget & { value: string }).value)
      }
    />
    <Show when={field.helpText}>
      <p style={{ margin: 'var(--sl-spacing-2x-small) 0 0', 'font-size': 'var(--sl-font-size-small)', color: 'var(--sl-color-neutral-500)' }}>
        {field.helpText}
      </p>
    </Show>
  </div>
</Show>
```

c) Extend the fallback `<Show>` condition that renders `sl-input` to exclude `'color'`:
```tsx
<Show
  when={
    !isTextarea() &&
    field.type !== 'select' &&
    field.type !== 'checkbox' &&
    field.type !== 'switch' &&
    field.type !== 'color'   // ← add this
  }
>
```

**Edge case — initial value for `'color'`:** The fallback in `initialValues()` uses `''` for all non-checkbox/switch types. `sl-color-picker` with an empty `value` shows its own default colour (black). Render with `prop:value={strVal() || '#000000'}` so the SPA and picker agree on a starting state. The stored form value will be `''` until the user picks a colour, which allows required-field validation to catch unset colour fields.

**Edge case — `required` validation:** The existing `validate()` check `val === '' || val === undefined || val === null` already handles this correctly for color fields.

---

### 3. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** TypeScript needs to know the shape of `<sl-color-picker>` as a JSX intrinsic element.

**Add inside the `IntrinsicElements` interface:**
```typescript
'sl-color-picker': JSX.HTMLAttributes<HTMLElement> & {
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv';
  value?: string;
  'prop:value'?: string;
  swatches?: string;
  inline?: boolean;
  disabled?: boolean;
  'no-format-toggle'?: boolean;
  'on:sl-change'?: SlEventHandler;
  'on:sl-input'?: SlEventHandler;
};
```

Note: `sl-color-picker` does not have an `invalid` prop in Shoelace; error display is handled by the existing common error `<Show when={err()}>` block below the field.

---

## Files with NO changes needed

- **`packages/server-solid-shoelace/src/form-builder.ts`** — `fieldOverride(key, Partial<Field>)` accepts `type: 'color'` automatically once `Field` is updated.
- **`packages/schema-builder-zod/src/mappers.ts`** — Color fields are set by manual `fieldOverride`, not auto-derived from Zod. No mapping change needed.
- **`packages/server-solid-shoelace/src/view-builder.ts`** — No builder method for field-level concerns.
- **Example apps** — None use a color field; no example change required by the issue.

---

## Tests to write

### Unit tests — `packages/core/src/types/__tests__/form.test.ts`

**Critical fix first:** The existing test `'rejects unknown field type'` uses `type: 'color'` as the invalid value. After this change that test will fail because `'color'` is now valid. Change it to use `type: 'unknowntype'` or similar.

**Add tests:**
```typescript
it('accepts color field type', () => {
  const result = FieldSchema.safeParse({
    name: 'brand',
    label: 'Brand colour',
    type: 'color',
  });
  expect(result.success).toBe(true);
});

it('accepts colorFormat on a color field', () => {
  const result = FieldSchema.safeParse({
    name: 'brand',
    label: 'Brand colour',
    type: 'color',
    colorFormat: 'hsl',
  });
  expect(result.success).toBe(true);
});

it('rejects invalid colorFormat value', () => {
  const result = FieldSchema.safeParse({
    name: 'brand',
    label: 'Brand colour',
    type: 'color',
    colorFormat: 'cmyk',
  });
  expect(result.success).toBe(false);
});

it('accepts colorSwatches array', () => {
  const result = FieldSchema.safeParse({
    name: 'brand',
    label: 'Brand colour',
    type: 'color',
    colorSwatches: ['#ff0000', '#00ff00', '#0000ff'],
  });
  expect(result.success).toBe(true);
});

it('rejects unknown field type', () => {
  // was using 'color' — changed to 'unknowntype' since 'color' is now valid
  const result = FieldSchema.safeParse({
    name: 'x',
    label: 'X',
    type: 'unknowntype',
  });
  expect(result.success).toBe(false);
});
```

### Integration / E2E — `examples/js/contacts/e2e/contacts.spec.ts` (or a new example)

The existing examples do not have a color field. Options:
1. Add a `color` field to the contacts example (e.g. a `preferredColor` field) and write a Playwright test that:
   - Opens the create contact form
   - Confirms `sl-color-picker` is present in the DOM
   - Submits with a colour value and verifies it is stored
2. Defer e2e until a new color-specific example is added.

The minimum required is option 1, adding a field to one example to exercise the full render path. The contacts example is the best candidate because it is the simplest.

---

## Key decisions and rationale

| Decision | Rationale |
|---|---|
| Store value as a raw string (hex by default) | Matches what `sl-color-picker` emits and what the server receives; no transform layer needed |
| Default `format` to `'hex'` | Most common need; hex is unambiguous and easy to store in a DB column |
| `colorSwatches` as `string[]` in spec, joined as `'; '` in SPA | Array is ergonomic for the server-side builder; Shoelace `swatches` attribute takes a `;`-delimited string |
| Manual `<label>` element instead of `label` prop | `sl-color-picker` does not render a visible label from its `label` prop — that prop is aria-only |
| `prop:value={strVal() \|\| '#000000'}` fallback | Avoids an empty `prop:value` making the picker show no colour while initialValues still holds `''` for validation |
| No change to form-builder or mappers | The builder's `fieldOverride` generic already handles new types; colour fields are always set explicitly, never auto-derived from Zod schemas |
