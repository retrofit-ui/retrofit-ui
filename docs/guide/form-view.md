# Form View

The form view is driven by a `FormSpec` returned from `GET /api/ui/{resource}/{id}`. It renders a create or edit form with validation, and optionally a delete button.

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <button style="background: none; border: none; font-size: 12px; color: var(--vp-c-text-3); cursor: default; padding: 0; margin-bottom: 12px;">← Back</button>
  <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: var(--vp-c-text-1);">Edit Post</h2>
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px;">
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Title</label>
      <input readonly value="Getting started with Vite" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Body</label>
      <textarea readonly rows="3" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); resize: vertical; box-sizing: border-box;">Vite is a modern build tool...</textarea>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Status</label>
      <select style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1);">
        <option>draft</option>
        <option selected>published</option>
        <option>archived</option>
      </select>
    </div>
    <div style="display: flex; gap: 8px; margin-top: 4px;">
      <button style="padding: 7px 16px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: default;">Save</button>
      <button style="padding: 7px 16px; background: transparent; color: var(--vp-c-red-1, #ef4444); border: 1px solid var(--vp-c-red-1, #ef4444); border-radius: 4px; font-size: 13px; cursor: default;">Delete</button>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .find({ method: 'GET', url: '/posts/{id}' })
  .update({ method: 'PUT', url: '/posts/{id}' })
  .delete({ method: 'DELETE', url: '/posts/{id}' })
  .build()
```

:::

## Basic setup (JS)

```typescript
import { formSpec } from '@retrofit-ui/builder-zod';
import { z } from 'zod';

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
});

const UpdatePostSchema = PostSchema.omit({ id: true });

// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/admin-ui/posts/:id', (req, res) => {
  res.json(
    retrofit(
      formSpec(PostSchema, UpdatePostSchema)
        .find({ method: 'GET', url: '/posts/{id}' })
        .update({ method: 'PUT', url: '/posts/{id}' })
        .delete({ method: 'DELETE', url: '/posts/{id}' })
        .build(),
    ),
  );
});
```

When `id` is `"new"`, the SPA shows a blank create form. When it's an actual ID, the SPA fetches the entity from the `find` endpoint and pre-populates the fields.

## Field types

retrofit-ui derives field types from Zod automatically:

| Zod type | Field type | Input |
|----------|------------|-------|
| `z.string()` | `text` | `<sl-input type="text">` |
| `z.string().email()` | `email` | `<sl-input type="email">` |
| `z.number()` | `number` | `<sl-input type="number">` |
| `z.boolean()` | `checkbox` | `<sl-checkbox>` |
| `z.enum(...)` | `select` | `<sl-select>` with auto-derived options |
| `z.date()` | `date` | `<sl-input type="date">` |

<PreviewBlock title="All field types">

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px;">
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Full name</label>
      <input readonly value="Alice Kowalski" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Email</label>
      <input readonly type="email" value="alice@example.com" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Amount</label>
      <input readonly type="number" value="42.50" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <input type="checkbox" checked style="width: 16px; height: 16px; cursor: default;" />
      <label style="font-size: 13px; color: var(--vp-c-text-1);">Active</label>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Status</label>
      <select style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1);">
        <option>draft</option>
        <option selected>published</option>
        <option>archived</option>
      </select>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Date</label>
      <input readonly type="date" value="2026-06-27" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
const schema = z.object({
  name:   z.string(),
  email:  z.string().email(),
  amount: z.number(),
  active: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  date:   z.date(),
});
formSpec(schema, schema).build()
// Zod types → field types automatically
```

:::

Override the inferred type with `fieldOverride`:

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('body', { type: 'markdown' })   // renders a textarea with "Markdown supported" hint
  .fieldOverride('notes', { type: 'textarea' })
  .fieldOverride('status', { type: 'radio-group' })  // renders a segmented button control
```

| Override type | Input |
|---|---|
| `radio-group` | `<sl-radio-group>` with `<sl-radio-button>` children (segmented control) |

<PreviewBlock title="fieldOverride type examples">

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px;">
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Body (markdown)</label>
      <textarea readonly rows="4" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); resize: vertical; box-sizing: border-box; font-family: monospace;">## Introduction
This is **bold** text.</textarea>
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px; font-style: italic;">Markdown supported</div>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Notes</label>
      <textarea readonly rows="3" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); resize: vertical; box-sizing: border-box;">Additional context for this record.</textarea>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Priority</label>
      <div style="display: inline-flex; border: 1px solid var(--vp-c-divider); border-radius: 4px; overflow: hidden; font-size: 13px;">
        <button style="padding: 6px 14px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-right: 1px solid var(--vp-c-divider); cursor: default;">Low</button>
        <button style="padding: 6px 14px; background: var(--vp-c-bg); color: var(--vp-c-text-1); border: none; border-right: 1px solid var(--vp-c-divider); cursor: default;">Medium</button>
        <button style="padding: 6px 14px; background: var(--vp-c-bg); color: var(--vp-c-text-1); border: none; cursor: default;">High</button>
      </div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('body',     { type: 'markdown' })
  .fieldOverride('notes',    { type: 'textarea' })
  .fieldOverride('priority', { type: 'radio-group' })
  .build()
```

:::

## Field overrides

