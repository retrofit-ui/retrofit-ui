// Key demo: the valid values for `status` (draft/published/archived) live
// exclusively in UpdatePostSchema on the server. To add a new state such as
// 'review', change the enum here — the client form regenerates automatically
// with no frontend changes required. This is the server-driven UI principle.

import { formSpec, TableView } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import type { Post, Review } from './schemas';
import { ReviewSchema, UpdateReviewSchema } from './schemas';
import {
  blogTheme,
  buildPostFormSpec,
  buildPostRenderSpec,
  buildPostsByStatusSpec,
  buildPostsTableSpec,
  buildPostTimelineSpec,
} from './specs';
import { store } from './store';

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

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme: blogTheme }),
);
app.use(express.static(distPath));

app.get('/api/ui/posts', (_req, res) => {
  res.json(buildPostsTableSpec(store.all() as Post[]));
});

app.get('/api/ui/posts/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? (store.find(id) as Post | null) : null;
  res.json(buildPostFormSpec(entity));
});

app.get('/api/ui/posts/:id/render', (req, res) => {
  const post = store.find(req.params.id) as Post | undefined;
  if (!post) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(buildPostRenderSpec(post));
});

app.get('/api/ui/posts/:id/timeline', (req, res) => {
  const post = store.find(req.params.id) as Post | undefined;
  if (!post) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(buildPostTimelineSpec(post));
});

app.get('/api/ui/posts-by-status', (_req, res) =>
  res.json(buildPostsByStatusSpec()),
);

// ── Reviews (used by the custom-view example, not the blog docs demo) ────────

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
    TableView.forRows(ReviewSchema, reviews)
      .find({ method: 'GET', url: '/reviews/{id}' })
      .create({ method: 'POST', url: '/reviews' })
      .build(),
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
  res.json(builder.build());
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Blog server running at http://localhost:${PORT}`);
});
