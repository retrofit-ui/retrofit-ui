// Key demo: the valid values for `status` (draft/published/archived) live
// exclusively in UpdatePostSchema on the server. To add a new state such as
// 'review', change the enum here — the client form regenerates automatically
// with no frontend changes required. This is the server-driven UI principle.

import {
  retrofitUi,
  TableFormWorkflowBundle,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { PostSchema, UpdatePostSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/posts', (_req, res) => res.json(store.all()));
app.get('/posts/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/posts', (req, res) =>
  res.json(
    store.create({
      ...(req.body as object),
      author: 'Anonymous',
      updatedAt: new Date().toISOString(),
    }),
  ),
);
app.put('/posts/:id', (req, res) =>
  res.json(
    store.update(req.params.id, {
      ...(req.body as object),
      updatedAt: new Date().toISOString(),
    }),
  ),
);
app.delete('/posts/:id', (req, res) => {
  store.delete(req.params.id);
  res.json({ ok: true });
});

const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
      '--sl-color-primary-50': '#fdf4ff',
      '--sl-color-primary-100': '#fae8ff',
      '--sl-color-primary-200': '#f5d0fe',
      '--sl-color-primary-300': '#f0abfc',
      '--sl-color-primary-400': '#e879f9',
      '--sl-color-primary-500': '#d946ef',
      '--sl-color-primary-600': '#c026d3',
      '--sl-color-primary-700': '#a21caf',
      '--sl-color-primary-800': '#86198f',
      '--sl-color-primary-900': '#701a75',
      '--sl-color-primary-950': '#4a044e',
    },
    extraCss: `.retrofit-thead { background-color: #701a75; }
.retrofit-th { color: #fdf4ff; border-bottom-color: #86198f; }`,
  },
});

TableFormWorkflowBundle.schema(PostSchema)
  .updateSchema(UpdatePostSchema)
  .table((t) =>
    t
      .columnOverride('title', { sortable: true, filterable: true })
      .columnOverride('status', { filterable: true }),
  )
  .form((f) =>
    f
      .fieldOverride('body', { type: 'textarea' })
      .fieldOverride('slug', {
        helpText: 'lowercase, hyphens only',
        validation: { pattern: '^[a-z0-9-]+$' },
      })
      .fieldOverride('tags', { helpText: 'comma-separated' })
      .fieldOverride('title', { validation: { max: 200 } }),
  )
  .list({ method: 'GET', url: '/posts' })
  .find({ method: 'GET', url: '/posts/{id}' })
  .create({ method: 'POST', url: '/posts' })
  .update({ method: 'PUT', url: '/posts/{id}' })
  .delete({ method: 'DELETE', url: '/posts/{id}' })
  .build()
  .register(app, retrofit, '/api/ui/posts');

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Blog server running at http://localhost:${PORT}`);
});
