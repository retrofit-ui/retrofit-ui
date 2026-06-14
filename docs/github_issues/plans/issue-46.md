# Plan: Star rating field type (`sl-rating`) — Issue #46

## What this change does

Adds `'rating'` as a new `FieldType`. In the SPA, a `rating` field renders Shoelace's `sl-rating` web component. The stored value is a `number` (0 = unrated, 1–max = selected). Two optional field-level properties control the component: `ratingMax` (default 5) and `ratingPrecision` (step size, default 1).

---

## Files to change

### 1. `packages/core/src/types/form.ts`

**Why:** This is the canonical type contract. All downstream consumers (`FormView`, schema-builder-zod, server adapter) derive field handling from this type.

**Changes:**

- Add `'rating'` to `FieldTypeSchema` enum.
- Add `ratingMax: z.number().int().positive().optional()` and `ratingPrecision: z.number().positive().optional()` to `FieldSchema`.

Both new fields are optional and placed after the existing optional fields so there is no breaking schema change.

```typescript
// FieldTypeSchema — add 'rating'
export const FieldTypeSchema = z.enum([
  'text', 'email', 'password', 'number', 'date',
  'select', 'multiselect', 'checkbox', 'switch', 'radio',
  'textarea', 'markdown', 'file',
  'rating',   // ← new
]);

// FieldSchema — add ratingMax, ratingPrecision
export const FieldSchema = z.object({
  // ...existing fields unchanged...
  ratingMax: z.number().int().positive().optional(),
  ratingPrecision: z.number().positive().optional(),
});
```

### 2. `packages/spa-solid-shoelace/ui/FormView.tsx`

**Why:** This is the only SPA file that renders form fields. Every field type has a `<Show>` block here.

**Changes (in order):**

**a. Import the Shoelace rating component** at the top alongside the other component imports:
```typescript
import '@shoelace-style/shoelace/dist/components/rating/rating.js';
```

**b. Add a `Show` block for `'rating'`** inside the `<For>` loop, before the catch-all `sl-input` block:
```tsx
<Show when={field.type === 'rating'}>
  <div>
    <Show when={!hideLabel()}>
      <label style={{ display: 'block', 'margin-bottom': 'var(--sl-spacing-2x-small)', 'font-size': 'var(--sl-font-size-small)', 'font-weight': 'var(--sl-font-weight-semibold)' }}>
        {fieldLabel()}
      </label>
    </Show>
    <sl-rating
      label={fieldLabel()}
      prop:value={Number(values()[field.name] ?? 0)}
      max={field.ratingMax ?? 5}
      precision={field.ratingPrecision ?? 1}
      readonly={field.readOnly || undefined}
      on:sl-change={(e: Event) =>
        setValue(field.name, (e.target as EventTarget & { value: number }).value)
      }
    />
    <Show when={field.helpText}>
      <p style={{ margin: 'var(--sl-spacing-2x-small) 0 0', 'font-size': 'var(--sl-font-size-small)', color: 'var(--sl-color-neutral-600)' }}>
        {field.helpText}
      </p>
    </Show>
  </div>
</Show>
```

**c. Extend the catch-all `sl-input` `Show` condition** to exclude `'rating'`:
```tsx
<Show
  when={
    !isTextarea() &&
    field.type !== 'select' &&
    field.type !== 'checkbox' &&
    field.type !== 'switch' &&
    field.type !== 'rating'   // ← add this
  }
>
```
Without this exclusion, a `rating` field would also render an `<sl-input type="rating">`, which is invalid.

**d. Update `initialValues()`** to default `rating` fields to `0` instead of `''`:
```typescript
if (f.type === 'checkbox' || f.type === 'switch') return [f.name, false];
if (f.type === 'rating') return [f.name, 0];   // ← new
return [f.name, ''];
```

**Note on value binding:** `sl-rating` uses a numeric `value` property, not a string. Use `prop:value={Number(...)}` to set it via DOM property (same pattern as `prop:value` for `sl-input` and `prop:checked` for `sl-checkbox`). The change event's `e.target.value` is already a `number` for `sl-rating`.

**Note on label:** `sl-rating` does not have a visual `label` slot like `sl-input`. Render the label explicitly above the component (see block above). The `label` attribute on `sl-rating` itself is for `aria-label` (accessibility).

