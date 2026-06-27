# Workflow Bundle

`TableFormWorkflowBundle` combines a table view and a form view into a single builder, producing two complementary specs you serve on a collection route and an item route. It is the right choice when you want a standard list-then-edit CRUD flow and do not need inline table editing.

## When to use it

| Pattern | Use when |
|---------|----------|
| `TableFormWorkflowBundle` | Standard list → click row → edit form flow |
| `TableView` + separate `formSpec` | You need different schemas or custom routing per view |
| `TableView` with `updateSchema` | You want inline cell editing without a separate form page |

## Basic setup

```typescript
import { TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';
import { z } from 'zod';

const ContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  type: z.enum(['work', 'personal', 'other']),
  notes: z.string().optional(),
});

const UpdateContactSchema = ContactSchema.omit({ id: true });

const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .list({ method: 'GET', url: '/contacts' })
  .find({ method: 'GET', url: '/contacts/{id}' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// Serve the two specs. The table spec goes on the collection route; the form
// spec on the item route, with the entity's values baked onto the fields for edit.
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));

app.get('/api/ui/contacts/:id', (req, res) => {
  const { id } = req.params;
  const entity =
    id !== 'new'
      ? (store.find(id) as Record<string, unknown> | undefined)
      : undefined;
  const fields = entity
    ? bundle.formSpec.fields.map((f) =>
        entity[f.name] !== undefined ? { ...f, value: entity[f.name] } : f,
      )
    : bundle.formSpec.fields;
  res.json({ ...bundle.formSpec, fields });
});
```

The two routes you wire:

| Route | Spec | Notes |
|-------|------|-------|
| `GET /api/ui/contacts` | `TableSpec` | Clicking a row navigates to the form |
| `GET /api/ui/contacts/:id` | `FormSpec` | `"new"` for create, an ID for edit |

## Customising the table

Use the `table()` callback to apply column overrides without leaving the bundle chain:

```typescript
TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .table((t) =>
    t
      .columnOverride('name', { sortable: true })
      .columnOverride('email', { filterable: true })
  )
  // ...endpoints...
  .build();
```

The `table()` callback receives a `TableCustomizer` which exposes `columnOverride`. The same `visibleColumns` and `rowAction` methods from `TableViewBuilder` are also available.

## Customising the form

Use the `form()` callback to apply field overrides:

```typescript
TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) =>
    f
      .fieldOverride('notes', { type: 'textarea' })
      .fieldOverride('phone', {
        placeholder: '+1 555 000 0000',
        validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
      })
  )
  // ...endpoints...
  .build();
```

## Key difference from inline editing

In a `WorkflowBundle`, the table columns are **not** inline-editable. The `updateSchema` is used only to determine which form fields are editable (i.e. not read-only). Mutations happen through the form route, not directly in the table cells.

If you want inline cell editing, use `TableView.schema(...).updateSchema(...)` directly instead.

## Accessing the specs directly

`bundle.tableSpec` and `bundle.formSpec` are plain `TableSpec` and `FormSpec` objects if you need to inspect or extend them before serving:

```typescript
const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  // ...
  .build();

console.log(bundle.tableSpec.columns.map((c) => c.key));
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
```
