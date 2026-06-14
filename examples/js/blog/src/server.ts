// Key demo: the valid values for `status` (draft/published/archived) live
// exclusively in UpdatePostSchema on the server. To add a new state such as
// 'review', change the enum here — the client form regenerates automatically
// with no frontend changes required. This is the server-driven UI principle.

import {
  filterForm,
  formSpec,
  type MarkdownViewSpec,
  pageSpec,
  retrofitUi,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import type { Review } from './schemas';
import {
  PostSchema,
  ReviewSchema,
  UpdatePostSchema,
  UpdateReviewSchema,
} from './schemas';
import { store } from './store';

const AUTHORS = [
  { id: 'alice', name: 'Alice Smith' },
  { id: 'bob', name: 'Bob Jones' },
  { id: 'carol', name: 'Carol White' },
];

const app = express();
app.use(express.json());

app.get('/posts', (req, res) => {
  const status = req.query.status as string | undefined;
  res.json(status ? store.byStatus(status) : store.all());
});
app.get('/posts/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/posts', (req, res) =>
  res.json(
    store.create({
      ...(req.body as object),
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
app.post('/test/reset', (_req, res) => {
  store.reset();
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

// Table view — rows embedded; click row to edit, Preview button to render
app.get('/api/ui/posts', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(PostSchema, store.all())
        .columnOverride('title', { sortable: true })
        .columnOverride('status', { filterable: true })
        .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
        .find({ method: 'GET', url: '/posts/{id}' })
        .create({ method: 'POST', url: '/posts' })
        .build(),
    ),
  );
});

// Form view — handles new (/api/ui/posts/new) and edit (/api/ui/posts/:id)
// Express ':id' matches 'new' too, so one handler covers both
app.get('/api/ui/posts/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? store.find(id) : null;
  const builder = formSpec(PostSchema, UpdatePostSchema)
    .fieldOverride('body', { type: 'markdown' })
    .fieldOverride('slug', {
      helpText: 'lowercase, hyphens only',
      validation: { pattern: '^[a-z0-9-]+$' },
    })
    .fieldOverride('tags', { type: 'tags' })
    .fieldOverride('title', { validation: { max: 200 } })
    .fieldOverride('author', {
      type: 'select',
      label: 'Author',
      options: AUTHORS.map((a) => ({ label: a.name, value: a.id })),
    })
    .fieldOverride('status', { type: 'radio-group' })
    .create({ method: 'POST', url: '/posts' })
    .update({ method: 'PUT', url: '/posts/{id}' })
    .delete({ method: 'DELETE', url: '/posts/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});

// Markdown render spec — 3 path segments, won't conflict with /:id above
app.get('/api/ui/posts/:id/render', (_req, res) => {
  res.json(
    retrofit({
      entityEndpoint: { method: 'GET', url: '/posts/{id}' },
      field: 'body',
      metadata: { title: 'Preview' },
    } satisfies MarkdownViewSpec),
  );
});

// Stacked layout: status filter + posts table — navigate to /#/posts-by-status
app.get('/api/ui/posts-by-status', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Posts by Status')
        .filterForm(
          filterForm()
            .field('status', {
              type: 'select',
              label: 'Status',
              placeholder: 'All Statuses',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
            })
            .build(),
        )
        .table(
          TableView.schema(PostSchema)
            .visibleColumns(['title', 'author', 'status', 'updatedAt'])
            .list({ method: 'GET', url: '/posts?status={status}' })
            .build(),
        )
        .build(),
    ),
  );
});

// In-memory reviews store
let reviewNextId = 1;
const reviews: Review[] = [];

app.get('/reviews', (_req, res) => res.json(reviews));
app.get('/reviews/:id', (req, res) => {
  const review = reviews.find((r) => r.id === Number(req.params.id));
  if (!review) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(review);
});
app.post('/reviews', (req, res) => {
  const review = { ...(req.body as Omit<Review, 'id'>), id: reviewNextId++ };
  reviews.push(review);
  res.status(201).json(review);
});
app.put('/reviews/:id', (req, res) => {
  const idx = reviews.findIndex((r) => r.id === Number(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  reviews[idx] = {
    ...(reviews[idx] as Review),
    ...(req.body as Partial<Review>),
  };
  res.json(reviews[idx]);
});
app.delete('/reviews/:id', (req, res) => {
  const idx = reviews.findIndex((r) => r.id === Number(req.params.id));
  if (idx !== -1) reviews.splice(idx, 1);
  res.json({ ok: true });
});
app.post('/test/reset-reviews', (_req, res) => {
  reviews.length = 0;
  reviewNextId = 1;
  res.json({ ok: true });
});

app.get('/api/ui/reviews', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(ReviewSchema, reviews)
        .find({ method: 'GET', url: '/reviews/{id}' })
        .create({ method: 'POST', url: '/reviews' })
        .build(),
    ),
  );
});

app.get('/api/ui/reviews/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? reviews.find((r) => r.id === Number(id)) : null;
  const builder = formSpec(ReviewSchema, UpdateReviewSchema)
    .fieldOverride('body', { type: 'textarea' })
    .fieldOverride('rating', { type: 'rating', ratingMax: 5 })
    .create({ method: 'POST', url: '/reviews' })
    .update({ method: 'PUT', url: '/reviews/{id}' })
    .delete({ method: 'DELETE', url: '/reviews/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Blog server running at http://localhost:${PORT}`);
});
