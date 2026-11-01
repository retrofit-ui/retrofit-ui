# JS Quickstart

Get a working table in the hosted app in a few minutes, with Express and Zod.

## Install

```bash
pnpm add @retrofit-ui/builder-zod @retrofit-ui/spa-solid-shoelace express zod
pnpm add -D @types/express tsx
```

- `@retrofit-ui/builder-zod` builds specs from Zod schemas. Zod is its peer dependency, so you install it yourself.
- `@retrofit-ui/spa-solid-shoelace` ships the prebuilt hosted app. Its `distPath` export is the folder your server serves as static files.

The server has three jobs: declare its screens in `/retrofit.json`, return spec JSON for each screen, and serve the app's files. A server in another language does the same three things; see [The spec contract](/guide/contract).

## Minimum working example

Save this as `server.ts`:

```typescript
import { type RetrofitConfig, route, TableView } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Your existing data and schema
const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
});

const items = [
  { id: 1, name: 'First item', active: true },
  { id: 2, name: 'Second item', active: false },
];

// 1. The app's screens, and the app itself as static files.
//    route('/items') is the hash route #/items; its spec is served at /api/ui/items.
const config: RetrofitConfig = { apiBase: '/api/ui', routes: [route('/items')] };
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

// 2. Your existing REST endpoint, unchanged: it returns a plain array of rows.
app.get('/items', (_req, res) => res.json(items));

// 3. The spec for #/items: a table whose rows come from GET /items.
app.get('/api/ui/items', (_req, res) => {
  res.json(TableView.schema(ItemSchema).list({ method: 'GET', url: '/items' }).build());
});

app.listen(3000, () => console.log('http://localhost:3000/#/items'));
```

Run it:

```bash
npx tsx server.ts
```

Open `http://localhost:3000/#/items`. The table has Id, Name and Active columns: the builder derived them from the Zod schema, and the rows come from `GET /items`.

The spec endpoint returns plain JSON. You can see exactly what the app receives:

```bash
curl http://localhost:3000/api/ui/items
```

```json
{
  "kind": "table",
  "columns": [
    { "key": "id", "label": "Id", "type": "number", "sortable": false, "editable": false, "alignment": "left" },
    { "key": "name", "label": "Name", "type": "string", "sortable": false, "editable": false, "alignment": "left" },
    { "key": "active", "label": "Active", "type": "boolean", "sortable": false, "editable": false, "alignment": "left" }
  ],
  "endpoints": { "list": { "method": "GET", "url": "/items" } }
}
```

The app shows only the routes you declare. `http://localhost:3000/` has no route, so the app says so. To show the table there too, add `route('/', '/items')`: the hash route `/`, served by the same spec.

::: info The `/api/ui` prefix is your choice
`apiBase` is a prefix that the app puts before each route's `spec` when it fetches it. It defaults to `/api/ui`, but any prefix works (`/admin-ui`, `/ui/v2`, `/`). `apiBase` plus each route's `spec` must match a spec endpoint that you register. Urls inside a spec, such as `list`, are fetched as written, with no prefix.
:::

## Adding create and delete

Replace the `config`, the `GET /items` handler and the `/api/ui/items` handler above with the code below. Add `formSpec` and `withRowActions` to the `@retrofit-ui/builder-zod` import.

```typescript
import {
  formSpec,
  type RetrofitConfig,
  route,
  TableView,
  withRowActions,
} from '@retrofit-ui/builder-zod';

// A second screen: the create form at #/items/new
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  routes: [route('/items'), route('/items/new')],
};

// REST handlers. Each row the list returns carries its own finished delete
// in `_actions`; withRowActions fills {id} from the row, here on the server.
app.get('/items', (_req, res) => {
  res.json(withRowActions(items, { delete: { method: 'DELETE', url: '/items/{id}' } }));
});

let nextId = items.length + 1;
app.post('/items', (req, res) => {
  const item = { id: nextId++, ...req.body };
  items.push(item);
  res.status(201).json(item);
});

app.delete('/items/:id', (req, res) => {
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx !== -1) items.splice(idx, 1);
  res.json({ ok: true });
});

// The table, now with a "New" button above it
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .list({ method: 'GET', url: '/items' })
      .toolbar('New', { type: 'navigate', to: '#/items/new' })
      .build(),
  );
});

// The create form for #/items/new. `id` is not in the second (update) schema,
// so it is read-only and the create form leaves it out. After a save, `onDone`
// goes back to the table.
app.get('/api/ui/items/new', (_req, res) => {
  res.json(
    formSpec(ItemSchema, ItemSchema.omit({ id: true }))
      .title('Item')
      .create({ method: 'POST', url: '/items' })
      .onDone({ type: 'navigate', to: '#/items' })
      .build(),
  );
});
```

Now the table has a "New" button, and each row has a "Delete" button. The client adds nothing on its own:

- The "New" button is there because the spec has a `toolbar` entry. It opens `#/items/new` because that is the action's `to`.
- A row shows "Delete" because the row carries `_actions.delete`. A row without `_actions` has no delete button.
- After a create or a delete, the app fetches the screen's spec again, so the table shows the change. See [Actions](/guide/actions#refresh).

`TableView`'s own `.update()` and `.delete()` apply only to rows embedded in the spec with `.rows()`. On a table that loads its rows from `list()`, `build()` throws, because the rows are not known when the spec is built. Use `withRowActions` in the list handler, as above.

## Next steps

- **Inline editing**: `updateSchema` marks the columns a user can edit in the table. See [Table View](/guide/table-view).
- **Edit forms and row links**: see [Form View](/guide/form-view) and [Table View](/guide/table-view).
- **More routes**: `crudRoutes('items')` declares the list, create and edit screens at once. See [Hosted SPA](/guide/hosted-spa#the-route-table).
- **Table and form together**: `TableFormWorkflowBundle` builds the usual set of screens. See [Workflow Bundle](/guide/workflow-bundle).
- **Auth headers and other client behavior**: see [Actions](/guide/actions).
- **A full example**: `just example todos` starts the todos example from the repo.
