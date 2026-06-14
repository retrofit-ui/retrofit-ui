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

## Open question for implementor

The `defineConfig` function in `packages/server-solid-shoelace/src/config.ts` currently accepts `forms` and `resources` keys. To serve a `TreeSpec` via the adapter, a `trees` config key is likely needed. Check whether the Express adapter's routing (`GET /api/ui/:resource`) can handle a tree resource, or whether tree resources need a dedicated route pattern (e.g., `GET /api/ui/:resource/tree` served separately from `GET /api/ui/:resource`). The recommended approach is a separate `GET /api/ui/:resource/tree` endpoint so existing table resources aren't disrupted.
