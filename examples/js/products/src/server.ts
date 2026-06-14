/**
 * Key demo: the same hierarchical category data is served two ways —
 * as a TreeSpec (browse by structure at /#/categories/tree) and as a
 * TableSpec (browse flat at /#/categories). Products reference categories
 * via a live select whose options are loaded from the category store,
 * with no client-side coupling — add a new category on the server and
 * it appears in the product form immediately.
 */

import {
  formSpec,
  retrofitUi,
  TableView,
  TreeView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { z } from 'zod';
import {
  CategorySchema,
  CreateCategorySchema,
  CreateProductSchema,
  ProductSchema,
} from './schemas';
import { categoryStore, productStore } from './store';

const app = express();
app.use(express.json());

// ── Category REST endpoints ─────────────────────────────────────────────────

app.get('/categories', (_req, res) => {
  res.json(categoryStore.all());
});
app.get('/categories/:id', (req, res) => {
  res.json(categoryStore.find(req.params.id));
});
app.post('/categories', (req, res) => {
  res.json(categoryStore.create(req.body));
});
app.put('/categories/:id', (req, res) => {
  res.json(categoryStore.update(req.params.id, req.body));
});
app.delete('/categories/:id', (req, res) => {
  categoryStore.delete(req.params.id);
  res.json({ ok: true });
});

// ── Product REST endpoints ──────────────────────────────────────────────────

app.get('/products', (_req, res) => {
  res.json(productStore.all());
});
app.get('/products/:id', (req, res) => {
  res.json(productStore.find(req.params.id));
});
app.post('/products', (req, res) => {
  res.json(productStore.create(req.body));
});
app.put('/products/:id', (req, res) => {
  res.json(productStore.update(req.params.id, req.body));
});
app.delete('/products/:id', (req, res) => {
  productStore.delete(req.params.id);
  res.json({ ok: true });
});

// ── Test reset endpoint (used by e2e beforeAll) ────────────────────────────

app.post('/test/reset', (_req, res) => {
  categoryStore.reset();
  productStore.reset();
  res.json({ ok: true });
});

// ── UI spec setup ──────────────────────────────────────────────────────────

const retrofit = retrofitUi(app);

// GET /api/ui/categories/tree → TreeSpec
app.get('/api/ui/categories/tree', (_req, res) => {
  res.json(
    retrofit(
      new TreeView()
        .endpoint({ method: 'GET', url: '/categories' })
        .idField('id')
        .parentField('parentId')
        .labelField('name')
        .selection('single')
        .create({ method: 'POST', url: '/categories' })
        .update({ method: 'PUT', url: '/categories/{id}' })
        .delete({ method: 'DELETE', url: '/categories/{id}' })
        .metadata({ title: 'Category Tree' })
        .build(),
    ),
  );
});

// GET /api/ui/categories → TableSpec (same data, flat view)
app.get('/api/ui/categories', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(CategorySchema, categoryStore.all())
        .columnOverride('parentId', { label: 'Parent ID' })
        .find({ method: 'GET', url: '/categories/{id}' })
        .create({ method: 'POST', url: '/categories' })
        .build(),
    ),
  );
});

// GET /api/ui/categories/:id → FormSpec
app.get('/api/ui/categories/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? categoryStore.find(id) : null;
  const builder = formSpec(CategorySchema, CreateCategorySchema)
    .fieldOverride('parentId', {
      type: 'select',
      label: 'Parent Category',
      placeholder: 'None (root category)',
      options: categoryStore.allAsOptions().map((o) => ({
        label: o.label,
        value: String(o.value),
      })),
    })
    .create({ method: 'POST', url: '/categories' })
    .update({ method: 'PUT', url: '/categories/{id}' })
    .delete({ method: 'DELETE', url: '/categories/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});

// GET /api/ui/products → TableSpec with enriched categoryName column
app.get('/api/ui/products', (_req, res) => {
  const rows = productStore.all().map((p) => ({
    ...p,
    categoryName:
      categoryStore.find(String(p.categoryId))?.name ?? String(p.categoryId),
  }));
  res.json(
    retrofit(
      TableView.forRows(
        ProductSchema.extend({ categoryName: z.string().optional() }),
        rows,
      )
        .visibleColumns(['name', 'sku', 'price', 'categoryName'])
        .columnOverride('categoryName', { label: 'Category' })
        .find({ method: 'GET', url: '/products/{id}' })
        .create({ method: 'POST', url: '/products' })
        .build(),
    ),
  );
});

// GET /api/ui/products/:id → FormSpec
app.get('/api/ui/products/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? productStore.find(id) : null;
  const builder = formSpec(ProductSchema, CreateProductSchema)
    .fieldOverride('categoryId', {
      type: 'select',
      label: 'Category',
      options: categoryStore.allAsOptions().map((o) => ({
        label: o.label,
        value: String(o.value),
      })),
    })
    .fieldOverride('price', { validation: { min: 0 } })
    .create({ method: 'POST', url: '/products' })
    .update({ method: 'PUT', url: '/products/{id}' })
    .delete({ method: 'DELETE', url: '/products/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});

const PORT = process.env.PORT ?? 3005;
app.listen(PORT, () => {
  console.log(`Products server running at http://localhost:${PORT}`);
});
