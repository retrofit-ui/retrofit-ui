# Form View

The form view is driven by a `FormSpec` (`kind: 'form'`). It draws a create or edit form, checks the input on the client, and sends the values to the endpoint the spec names. An edit form can also delete the record.

<PreviewBlock title="A create form">

<div style="padding: 16px; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 14px; background: var(--vp-c-bg);">
  <div style="font-size: 22px; font-weight: 700; margin-bottom: 16px;">New Post</div>
  <div style="margin-bottom: 12px;">
    <div style="font-size: 13px; margin-bottom: 4px;">Title *</div>
    <input value="" style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1);" />
  </div>
  <div style="margin-bottom: 16px;">
    <div style="font-size: 13px; margin-bottom: 4px;">Status *</div>
    <select style="width: 100%; padding: 6px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1);"><option>-- select --</option><option>draft</option><option>published</option></select>
  </div>
  <button style="padding: 6px 16px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-radius: 4px; cursor: default;">Create</button>
</div>

</PreviewBlock>

::: details Spec

```json
{
  "kind": "form",
  "fields": [
    { "name": "title", "label": "Title", "type": "text", "validation": { "required": true } },
    {
      "name": "status", "label": "Status", "type": "select", "validation": { "required": true },
      "options": [{ "label": "draft", "value": "draft" }, { "label": "published", "value": "published" }]
    }
  ],
  "endpoints": { "create": { "method": "POST", "url": "/posts" } },
  "metadata": { "title": "Post" }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `fields` | `Field[]` | yes | The inputs, in order. |
| `endpoints.create` | `{ method, url }` | no | Where a create form submits. |
| `endpoints.update` | `{ method, url }` | no | Where an edit form submits. |
| `endpoints.delete` | `{ method, url }` | no | Used by the **Delete** button of an edit form. |
| `metadata.mode` | `'create' \| 'edit'` | no | Default `create`. `edit` submits to `update` and offers delete. |
| `metadata.title` | `string` | no | The record name. See [Headings](#headings-and-buttons). |
| `metadata.onDone` | action | no | Dispatched after a successful submit or delete, and by the Back button. |
| `metadata.submitLabel` | `string` | no | Submit button text. Default `Create`, or `Save` in edit mode. |
| `metadata.autoSubmit` | `boolean` | no | Inside a page: write each change to the page filters instead of submitting. |
| `metadata.layout` | `FormLayoutConfig` | no | See [Layout](#layout). |

Endpoints arrive finished. The client calls each URL exactly as the spec gives it, for example `/posts/7`. It never fills `{id}` in a form URL. Fill it on the producer side.

## Fields

| Field | Type | Meaning |
|-------|------|---------|
| `name` | `string` | Key in the submitted JSON. Required. |
| `label` | `string` | Label text. Required. |
| `type` | `FieldType` | The input. Required. See the table below. |
| `readOnly` | `boolean` | Disables the input in an edit form, and hides it in a create form. |
| `validation` | `{ required?, min?, max?, pattern? }` | See [Validation](#validation). |
| `placeholder`, `helpText` | `string` | Hint text in and below the input. |
| `tooltip` | `string` | A `?` button next to the label that shows this text. |
| `options` | `{ label, value }[]` | Choices for `select`, `multiselect` and `radio-group`. |
| `value` | any | The starting value. An edit form carries the record's current values here. |
| `colorFormat`, `colorSwatches` | `hex \| rgb \| hsl`, `string[]` | For `color`. Default format `hex`. |
| `ratingMax`, `ratingPrecision` | `number` | For `rating`. Default 5 and 1. |

| `type` | Input |
|--------|-------|
| `text`, `email`, `password`, `number`, `date`, `time` | Shoelace input of that type. |
| `datetime` | Date-time input. The value is sent as an ISO string. |
| `textarea` | Text area, 4 rows. |
| `markdown` | Text area, 12 rows, with the default help text "Markdown supported". The value is the markdown source. |
| `select` | Select with a "-- select --" choice for empty. |
| `multiselect` | Select that allows many choices. The value is an array. |
| `radio-group` | Segmented radio buttons. |
| `checkbox`, `switch` | Boolean control. The label is the field label. |
| `color` | Color picker. |
| `tags` | Free-text tags. Enter or comma adds a tag. Backspace on empty input removes the last. The value is a string array. |
| `rating` | Star rating. The value is a number. |

Option values of a `multiselect` must not contain spaces, because the select joins values with spaces.

## Validation

The client checks all visible fields, except read-only ones, when the user submits. If any check fails, it shows a message under the field and sends nothing.

1. A field with `validation.required: true` adds ` *` to its label. With an empty value, it fails. An empty value is `''`, `null`, `undefined` or an empty array.
2. An empty optional value skips the other checks.
3. For `number` fields, `validation.min` and `validation.max` bound the value.
4. For `text`, `email`, `password`, `textarea` and `markdown` fields, they bound the string length.
5. For the same text types, `validation.pattern` is a JavaScript regex source. The client anchors it, so it must match the whole string. An invalid pattern is ignored and the client writes one console warning.

`min`, `max` and `pattern` have no effect on other types. Server-side validation is not part of the spec: validate again on the server.

## Behavior

- **Create form.** Hides `readOnly` fields. After a successful submit it clears the form.
- **Edit form** (`mode: 'edit'`). Shows all fields, and sends all values, including read-only ones. It keeps the saved values.
- **Submit.** Sends JSON with every visible value to the `create` or `update` endpoint through the `http` action. On success it shows a toast, dispatches `refresh`, then dispatches `onDone`. On a non-2xx response it shows the `error` string from a JSON body, or `Request failed: <status>`.
- **Delete.** An edit form with `endpoints.delete` shows **Delete**. A dialog asks to confirm. On success the client shows a toast, dispatches `refresh`, then dispatches `onDone`.

### Headings and buttons

Outside a page, the form shows an `h1`: `New <title>` or `Edit <title>`, or just `New` or `Edit` with no title. If `onDone` is set, a "Back" button dispatches it. Inside a page, `metadata.title` is shown unchanged as a smaller heading, and there is no Back button.

### Layout

`metadata.layout` is `{ direction?, gap?, columns?, labelPosition? }`. With `columns`, the form is a CSS grid of that many equal columns. Otherwise it is a flex box with `direction` (default `column`; `row` wraps). `gap` defaults to the Shoelace medium spacing. `labelPosition: 'hidden'` hides the labels of most inputs; checkbox and switch keep their text.

### Inside a page

A form in a [page](/guide/layouts#pages-and-filters) starts with the page filter value for any field with the same name. With `autoSubmit`, each change writes the filter, and the submit button is hidden. Without `autoSubmit`, a successful write dispatches `refresh` and the page's tables reload.

## Building the spec with Zod

```typescript
import { formSpec } from '@retrofit-ui/builder-zod';
import { z } from 'zod';

