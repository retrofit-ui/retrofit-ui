# Tree View

The tree view renders a hierarchical structure from a flat list of records. It uses an `id`/`parentId` approach — you return all nodes as a flat array and the UI assembles the tree client-side.

<PreviewBlock>

<div style="padding: 16px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; color: var(--vp-c-text-1);">
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">▼</span>
    <span>Engineering</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0 4px 20px;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">▼</span>
    <span>Frontend</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0 4px 40px; background: var(--vp-c-brand-soft, rgba(59,130,246,0.1)); border-radius: 4px;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">◉</span>
    <span style="color: var(--vp-c-brand-1, #3b82f6); font-weight: 500;">Alice Johnson</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0 4px 40px;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">◉</span>
    <span>Bob Martinez</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0 4px 20px;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">▶</span>
    <span>Backend</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0;">
    <span style="color: var(--vp-c-text-3); font-size: 10px;">▶</span>
    <span>Design</span>
  </div>
  <div style="display: flex; gap: 8px; margin-top: 12px;">
    <button style="padding: 5px 14px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 12px; cursor: default;">Edit</button>
    <button style="padding: 5px 14px; border: 1px solid var(--vp-c-red-1, #ef4444); border-radius: 4px; background: transparent; color: var(--vp-c-red-1, #ef4444); font-size: 12px; cursor: default;">Delete</button>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
new TreeView()
  .endpoint({ method: 'GET', url: '/departments' })
  .idField('id')
  .parentField('parentId')
  .labelField('name')
  .metadata({ title: 'Department Structure' })
  .build()
```

:::

## How it works

The SPA navigates to `#/{resource}/tree` and fetches a `TreeSpec` from `GET /api/ui/{resource}/tree`. The spec describes how to fetch the flat node list and which fields to use for assembling the hierarchy.

Then the SPA fetches all nodes from `spec.endpoint` and builds the tree by matching each node's `parentField` value to another node's `idField` value. Root nodes are those with a `null` or missing parent.

## Basic setup (JS)

```typescript
import { TreeView } from '@retrofit-ui/builder-zod';

// Each row must have: id, parentId (or null for roots), name
app.get('/api/ui/departments/tree', (_req, res) => {
  res.json(
    new TreeView()
      .endpoint({ method: 'GET', url: '/departments' })
      .idField('id')
      .parentField('parentId')
      .labelField('name')
      .metadata({ title: 'Department Structure' })
      .build(),
  );
});
```

Your `/departments` endpoint returns a flat array:

```json
[
  { "id": 1, "name": "Engineering", "parentId": null },
  { "id": 2, "name": "Frontend", "parentId": 1 },
  { "id": 3, "name": "Alice Johnson", "parentId": 2 },
  { "id": 4, "name": "Bob Martinez", "parentId": 2 },
  { "id": 5, "name": "Backend", "parentId": 1 },
  { "id": 6, "name": "Design", "parentId": null }
]
```

## Spec fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `endpoint` | `EndpointDirective` | ✓ | Fetches the flat node array |
| `idField` | `string` | ✓ | Field on each node that uniquely identifies it (default: `'id'`) |
| `parentField` | `string` | ✓ | Field referencing the parent's ID; `null`/missing = root (default: `'parentId'`) |
| `labelField` | `string` | ✓ | Field to display as the node label (default: `'name'`) |
| `selection` | `'single' \| 'multiple' \| 'leaf'` | — | Selection mode (default: `'single'`) |
| `actions` | `{ create?, update?, delete? }` | — | CRUD buttons |
| `metadata.title` | `string` | — | Heading above the tree |

## Selection modes

<PreviewBlock title="Selection modes">

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px; background: var(--vp-c-bg);">
    <div style="font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 6px;"><code>'single'</code></div>
    <div style="font-size: 11px; color: var(--vp-c-text-2);">One node at a time. Edit and Delete buttons require exactly one selection.</div>
  </div>
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px; background: var(--vp-c-bg);">
    <div style="font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 6px;"><code>'multiple'</code></div>
    <div style="font-size: 11px; color: var(--vp-c-text-2);">Multiple nodes. Useful for bulk delete. Edit is disabled when more than one node is selected.</div>
  </div>
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 12px; background: var(--vp-c-bg);">
    <div style="font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 6px;"><code>'leaf'</code></div>
    <div style="font-size: 11px; color: var(--vp-c-text-2);">Only leaf nodes (no children) can be selected — enforced by the Shoelace tree component.</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
new TreeView()
  .endpoint({ method: 'GET', url: '/employees' })
  .idField('id')
  .parentField('managerId')
  .labelField('name')
  .selection('multiple')
  .build();
```

:::

## CRUD actions

Add `.create()`, `.update()`, and `.delete()` to enable action buttons:

```typescript
new TreeView()
  .endpoint({ method: 'GET', url: '/departments' })
  .idField('id')
  .parentField('parentId')
  .labelField('name')
  .create({ method: 'POST', url: '/departments' })
  .update({ method: 'PUT', url: '/departments/{id}' })
  .delete({ method: 'DELETE', url: '/departments/{id}' })
  .build();
```

| Action | Button | Behaviour |
|--------|--------|-----------|
| `create` | **New** (top-right) | Navigates to `#/{resource}/new` |
| `update` | **Edit** | Navigates to `#/{resource}/{selectedId}`; disabled when ≠ 1 item selected |
| `delete` | **Delete** | Opens a confirmation dialog, then calls the endpoint for each selected ID |

The delete action is the only one handled inline — it prompts with a confirmation dialog before calling the endpoint, then shows a success or error toast.

## Linking from a table

Use a table row action to navigate users to the tree view:

```typescript
TableView.schema(ProjectSchema)
  .rowAction({ label: 'Structure', routePattern: '/tree' })
  // note: routes to #/{resource}/tree, not per-entity
  .list({ method: 'GET', url: '/projects' })
  .build();
```