Customise any field without re-defining the whole schema:

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('slug', {
    helpText: 'lowercase letters and hyphens only',
    validation: { pattern: '^[a-z0-9-]+$' },
  })
  .fieldOverride('amount', {
    validation: { min: 0.01, max: 10_000 },
  })
  .fieldOverride('phone', {
    placeholder: '+1 555 000 0000',
    validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
  })
```

<PreviewBlock title="Field validation and helpers">

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px;">
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Slug</label>
      <input readonly value="my-post-title" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">lowercase letters and hyphens only</div>
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Phone</label>
      <input placeholder="+1 555 000 0000" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-3); box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Amount</label>
      <input readonly value="-5" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-red-1, #ef4444); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
      <div style="font-size: 11px; color: var(--vp-c-red-1, #ef4444); margin-top: 4px;">Must be at least 0.01</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('slug',   { helpText: 'lowercase letters and hyphens only',
                             validation: { pattern: '^[a-z0-9-]+$' } })
  .fieldOverride('phone',  { placeholder: '+1 555 000 0000',
                             validation: { pattern: '^\\+?[\\d\\s\\-()]+$' } })
  .fieldOverride('amount', { validation: { min: 0.01, max: 10_000 } })
  .build()
```

:::

| Override field | Type | Effect |
|----------------|------|--------|
| `type` | `FieldType` | Override the auto-derived input type |
| `label` | `string` | Override the auto-derived label |
| `placeholder` | `string` | Input placeholder text |
| `helpText` | `string` | Helper text shown below the field |
| `tooltip` | `string` | Renders a `?` icon button next to the field label; hovering or focusing the button shows the tooltip text |
| `required` | `boolean` | Override required state |
| `readOnly` | `boolean` | Force the field read-only |
| `validation.min` | `number` | Minimum value (numbers) or length (strings) |
| `validation.max` | `number` | Maximum value or length |
| `validation.pattern` | `string` | Regex pattern (string inputs) |

`tooltip` and `helpText` are independent and can coexist on the same field:

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

## Read-only fields

Fields in the full schema but absent from the `updateSchema` are rendered as read-only on the edit form. They are hidden entirely on the create form (since they don't exist yet).

This is how server-controlled fields like `id`, `createdAt`, or `status` work — users see them but cannot edit them.

<PreviewBlock title="Read-only vs editable fields">

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px;">
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-2); margin-bottom: 4px;">Author <span style="font-size: 11px; font-weight: 400; color: var(--vp-c-text-3);">(read-only)</span></label>
      <input readonly value="Alice Kowalski" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); cursor: not-allowed; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-2); margin-bottom: 4px;">Updated at <span style="font-size: 11px; font-weight: 400; color: var(--vp-c-text-3);">(read-only)</span></label>
      <input readonly value="2026-06-27T14:30:00Z" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); cursor: not-allowed; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Title</label>
      <input readonly value="Getting started with Vite" style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; font-weight: 500; color: var(--vp-c-text-1); margin-bottom: 4px;">Status</label>
      <select style="width: 100%; padding: 7px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1);">
        <option>draft</option>
        <option selected>published</option>
        <option>archived</option>
      </select>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
const PostSchema = z.object({
  id:        z.number(),
  title:     z.string(),
  status:    z.enum(['draft', 'published', 'archived']),
  author:    z.string(),
  updatedAt: z.date(),
});

// author and updatedAt omitted from update schema → rendered read-only
const UpdatePostSchema = PostSchema.pick({ title: true, status: true });

formSpec(PostSchema, UpdatePostSchema)
  .find({ method: 'GET', url: '/posts/{id}' })
  .update({ method: 'PUT', url: '/posts/{id}' })
  .build()
```

:::

## Endpoint wiring

| Endpoint | Effect |
|----------|--------|
| `find` | Fetches the entity to pre-populate the form. Required for edit mode. |
| `create` | Wires the submit button for new entities. |
| `update` | Wires the save button for existing entities. |
| `delete` | Shows a "Delete" button that confirms then calls this endpoint. |

Only wire the endpoints your use case needs. A read-only detail view wires only `find`.

## Making the table row clickable

For the form view to be reachable from a table, wire `find` on the `TableSpec` too:

```typescript
// Table spec — makes rows clickable
TableView.schema(PostSchema)
  .find({ method: 'GET', url: '/posts/{id}' })
  // ...
```

```typescript
// Form spec — handles the edit page
app.get('/admin-ui/posts/:id', (req, res) => {
  res.json(retrofit(formSpec(PostSchema, UpdatePostSchema)
    .find({ method: 'GET', url: '/posts/{id}' })
    .update({ method: 'PUT', url: '/posts/{id}' })
    .delete({ method: 'DELETE', url: '/posts/{id}' })
    .build()))
});
```

## Java

```java
@GetMapping("/admin-ui/items/{id}")
public FormSpec itemForm(@PathVariable String id) {
    boolean isNew = "new".equals(id);
    var builder = FormSpec.builder()
        .field(Field.builder("name",   "Name",   "text").required(true).build())
        .field(Field.builder("active", "Active", "checkbox").build());

    if (isNew) {
        builder.create(EndpointDirective.post("/items"));
    } else {
        builder.find(EndpointDirective.get("/items/{id}"))
               .update(EndpointDirective.put("/items/{id}"))
               .delete(EndpointDirective.delete("/items/{id}"));
    }
    return builder.build();
}
```
