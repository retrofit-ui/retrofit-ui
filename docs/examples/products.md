# Products Example

**Pattern: one hierarchy served as a `tree` and as a `table`, with live `select` options**

Categories form a tree. The same data shows as a `tree` view and as a flat `table`. Product forms load their category options from the server.

Run it locally (serves on port 3005, or `PORT`):

```bash
just example products
# or: pnpm --filter @retrofit-ui-examples/products dev
```

## What it demonstrates

- `tree` built with `TreeView`: `idField`, `parentField`, `labelField`, `selection` and `linkField`
- `withRowActions` on fetched tree nodes: each node carries its own `link` and delete action
- `select` options built from a store, so a new category shows in the product form at once
- `columnOverride` labels and an enriched column (`categoryName`) joined on the server

## Routes

From `src/server.ts`:

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/categories/tree` | `/api/ui/categories/tree` | `tree` |
| `/categories` | `/api/ui/categories` | `table` |
| `/categories/new`, `/categories/:id` | `/api/ui/categories/...` | `form` |
| `/products` | `/api/ui/products` | `table` |
| `/products/new`, `/products/:id` | `/api/ui/products/...` | `form` |

`/categories/tree` comes before `crudRoutes('categories')`, so "tree" is never read as an id.

## The tree

```typescript
new TreeView()
  .endpoint({ method: 'GET', url: '/categories' })
  .idField('id')
  .parentField('parentId')
  .labelField('name')
  .selection('single')
  .linkField('link')
  .toolbar('New', { type: 'navigate', to: '#/categories/new' })
  .metadata({ title: 'Category Tree' })
  .build();
```

The tree fetches `GET /categories`. Each node carries a finished `link` and `_actions.delete`:

```typescript
withRowActions(
  categoryStore.all().map((c) => ({ ...c, link: `#/categories/${c.id}` })),
  { delete: { method: 'DELETE', url: '/categories/{id}' } },
);
```

## Live options in a form

```typescript
formSpec(ProductSchema, CreateProductSchema)
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
```

The server builds this form on each request, so the options always match the store.
