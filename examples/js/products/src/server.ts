/**
 * Key demo: the same hierarchical category data is served two ways —
 * as a TreeSpec (browse by structure at /#/categories/tree) and as a
 * TableSpec (browse flat at /#/categories). Products reference categories
 * via a live select whose options are loaded from the category store,
 * with no client-side coupling — add a new category on the server and
 * it appears in the product form immediately.
 */

import {
  crudRoutes,
  formSpec,
  type RetrofitConfig,
  route,
  TableView,
  TreeView,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
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

// Each category carries its finished UI link: the tree view's "Edit" button
// opens the selected node's `link` (see linkField below).
app.get('/categories', (_req, res) => {
  res.json(
    categoryStore.all().map((c) => ({ ...c, link: `#/categories/${c.id}` })),
  );
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

// ── Serve the SPA bundle + its config ───────────────────────────────────────
// The SPA fetches /retrofit.json for its apiBase and routes, then renders
// each route's spec from /api/ui/*. Any server in any language can serve the bundle the same way —
// see @retrofit-ui/spa-solid-shoelace.

// Route order matters: the static /categories/tree must come before
// /categories/:id (crudRoutes puts /new before /:id itself).
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  nav: [
    { label: 'Category Tree', href: '/categories/tree', icon: 'diagram-3' },
    { label: 'Categories', href: '/categories', icon: 'list' },
    { label: 'Products', href: '/products', icon: 'box' },
  ],
  routes: [
    route('/categories/tree'),
    ...crudRoutes('categories'),
    ...crudRoutes('products'),
  ],
};
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

// GET /api/ui/categories/tree → TreeSpec
app.get('/api/ui/categories/tree', (_req, res) => {
  res.json(
    new TreeView()
      .endpoint({ method: 'GET', url: '/categories' })
      .idField('id')
      .parentField('parentId')
      .labelField('name')
      .selection('single')
      .linkField('link')
      .toolbar('New', { type: 'navigate', to: '#/categories/new' })
      .delete({ method: 'DELETE', url: '/categories/{id}' })
      .metadata({ title: 'Category Tree' })
      .build(),
  );
});

// GET /api/ui/categories → TableSpec (same data, flat view)
app.get('/api/ui/categories', (_req, res) => {
  res.json(
    TableView.forRows(CategorySchema, categoryStore.all())
      .columnOverride('parentId', { label: 'Parent ID' })
      .rowLink((row) => `#/categories/${String(row.id)}`)
      .toolbar('New', { type: 'navigate', to: '#/categories/new' })
      .build(),
  );
});

// GET /api/ui/categories/new and /api/ui/categories/:id → FormSpec.
// Create and edit forms are built per request with their endpoints resolved here.
function categoryForm() {
  return formSpec(CategorySchema, CreateCategorySchema)
    .title('Category')
    .fieldOverride('parentId', {
      type: 'select',
      label: 'Parent Category',
      placeholder: 'None (root category)',
      options: categoryStore.allAsOptions().map((o) => ({
        label: o.label,
        value: String(o.value),
      })),
    })
    .onDone({ type: 'navigate', to: '#/categories' });
}

// /new must be registered before /:id so Express doesn't treat 'new' as an id
app.get('/api/ui/categories/new', (_req, res) => {
  res.json(
    categoryForm().create({ method: 'POST', url: '/categories' }).build(),
  );
});

app.get('/api/ui/categories/:id', (req, res) => {
  const entity = categoryStore.find(req.params.id);
  if (!entity) {
    res.status(404).json({ error: `No category ${req.params.id}` });
    return;
  }
  res.json(
    categoryForm()
      .edit()
      .values(entity as Record<string, unknown>)
      .params({ id: entity.id })
      .update({ method: 'PUT', url: '/categories/{id}' })
      .delete({ method: 'DELETE', url: '/categories/{id}' })
      .build(),
  );
});

// GET /api/ui/products → TableSpec with enriched categoryName column
app.get('/api/ui/products', (_req, res) => {
  const rows = productStore.all().map((p) => ({
    ...p,
    categoryName:
      categoryStore.find(String(p.categoryId))?.name ?? String(p.categoryId),
  }));
  res.json(
    TableView.forRows(
      ProductSchema.extend({ categoryName: z.string().optional() }),
      rows,
    )
      .visibleColumns(['name', 'sku', 'price', 'categoryName'])
      .columnOverride('categoryName', { label: 'Category' })
      .rowLink((row) => `#/products/${String(row.id)}`)
      .toolbar('New', { type: 'navigate', to: '#/products/new' })
      .build(),
  );
});

// GET /api/ui/products/new and /api/ui/products/:id → FormSpec
function productForm() {
  return formSpec(ProductSchema, CreateProductSchema)
    .title('Product')
    .fieldOverride('categoryId', {
      type: 'select',
      label: 'Category',
      options: categoryStore.allAsOptions().map((o) => ({
        label: o.label,
        value: String(o.value),
      })),
    })
    .fieldOverride('price', { validation: { min: 0 } })
    .onDone({ type: 'navigate', to: '#/products' });
}

app.get('/api/ui/products/new', (_req, res) => {
  res.json(productForm().create({ method: 'POST', url: '/products' }).build());
});

app.get('/api/ui/products/:id', (req, res) => {
  const entity = productStore.find(req.params.id);
  if (!entity) {
    res.status(404).json({ error: `No product ${req.params.id}` });
    return;
  }
  res.json(
    productForm()
      .edit()
      .values(entity as Record<string, unknown>)
      .params({ id: entity.id })
      .update({ method: 'PUT', url: '/products/{id}' })
      .delete({ method: 'DELETE', url: '/products/{id}' })
      .build(),
  );
});

const PORT = process.env.PORT ?? 3005;
app.listen(PORT, () => {
  console.log(`Products server running at http://localhost:${PORT}`);
});