**Note on `disabled` vs `readonly`:** `sl-rating` does not have a `disabled` attribute; use `readonly` to prevent changes on read-only fields.

### 3. Blog example server — `examples/blog/server.ts` (or equivalent)

**Why:** Reviewer explicitly requested a `reviews` collection in the blog example so there is a working, demo-able integration of the `rating` field type.

**Change:** Add a `reviews` resource with `title` (text), `body` (textarea), and `rating` (rating, ratingMax 5) fields. Wire it into the express app using the same in-memory adapter pattern as existing blog resources.

---

### 4. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** TypeScript will error on the `sl-rating` JSX element without a declaration. Every Shoelace component used in the SPA is declared here.

**Change:** Add `sl-rating` to the `IntrinsicElements` map:
```typescript
'sl-rating': JSX.HTMLAttributes<HTMLElement> & {
  label?: string;
  value?: number;
  'prop:value'?: number;
  max?: number;
  precision?: number;
  readonly?: boolean;
  'on:sl-change'?: SlEventHandler;
  'on:sl-hover'?: SlEventHandler;
};
```

---

## What must remain true after the change

- All 13 existing field types (`text`, `email`, `password`, `number`, `date`, `select`, `multiselect`, `checkbox`, `switch`, `radio`, `textarea`, `markdown`, `file`) still parse and render correctly — no regressions.
- `FieldSchema.safeParse({ name: 'x', label: 'X', type: 'rating' })` succeeds.
- `FieldSchema.safeParse({ name: 'x', label: 'X', type: 'color' })` still fails.
- A `rating` field renders `sl-rating`, not `sl-input`.
- A `rating` field with `ratingMax: 10` passes `max=10` to `sl-rating`.
- A `rating` field with `ratingPrecision: 0.5` passes `precision=0.5` to `sl-rating`.
- The value submitted in the form body is a number (not a string).
- `readOnly: true` on a `rating` field makes the component non-interactive.
- `ratingMax` and `ratingPrecision` are optional — omitting them uses defaults of 5 and 1.
- `pnpm typecheck` passes.
- `pnpm lint` exits zero.
- The blog example's `reviews` collection is reachable and renders `sl-rating` for the `rating` field.
- E2e tests for reviews: create with rating, value stored as number, rating pre-filled on edit, default max 5 — all pass.

---

## Edge cases to handle

| Case | Handling |
|---|---|
| `value` is `undefined` on new entity | `initialValues()` returns `0`; `sl-rating` shows no stars |
| `value` is `null` (from DB) | `Number(null ?? 0)` → `0`; safe |
| `value` is `"3"` (string from JSON) | `Number("3")` → `3`; `prop:value` coerces correctly |
| `ratingMax` not provided | Default `5` passed to `max` attribute |
| `ratingPrecision` not provided | Default `1` passed to `precision` attribute |
| `ratingMax: 0` or negative | Zod `.positive()` validation rejects it at spec-parse time |
| `readOnly: true` | Pass `readonly` attribute to `sl-rating` (not `disabled` — `sl-rating` has no `disabled`) |
| Form submitted with rating `0` | `0` is a valid number; server receives `{ score: 0 }` — server can interpret as "unrated" |
| Two-column layout | `rating` field participates in the grid like any other field |
| `required` validation | Existing `validate()` function checks `val === undefined || val === '' || val === null`; a rating of `0` passes (`0` is falsy but not `''` or `null`). Consider: should `0` count as "no rating" for required? The issue does not specify. **Decision:** leave required check as-is — `0` is a valid value. If the server wants to reject unrated, it should validate. |

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/form.test.ts`

Extend the existing `FieldSchema` describe block:

```typescript
it('accepts rating field type', () => {
  const result = FieldSchema.safeParse({ name: 'score', label: 'Score', type: 'rating' });
  expect(result.success).toBe(true);
});

it('accepts ratingMax on rating field', () => {
  const field = FieldSchema.parse({ name: 'score', label: 'Score', type: 'rating', ratingMax: 10 });
  expect(field.ratingMax).toBe(10);
});

