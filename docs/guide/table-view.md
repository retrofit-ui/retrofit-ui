# Table View

The table view is driven by a `TableSpec` (`kind: 'table'`). It shows rows, and can sort, paginate, link, edit rows in place and delete rows. A producer sends the spec; the client draws it.

<PreviewBlock title="A list-backed table with a sortable column and status badges">

<div>
  <table style="width: 100%; border-collapse: collapse; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
    <thead>
      <tr style="background: var(--vp-c-bg-soft);">
        <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 2px solid var(--vp-c-divider);">Title</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 2px solid var(--vp-c-divider);">Status</th>
        <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); border-bottom: 2px solid var(--vp-c-divider);">Author</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid var(--vp-c-divider);">
        <td style="padding: 10px 16px;">Getting started with Vite</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 2px 8px; border-radius: 9999px; font-size: 11px;">published</span></td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">Alice K.</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px;">Building server-driven UIs</td>
        <td style="padding: 10px 16px;"><span style="background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); padding: 2px 8px; border-radius: 9999px; font-size: 11px;">draft</span></td>
        <td style="padding: 10px 16px; color: var(--vp-c-text-2);">Bob M.</td>
      </tr>
    </tbody>
  </table>
</div>

</PreviewBlock>

::: details Spec

```json
{
  "kind": "table",
  "columns": [
    { "key": "title", "label": "Title", "type": "string", "sortable": true },
    {
      "key": "status", "label": "Status", "type": "enum",
      "badgeVariants": { "published": "success", "draft": "neutral" }
    },
    { "key": "author", "label": "Author", "type": "string" }
  ],
  "endpoints": { "list": { "method": "GET", "url": "/posts" } }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `columns` | `Column[]` | yes | One entry per column, in display order. |
| `rows` | `InlineRow[]` | no | Rows embedded in the spec. When set, the client does not call `endpoints.list`. |
| `endpoints` | `{ list?, create? }` | yes | Required in the TypeScript type: send `{}` when there are none. The renderer also accepts a spec with no `endpoints`. |
| `endpoints.list` | `{ method: 'GET', url }` | no | Fetches rows as a raw array of objects (`ListRow[]`). `method` must be `GET`: the schema rejects any other value. |
| `endpoints.create` | `{ method, url }` | no | With at least one editable column, adds an inline "new row" form. |
| `rowLinkField` | `string` | no | Field in each row holding that row's finished link, for example `#/posts/7`. Clicking the row opens it. The field does not need to be a column. |
| `rowActions` | `{ label, linkField }[]` | no | One link button per entry in each row. A row with no link in `linkField` shows no button. |
| `toolbar` | `{ label, action, variant? }[]` | no | Buttons above the table. `variant` is `primary` (default) or `default`. Each button dispatches its [action](/guide/actions). |
| `metadata.title` | `string` | no | Heading above the table. |
| `metadata.pagination` | `{ pageSize, totalRows, pageSizeOptions? }` | no | Turns on the pager. See [Pagination](#pagination). |

There is no automatic "New" button and no `find` endpoint. Navigation is data: a toolbar `navigate` action opens a create form, and a row link opens a record.

## Columns

| Field | Type | Meaning |
|-------|------|---------|
| `key` | `string` | Field name in each row. Required. |
| `label` | `string` | Header text. Required. |
| `type` | `string` | `string`, `number`, `date`, `datetime`, `time`, `boolean`, `enum` or `custom`. Required. |
| `sortable` | `boolean` | Makes the header a sort button. See [Sorting](#sorting). |
| `editable` | `boolean` | Shows an input for this column when a row is edited. See [Writes](#row-writes). |
| `width` | `string` | CSS width of the header cell, for example `12rem`. |
| `alignment` | `left`, `center` or `right` | Text alignment in the column. |
| `options` | `{ label, value }[]` | Choices for the select input of an editable `enum` column. |
| `badgeVariants` | `Record<string, variant>` | Shows the cell as a badge. Variants: `primary`, `success`, `neutral`, `warning`, `danger`. A value not in the map is shown as plain text. |
| `format` | `currency`, `bytes`, `percent` or `decimal` | Formats a numeric value on the client with Shoelace format components. |
| `currency` | `string` | Currency code for `format: 'currency'`. Default `USD`. |

The client shows other types as follows: `boolean` as a check or cross, `date` and `datetime` in the browser locale, `time` as `HH:MM`, and all others as text. `percent` expects a fraction (`0.25` shows as 25%).

A producer may also pre-format a cell, for inline rows only (list rows carry raw values). An inline cell is `{ "value": 1200, "formatted": "$1,200.00" }`, and the client shows `formatted`, even when the column has `format`. A column with `badgeVariants` keeps the badge colour from the raw value and shows `formatted` as the label.

## Rows

Rows come from one of two places.

**Inline rows** are in the spec. Each row is an object of cells, `{ "title": { "value": "Hello" } }`.

**List rows** come from `endpoints.list`. The response is a raw JSON array of plain objects. The client adds `page` and `pageSize` when `metadata.pagination` is set, `sort` and `order` after the user sorts a column, and the page's filter names. The full rules, including encoding, are in the [spec contract](/guide/contract).

While rows load, the table shows skeleton rows. A failed request shows an error message. A table with no rows (and no editable column) shows "No data.".

## Sorting

A column with `sortable: true` shows a header button for a list-backed table. A click sorts ascending, and the next click on the same column sorts descending. The client sends `sort=<key>&order=asc|desc` and goes back to page 1. The server does the sort. The header carries `aria-sort`.

A table with inline `rows` does not show sort buttons: the client never reorders rows itself.

## Pagination

```json
"metadata": { "pagination": { "pageSize": 20, "totalRows": 134, "pageSizeOptions": [10, 20, 50] } }
```

For a list-backed table the client sends `page` (from 1) and `pageSize`, and shows previous and next buttons and "Page N of M". It computes M from the spec's `totalRows` and the page size, so the producer must put the correct total in the spec. With `pageSizeOptions` the client also shows a page size select. The client does not slice inline `rows`.

## Row links and row actions

Both are link data that the producer resolves. The client does not build any URL.

```json
{
  "kind": "table",
  "columns": [{ "key": "title", "label": "Title", "type": "string" }],
  "rowLinkField": "link",
  "rowActions": [{ "label": "Preview", "linkField": "previewLink" }],
  "endpoints": { "list": { "method": "GET", "url": "/posts" } }
}
```

```json
[{ "id": 7, "title": "Hello", "link": "#/posts/7", "previewLink": "#/posts/7/preview" }]
```

`rowActions` are link buttons only. They are not the same as the `_actions` writes below. Clicking a row or a `rowActions` button dispatches `navigate`. A `#`-prefixed target sets the hash.

With the builder, inline rows get their links per row:

```typescript
import { TableView } from '@retrofit-ui/builder-zod';

TableView.forRows(PostSchema, posts)
  .rowLink((row) => `#/posts/${String(row.id)}`)
  .rowAction('Preview', (row) => `#/posts/${String(row.id)}/preview`)
  .toolbar('New', { type: 'navigate', to: '#/posts/new' })
  .build();
```

`rowLink` and `rowAction` store the link in hidden fields (`_link`, `_action0`, ...) of each inline row. A row for which the function returns `undefined` has no link. For list rows, call `.rowLinkField('link')` and let the list endpoint return the links. `rowAction` works for inline rows only. On a list table the call has no effect, because no row has the hidden fields: drop it and add `rowActions` to the built spec yourself.

## Row writes

A row that can be saved or deleted carries its own finished HTTP actions in `_actions`:

```json
{ "update": { "method": "PUT", "url": "/posts/7" }, "delete": { "method": "DELETE", "url": "/posts/7" } }
```

- Inline rows wrap it as a cell: `"_actions": { "value": { ... } }`.
- List rows carry it raw: `"_actions": { ... }`.
- A row with no `_actions` has no writes.

What the client shows and sends:

| Part | When it shows | Request |
|------|---------------|---------|
| **Edit** button, then **Save** and **Cancel** | The row has `_actions.update` and at least one column is `editable`. | `update` with a JSON body of the row's raw values. The body leaves out exactly `_actions`, the `rowLinkField` field and each `rowActions` link field. Every other field is sent, including your own `_id` or `_rev`. |
| **Delete** button | The row has `_actions.delete`. A dialog asks to confirm. | `delete` with no body. |
| Inline "new row" | A column is `editable` and `endpoints.create` is set. | `create` with a JSON body of one value per column key. A new row starts with `false` for boolean columns, `0` for number columns and `''` for others. |

After a successful write the client shows a toast, reloads the table and dispatches `refresh`. A failed request changes nothing. The client sends every request through the `http` action, so an `http` override sees these writes too. See [Actions](/guide/actions).

Only columns with `editable: true` show an input: a checkbox for `boolean`, a select for `enum` with `options`, a date-time input for `datetime`, and number, date, time or text inputs for the rest.

### With the builder

`updateSchema(schema)` marks the columns whose keys it has as `editable`. For inline rows, `update()` and `delete()` fill each row's `_actions`, replacing `{name}` in the URL with that row's field:

```typescript
TableView.forRows(TodoSchema, todos)
  .updateSchema(UpdateTodoSchema) // title, done, priority become editable
  .update({ method: 'PUT', url: '/todos/{id}' })
  .delete({ method: 'DELETE', url: '/todos/{id}' })
  .create({ method: 'POST', url: '/todos' })
  .build();
```

The builder fills `{name}` on the server and URI-encodes the value. `update()` and `delete()` apply to inline `rows()` only: `build()` throws for a list-backed table, because the builder never sees those rows. For list rows, add the writes in the list handler with `withRowActions`:

```typescript
import { withRowActions } from '@retrofit-ui/builder-zod';

app.get('/todos', (_req, res) => {
  res.json(
    withRowActions(store.all(), {
      update: { method: 'PUT', url: '/todos/{id}' },
      delete: { method: 'DELETE', url: '/todos/{id}' },
    }),
  );
});
```

`withRowActions` throws if a row has no value for a placeholder. The exact request bodies for every view are in the `RowActions` type documentation of `@retrofit-ui/core`.

## Building the spec with Zod

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
  .columnOverride('title', { sortable: true })
  .columnOverride('status', { badgeVariants: { draft: 'neutral', published: 'success', archived: 'warning' } })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

The builder derives the column `type` from the schema:

| Zod type | Column type |
|----------|-------------|
| `z.string()` | `string` |
| `z.string().datetime()` | `datetime` |
| `z.string().date()` | `date` |
| `z.string().time()` | `time` |
| `z.date()` | `datetime` |
| `z.number()` | `number` |
| `z.boolean()` | `boolean` |
| `z.enum(...)` | `enum`, with `options` taken from the enum values |
| anything else | `string` |

Every derived column starts with `sortable: false`, `editable: false` and `alignment: 'left'`.

| Builder method | Effect |
|----------------|--------|
| `TableView.schema(schema)` | Starts a builder. |
| `TableView.forRows(schema, rows)` | Starts a builder with inline `rows`. `.rows(rows)` does the same on an existing builder. |
| `columnOverride(key, partial)` | Merges `Partial<Column>` into one column. `format` may also be a function `(value) => string`; it fills `formatted` for inline rows only, and `build()` throws when the table has no inline `rows()`. |
| `visibleColumns(keys)` | Keeps only these columns. |
| `updateSchema(schema)` | Marks columns with keys in `schema` as `editable`. |
| `list(d)`, `create(d)` | Set `endpoints.list` and `endpoints.create`. |
| `update(d)`, `delete(d)` | Fill each inline row's `_actions`. Throw at `build()` for a list-backed table. |
| `rowLink(fn)`, `rowLinkField(field)`, `rowAction(label, fn)` | Row links, see above. |
| `toolbar(label, action, variant?)` | Adds a toolbar button. |
| `metadata(meta)` | Sets `metadata`, including `pagination`. |

## Inside a page

A table inside a [page](/guide/layouts#pages-and-filters) also sends the page's filter fields as list query params, by field name. Names are only taken from the page's `filter-form` and `autoSubmit` forms. When a form on the same page writes, the page's tables reload.
