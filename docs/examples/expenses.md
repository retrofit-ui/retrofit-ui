# Expenses Example

**Pattern: server-controlled validation and several page layouts**

The `amount` bounds and the `date` pattern live on the server. Change them there and every client follows. No frontend deploy is needed.

Run it locally (serves on port 3000, or `PORT`):

```bash
just example expenses
# or: pnpm --filter @retrofit-ui-examples/expenses dev
```

## What it demonstrates

- Form `validation`: number bounds (`min`/`max`), a length bound on text, and an anchored `pattern`
- Column `format: 'currency'` (client formats) against a `format` function (server pre-formats each cell as `{ value, formatted }`)
- `page` layouts: an `autoSubmit` filter form over a list-backed table, a form above a table, and a `row()` with the form beside the table
- Server-controlled fields kept out of the form: `CreateExpenseSchema` has no `id` or `status`

## Routes

From `src/server.ts`:

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/expenses` | `/api/ui/expenses` | `table` |
| `/expenses/new` | `/api/ui/expenses/new` | `form` (create) |
| `/expenses/:id` | `/api/ui/expenses/{id}` | `form` (edit) |
| `/expenses-formatted` | `/api/ui/expenses-formatted` | `table` (server-formatted) |
| `/expenses-filtered` | `/api/ui/expenses-filtered` | `page`: `form` (auto-submit) + `table` |
| `/expenses-stacked` | `/api/ui/expenses-stacked` | `page`: `form` + `table` |
| `/expenses-dashboard` | `/api/ui/expenses-dashboard` | `page` with a `row` of `form` + `table` |

## Validation

```typescript
function expenseForm() {
  return formSpec(ExpenseSchema, CreateExpenseSchema)
    .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
    .fieldOverride('date', {
      placeholder: 'YYYY-MM-DD',
      helpText: 'YYYY-MM-DD',
      validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    })
    .fieldOverride('notes', { type: 'textarea' })
    .fieldOverride('description', { validation: { min: 3 } });
}
```

## Formatting

The client formats `format: 'currency'`. A `format` function makes the server send the display string.

```typescript
// /api/ui/expenses: the client formats
.columnOverride('amount', { format: 'currency', currency: 'USD' })

// /api/ui/expenses-formatted: the server formats
.columnOverride('amount', { format: (v) => usd.format(Number(v)) })
```

## Filter above a table

Abridged: the real spec also sets `visibleColumns`.

```typescript
pageSpec()
  .title('Expenses')
  .form(
    formSpec(ExpenseFilterSchema)
      .fieldOverride('category', { placeholder: 'All Categories' })
      .fieldOverride('status', { placeholder: 'All Statuses' })
      .autoSubmit()
      .layout({ direction: 'row' })
      .build(),
  )
  .table(
    TableView.schema(ExpenseSchema)
      .list({ method: 'GET', url: '/expenses' })
      .build(),
  )
  .build();
```

The page sends `category` and `status` as query parameters to `GET /expenses`.
