# Plan: Tags input field type (#45)

## Problem recap

`z.string().optional()` with `helpText: 'comma-separated'` is the current workaround for tags in the blog example. There is no visual affordance per tag, no removal UX, and the stored value is a plain string. Issue #45 adds `'tags'` to `FieldType` and a `TagsInput` component that stores `string[]`.

---

## Files to change

### 1. `packages/core/src/types/form.ts`

Add `'tags'` to `FieldTypeSchema`:

```typescript
export const FieldTypeSchema = z.enum([
  'text', 'email', 'password', 'number', 'date',
  'select', 'multiselect', 'checkbox', 'switch',
  'radio', 'textarea', 'markdown', 'file',
  'tags',  // ← new
]);
```

No other changes to `FieldSchema` are needed — `value: z.unknown()` already accepts `string[]`, and no new field-level config (delimiter, max count) is in scope for this issue.

### 2. `packages/spa-solid-shoelace/ui/FormView.tsx`

Three changes:

**a. Add Shoelace tag import at the top:**
```typescript
import '@shoelace-style/shoelace/dist/components/tag/tag.js';
```

**b. Add `TagsInput` component (above `FormEditor`):**
```tsx
interface TagsInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  label?: string;
  helpText?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

function TagsInput(props: TagsInputProps) {
  const [draft, setDraft] = createSignal('');

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    props.onChange([...props.value, tag]);
    setDraft('');
  }

  function removeTag(tag: string) {
    props.onChange(props.value.filter((t) => t !== tag));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(draft());
    } else if (e.key === ',') {
      e.preventDefault();
      addTag(draft());
    } else if (e.key === 'Backspace' && draft() === '') {
      props.onChange(props.value.slice(0, -1));
    }
  }

  return (
    <div class="retrofit-tags-input">
      <Show when={props.label}>
        <label class="retrofit-tags-label">{props.label}</label>
      </Show>
      <div class="retrofit-tags-field" aria-label={props.label}>
        <For each={props.value}>
          {(tag) => (
            <sl-tag
              removable={!props.disabled || undefined}
              on:sl-remove={() => removeTag(tag)}
            >
              {tag}
            </sl-tag>
          )}
        </For>
        <sl-input
          placeholder={props.value.length === 0 ? props.placeholder : undefined}
          disabled={props.disabled || undefined}
          prop:value={draft()}
          invalid={props.invalid || undefined}
          on:sl-input={(e: Event) =>
            setDraft((e.target as EventTarget & { value: string }).value)
          }
          on:keydown={handleKeydown}
        />
      </div>
      <Show when={props.helpText}>
        <p class="retrofit-tags-help">{props.helpText}</p>
      </Show>
    </div>
  );
}
```

**c. Update `FormEditor` in three places:**

- `initialValues`: for `'tags'` fields, default to `[]` instead of `''`:
  ```typescript
  if (f.type === 'checkbox' || f.type === 'switch') return [f.name, false];
  if (f.type === 'tags') return [f.name, []];
  return [f.name, ''];
  ```

- `validate`: for required tags, an empty array fails:
  ```typescript
  const val = values()[field.name];
  const isEmpty =
    val === undefined || val === '' || val === null ||
    (Array.isArray(val) && val.length === 0);
  if (field.required && isEmpty) {
    errs[field.name] = `${field.label} is required`;
  }
  ```

- Field rendering: add a `Show` block for `'tags'` before the fallthrough `sl-input`:
  ```tsx
  <Show when={field.type === 'tags'}>
    <TagsInput
      label={hideLabel() ? undefined : fieldLabel()}
      helpText={field.helpText}
      placeholder={field.placeholder}
      disabled={field.readOnly || undefined}
      invalid={!!err() || undefined}
      value={(values()[field.name] as string[] | undefined) ?? []}
      onChange={(v) => setValue(field.name, v)}
    />
  </Show>
  ```
  Also add `field.type !== 'tags'` to the fallthrough `Show` condition.

