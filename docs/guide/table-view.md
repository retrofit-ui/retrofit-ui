# Table View

The table view is driven by a `TableSpec` — in the hosted SPA, the spec served for a route such as `#/posts`. It renders a data table with optional inline editing, row links, row actions, and toolbar buttons.

<PreviewBlock>

<div>
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-divider);">
    <div style="font-weight: 600; font-size: 16px; color: var(--vp-c-text-1);">Posts</div>
    <button style="padding: 5px 14px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: default;">New</button>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Title</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Status</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Author</th>
        <th style="padding: 8px 16px; text-align: right; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Getting started with Vite</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">published</span></td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">Alice K.</td>
        <td style="padding: 10px 16px; text-align: right;"><button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Building server-driven UIs</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">draft</span></td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">Bob M.</td>
        <td style="padding: 10px 16px; text-align: right;"><button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button></td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">SolidJS reactivity explained</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-yellow-soft, rgba(245,158,11,0.12)); color: var(--vp-c-yellow-1, #d97706); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">archived</span></td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">Carol T.</td>
        <td style="padding: 10px 16px; text-align: right;"><button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button></td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
const spec = TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' })
  .build();
```

:::

## Basic setup (JS)

```typescript
import { TableView } from '@retrofit-ui/builder-zod';
import { z } from 'zod';

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  author: z.string(),
});

const spec = TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' })
  .build();
```

retrofit-ui derives column types from the Zod schema automatically:

| Zod type | Column type | Renders as |
|----------|-------------|------------|
| `z.string()` | `string` | Plain text |
| `z.number()` | `number` | Plain text |
| `z.boolean()` | `boolean` | ✓ / ✗ |
| `z.enum(...)` | `enum` | Enum value text |
| `z.date()` | `date` | Plain text |

Enum options are also derived automatically — no separate configuration needed.

## Filtering visible columns

By default all schema fields become columns. Use `visibleColumns` to show a subset:

```typescript
TableView.schema(ExpenseSchema)
  .visibleColumns(['description', 'amount', 'date']) // only these three
  .list({ method: 'GET', url: '/expenses' })
  .build();
```

<PreviewBlock title="Filtered columns">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Description</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Amount</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Date</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Team lunch</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">$42.50</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">2026-06-25</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Office supplies</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">$18.99</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">2026-06-24</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">AWS bill</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">$230.14</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">2026-06-01</td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
const ExpenseSchema = z.object({
  id:          z.number(),
  description: z.string(),
  amount:      z.number(),
  date:        z.date(),
  category:    z.string(),
  submittedBy: z.string(),
});

TableView.schema(ExpenseSchema)
  .visibleColumns(['description', 'amount', 'date'])
  .list({ method: 'GET', url: '/expenses' })
  .build();
```

:::

## Column overrides

Customise individual columns without losing the auto-derived type:

```typescript
TableView.schema(PostSchema)
  .columnOverride('title', { sortable: true })
  .columnOverride('author', { width: '120px', alignment: 'right' })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

| Override field | Type | Effect |
|----------------|------|--------|
| `sortable` | `boolean` | Shows sort indicator (visual only — sorting is done server-side) |
| `width` | `string` | CSS width, e.g. `'120px'` |
| `alignment` | `'left' \| 'center' \| 'right'` | Cell alignment |
| `label` | `string` | Override the auto-derived column header |
| `type` | `ColumnType` | Override the auto-derived type |
| `badgeVariants` | `Record<string, 'primary' \| 'success' \| 'neutral' \| 'warning' \| 'danger'>` | Renders the cell as `<sl-badge>` with the mapped variant; values absent from the map render as plain text |

<PreviewBlock title="Column overrides">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Title <span style="color: var(--vp-c-text-3); font-size: 10px;">↑</span></th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Status <span style="color: var(--vp-c-text-3); font-size: 10px;">⊟</span></th>
        <th style="padding: 8px 16px; text-align: right; width: 100px; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Author</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Getting started with Vite</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">published</span></td>
        <td style="padding: 10px 16px; text-align: right; color: var(--vp-c-text-2);">Alice K.</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Building server-driven UIs</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">draft</span></td>
        <td style="padding: 10px 16px; text-align: right; color: var(--vp-c-text-2);">Bob M.</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">SolidJS reactivity explained</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-yellow-soft, rgba(245,158,11,0.12)); color: var(--vp-c-yellow-1, #d97706); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">archived</span></td>
        <td style="padding: 10px 16px; text-align: right; color: var(--vp-c-text-2);">Carol T.</td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
TableView.schema(PostSchema)
  .columnOverride('title',  { sortable: true })
  .columnOverride('author', { width: '100px', alignment: 'right' })
  .list({ method: 'GET', url: '/posts' })
  .build()
```

