# Plan: Tree view for hierarchical resources (`sl-tree`) — Issue #57

## Goal

Add a `TreeSpec` type and `TreeViewBuilder` server builder, plus a `TreeView.tsx` SPA component that fetches a flat node list, builds a tree in memory, and renders it with Shoelace's `sl-tree`/`sl-tree-item` web components. Accessible at `/:resource/tree`.

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** All view spec types live here. `TreeSpec` must be defined here so both server builders and the SPA can import it from `@retrofit-ui/core`.

Add after `MarkdownViewSpec`:

```typescript
export interface TreeSpec {
  endpoint: EndpointDirective;
  idField: string;       // e.g. 'id' — unique identifier field name
  parentField: string;   // e.g. 'parentId' — null/undefined means root
  labelField: string;    // e.g. 'name' — display string field name
  selection?: 'single' | 'multiple' | 'leaf';
  actions?: {
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
```

No `kind` discriminant is needed — the `/:resource/tree` route always expects a `TreeSpec`, so there is nothing to dispatch on. If a future change embeds tree views in `PageSpec`, a `kind: 'tree'` can be added to the `ViewSpec` union at that time.

---

### 2. `packages/server-solid-shoelace/src/tree-builder.ts` _(new file)_

**Why:** Each view type has its own fluent builder (`FormSpecBuilder`, `TableViewBuilder`). A `TreeViewBuilder` follows the same pattern.

`TreeViewBuilder` does **not** take a Zod schema — unlike `TableViewBuilder`, a tree view's shape is described by field name strings (`idField`, `parentField`, `labelField`), not a schema. The builder is schema-free.

```typescript
import type { EndpointDirective, TreeSpec } from '@retrofit-ui/core';

export class TreeViewBuilder {
  private _endpoint?: EndpointDirective;
  private _idField = 'id';
  private _parentField = 'parentId';
  private _labelField = 'name';
  private _selection?: TreeSpec['selection'];
  private _actions: NonNullable<TreeSpec['actions']> = {};
  private _metadata?: TreeSpec['metadata'];

  endpoint(directive: EndpointDirective): this {
    this._endpoint = directive;
    return this;
  }

  idField(field: string): this {
    this._idField = field;
    return this;
  }

  parentField(field: string): this {
    this._parentField = field;
    return this;
  }

  labelField(field: string): this {
    this._labelField = field;
    return this;
  }

  selection(mode: NonNullable<TreeSpec['selection']>): this {
    this._selection = mode;
    return this;
  }

  create(directive: EndpointDirective): this {
    this._actions = { ...this._actions, create: directive };
    return this;
  }

  update(directive: EndpointDirective): this {
    this._actions = { ...this._actions, update: directive };
    return this;
  }

  delete(directive: EndpointDirective): this {
    this._actions = { ...this._actions, delete: directive };
    return this;
  }

  metadata(meta: TreeSpec['metadata']): this {
    this._metadata = meta;
    return this;
  }

  build(): TreeSpec {
    if (!this._endpoint) {
      throw new Error('TreeViewBuilder: endpoint() is required');
    }
    return {
      endpoint: this._endpoint,
      idField: this._idField,
      parentField: this._parentField,
      labelField: this._labelField,
      ...(this._selection && { selection: this._selection }),
      ...(Object.keys(this._actions).length > 0 && { actions: this._actions }),
      ...(this._metadata && { metadata: this._metadata }),
    };
  }
}

export const TreeView = TreeViewBuilder;
```

Defaults: `idField='id'`, `parentField='parentId'`, `labelField='name'` — the most common convention. Callers only override when their schema differs.

---

### 3. `packages/server-solid-shoelace/src/index.ts`

**Why:** All public builder APIs are re-exported from the package index.

Add to exports:

```typescript
export { TreeView, TreeViewBuilder } from './tree-builder';
```

Also add `TreeSpec` to the type re-exports from `@retrofit-ui/core`:

```typescript
export type {
  // ... existing types ...
  TreeSpec,
} from '@retrofit-ui/core';
```

---

### 4. `packages/spa-solid-shoelace/ui/TreeView.tsx` _(new file)_

**Why:** Every view type has a dedicated SolidJS component. `TreeView` fetches the flat list from `spec.endpoint`, transforms it to a tree, and renders `sl-tree`/`sl-tree-item`.

#### Flat-to-tree transform

