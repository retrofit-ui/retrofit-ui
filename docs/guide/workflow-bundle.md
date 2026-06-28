# Workflow Bundle

`TableFormWorkflowBundle` combines a table view and a form view into a single builder, producing two complementary specs you serve on a collection route and an item route. It is the right choice when you want a standard list-then-edit CRUD flow and do not need inline table editing.

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden; font-family: var(--vp-font-family-base, system-ui, sans-serif);">
    <div style="padding: 10px 14px; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-divider); font-size: 13px; font-weight: 600; color: var(--vp-c-text-1);">Contacts</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: var(--vp-c-bg);">
      <thead>
        <tr style="background: var(--vp-c-bg-soft);">
          <th style="padding: 7px 12px; text-align: left; font-size: 10px; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); font-weight: 600;">Name</th>
          <th style="padding: 7px 12px; text-align: left; font-size: 10px; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); font-weight: 600;">Type</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--vp-c-divider); cursor: pointer; background: var(--vp-c-brand-soft, rgba(59,130,246,0.07));">
          <td style="padding: 8px 12px; color: var(--vp-c-brand-1, #3b82f6);">Alice Johnson →</td>
          <td style="padding: 8px 12px; color: var(--vp-c-text-2);">work</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--vp-c-divider);">
          <td style="padding: 8px 12px; color: var(--vp-c-text-1);">Bob Martinez</td>
          <td style="padding: 8px 12px; color: var(--vp-c-text-2);">personal</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; color: var(--vp-c-text-1);">Carol Thompson</td>
          <td style="padding: 8px 12px; color: var(--vp-c-text-2);">work</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 14px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
    <button style="background: none; border: none; font-size: 11px; color: var(--vp-c-text-3); cursor: default; padding: 0; margin-bottom: 10px;">← Back</button>
    <div style="font-size: 15px; font-weight: 700; color: var(--vp-c-text-1); margin-bottom: 12px;">Edit Contact</div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div>
        <div style="font-size: 11px; font-weight: 500; color: var(--vp-c-text-2); margin-bottom: 3px;">Name</div>
        <input readonly value="Alice Johnson" style="width: 100%; padding: 5px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 12px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
      </div>
      <div>
        <div style="font-size: 11px; font-weight: 500; color: var(--vp-c-text-2); margin-bottom: 3px;">Email</div>
        <input readonly value="alice@example.com" style="width: 100%; padding: 5px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; font-size: 12px; background: var(--vp-c-bg); color: var(--vp-c-text-1); box-sizing: border-box;" />
      </div>
      <div style="display: flex; gap: 6px;">
        <button style="padding: 5px 12px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: default;">Save</button>
        <button style="padding: 5px 12px; background: transparent; color: var(--vp-c-red-1, #ef4444); border: 1px solid var(--vp-c-red-1, #ef4444); border-radius: 4px; font-size: 12px; cursor: default;">Delete</button>
      </div>
    </div>
  </div>
</div>

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