const PostSchema = z.object({
  id: z.number(),
  title: z.string().min(3),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
});
const UpdatePostSchema = PostSchema.omit({ id: true });

function postForm() {
  return formSpec(PostSchema, UpdatePostSchema)
    .title('Post')
    .fieldOverride('body', { type: 'markdown' })
    .onDone({ type: 'navigate', to: '#/posts' });
}

app.get('/api/ui/posts/new', (_req, res) => {
  res.json(postForm().create({ method: 'POST', url: '/posts' }).build());
});

app.get('/api/ui/posts/:id', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) return void res.status(404).json({ error: `No post ${req.params.id}` });
  res.json(
    postForm()
      .edit()
      .values(post)
      .params({ id: post.id })
      .update({ method: 'PUT', url: '/posts/{id}' })
      .delete({ method: 'DELETE', url: '/posts/{id}' })
      .build(),
  );
});
```

`formSpec(schema, updateSchema?)`: a field that `updateSchema` leaves out becomes `readOnly`. The builder derives each field from Zod:

| Zod type | Field type |
|----------|------------|
| `z.string()` | `text` |
| `z.string().email()` | `email` |
| `z.string().datetime()`, `z.date()` | `datetime` |
| `z.string().date()` | `date` |
| `z.string().time()` | `time` |
| `z.number()` | `number` |
| `z.boolean()` | `checkbox` |
| `z.enum(...)` | `select`, with `options` from the values |
| anything else | `text` |

A schema field that is not `.optional()` gets `validation: { required: true }`. The builder also copies `.min()` and `.max()` to `validation.min` and `validation.max` (length for strings, bounds for numbers). Use `fieldOverride` for everything else: `multiselect`, `radio-group`, `switch`, `tags`, `rating`, `color`, `password`, `textarea`, `markdown`, a pattern, help text.

```typescript
formSpec(ContactSchema)
  .fieldOverride('slug', { validation: { pattern: '^[a-z0-9-]+$' }, helpText: 'lowercase and hyphens' })
  .fieldOverride('role', { type: 'multiselect', options: [{ label: 'Admin', value: 'admin' }] })
  .fieldOverride('plan', { type: 'radio-group' })
  .layout({ columns: 2, gap: '16px' });
```

| Builder method | Spec field |
|----------------|------------|
| `fieldOverride(key, partial)` | Merges `Partial<Field>` into one field. Its `validation` merges into the schema-derived one, so `required`, `min` and `max` stay unless the override sets them. |
| `values(record)` | Sets each field's `value`. |
| `create(d)`, `update(d)`, `delete(d)` | `endpoints.*` |
| `params({ id })` | Fills `{id}` in every endpoint URL here, on the server. |
| `title(t)`, `submitLabel(l)`, `edit()`, `onDone(a)`, `autoSubmit()`, `layout(cfg)` | `metadata.*` |

Link a table to these routes with a row link and a toolbar button. See [Table view](/guide/table-view#row-links-and-row-actions).
