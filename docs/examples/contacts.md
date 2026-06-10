# Contacts Example

**Pattern: `TableFormWorkflowBundle` — separate table and form views**

The contacts example shows the most common CRUD pattern: a table listing all records, clicking a row opens an edit form, a "New" button opens a create form.

Run it:
```bash
just example js contacts   # Node.js / Express
just example java contacts # Spring Boot
```

## What it demonstrates

- `TableFormWorkflowBundle` for zero-boilerplate table+form registration
- Column and field customisation via the `table()` and `form()` callbacks
- Custom field validation (`pattern`) and display overrides (`placeholder`, `helpText`)
- `updateSchema` to keep `id` read-only on the edit form

## Server

```typescript
const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .table((t) =>
    t
      .columnOverride('name', { sortable: true })
      .columnOverride('email', { filterable: true }),
  )
  .form((f) =>
    f
      .fieldOverride('notes', { type: 'textarea' })
      .fieldOverride('phone', {
        placeholder: '+1 555 000 0000',
        validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
      }),
  )
  .list({ method: 'GET', url: '/contacts' })
  .find({ method: 'GET', url: '/contacts/{id}' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// Registers GET /api/ui/contacts and GET /api/ui/contacts/:id
bundle.register(app, retrofit, '/api/ui/contacts');
```

## What `.register()` creates

| Route | Spec | Behaviour |
|-------|------|-----------|
| `GET /api/ui/contacts` | `TableSpec` | Table with Name, Email, Phone, Type columns. Rows are clickable (find is wired). "New" button present (create is wired). |
| `GET /api/ui/contacts/:id` | `FormSpec` | Edit form when id is a number. Create form when id is `"new"`. Delete button present (delete is wired). |

## Key takeaway

`TableFormWorkflowBundle` is two spec endpoints in one builder call. The `table()` and `form()` callbacks let you customise each independently without leaving the chain.
