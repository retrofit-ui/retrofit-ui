# Table View

The table view is driven by a `TableSpec` returned from `GET /api/ui/{resource}`. It renders a data table with optional inline editing, row actions, and CRUD buttons.

## Basic setup (JS)

```typescript
import { TableView } from '@retrofit-ui/server-solid-shoelace';
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

## Column overrides

Customise individual columns without losing the auto-derived type:

```typescript
TableView.schema(PostSchema)
  .columnOverride('title', { sortable: true })
  .columnOverride('status', { filterable: true })
  .columnOverride('author', { width: '120px', alignment: 'right' })
  .list({ method: 'GET', url: '/posts' })
  .build();
```

| Override field | Type | Effect |
|----------------|------|--------|
| `sortable` | `boolean` | Shows sort indicator (visual only — sorting is done server-side) |
| `filterable` | `boolean` | Shows filter indicator |
| `width` | `string` | CSS width, e.g. `'120px'` |
| `alignment` | `'left' \| 'center' \| 'right'` | Cell alignment |
| `label` | `string` | Override the auto-derived column header |
| `type` | `ColumnType` | Override the auto-derived type |
| `badgeVariants` | `Record<string, 'primary' \| 'success' \| 'neutral' \| 'warning' \| 'danger'>` | Renders the cell as `<sl-badge>` with the mapped variant; values absent from the map render as plain text |

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

## Row actions

Add custom buttons to each row that navigate to a different route:

```typescript
TableView.schema(PostSchema)
  .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
  .list({ method: 'GET', url: '/posts' })
  .find({ method: 'GET', url: '/posts/{id}' })
  .build();
```

`routePattern` is appended to `#/{resource}/` in the SPA's hash router. `{id}` is substituted with the row's id field at render time.

## Endpoint wiring

| Method | Effect when present |
|--------|---------------------|
| `list` | Fetches row data. Required for the table to show any rows. |
| `find` | Makes rows clickable, navigating to the form view at `/{resource}/{id}`. |
| `create` | Shows a "New" button (or a new-row form if `updateSchema` is set). |
| `update` | Enables inline save (requires `updateSchema`) or form save. |
| `delete` | Shows a "Delete" button per row. |

URL patterns use `{id}` as a placeholder — e.g. `/posts/{id}` — substituted at runtime.

## Java

```java
TableSpec.builder()
    .column("title", "Title", "string")
    .column(Column.builder("status", "Status", "enum")
        .filterable(true)
        .options(List.of(
            new FieldOption("draft",     "draft"),
            new FieldOption("published", "published")
        )).build())
    .list(EndpointDirective.get("/posts"))
    .find(EndpointDirective.get("/posts/{id}"))
    .create(EndpointDirective.post("/posts"))
    .build();
```

In Java you specify column types and enum options explicitly since there is no schema reflection layer.
