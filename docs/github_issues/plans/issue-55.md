# Plan: Field tooltip for contextual help text (`sl-tooltip`) — Issue #55

## Goal

Add an optional `tooltip` field to `Field`. When set, a `?` icon button appears next to the field label; hovering (or focusing) it shows the tooltip text. `tooltip` and `helpText` are independent and can coexist on the same field.

---

## Files to change

### 1. `packages/core/src/types/form.ts`

**Why:** `FieldSchema` is the Zod source-of-truth for `Field`. All downstream consumers — builders, renderer, wire format — derive from it.

Add `tooltip` after `helpText` in `FieldSchema`:

```typescript
export const FieldSchema = z.object({
  // existing fields...
  helpText: z.string().optional(),
  tooltip: z.string().optional(),   // ← add this
  // existing fields...
});
```

`tooltip` is a plain `z.string().optional()` — no enum, no validation beyond being a string. Empty string `""` is technically valid per schema but will not render a tooltip button (guarded by `Show when={field.tooltip}` in the renderer, which treats `""` as falsy).

---

### 2. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** SolidJS/TypeScript needs intrinsic element declarations for `<sl-tooltip>` and `<sl-icon-button>` or the JSX in `FormView.tsx` will produce type errors.

Add after the last entry in `IntrinsicElements` (after the `'sl-badge'` block, before the closing `}`):

```typescript
'sl-tooltip': JSX.HTMLAttributes<HTMLElement> & {
  content?: string;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end';
  disabled?: boolean;
  distance?: number;
  open?: boolean;
  skidding?: number;
  trigger?: string;
  hoist?: boolean;
  children?: JSX.Element;
};
'sl-icon-button': JSX.HTMLAttributes<HTMLElement> & {
  name?: string;
  library?: string;
  src?: string;
  label?: string;
  disabled?: boolean;
  'on:click'?: SlEventHandler;
};
```

Declare `placement`, `disabled`, `distance`, `hoist`, and `trigger` even though this issue only uses `content` — they are real Shoelace attributes and declaring them prevents type errors if they are used elsewhere.

---

### 3. `packages/spa-solid-shoelace/ui/FormView.tsx`

**Why:** This is the sole renderer for `Field`. Three changes are needed:

#### 3a. Add Shoelace component side-effect imports

At the top of the file, after the existing Shoelace imports:

```typescript
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
```

#### 3b. Extract a `TooltipIcon` helper component

Add before `TagsInput` (or as a standalone function before `FormEditor`):

```tsx
function TooltipIcon(props: { tip: string }) {
  return (
    <sl-tooltip content={props.tip}>
      <sl-icon-button
        name="question-circle"
        label="Help"
        style={{ 'vertical-align': 'middle', 'font-size': 'var(--sl-font-size-small)' }}
      />
    </sl-tooltip>
  );
}
```

`sl-tooltip` shows on both hover and keyboard focus, so keyboard users who tab to the icon button automatically see the tooltip. No extra accessibility work needed.

#### 3c. Extend `TagsInput` to accept a `tooltip` prop

`TagsInput` already renders its own `<label>` element. Add `tooltip` to its props interface:

```typescript
interface TagsInputProps {
  // existing...
  tooltip?: string;
}
```

Inside `TagsInput`, update the label render to include `TooltipIcon`:

```tsx
<Show when={props.label}>
  <label class="retrofit-tags-label" for={inputId}>
    {props.label}
    <Show when={props.tooltip}>
      {(tip) => <TooltipIcon tip={tip()} />}
    </Show>
  </label>
</Show>
```

Pass `tooltip={field.tooltip}` when calling `<TagsInput>` inside `FormEditor`.

#### 3d. Update `FormEditor` field rendering for each field group

Inside the `<For each={visibleFields()}>` loop, each field group needs to render the tooltip button next to its label. The approach differs by how the field type renders its label:

**Group A — Shoelace components with a `label` slot (`sl-input`, `sl-textarea`, `sl-select`, `sl-radio-group`):**

Shoelace's `label` slot overrides the `label` attribute when slot content is provided. The strategy: continue using `label={...}` attribute when no tooltip is present (existing behavior, unchanged), and add slot content only when `field.tooltip` is set.

For `sl-input` (the default fallback `<Show>`):
```tsx
<sl-input
  label={(!hideLabel() && !field.tooltip) ? fieldLabel() : undefined}
  aria-label={fieldLabel()}
  // ... rest of existing props unchanged
>
  <Show when={!hideLabel() && field.tooltip}>
    {(tip) => (
      <span slot="label">
        {fieldLabel()} <TooltipIcon tip={tip()} />
      </span>
    )}
  </Show>
</sl-input>
```

