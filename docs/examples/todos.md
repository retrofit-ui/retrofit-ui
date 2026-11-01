# Todos Example

**Pattern: inline table editing with `updateSchema`**

One table edits, creates and deletes rows in place. A separate form pair exists for the `/todos/new` and `/todos/:id` routes.

<TodosDemo />

::: tip
The demo above is live. Edit a row, add a todo or delete one. All data is mocked in the browser with MSW.
:::

Run it locally (serves on port 3000, or `PORT`):

```bash
just example todos
# or: pnpm --filter @retrofit-ui-examples/todos dev
```

## What it demonstrates

- `table` with inline rows: `TableView.forRows(...)` plus `updateSchema`, `create`, `update` and `delete`
- Per-row Edit/Save/Cancel and Delete buttons, and a new-row form at the bottom of the table
- `form` with `onDone` navigation and `fieldOverride` (`switch`, `tooltip`, `helpText`)
- `page` with a `filter-form` over a list-backed `table`

## Routes

`/retrofit.json` lists the routes (`src/server.ts`). Each route's spec comes from `apiBase` + the route's `spec` path.

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/todos` | `/api/ui/todos` | `table` (inline rows) |
| `/todos/new` | `/api/ui/todos/new` | `form` (create) |
| `/todos/:id` | `/api/ui/todos/{id}` | `form` (edit) |
| `/todos-by-priority` | `/api/ui/todos-by-priority` | `page`: `filter-form` + `table` |

```typescript
// src/server.ts
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme: todosTheme,
  routes: [...crudRoutes('todos'), route('/todos-by-priority')],
};
```

`crudRoutes('todos')` expands to `/todos`, `/todos/new` and `/todos/:id`. The `:id` in the route path fills the `{id}` in the spec path.

## The inline table

From `src/specs.ts` (abridged). The column set in `updateSchema` is the editable set; `id` is absent, so it stays read-only.

```typescript
const builder = TableView.forRows(TodoSchema, rows)
  .updateSchema(CreateTodoSchema)
  .create({ method: 'POST', url: '/todos' })
  .update({ method: 'PUT', url: '/todos/{id}' })
  .delete({ method: 'DELETE', url: '/todos/{id}' });
```

The builder fills `{id}` in each row's write actions on the server. No `rowLink` is set, so a click on a row does nothing: all interaction stays in the table.

## The form

```typescript
formSpec(TodoSchema, CreateTodoSchema)
  .title('Todo')
  .fieldOverride('done', { type: 'switch' })
  .onDone({ type: 'navigate', to: '#/todos' });
```

## The filtered page

`/todos-by-priority` sends `priority` as a query parameter to `GET /todos`. The `filter-form` declares the field name (`buildTodosByPrioritySpec` in `src/specs.ts`). See [the contract](/guide/contract) for the list query parameters.
