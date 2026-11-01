# Contacts Example

**Pattern: `TableFormWorkflowBundle` with a paginated, sortable list**

A table lists contacts and a form edits them. The bundle builds the matching table and form specs from one schema.

<ContactsDemo />

::: tip
The demo above is live. Edit a contact, add one or delete one. All data is mocked in the browser with MSW.
:::

Run it locally (serves on port 3000, or `PORT`):

```bash
just example contacts
# or: pnpm --filter @retrofit-ui-examples/contacts dev
```

## What it demonstrates

- `TableFormWorkflowBundle`: one schema yields `tableSpec`, `createForm` and `editForm(entity, params)`
- A list-backed `table` with `sortable` columns and `metadata.pagination`
- Per-row writes with `withRowActions`
- Field validation (`pattern`) and `placeholder` on a form
- A `stat` view and a `page` with `filter-form` + `form` + `table`

## Routes

From `src/server.ts`:

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/contacts` | `/api/ui/contacts` | `page` with a `table` |
| `/contacts/new` | `/api/ui/contacts/new` | `form` (create) |
| `/contacts/:id` | `/api/ui/contacts/{id}` | `form` (edit) |
| `/contacts-by-type` | `/api/ui/contacts-by-type` | `page`: `filter-form`, `form`, `table` |
| `/dashboard/stats` | `/api/ui/dashboard/stats` | `stat` |

```typescript
routes: [
  ...crudRoutes('contacts'),
  route('/contacts-by-type'),
  route('/dashboard/stats'),
],
```

## The bundle

From `src/specs.ts`:

```typescript
TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .table((t) =>
    t
      .columnOverride('name', { sortable: true })
      .metadata({ pagination: { pageSize: 2, totalRows } }),
  )
  .form((f) =>
    f.title('Contact').fieldOverride('phone', {
      placeholder: '+1 555 000 0000',
      validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
    }),
  )
  .route('/contacts')
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();
```

`.route('/contacts')` adds the table's "New" button and sends the forms back to the list. The `page` spec wraps `bundle.tableSpec`.

## The list endpoint

The client calls `GET /contacts` with `page`, `pageSize`, `sort` and `order`. The server slices and sorts, and adds the per-row writes with `withRowActions`:

```typescript
const all = withRowActions(type ? store.byType(type) : store.all(), {
  update: { method: 'PUT', url: '/contacts/{id}' },
  delete: { method: 'DELETE', url: '/contacts/{id}' },
});
```

The response is a raw row array. See [the contract](/guide/contract) for the query parameters and [Actions](/guide/actions) for the write bodies.