:::

### Status badges (enum columns)

Use `badgeVariants` to render enum values as coloured `<sl-badge>` elements for at-a-glance status scanning:

```typescript
TableView.schema(PostSchema)
  .columnOverride('status', {
    badgeVariants: {
      draft:     'neutral',
      published: 'success',
      archived:  'warning',
    },
  })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

Values absent from the map fall through to plain text — partial maps are valid.

<PreviewBlock title="Status badges">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider);">Title</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider);">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">My first post</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 2px 9px; border-radius: 9999px; font-size: 11px; font-weight: 500;">published</span></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Work in progress</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); padding: 2px 9px; border-radius: 9999px; font-size: 11px; font-weight: 500;">draft</span></td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Old article</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-yellow-soft, rgba(245,158,11,0.12)); color: var(--vp-c-yellow-1, #d97706); padding: 2px 9px; border-radius: 9999px; font-size: 11px; font-weight: 500;">archived</span></td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
TableView.schema(PostSchema)
  .columnOverride('status', {
    badgeVariants: {
      draft:     'neutral',
      published: 'success',
      archived:  'warning',
    },
  })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

:::

## Inline editing

To enable per-row Edit/Save/Cancel buttons, pass an `updateSchema` containing only the fields users are allowed to change:

```typescript
const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

