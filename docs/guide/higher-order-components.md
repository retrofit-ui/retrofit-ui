# Higher-Order Components

Higher-order components (HOCs) in retrofit-ui are builders that compose multiple specs into a
named unit. Where a view like `TableView` or `FormView` produces a single spec for a single
route, an HOC produces a spec — or a bundle of specs — that orchestrates several views in one
call.

Two HOCs ship today:

| HOC | Output | When to reach for it |
|-----|--------|----------------------|
| `pageSpec` | A single `PageSpec` | Multi-component pages: dashboards, filter+table, form+table on one screen |
| `TableFormWorkflowBundle` | A `tableSpec`, plus `createForm` and `editForm(values, params)` | Standard list → create/edit CRUD flow across three routes |

---

## `pageSpec` — composed pages

`pageSpec` assembles multiple views (tables, forms, filter forms, markdown) into one page spec
served from a single endpoint. The client renders them as a stacked or side-by-side layout.

**When to use it:**
- You want a filter bar above a table on the same page.
- You want a create form and a table visible at once (dashboard style).
- You want a page with a stats summary beside a detail table.

### Example: table on a page

```typescript
import { pageSpec, TableView } from '@retrofit-ui/builder-zod';

const tableSpec = TableView.schema(PostSchema)
  .list({ method: 'GET', url: '/posts' })
  .build();

// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/admin-ui/posts-page', (_req, res) => {
  res.json(
    pageSpec()
      .title('Posts')
      .table(tableSpec)
      .build()
  );
});
```

### Example: form and table side by side

Use `row()` + `.add()` to compose a two-column dashboard:

```typescript
import { pageSpec, row, formSpec, TableView } from '@retrofit-ui/builder-zod';

app.get('/reports/expenses-dashboard', (_req, res) => {
  res.json(
    pageSpec()
      .title('Expenses')
      .add(
        row()
          .form(createFormSpec, 'New Expense')
          .table(tableSpec)
          .build()
      )
      .build()
  );
});
```

Layout helpers — `col()`, `row()`, `grid(n)` — return a `LayoutContainerBuilder`. Call `.build()`
on them before passing to `.add()`.

---

## `TableFormWorkflowBundle` — CRUD routes

`TableFormWorkflowBundle` produces the specs for a standard list-then-edit flow in one call: a
`TableSpec` for the list route, a create form, and an edit form per record. Given `.route()`, it
also wires the navigation between them into the specs: a "New" button on the table and an
`onDone` on each form that returns to the list.

**When to use it:**
- Standard admin CRUD: a list page, a create form and an edit form.
- You want the table and form to share one schema definition.

```typescript
import { TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';

const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) => f.title('Contact'))
  .route('/contacts') // matches crudRoutes('contacts') in /retrofit.json
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// Three routes, one builder call
app.get('/admin-ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/admin-ui/contacts/new', (_req, res) => res.json(bundle.createForm));
app.get('/admin-ui/contacts/:id', (req, res) => {
  const contact = store.find(req.params.id);
  if (!contact) {
    res.status(404).json({ error: `No contact ${req.params.id}` });
    return;
  }
  // prefilled with the contact's values, urls resolved to its id
  res.json(bundle.editForm(contact, { id: contact.id }));
});
```

For full configuration options (column overrides, form field overrides, inline editing comparison),
see the [Workflow Bundle guide](/guide/workflow-bundle).