Apply the same pattern to `sl-textarea`, `sl-select`, and `sl-radio-group`.

**Group B — `sl-checkbox` and `sl-switch` (label via JSX children):**

These components use their JSX children as the label text. Putting `TooltipIcon` inside the children risks click propagation toggling the control when the icon button is clicked.

The safer approach: put the tooltip button as a sibling _after_ the Shoelace component, inside the wrapping `<div>`. Both the checkbox/switch and the icon button sit side by side:

```tsx
<div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--sl-spacing-x-small)' }}>
  <sl-checkbox ...>
    {fieldLabel()}
  </sl-checkbox>
  <Show when={field.tooltip}>
    {(tip) => <TooltipIcon tip={tip()} />}
  </Show>
</div>
```

Same pattern for `sl-switch`.

**Group C — `color` and `rating` fields (custom `<label>` HTML element):**

Both already render a `<label>` element manually. Add `TooltipIcon` inside that element, after the label text:

```tsx
<label for={field.name} style={{ ... }}>
  {fieldLabel()}
  <Show when={field.tooltip}>
    {(tip) => <TooltipIcon tip={tip()} />}
  </Show>
</label>
```

**Group D — `tags` field:**

Already handled via the `TagsInput` prop extension in 3c.

---

## No changes needed in builders

`FormSpecBuilder.fieldOverride()` in `packages/server-solid-shoelace/src/form-builder.ts` already accepts `Partial<Field>` and spreads it over the derived field. Once `tooltip` is part of `Field`, it automatically flows through.

`FormBuilder.withFieldOverrides()` in `packages/schema-builder-zod/src/FormBuilder.ts` is identical — also `Partial<Field>` spread. No code change needed.

The `FormSpec` wire format is plain JSON; `tooltip` is just another string field in the serialized spec.

---

## Key decisions

### Why `z.string().optional()` with no non-empty constraint?

Consistent with `helpText`, `placeholder`, and `label` — all accept any string. An empty `tooltip` is arguably a schema authoring mistake, not a type-system concern. The renderer already guards with `Show when={field.tooltip}` which treats `""` as falsy, so empty string silently produces no tooltip button (no visible harm).

### Why `sl-icon-button` over plain `sl-icon`?

`sl-icon-button` is focusable and keyboard-accessible. `sl-tooltip` activates on both `hover` and `focus` triggers by default, so tabbing to the icon button reveals the tooltip — no mouse required. A plain `sl-icon` is not focusable, making tooltips inaccessible to keyboard-only users.

### Why sibling-after approach for checkbox/switch?

If `TooltipIcon` is placed inside `<sl-checkbox>` or `<sl-switch>` children, a click on the icon button propagates to the host element and toggles the control. Putting the icon button outside the Shoelace component avoids propagation without needing `stopPropagation()` workarounds.

### Why hide the tooltip button when `hideLabel()` is true?

`hideLabel()` is set when `labelPosition === 'hidden'`. In this layout mode the label is visually suppressed; a stray tooltip icon with no associated label text would be visually confusing and semantically orphaned. Suppress both together.

### Why `label` attribute + conditional slot, rather than slot-always?

Always-slot would require restructuring every `label={...}` prop across all field types (large diff, higher regression surface). The conditional-slot approach is surgical: existing non-tooltip fields are untouched; only tooltip fields add a slot element.

### Why `content` prop on `sl-tooltip` (not the `content` slot)?

