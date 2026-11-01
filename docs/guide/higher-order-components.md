# Higher-Order Components

A higher-order component (HOC) is a builder in `@retrofit-ui/builder-zod` that composes several specs into one unit. A view builder such as `TableView` makes one spec for one route. An HOC makes a page, or a set of specs for related routes.

| HOC | Output | Use it for |
|-----|--------|------------|
| `pageSpec()` | One `PageSpec` | Several views on one screen: filters and a table, a form beside a table, a dashboard. |
| `TableFormWorkflowBundle` | A table spec, a create form, and an edit form per record | The standard list, create and edit flow over three routes. |

Both only build specs. The server still decides which route serves which spec. See the [spec contract](/guide/contract) for the route table.

## `pageSpec`: composed pages

`pageSpec()` puts several specs in one `page` spec, served from one endpoint. Add any spec with `add()`, or use the shortcuts `table()`, `form()`, `filterForm()` and `markdown()`. Layout helpers `row()`, `col()` and `grid()` arrange the children. Call `.build()` on them before `add()`.

```typescript
import { pageSpec, row, TableView } from '@retrofit-ui/builder-zod';

const tableSpec = TableView.schema(ExpenseSchema)
  .list({ method: 'GET', url: '/expenses' })
  .build();

// The route `/expenses` in /retrofit.json points at this endpoint.
app.get('/api/ui/expenses', (_req, res) => {
  res.json(
    pageSpec()
      .title('Expenses')
      .add(row('16px').form(createExpenseForm, 'New Expense').table(tableSpec).build())
      .build(),
  );
});
```

Specs on one page share filters, and a write in one view reloads the others. Details, the layout fields and the `filter-form` kind are in [Layouts](/guide/layouts).

## `TableFormWorkflowBundle`: CRUD routes

One schema produces the list table, the create form and the edit form. With `.route()`, the bundle also builds the navigation between them. See the [Workflow Bundle guide](/guide/workflow-bundle) for the full behavior.

```typescript
import { crudRoutes, TableFormWorkflowBundle } from '@retrofit-ui/builder-zod';

const bundle = TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .form((f) => f.title('Contact'))
  .route('/contacts')
  .list({ method: 'GET', url: '/contacts' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build();

// /retrofit.json routes: crudRoutes('contacts') → /contacts, /contacts/new, /contacts/:id
app.get('/api/ui/contacts', (_req, res) => res.json(bundle.tableSpec));
app.get('/api/ui/contacts/new', (_req, res) => res.json(bundle.createForm));
app.get('/api/ui/contacts/:id', (req, res) => {
  const contact = store.find(req.params.id);
  if (!contact) return void res.status(404).json({ error: `No contact ${req.params.id}` });
  res.json(bundle.editForm(contact, { id: contact.id }));
});
```
