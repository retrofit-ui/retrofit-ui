// Key demo: the valid values for `status` (draft/published/archived) live
// exclusively in UpdatePostSchema on the server. To add a new state such as
// 'review', change the enum here — the client form regenerates automatically
// with no frontend changes required. This is the server-driven UI principle.

import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import express, { type Request, type Response } from 'express';
import { PostSchema, UpdatePostSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

// ─── List ─────────────────────────────────────────────────────────────────────

app.get('/api/ui/posts', (_req: Request, res: Response) => {
  const table = tableFromSchema(
    PostSchema,
    store.all() as Record<string, unknown>[],
  )
    .withTitle('Posts')
    .withRowLink('/api/ui/posts/{id}')
    .withCreateUrl('/api/ui/posts/new')
    .withColumnOverrides({
      title: { sortable: true, filterable: true },
      status: { filterable: true },
    })
    .build();
  res.json(table);
});

// ─── New ──────────────────────────────────────────────────────────────────────

app.get('/api/ui/posts/new', (_req: Request, res: Response) => {
  const form = formFromSchema(PostSchema)
    .withMutability(UpdatePostSchema)
    .withTitle('New Post')
    .withSubmit({ method: 'POST', url: '/api/ui/posts' })
    .withFieldOverrides({
      body: { type: 'textarea' },
      slug: {
        helpText: 'lowercase, hyphens only',
        validation: { pattern: '^[a-z0-9-]+$' },
      },
      tags: { helpText: 'comma-separated' },
      title: { validation: { max: 200 } },
    })
    .build();
  res.json(form);
});

// ─── Detail / Edit ────────────────────────────────────────────────────────────

app.get('/api/ui/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id ?? '';
  const entity = store.find(id);
  if (!entity) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  const spec = formFromSchema(PostSchema)
    .withMutability(UpdatePostSchema)
    .withTitle('Edit Post')
    .withSubmit({ method: 'PUT', url: `/api/ui/posts/${id}` })
    .withDelete({ method: 'DELETE', url: `/api/ui/posts/${id}` })
    .withFieldOverrides({
      body: { type: 'textarea' },
      slug: {
        helpText: 'lowercase, hyphens only',
        validation: { pattern: '^[a-z0-9-]+$' },
      },
      tags: { helpText: 'comma-separated' },
      title: { validation: { max: 200 } },
    })
    .build();
  res.json({ spec, entity });
});

// ─── Create ───────────────────────────────────────────────────────────────────

app.post('/api/ui/posts', (req: Request, res: Response) => {
  const result = UpdatePostSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const created = store.create({
    ...result.data,
    author: 'Anonymous',
    updatedAt: new Date().toISOString(),
  });
  res.status(201).json({ ok: true, data: created });
});

// ─── Update ───────────────────────────────────────────────────────────────────

app.put('/api/ui/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id ?? '';
  const result = UpdatePostSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const updated = store.update(id, {
    ...result.data,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json({ ok: true, data: updated });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

app.delete('/api/ui/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id ?? '';
  const deleted = store.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json({ ok: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Blog API running at http://localhost:${PORT}`);
  console.log(`  GET    http://localhost:${PORT}/api/ui/posts`);
  console.log(`  GET    http://localhost:${PORT}/api/ui/posts/new`);
  console.log(`  POST   http://localhost:${PORT}/api/ui/posts`);
  console.log(`  GET    http://localhost:${PORT}/api/ui/posts/1`);
  console.log(`  PUT    http://localhost:${PORT}/api/ui/posts/1`);
  console.log(`  DELETE http://localhost:${PORT}/api/ui/posts/1`);
});