### 3. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

Add `sl-tag` to `IntrinsicElements`:

```typescript
'sl-tag': JSX.HTMLAttributes<HTMLElement> & {
  variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  pill?: boolean;
  removable?: boolean;
  'on:sl-remove'?: SlEventHandler;
  children?: JSX.Element;
};
```

### 4. `packages/spa-solid-shoelace/ui/layout.css` (or equivalent CSS file)

Add minimal styles for the tags container. The `sl-input` inside the tags field should be borderless/inline so it visually integrates with the tag chips. Use Shoelace tokens:

```css
.retrofit-tags-input {
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-2x-small);
}

.retrofit-tags-label {
  font-size: var(--sl-font-size-small);
  font-weight: var(--sl-font-weight-semibold);
  color: var(--sl-color-neutral-700);
}

.retrofit-tags-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sl-spacing-2x-small);
  padding: var(--sl-spacing-x-small);
  border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  border-radius: var(--sl-input-border-radius-medium);
  background: var(--sl-input-background-color);
  min-height: var(--sl-input-height-medium);
}

.retrofit-tags-help {
  margin: 0;
  font-size: var(--sl-font-size-small);
  color: var(--sl-color-neutral-500);
}
```

Locate the existing CSS file first (likely `packages/spa-solid-shoelace/ui/layout.css` or similar) and append there.

### 5. `examples/js/blog/src/schemas.ts`

Change `tags` from `z.string()` to `z.array(z.string())` in both schemas:

```typescript
tags: z.array(z.string()).optional(),
```

### 6. `examples/js/blog/src/server.ts`

Change the `tags` field override from a hint to the proper type:

```typescript
// Before:
.fieldOverride('tags', { helpText: 'comma-separated' })

// After:
.fieldOverride('tags', { type: 'tags' })
```

### 7. `examples/js/blog/src/store.ts`

Update seed data so `tags` values are `string[]` instead of comma-separated strings. Any existing `tags: 'foo,bar'` entries become `tags: ['foo', 'bar']`.

---

## Key decisions

**Why a custom component instead of `sl-input` + post-processing?**  
`sl-input` has no chip/tag display mode. A custom wrapper using `sl-tag` + `sl-input` is idiomatic Shoelace and matches the issue's proposed sketch.

**Delimiter: Enter and comma, not space**  
Enter and comma are unambiguous tag separators. Space-separated tags would break multi-word tags (e.g. "web components"). Pressing Backspace on empty draft removes the last tag — standard chip-input UX.

**No deduplication by default**  
The spec doesn't mention it. Silently deduplicating could surprise users (input appears to do nothing). Leave dedup to the server or a future `unique?: boolean` field option.

**Whitespace trimming: yes**  
A tag of `"  typescript  "` is almost never intentional. Trim on add.

**No auto-detection from Zod**  
`z.array(z.string())` currently maps to `'text'` (fallthrough). The `'tags'` type must be set via `fieldOverride`. This is consistent with how the blog example uses `fieldOverride` for `'markdown'`, `'select'`, etc. No change to `packages/schema-builder-zod/src/mappers.ts` is needed.

**CSS approach: wrapper div, not sl-input extension**  
Shoelace's `sl-input` doesn't support custom slot content for chips. A `<div>` wrapper with Shoelace design tokens gives consistent styling without forking Shoelace internals.

**`sl-input` inside the tags field**  
Set `no-border` or override border via CSS on the inner `sl-input` so only the outer wrapper border shows. Alternatively, use a plain `<input>` element styled to match — but `sl-input` is easier to keep consistent and handles focus/disabled states.

---

## Edge cases to handle

