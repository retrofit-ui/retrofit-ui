# Contacts Example

**Pattern: `TableFormWorkflowBundle` — separate table and form views**

The contacts example shows the most common CRUD pattern: a table listing all records, clicking a row opens an edit form, a "New" button opens a create form.

<ContactsDemo />

::: tip
The demo above is live — try editing a contact's type, adding a new contact, or deleting one. All data is mocked in the browser with MSW.
:::

Run it locally:
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

// Serve the two specs on a collection route and an item route
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/api/ui/contacts/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? store.find(id) : undefined;
  const fields = entity
    ? bundle.formSpec.fields.map((f) =>
        entity[f.name] !== undefined ? { ...f, value: entity[f.name] } : f,
      )
    : bundle.formSpec.fields;
  res.json({ ...bundle.formSpec, fields });
});
```

## What the two routes serve

| Route | Spec | Behaviour |
|-------|------|-----------|
| `GET /api/ui/contacts` | `TableSpec` | Table with Name, Email, Phone, Type columns. Rows are clickable (find is wired). "New" button present (create is wired). |
| `GET /api/ui/contacts/:id` | `FormSpec` | Edit form when id is a number. Create form when id is `"new"`. Delete button present (delete is wired). |

## Key takeaway

`TableFormWorkflowBundle` builds two complementary specs in one builder call. The `table()` and `form()` callbacks let you customise each independently without leaving the chain; your server serves `bundle.tableSpec` and `bundle.formSpec` on the two routes.