Tooltip text is a plain string. The `content` attribute is the correct approach for plain strings; the `content` slot is for rich HTML content (which we don't need here). Using the attribute keeps the JSX simple.

---

## Edge cases

| Edge case | How to handle |
|-----------|---------------|
| `tooltip` + `helpText` on same field | Independent: `helpText` renders as Shoelace's `help-text` attribute below the input; `tooltip` renders as icon button next to label. No conflict. |
| `hideLabel()` is true | `Show when={!hideLabel() && field.tooltip}` evaluates to false — no slot content rendered. The `label` attribute is already `undefined` in this mode. No tooltip button appears. |
| `tooltip` on a `readOnly` field | Tooltip still renders. Read-only context often most benefits from explanatory tooltips (e.g., "this was auto-computed"). No special handling needed. |
| Empty string `""` as tooltip | `FieldSchema.parse()` succeeds (no `z.string().min(1)`). `Show when={field.tooltip}` treats `""` as falsy; no button rendered. Silent no-op. |
| Click on `sl-icon-button` inside checkbox/switch | Not possible — icon button is a sibling _outside_ the Shoelace component (see sibling-after approach). |
| Tooltip on a field with `type: 'color'` or `type: 'rating'` | Custom label `<label>` element already present; `TooltipIcon` is appended as a sibling inside it. |
| Long tooltip strings | `sl-tooltip` handles overflow via its own panel sizing. No truncation needed on our side. |
| Multiple fields with tooltips on the same form | Each field independently renders its own `<sl-tooltip>` + `<sl-icon-button>`. No shared state. |

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/form.test.ts`

Add to the existing `describe('FieldSchema')` block:

1. **`tooltip` is optional**: Parse `{ name: 'cvv', label: 'CVV', type: 'text' }` — assert `result.success` is `true` and `result.data.tooltip` is `undefined`.
2. **`tooltip` accepts a string**: Parse `{ name: 'cvv', label: 'CVV', type: 'text', tooltip: 'The 3-digit code on the back of your card' }` — assert `result.data.tooltip` equals the string.
3. **`tooltip` and `helpText` coexist**: Parse a field with both `tooltip: 'tip'` and `helpText: 'help'` — assert `result.success` is `true` and both fields are present.
4. **Round-trip through `FormSchema.parse()`**: Build a `FormSchema` with a field that has `tooltip` set — assert `FormSchema.safeParse(form).success` is `true`.

### Unit — `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts`

5. **`withFieldOverrides` accepts `tooltip`**: Call `.withFieldOverrides({ cvv: { tooltip: 'The 3-digit code on the back of your card' } })` — assert the built field has the correct `tooltip` value.
6. **`tooltip` survives `FormSchema.parse()` after build**: Same as above but assert `FormSchema.parse(form)` does not throw.

### Unit — `packages/server-solid-shoelace/src/__tests__/` (new or existing form builder test)

7. **`fieldOverride` passes `tooltip` through to spec**: Call `formSpec(SomeSchema).fieldOverride('cvv', { tooltip: 'tip' }).build()` — assert the `cvv` field in the output has `tooltip: 'tip'`.

### E2E — add to an existing form-view spec (e.g. `examples/js/todos/e2e/todos.spec.ts` under a new `describe`)

First, add a `tooltip` override to a field in the todos server (`examples/js/todos/src/server.ts`):

```typescript
formSpec(TodoSchema, CreateTodoSchema)
  .fieldOverride('done', { type: 'switch' })
  .fieldOverride('title', { tooltip: 'Enter a short description of the task' })
  // ... rest unchanged
```

Then add a `test.describe('Field tooltip')` block with:

8. **`sl-tooltip` element is present in the DOM**: Navigate to `/#/todos/1`, wait for `form`, and assert that the page contains at least one `sl-tooltip` element.
9. **`sl-icon-button` is visible next to the label**: Assert `page.locator('sl-icon-button[name="question-circle"]')` is visible.
10. **Tooltip content attribute matches configured string**: Assert the `sl-tooltip` element has `content="Enter a short description of the task"`.
11. **Field with tooltip + helpText renders both**: If a field is configured with both (add another `fieldOverride` in the fixture), assert both `sl-tooltip` and the Shoelace `help-text` attribute are present on the same field.
12. **Field without tooltip has no `sl-icon-button`**: Assert that the `done` (switch) field, which has no tooltip set, has no sibling `sl-icon-button`.

---

## Docs update

Add to `docs/guide/form-view.md` under the field overrides section:

| Override field | Type | Effect |
|----------------|------|--------|
| `tooltip` | `string` | Renders a `?` icon button next to the field label; hovering or focusing the button shows the tooltip text |

Add a brief usage example:

```typescript
formSpec(PaymentSchema)
  .fieldOverride('cvv', {
    tooltip: 'The 3-digit code on the back of your card (4 digits for Amex)',
  })
  .fieldOverride('routingNumber', {
    tooltip: 'Found at the bottom-left of your check',
    helpText: '9-digit ABA number',
  })
```

---

## Summary of changes

| File | Change |
|------|--------|
| `packages/core/src/types/form.ts` | Add `tooltip: z.string().optional()` to `FieldSchema` |
| `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` | Add `sl-tooltip` and `sl-icon-button` JSX intrinsic declarations |
| `packages/spa-solid-shoelace/ui/FormView.tsx` | Import `tooltip.js` + `icon-button.js`; add `TooltipIcon` component; extend `TagsInput` props; update all field group label render paths |
| `packages/core/src/types/__tests__/form.test.ts` | 4 new unit tests |
| `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts` | 2 new unit tests |
| `packages/server-solid-shoelace/src/__tests__/` | 1 new unit test for `fieldOverride` propagation |
| `examples/js/todos/src/server.ts` | Add `tooltip` override to fixture field |
| `examples/js/todos/e2e/todos.spec.ts` | 5 new e2e test cases in a `Field tooltip` describe block |
| `docs/guide/form-view.md` | Add `tooltip` row to override table + usage example |