| Case | Handling |
|------|----------|
| Empty draft on Enter/comma | Skip — do not add empty tag |
| Draft with only whitespace | Trim → empty → skip |
| Comma mid-draft (`"foo,bar"` pasted) | Only triggered on keydown, not on paste. Paste lands as a single string; user must press Enter to add. (Paste splitting is a nice-to-have, out of scope.) |
| Required + empty tags array | `validate()` treats `[]` as empty — shows error |
| ReadOnly field | Pass `disabled` to `TagsInput`; render tags without `removable`; hide the input |
| Initial value is `undefined` | Default to `[]` in `initialValues` |
| Initial value is `string[]` from server | Used directly |
| Submission serialization | `JSON.stringify(values())` already handles `string[]` correctly |
| Backspace on non-empty draft | Standard text editing — do not remove last tag |
| Backspace on empty draft | Remove last tag (standard chip-input UX) |

---

## Tests to write

### Unit: `packages/core/src/types/__tests__/form.test.ts`

```typescript
it('accepts tags field type', () => {
  const result = FieldSchema.safeParse({
    name: 'tags',
    label: 'Tags',
    type: 'tags',
  });
  expect(result.success).toBe(true);
});
```

### Unit: `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts`

```typescript
it('withFieldOverrides can set type to tags', () => {
  const form = formFromSchema(TodoSchema)
    .withFieldOverrides({ title: { type: 'tags' } })
    .build();
  expect(form.fields.find((f) => f.name === 'title')?.type).toBe('tags');
});

it('tags field override passes FormSchema.parse()', () => {
  const form = formFromSchema(TodoSchema)
    .withFieldOverrides({ title: { type: 'tags' } })
    .build();
  expect(() => FormSchema.parse(form)).not.toThrow();
});
```

### Integration / e2e: blog example

The blog example is the natural e2e test target. After applying the schema and server changes:

1. `GET /api/ui/posts/new` — tags field has `type: 'tags'`
2. Create a post with tags `["solidjs", "typescript"]` — verify stored as array, not string
3. Reload the edit form — tags appear as chips (value round-trips correctly)
4. Remove a tag — form value updates, submit saves without the removed tag

These can be verified manually via the dev server (`pnpm --filter @retrofit-ui/server-solid-shoelace dev` or `just example js blog`). If the repo has playwright tests, add:

```typescript
test('tags field adds and removes chips', async ({ page }) => {
  await page.goto('/#/posts/new');
  // type a tag and press Enter
  await page.locator('.retrofit-tags-field sl-input').fill('solidjs');
  await page.keyboard.press('Enter');
  // verify chip appears
  await expect(page.locator('sl-tag').filter({ hasText: 'solidjs' })).toBeVisible();
  // remove the chip
  await page.locator('sl-tag').filter({ hasText: 'solidjs' }).locator('[part=remove-button]').click();
  await expect(page.locator('sl-tag').filter({ hasText: 'solidjs' })).not.toBeVisible();
});
```

---

## Changeset

After implementation, run:
```bash
pnpm changeset
```

Select **minor** bump for:
- `@retrofit-ui/core` — new `FieldType` value
- `@retrofit-ui/spa-solid-shoelace` — new `TagsInput` component

`@retrofit-ui/server-solid-shoelace` and `@retrofit-ui/schema-builder-zod` do not change.

---

## Implementation order

1. `packages/core/src/types/form.ts` — add `'tags'`
2. `packages/core/src/types/__tests__/form.test.ts` — add type acceptance test
3. `packages/schema-builder-zod/src/__tests__/FormBuilder.test.ts` — add override test
4. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` — add `sl-tag`
5. `packages/spa-solid-shoelace/ui/FormView.tsx` — add `TagsInput` + wire into `FormEditor`
6. `packages/spa-solid-shoelace/ui/layout.css` (or equivalent) — add `.retrofit-tags-*` styles
7. `examples/js/blog/src/schemas.ts` — `z.array(z.string())`
8. `examples/js/blog/src/store.ts` — update seed data
9. `examples/js/blog/src/server.ts` — `type: 'tags'` override
10. Run `pnpm typecheck && pnpm test && pnpm lint --write`
11. `pnpm changeset`