Extract as a pure, exportable function so it can be unit-tested independently:

```typescript
interface TreeNode {
  node: Record<string, unknown>;
  children: TreeNode[];
}

export function buildTree(
  nodes: Record<string, unknown>[],
  idField: string,
  parentField: string,
): TreeNode[] {
  const byId = new Map<unknown, TreeNode>();
  for (const node of nodes) {
    byId.set(node[idField], { node, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const treeNode of byId.values()) {
    const parentId = treeNode.node[parentField];
    if (parentId == null || !byId.has(parentId)) {
      roots.push(treeNode);
    } else {
      byId.get(parentId)!.children.push(treeNode);
    }
  }

  return roots;
}
```

Root detection: a node is a root if its `parentField` value is `null`, `undefined`, or does not match any known ID. This covers all common conventions (null FK, missing field, self-referential 0) without requiring a `rootValue` config.

No recursive cycle detection is needed at render time given the root-detection approach above: a node that is its own ancestor will be treated as a root (its parentId won't match any node that eventually reaches it in the map, since the child-assignment loop runs top-down). However, `sl-tree-item` renders lazily so pathological inputs won't stack-overflow; still, document that circular inputs are not supported.

#### Component structure

```typescript
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';

export function TreeView() { ... }
```

State signals:
- `createResource` for the `TreeSpec` (fetched from `${apiBase}/${resource}/tree`)
- `createResource` (dependent on spec) for the flat node list (fetched from `spec.endpoint.url`)
- `createSignal<unknown[]>` for selected node IDs
- `createSignal<boolean>` for delete confirmation dialog

Rendering approach:

1. Fetch `TreeSpec` from `GET ${apiBase}/${resource}/tree`
2. Fetch flat list from `spec.endpoint.url` using `spec.endpoint.method`
3. Call `buildTree(flat, spec.idField, spec.parentField)` → `TreeNode[]`
4. Render `<sl-tree selection={spec.selection ?? 'single'}>` with a recursive `TreeItem` sub-component

Recursive item renderer:

```typescript
function TreeItem(props: { treeNode: TreeNode; spec: TreeSpec }) {
  return (
    <sl-tree-item>
      {String(props.treeNode.node[props.spec.labelField] ?? '')}
      <For each={props.treeNode.children}>
        {(child) => <TreeItem treeNode={child} spec={props.spec} />}
      </For>
    </sl-tree-item>
  );
}
```

#### Selection handling

Listen to `sl-selection-change` on `<sl-tree>`. The event's `detail.selection` is an array of `sl-tree-item` elements. Map them to IDs by reading the `data-id` attribute set during render: `<sl-tree-item data-id={String(node[spec.idField])}>`.

```typescript
on:sl-selection-change={(e) => {
  const items = (e as CustomEvent<{ selection: HTMLElement[] }>).detail.selection;
  setSelectedIds(items.map((el) => el.dataset.id));
}}
```

#### Action toolbar

Shown below the tree when `spec.actions` is defined. Buttons:

- **New**: always enabled if `spec.actions.create` is present. Navigates to `/:resource/new`.
- **Edit**: enabled when exactly one node is selected and `spec.actions.update` is present. Navigates to `/:resource/:id`.
- **Delete**: enabled when one or more nodes are selected and `spec.actions.delete` is present. Opens a confirm dialog. On confirm, calls DELETE for each selected ID (sequential, not parallel, to avoid race conditions on the server). Shows a single toast on completion.

#### Loading/error states

Same pattern as `TableView` and `FormView`:
- Loading: show `<sl-skeleton effect="sheen" />` blocks
- Error: show `<p class="retrofit-error-message">Error: ...</p>`
- Empty: show `<p class="retrofit-empty">No data.</p>`

---

### 5. `packages/spa-solid-shoelace/ui/App.tsx`

**Why:** The router must know about the new route.

Add one route after the existing `/:resource` route:

```typescript
import { TreeView } from './TreeView';

// inside <HashRouter>:
<Route path="/:resource/tree" component={TreeView} />
```

Place it **before** `/:resource/:id` to avoid the router matching `tree` as an ID segment.

---

### 6. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** SolidJS JSX type-checks against `IntrinsicElements`. Without declarations, `<sl-tree>` and `<sl-tree-item>` are type errors.

Add to the `IntrinsicElements` interface:

```typescript
'sl-tree': JSX.HTMLAttributes<HTMLElement> & {
  selection?: 'single' | 'multiple' | 'leaf';
  'on:sl-selection-change'?: SlEventHandler;
  children?: JSX.Element;
};
'sl-tree-item': JSX.HTMLAttributes<HTMLElement> & {
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  lazy?: boolean;
  'data-id'?: string;
  children?: JSX.Element;
  'on:sl-expand'?: SlEventHandler;
  'on:sl-collapse'?: SlEventHandler;
};
```

---

## Implementation approach and key decisions

### Decision: schema-free builder

`TreeViewBuilder` does not accept a Zod schema. Unlike `TableViewBuilder`, which derives columns from schema shape, a tree view only needs three field name strings. Accepting a schema would add complexity with no benefit — the field names can differ arbitrarily from schema keys.

### Decision: dedicated route, not a `PageSpec` pane

`TreeSpec` is served at `/:resource/tree`, not embedded into `PageSpec`. This is consistent with how `FormSpec` is served at `/:resource/:id` — each view type gets its own route. Adding tree as a `PageSpec` pane (embedding in layouts) is a future concern and would require adding `kind: 'tree'` to the `ViewSpec` union.

### Decision: root detection by null/missing parentId

Root nodes are those with a `parentField` value of `null`, `undefined`, or a value that does not match any node's `idField`. This covers all common DB conventions:
- FK is null in SQL
- Field is absent from the JSON
- Self-referential root with `parentId = 0` when IDs are 1-based

An explicit `rootValue` config option is unnecessary and would add API surface for no gain.

### Decision: selection event via `data-id` attribute

Shoelace's `sl-selection-change` event gives back DOM elements. The cleanest way to map them back to data IDs is a `data-id` attribute on each `sl-tree-item`. This avoids maintaining a WeakMap or closure-based lookup.

### Decision: sequential deletes, single toast

When deleting multiple selected nodes, fire DELETE requests one at a time rather than `Promise.all`. Reason: tree nodes often have parent-child FK constraints — deleting a child before its parent is safer than racing. Show one toast on overall completion.

### Decision: no lazy loading

The spec's `endpoint` returns all nodes at once. Lazy loading (expanding nodes on demand) is a future optimization for very large trees. The current design is correct for trees up to a few thousand nodes.

---

## Edge cases to handle

| Case | Handling |
|------|----------|
| Empty node list | Show `<p class="retrofit-empty">No data.</p>` |
| Orphan node (parentId points to non-existent ID) | Treat as root |
| All nodes are roots (flat list) | Renders as flat `sl-tree` — valid, degenerate case |
| Single-level tree (all children of one root) | Standard case |
| Node where `labelField` is missing/null | Render empty string — no crash |
| `selection` not set in spec | Default to `'single'` |
| No `actions` in spec | No toolbar rendered |
| Edit clicked with 0 or 2+ selected nodes | Edit button disabled; guard in handler |
| Delete confirmed with network error | Show toast with error variant; do not close dialog |
| `spec.endpoint.method` is not GET | Still uses `fetch(url, { method })` — supports POST for list endpoints |
| Node IDs that are numbers vs strings | IDs stored as `unknown`, compared with `===`. `data-id` always serialises to string; the ID lookup when calling actions must coerce: `spec.endpoint.url.replace('{id}', String(selectedId))` |
| Duplicate IDs in flat list | Last one wins in the `byId` Map. Document as unsupported. |

---

## Tests to write

### Unit: `buildTree` transform

File: `packages/spa-solid-shoelace/ui/__tests__/buildTree.test.ts`

```
- flat list with no children → array of roots with empty children arrays
- one root with two children
- two-level nesting (grandchildren)
- empty array → []
- orphan node (parentId not in list) → treated as root
- node with parentId: null → root
- node with parentId: undefined → root
- all nodes have same parentId pointing to a non-existent node → all roots
```

These are pure-function tests; no SolidJS rendering required.

### Unit: `TreeViewBuilder`

File: `packages/server-solid-shoelace/src/__tests__/tree-builder.test.ts`

```
- build() throws if endpoint() not called
- build() uses idField/parentField/labelField defaults ('id', 'parentId', 'name')
- idField(), parentField(), labelField() override defaults
- selection() sets selection field
- create/update/delete() populate actions object
- actions object omitted from spec when no actions configured
- metadata() sets metadata.title
- metadata omitted from spec when not set
- fluent chaining returns same instance (this)
- build() produces a valid TreeSpec shape matching the TypeScript interface
```

### Integration: express adapter

File: `packages/server-solid-shoelace/src/__tests__/express.test.ts` _(extend existing file)_

Register a tree resource using `defineConfig` with a `tree` renderer and `TreeViewBuilder`. Test:

```
- GET /api/ui/categories returns TreeSpec JSON with correct shape
- TreeSpec includes idField, parentField, labelField, endpoint.url, endpoint.method
- GET /api/ui/categories/tree/data (the endpoint.url) returns the flat list from the list function
```

Note: the `defineConfig` API may need to support a `tree` renderer type alongside the existing `form` and `resource` types. Check `packages/server-solid-shoelace/src/types.ts` and `config.ts` during implementation — this may require adding a `trees` config key analogous to `resources`.

### No e2e tests

The project has no Playwright or Cypress config. Browser testing should be done manually via the dev server.

---

## Implementation order

1. `packages/core/src/types/resource-spec.ts` — add `TreeSpec` (unblocks everything)
2. `packages/server-solid-shoelace/src/tree-builder.ts` — new builder file
3. `packages/server-solid-shoelace/src/index.ts` — export builder and type
4. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` — add JSX types
5. `packages/spa-solid-shoelace/ui/TreeView.tsx` — new component
6. `packages/spa-solid-shoelace/ui/App.tsx` — add route
7. Write unit tests for `buildTree` and `TreeViewBuilder`
8. Extend integration tests in `express.test.ts`

Steps 2 and 4 are independent once step 1 is done and can proceed in parallel.

---

## Example: `examples/js/products` _(new example, required by issue comment)_

The issue comment explicitly requests a new `examples/js/products` example that demonstrates:

1. **Category tree view** — categories stored as a hierarchy (parent → child), browsed via `sl-tree`
2. **Category table view** — same data browsed as a flat sortable table
3. **Product table view** — products with a `categoryId` column enriched with the resolved category name
4. **Product form** — `categoryId` field rendered as a `<sl-select>` populated with live category options from the store

This example is the canonical end-to-end demo of the `TreeView` builder.

---

### Domain model

**Categories** are hierarchical. A category with `parentId: null` (or `parentId` absent) is a root category; otherwise it is a child of another category. IDs are integers.

**Products** are flat; each belongs to exactly one category via `categoryId`.

---

### Files to create

```
examples/js/products/
  package.json
  tsconfig.json
  playwright.config.ts
  src/
    schemas.ts
    store.ts
    server.ts
  e2e/
    products.spec.ts
```

---

### `src/schemas.ts`

```typescript
import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable().optional(),
});
export const CreateCategorySchema = z.object({
  name: z.string(),
  parentId: z.number().nullable().optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  categoryId: z.number(),
});
export const CreateProductSchema = z.object({
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  categoryId: z.number(),
});

