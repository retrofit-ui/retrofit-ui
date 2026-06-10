# JS Quickstart

Get a working admin table view in under five minutes with Express.

## Install

```bash
pnpm add @retrofit-ui/server-solid-shoelace @retrofit-ui/spa-solid-shoelace express
pnpm add -D @types/express tsx
```

`server-solid-shoelace` contains the server helpers and builders. `spa-solid-shoelace` provides the pre-built SPA assets that get served at `/`.

## Minimum working example

```typescript
import { retrofitUi, TableView } from '@retrofit-ui/server-solid-shoelace';
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

// 1. Mount the SPA and the /retrofit.json config endpoint
const retrofit = retrofitUi(app);

// 2. Your existing REST endpoint (unchanged)
app.get('/items', (_req, res) => res.json(items));

// 3. The spec endpoint — tells the SPA how to render the table
app.get('/api/ui/items', (_req, res) => {
  res.json(
    retrofit(
      TableView.schema(ItemSchema)
        .list({ method: 'GET', url: '/items' })
        .build(),
    ),
  );
});

app.listen(3000, () => console.log('http://localhost:3000'));
```

Run it:

```bash
npx tsx server.ts
```

Open `http://localhost:3000` and you'll see a table with Name and Active columns populated from your data. retrofit-ui derived the column types from the Zod schema automatically.

## Adding create and delete

Wire up more endpoints by adding handlers and endpoint directives to the builder:

```typescript
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

// Update the spec endpoint
app.get('/api/ui/items', (_req, res) => {
  res.json(
    retrofit(
      TableView.schema(ItemSchema)
        .list({ method: 'GET', url: '/items' })
        .create({ method: 'POST', url: '/items' })
        .delete({ method: 'DELETE', url: '/items/{id}' })
        .build(),
    ),
  );
});
```

A "New" button and per-row "Delete" buttons appear automatically.

## Next steps

- **Inline editing** — use `updateSchema` to mark which fields are editable directly in the table. See [Table View](/guide/table-view).
- **Separate form view** — use `formSpec` for a dedicated create/edit page. See [Form View](/guide/form-view).
- **Combined table + form** — use `TableFormWorkflowBundle` for the most common pattern. See [Workflow Bundle](/guide/workflow-bundle).
- **Run a full example** — `just example js todos` starts the todos example from the repo.
