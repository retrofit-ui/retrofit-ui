# JS Quickstart

Get a working table view in under five minutes with Express.

## Install

```bash
pnpm add @retrofit-ui/builder-zod @retrofit-ui/spa-solid-shoelace express
pnpm add -D @types/express tsx
```

`builder-zod` contains the Zod-driven spec builders. `spa-solid-shoelace` provides the pre-built SPA bundle (exposed as `distPath`) that your server serves as static files at `/`. The server's only jobs are to declare its screens in `/retrofit.json`, emit spec JSON and serve the bundle — the same model in any language.

## Minimum working example

```typescript
import { type RetrofitConfig, route, TableView } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Your existing data + schema
const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
});

const items = [
  { id: 1, name: 'First item', active: true },
  { id: 2, name: 'Second item', active: false },
];

// 1. Serve the config — the app's screens — and the SPA bundle as static files.
//    route('/items') is the hash route #/items, whose spec is /api/ui/items.
const config: RetrofitConfig = { apiBase: '/api/ui', routes: [route('/items')] };
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

// 2. Your existing REST endpoint (unchanged)
app.get('/items', (_req, res) => res.json(items));

// 3. The spec endpoint for #/items — tells the SPA how to render the table
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .list({ method: 'GET', url: '/items' })
      .build(),
  );
});

app.listen(3000, () => console.log('http://localhost:3000'));
```

Run it:

```bash
npx tsx server.ts
```

Open `http://localhost:3000/#/items` and you'll see a table with ID, Name and Active columns populated from your data. retrofit-ui derived the column types from the Zod schema automatically.

The SPA shows only the routes you declare: the bare `http://localhost:3000` has no route, so it says so. To show the table there too, add `route('/', '/items')` — a hash route `/` served by the same spec.

::: info The `/api/ui` prefix is your choice
`apiBase` is a prefix retrofit-ui prepends to each route's `spec` when it fetches it. `/api/ui` above (also the default) is a convention that reads cleanly, not a requirement — use `/admin-ui`, `/ui/v2`, or `/` if that fits your server. Just make sure `apiBase` plus each route's `spec` matches a spec endpoint you register.
:::

## Adding create and delete

Wire up more endpoints by adding handlers, a create-form screen, and endpoint directives to the builder:

```typescript
import { formSpec } from '@retrofit-ui/builder-zod';

// Declare the new screen in /retrofit.json
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  routes: [route('/items'), route('/items/new')],
};

// Add REST handlers
app.post('/items', (req, res) => {
  const item = { id: items.length + 1, ...req.body };
  items.push(item);
  res.status(201).json(item);
});

app.delete('/items/:id', (req, res) => {
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx !== -1) items.splice(idx, 1);
  res.json({ ok: true });
});

// Update the table's spec endpoint
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .list({ method: 'GET', url: '/items' })
      .delete({ method: 'DELETE', url: '/items/{id}' })
      .toolbar('New', { type: 'navigate', to: '#/items/new' })
      .build(),
  );
});

// The create form for #/items/new. `id` isn't in the update schema, so the
// create form leaves it out; `onDone` goes back to the table after saving.
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

A "New" button now opens the create form, and each row gets a "Delete" button. Nothing is added implicitly: the "New" button exists because the spec has a `toolbar` entry, and it goes to `#/items/new` because that is the action's `to`.

## Next steps

- **Inline editing** — use `updateSchema` to mark which fields are editable directly in the table. See [Table View](/guide/table-view).
- **Edit forms and row links** — see [Form View](/guide/form-view) and [Table View](/guide/table-view#row-links).
- **More routes** — `crudRoutes('items')` declares the list, create and edit screens at once. See [Hosted SPA](/guide/hosted-spa#the-route-table).
- **Combined table + form** — use `TableFormWorkflowBundle` for the most common pattern. See [Workflow Bundle](/guide/workflow-bundle).
- **Run a full example** — `just example todos` starts the todos example from the repo.