export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
```

---

### `src/store.ts`

Two independent in-memory stores following the same pattern as other examples.

**Category seed** — two root categories with child subcategories:

```
Electronics (id:1, parentId:null)
  Phones     (id:3, parentId:1)
  Laptops    (id:4, parentId:1)
Clothing   (id:2, parentId:null)
  Tops       (id:5, parentId:2)
  Footwear   (id:6, parentId:2)
```

**Product seed** — four products spread across leaf categories:

```
{ id:1, name:'Galaxy S25',      sku:'GAL-S25', price:899, categoryId:3 }
{ id:2, name:'ThinkPad X1',     sku:'TP-X1',   price:1299, categoryId:4 }
{ id:3, name:'Classic T-Shirt', sku:'TS-001',  price:29,   categoryId:5 }
{ id:4, name:'Running Shoes',   sku:'RS-001',  price:89,   categoryId:6 }
```

Both stores expose `all()`, `find(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `reset()`. Category store also exposes `allAsOptions()` which returns `{ label: string; value: number }[]` for use in the product form select.

---

### `src/server.ts` — REST endpoints

```
GET    /categories          → all categories (flat list — tree built in-browser)
GET    /categories/:id      → single category
POST   /categories          → create category
PUT    /categories/:id      → update category
DELETE /categories/:id      → delete category

GET    /products            → all products
GET    /products/:id        → single product
POST   /products            → create product
PUT    /products/:id        → update product
DELETE /products/:id        → delete product

POST   /test/reset          → reset both stores (used by e2e beforeAll)
```

---

### `src/server.ts` — UI spec endpoints

**`GET /api/ui/categories/tree`** → `TreeSpec`

```typescript
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
```

**`GET /api/ui/categories`** → `TableSpec` (standard table, demonstrating same data two ways)

```typescript
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
```

**`GET /api/ui/categories/:id`** → `FormSpec`

```typescript
app.get('/api/ui/categories/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? categoryStore.find(id) : null;
  const builder = formSpec(CategorySchema, CreateCategorySchema)
    .fieldOverride('parentId', {
      type: 'select',
      label: 'Parent Category',
      placeholder: 'None (root category)',
      options: categoryStore.allAsOptions(),
    })
    .create({ method: 'POST', url: '/categories' })
    .update({ method: 'PUT', url: '/categories/{id}' })
    .delete({ method: 'DELETE', url: '/categories/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});
```

**`GET /api/ui/products`** → `TableSpec` with enriched rows

```typescript
app.get('/api/ui/products', (_req, res) => {
  // Denormalize: join categoryName so the table shows a human-readable column
  const rows = productStore.all().map((p) => ({
    ...p,
    categoryName: categoryStore.find(String(p.categoryId))?.name ?? String(p.categoryId),
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
```

**`GET /api/ui/products/:id`** → `FormSpec`

```typescript
app.get('/api/ui/products/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? productStore.find(id) : null;
  const builder = formSpec(ProductSchema, CreateProductSchema)
    .fieldOverride('categoryId', {
      type: 'select',
      label: 'Category',
      options: categoryStore.allAsOptions(),
    })
    .fieldOverride('price', { validation: { min: 0 } })
    .create({ method: 'POST', url: '/products' })
    .update({ method: 'PUT', url: '/products/{id}' })
    .delete({ method: 'DELETE', url: '/products/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});
```

---

### `package.json`

Same structure as other JS examples. Name: `@retrofit-ui-examples/products`. Port: `3005`.

---

### `playwright.config.ts`

Port `3005`, `baseURL: 'http://localhost:3005'`, `webServer.command: 'PORT=3005 pnpm dev'`.

---

### `e2e/products.spec.ts`

```
beforeAll: POST /test/reset

Category tree view (/#/categories/tree):
- renders sl-tree with root nodes "Electronics" and "Clothing"
- expanding "Electronics" reveals child nodes "Phones" and "Laptops"
- clicking a node selects it (sl-tree-item has selected state)
- Edit button is disabled when nothing selected, enabled when one node selected
- New button navigates to /#/categories/new
- clicking Edit with "Phones" selected navigates to /#/categories/3

Category table view (/#/categories):
- renders table with all 6 categories
- clicking New navigates to /#/categories/new
- clicking a row navigates to /#/categories/:id

Category form (/#/categories/new and /#/categories/:id):
- new form has parentId select with all category names as options
- can create a new root category (parentId blank)
- can create a child category by selecting a parent from the select
- can edit an existing category
- Delete button removes the category

Product table view (/#/products):
- renders table with 4 seed products
- Category column shows category name, not raw categoryId number
- clicking New navigates to /#/products/new
- clicking a row navigates to /#/products/:id

Product form (/#/products/:id):
- categoryId field renders as a select with category names
- can create a new product with a category assigned
- can edit a product's category
- price field enforces min:0
```

---

### Key demo point for the example

**Comment at top of `server.ts`:**

> _Key demo: the same hierarchical category data is served two ways — as a `TreeSpec` (browse by structure at `/#/categories/tree`) and as a `TableSpec` (browse flat at `/#/categories`). Products reference categories via a live select whose options are loaded from the category store, with no client-side coupling — add a new category on the server and it appears in the product form immediately._

---

## Resolved: adapter config for tree resources

`RetrofitConfig` in `packages/server-solid-shoelace/src/types.ts` already has `trees?: Record<string, TreeResourceConfig>`, alongside the existing `forms` and `resources` keys. `TreeResourceConfig` defines the same `list/create/update/delete` function contract as `ResourceConfig`, plus `idField/parentField/labelField/selection/metadata`.

The Express adapter routes tree resources at `GET /api/ui/:resource/tree` (separate from `GET /api/ui/:resource` used by table resources), so existing table resources are not disrupted. The `products` example uses manual Express routes rather than the adapter's `trees` config key, which is also valid and keeps the example self-contained.