// id is server-controlled — exclude it from updates
const CreateTodoSchema = z.object({
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

TableView.schema(TodoSchema)
  .updateSchema(CreateTodoSchema) // title/done/priority become editable cells
  .list({ method: 'GET', url: '/todos' })
  .update({ method: 'PUT', url: '/todos/{id}' })
  .delete({ method: 'DELETE', url: '/todos/{id}' })
  .build();
```

Columns present in `updateSchema` get an inline editor (text input, checkbox, or select for enums). The `id` column stays read-only because it is absent from `updateSchema`.

A "new row" form also appears at the bottom of the table when `create` is wired.

<PreviewBlock title="Inline editing">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Title</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Done</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Priority</th>
        <th style="padding: 8px 16px; text-align: right; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Write docs</td>
        <td style="padding: 10px 16px;">✓</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">high</td>
        <td style="padding: 10px 16px; text-align: right;"><button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Edit</button></td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);">
        <td style="padding: 6px 16px;"><input value="Todo item title" style="width: 100%; padding: 4px 6px; border: 1px solid var(--vp-c-brand-1, #3b82f6); border-radius: 3px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1);" /></td>
        <td style="padding: 6px 16px;"><input type="checkbox" checked style="cursor: default;" /></td>
        <td style="padding: 6px 16px;"><select style="padding: 4px 6px; border: 1px solid var(--vp-c-divider); border-radius: 3px; font-size: 13px; background: var(--vp-c-bg); color: var(--vp-c-text-1);"><option>low</option><option selected>medium</option><option>high</option></select></td>
        <td style="padding: 6px 16px; text-align: right; white-space: nowrap;">
          <button style="padding: 3px 10px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-radius: 3px; font-size: 11px; margin-right: 4px; cursor: default;">Save</button>
          <button style="padding: 3px 10px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); border-radius: 3px; font-size: 11px; cursor: default;">Cancel</button>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Ship v1.0</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-3);">✗</td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">low</td>
        <td style="padding: 10px 16px; text-align: right;"><button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
TableView.schema(TodoSchema)
  .updateSchema(CreateTodoSchema)
  .list({ method: 'GET', url: '/todos' })
  .update({ method: 'PUT', url: '/todos/{id}' })
  .delete({ method: 'DELETE', url: '/todos/{id}' })
  .build()
```

:::

## Row links

Every link in a table is resolved on the server: each row carries its own finished link, and the client only follows it. With inline rows, pass `rowLink` a function from row to link — it runs in the builder, once per row:

```typescript
TableView.forRows(PostSchema, posts)
  .rowLink((row) => `#/posts/${String(row.id)}`) // clicking a row opens #/posts/7
  .build();
```

The link lands in a hidden field of each row, and the spec's `rowLinkField` names it; the field needn't be a column. A row the function returns `undefined` for isn't clickable.

Rows fetched from `list()` are never seen by the builder, so the list endpoint returns the links itself. Point `rowLinkField` at the field that holds them:

```typescript
// GET /posts returns [{ id: 7, title: '…', link: '#/posts/7' }, …]
TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' })
  .rowLinkField('link')
  .build();
```

## Toolbar

Buttons above the table come from `toolbar(label, action, variant?)`. Each one dispatches its action — typically a `navigate` to a create form. There is no automatic "New" button:

```typescript
TableView.forRows(PostSchema, posts)
  .toolbar('New', { type: 'navigate', to: '#/posts/new' }, 'primary')
  .build();
```

## Row actions

Add buttons to each row that open a link of their own. Like `rowLink`, `rowAction(label, link)` resolves the link per row in the builder; a row it returns `undefined` for gets no button:

```typescript
TableView.forRows(PostSchema, posts)
  .rowAction('Preview', (row) => `#/posts/${String(row.id)}/preview`)
  .build();
```

In the spec this is `rowActions: [{ label: 'Preview', linkField: '…' }]`, where `linkField` names the row field holding that button's link. Since `rowAction` needs the rows, it applies to `forRows()` / `rows()`; for rows fetched from `list()`, have the list endpoint return a link field and set `rowActions` on the built spec:

```typescript
const spec = TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' }) // rows carry `previewLink`
  .build();
res.json({ ...spec, rowActions: [{ label: 'Preview', linkField: 'previewLink' }] });
```

<PreviewBlock title="Row actions">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Title</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Status</th>
        <th style="padding: 8px 16px; text-align: right; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: 0.04em;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Getting started with Vite</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">published</span></td>
        <td style="padding: 10px 16px; text-align: right;">
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button>
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default; margin-left: 4px;">✏ Edit</button>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">Building server-driven UIs</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">draft</span></td>
        <td style="padding: 10px 16px; text-align: right;">
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button>
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default; margin-left: 4px;">✏ Edit</button>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: var(--vp-c-text-1);">SolidJS reactivity explained</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-yellow-soft, rgba(245,158,11,0.12)); color: var(--vp-c-yellow-1, #d97706); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">archived</span></td>
        <td style="padding: 10px 16px; text-align: right;">
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Preview</button>
          <button style="padding: 3px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 11px; cursor: default; margin-left: 4px;">✏ Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```typescript
TableView.forRows(PostSchema, posts)
  .rowAction('Preview', (row) => `#/posts/${String(row.id)}/preview`)
  .rowLink((row) => `#/posts/${String(row.id)}`)
  .build()
```

:::

## Endpoint wiring

| Method | Effect when present |
|--------|---------------------|
| `list` | Fetches row data, unless the spec has inline `rows`. |
| `create` | With editable columns (`updateSchema`), adds an inline new-row form. It adds no "New" button — use `toolbar()`. |
| `update` | Enables inline save (requires `updateSchema`). |
| `delete` | Shows a "Delete" button per row. |

Inline save and delete are the one place the client fills a url from a row: `{id}` in the `update`/`delete` url is replaced with the row's id field (`idField`, derived from the url) when the user clicks. Write the placeholder as `{id}`. The `list` url gets query params from the client: `page` and `pageSize` when the table is paginated, `sort` and `order` for a sortable column, and each [page](/guide/layouts) filter by name. Empty values are omitted. Everything else — row links, row actions, toolbar actions — arrives finished.

There is no `find` endpoint: opening a record is a row link to a route whose spec is that record's form.
