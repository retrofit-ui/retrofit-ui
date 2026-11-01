# Workflow Bundle

::: tip Part of the Higher-Order Components family
`TableFormWorkflowBundle` is one of the builders in the [Higher-Order Components overview](/guide/higher-order-components).
:::

`TableFormWorkflowBundle` takes one Zod schema and builds three specs for a list, create and edit flow: a table, a create form, and an edit form per record. You serve them on a list route, a create route and an item route. Use it when records are edited on their own form page. For inline table editing, use [`TableView`](/guide/table-view) directly.

`WorkflowBundleBuilder` is the same class under another name, and `WorkflowBundle` is the type that `.build()` returns.

## Basic setup

```typescript
import { crudRoutes, TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';
import { z } from 'zod';

const ContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  type: z.enum(['work', 'personal', 'other']),
  notes: z.string().optional(),
});
const UpdateContactSchema = ContactSchema.omit({ id: true });

const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) => f.title('Contact'))
  .route('/contacts')
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// /retrofit.json
app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', routes: crudRoutes('contacts') }),
);

app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/api/ui/contacts/new', (_req, res) => res.json(bundle.createForm));
app.get('/api/ui/contacts/:id', (req, res) => {
  const contact = store.find(req.params.id);
  if (!contact) return void res.status(404).json({ error: `No contact ${req.params.id}` });
  res.json(bundle.editForm(contact, { id: contact.id }));
});
```

`crudRoutes('contacts')` declares `/contacts`, `/contacts/new` and `/contacts/:id`, in that order, so `new` is never read as an id.

| Route | Spec | Notes |
|-------|------|-------|
| `/contacts` | `bundle.tableSpec` | Columns from the schema. |
| `/contacts/new` | `bundle.createForm` | A getter. Submits to `create`. |
| `/contacts/:id` | `bundle.editForm(values, params)` | An edit form (`mode: 'edit'`) with the field values from `values`. Submits to `update` and offers `delete`. `{name}` in those URLs is filled from `params` on the server. |

## What `.route()` does

`.route(path)` names the hash route of the resource, the same one `crudRoutes` declares. It accepts `/contacts`, `contacts` or `#/contacts/` and normalizes to `/contacts`. From it the bundle builds navigation data into the specs:

- The table gets a **New** toolbar button, a `navigate` action to `#/contacts/new`. It appears only when both `.route()` and `.create()` are set.
- Both forms get `onDone: { type: 'navigate', to: '#/contacts' }`. Saving, deleting or pressing Back returns to the list.

Without `.route()`, the specs carry no navigation.

## What the bundle does not do

- **The table has no row writes.** The table is built without an `updateSchema`, so no column is editable. The bundle does not call `update()` or `delete()` on the table, so rows carry no `_actions` and show no **Delete** button. Delete is on the edit form. `create` is stored in the table endpoints, but with no editable column the table shows no inline "new row".
- **The rows are not linked.** The bundle does not bind a row to its edit form. Clicking a row does nothing until you add links. The list endpoint returns a link per row, and you set `rowLinkField` on the spec:

```typescript
// GET /contacts returns [{ id: 7, …, link: '#/contacts/7' }, …]
res.json({ ...bundle.tableSpec, rowLinkField: 'link' });
```

The list handler can add `_actions` with [`withRowActions`](/guide/table-view#row-writes) in the same way, if you want a delete button in the table. To add any other table field, such as `rowActions` or `toolbar` buttons, spread `bundle.tableSpec` into a new object.

## Customizing

`table(fn)` receives a `TableCustomizer` with two methods: `columnOverride(key, partial)` and `metadata(meta)`. `form(fn)` receives a `FormCustomizer` with `fieldOverride(key, partial)` and `title(name)`. The title gives the headings "New Contact" and "Edit Contact".

```typescript
TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .table((t) => t.columnOverride('name', { sortable: true }).metadata({ title: 'Contacts' }))
  .form((f) =>
    f.title('Contact').fieldOverride('notes', { type: 'textarea' }),
  )
  // ...route and endpoints...
  .build();
```

`updateSchema` decides which form fields are editable. A field it leaves out is read-only in the edit form and hidden in the create form. See [Form view](/guide/form-view).

## The built specs

`bundle.tableSpec` is a `TableSpec`. `bundle.createForm` and `bundle.editForm(values, params)` are `FormSpec`s. They are plain objects: inspect or extend them before you send them.
