# Workflow Bundle

::: tip Part of the Higher-Order Components family
`TableFormWorkflowBundle` is one of retrofit-ui's HOCs — builders that compose multiple specs
into a single unit. See the [Higher-Order Components overview](/guide/higher-order-components)
for how it relates to `pageSpec`.
:::

`TableFormWorkflowBundle` combines a table view and a form view into a single builder, producing a table spec plus its create and edit forms, which you serve on a list route, a create route and an item route. It is the right choice when you want a standard list-then-edit CRUD flow and do not need inline table editing.

<PreviewBlock>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

</PreviewBlock>

::: details Spec

```typescript
const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) => f.title('Contact'))
  .route('/contacts')
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

res.json(bundle.editForm(contact, { id: contact.id }));
```

:::

## When to use it

| Pattern | Use when |
|---------|----------|
| `TableFormWorkflowBundle` | Standard list → create/edit form flow from one schema |
| `TableView` + separate `formSpec` | You need different schemas or custom routing per view |
| `TableView` with `updateSchema` | You want inline cell editing without a separate form page |

## Basic setup

```typescript
import { crudRoutes, TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';
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
  .form((f) => f.title('Contact')) // "New Contact" / "Edit Contact"
  .route('/contacts')              // the hash route the screens live under
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// /retrofit.json: the three screens, #/contacts, #/contacts/new, #/contacts/:id
// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/admin-ui', routes: crudRoutes('contacts') }),
);

app.get('/admin-ui/contacts', (_req, res) => res.json(bundle.tableSpec));

// /new before /:id, so Express never reads "new" as an id
app.get('/admin-ui/contacts/new', (_req, res) => res.json(bundle.createForm));

app.get('/admin-ui/contacts/:id', (req, res) => {
  const contact = store.find(req.params.id);
  if (!contact) {
    res.status(404).json({ error: `No contact ${req.params.id}` });
    return;
  }
  // Prefilled with the contact's values; update/delete urls resolved to its id
  res.json(bundle.editForm(contact, { id: contact.id }));
});
```

The three routes you wire:

| Route | Spec | Notes |
|-------|------|-------|
| `GET /admin-ui/contacts` | `bundle.tableSpec` | The list, with a "New" toolbar button |
| `GET /admin-ui/contacts/new` | `bundle.createForm` | Submits to `create` |
| `GET /admin-ui/contacts/:id` | `bundle.editForm(values, params)` | Prefilled; submits to `update` with `{param}`s filled from `params`, and offers `delete` |

## Routing with `.route()`

`.route(path)` tells the bundle which hash route its screens live under — the same resource `crudRoutes` declares. From it the bundle builds the navigation into the specs:

- the table gets a **New** toolbar button navigating to `#<path>/new` (only when `create` is wired);
- both forms get `onDone: { type: 'navigate', to: '#<path>' }`, so saving, deleting or pressing Back returns to the list.

Without `.route()` the specs carry no navigation at all.

::: warning Table rows aren't linked
The bundle doesn't give the table's rows a link, so clicking a row doesn't open its edit form. Rows come from `list`, which the builder never sees: have your list endpoint return a link per row and set `rowLinkField` on the table spec yourself:

```typescript
// GET /contacts returns [{ id: 7, …, link: '#/contacts/7' }, …]
res.json({ ...bundle.tableSpec, rowLinkField: 'link' });
```
:::

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

The `table()` callback receives a `TableCustomizer`, which exposes `columnOverride` and `metadata` (e.g. a title or pagination). Other `TableViewBuilder` methods aren't available on it; to change anything else, spread `bundle.tableSpec` into a new object before serving it.

## Customising the form

Use the `form()` callback to apply field overrides:

```typescript
TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) =>
    f
      .title('Contact') // headings: "New Contact", "Edit Contact"
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

`bundle.tableSpec`, `bundle.createForm` and `bundle.editForm(values, params)` are plain `TableSpec` and `FormSpec` objects if you need to inspect or extend them before serving:

```typescript
const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  // ...
  .build();

console.log(bundle.tableSpec.columns.map((c) => c.key));
app.get('/admin-ui/contacts', (_req, res) => res.json(bundle.tableSpec));
```