it('accepts ratingPrecision on rating field', () => {
  const field = FieldSchema.parse({ name: 'score', label: 'Score', type: 'rating', ratingPrecision: 0.5 });
  expect(field.ratingPrecision).toBe(0.5);
});

it('rejects ratingMax of 0', () => {
  const result = FieldSchema.safeParse({ name: 'score', label: 'Score', type: 'rating', ratingMax: 0 });
  expect(result.success).toBe(false);
});

it('rejects negative ratingMax', () => {
  const result = FieldSchema.safeParse({ name: 'score', label: 'Score', type: 'rating', ratingMax: -1 });
  expect(result.success).toBe(false);
});

it('does not reject ratingMax on non-rating fields (stored but ignored)', () => {
  // ratingMax is on the Field schema generally; validation is done in the SPA
  const result = FieldSchema.safeParse({ name: 'x', label: 'X', type: 'text', ratingMax: 5 });
  expect(result.success).toBe(true);
});
```

### Integration — `packages/server-solid-shoelace/src/__tests__/express.test.ts`

Add a resource (or standalone form) with a `rating` field and verify the JSON spec returned by the server includes `type: 'rating'`, `ratingMax`, and `ratingPrecision`. The existing test structure (spin up express, fetch `/api/...`) can be extended.

### E2E — blog example (`examples/blog`)

**Reviewer requested:** create a `reviews` collection in the blog example server and write automated e2e tests that add reviews and set star ratings. This replaces the earlier manual verification steps.

#### 4a. Blog example server — add reviews collection

In the blog example server (e.g. `examples/blog/server.ts` or equivalent), add a `reviews` collection with at least:

```typescript
{
  name: 'reviews',
  label: 'Reviews',
  fields: [
    { name: 'title',  label: 'Title',  type: 'text' },
    { name: 'body',   label: 'Body',   type: 'textarea' },
    { name: 'rating', label: 'Rating', type: 'rating', ratingMax: 5 },
  ],
}
```

The in-memory store pattern used by the other blog collections (posts, comments, etc.) applies here unchanged.

#### 4b. E2E tests — `examples/blog/e2e/reviews.spec.ts` (or nearest existing e2e location)

Write Playwright tests (matching the project's existing e2e setup and file conventions) covering:

1. **Create a review with a star rating**
   - Navigate to the reviews list.
   - Open the "New review" form.
   - Fill in `title` and `body`.
   - Click the 3rd star on the `sl-rating` component.
   - Submit and assert the new review appears in the list.

2. **Stored rating value is a number**
   - After creating a review, intercept or inspect the POST body (or a subsequent GET) and assert `rating` is the number `3`, not the string `"3"`.

3. **Rating is pre-filled when editing**
   - Navigate to edit the review created above.
   - Assert the `sl-rating` element has `value="3"` (i.e. the correct star is highlighted).
   - Change the rating to 5 stars, save, and re-open — assert the updated value persists.

4. **Default max (5 stars)**
   - Assert the rendered `sl-rating` has `max="5"` (or that exactly 5 star symbols are present).

Playwright selectors for `sl-rating`: use `page.locator('sl-rating[name="rating"]')` and interact via `.click()` on its shadow-DOM parts, or use Shoelace's imperative API (`evaluate`) to set value directly if shadow-DOM clicking is unreliable in CI.

---

## Changeset

After implementation, run `pnpm changeset` and select:

- `@retrofit-ui/core` — minor (new field type added, no breaking changes)
- `@retrofit-ui/server-solid-shoelace` — minor (SPA renders new type; `shoelace-types.d.ts` updated)

---

## Out of scope for this issue

- Schema-builder-zod integration: `ratingMax`/`ratingPrecision` cannot be inferred from a Zod `number()` schema, so the builder cannot auto-generate them. They must be set via `fieldOverride`. No changes to `packages/schema-builder-zod`.
- The server adapter does not need changes: `fieldOverride` already merges arbitrary `Partial<Field>` properties, so `ratingMax`/`ratingPrecision` pass through automatically once they are on the `Field` type.
- React renderer: out of scope per AGENTS.md ("implement Solid first").
- `multiselect` and `radio` field types already exist but are not handled distinctly in the current `FormView.tsx` catch-all (they fall through to `sl-input`). Do not fix that in this PR.
