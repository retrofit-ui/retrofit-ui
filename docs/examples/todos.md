# Todos Example

**Pattern: inline table editing with `updateSchema`**

The todos example shows how to build a single-page CRUD interface entirely within the table — no separate form view, no page navigation.

Run it:
```bash
just example js todos   # Node.js / Express
just example java todos # Spring Boot
```

## What it demonstrates

- `updateSchema` to mark specific columns as inline-editable
- A "new row" form appended at the bottom of the table for creates
- Per-row Edit/Save/Cancel and Delete buttons

## Schemas

```typescript
// Full schema — all fields including server-controlled id
const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

// Update schema — excludes id (users cannot change it)
const CreateTodoSchema = z.object({
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});
```

## Server

```typescript
const retrofit = retrofitUi(app, { theme: { /* purple */ } });

app.get('/api/ui/todos', (_req, res) => {
  res.json(
    retrofit(
      TableView.schema(TodoSchema)
        .updateSchema(CreateTodoSchema) // title/done/priority become editable cells
        .list({ method: 'GET', url: '/todos' })
        .create({ method: 'POST', url: '/todos' })
        .update({ method: 'PUT', url: '/todos/{id}' })
        .delete({ method: 'DELETE', url: '/todos/{id}' })
        .build(),
    ),
  );
});
```

Because `find` is not wired, clicking a row does nothing — all interaction stays in the table.

## How inline editing works

1. Columns in `updateSchema` (`title`, `done`, `priority`) render as editable cells when a row is in edit mode.
2. The `id` column is absent from `updateSchema`, so it stays read-only.
3. `priority` is a `z.enum(...)` — retrofit-ui derives the `<sl-select>` options automatically.
4. `done` is `z.boolean()` — renders as a `<sl-checkbox>`.
5. The last table row is always an empty "new row" form because `create` is wired.

## Key takeaway

`updateSchema` is the toggle for inline editing. Include a field → editable cell. Exclude it → read-only. The server owns that decision entirely.
