# Tree View

The tree view (`kind: 'tree'`) shows a hierarchy. The endpoint returns a flat list of nodes, and the client builds the tree from an id field and a parent field.

::: details Spec

```json
{
  "kind": "tree",
  "endpoint": { "method": "GET", "url": "/departments" },
  "idField": "id",
  "parentField": "parentId",
  "labelField": "name",
  "linkField": "link",
  "toolbar": [{ "label": "New", "action": { "type": "navigate", "to": "#/departments/new" } }],
  "selection": "single",
  "metadata": { "title": "Department Structure" }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `endpoint` | `{ method, url }` | yes | Returns the flat node array (`ListRow[]`). |
| `idField` | `string` | yes | Field that identifies a node. |
| `parentField` | `string` | yes | Field with the parent's id. |
| `labelField` | `string` | yes | Field shown as the node label. |
| `linkField` | `string` | no | Field with the node's finished link. Adds an **Edit** button. |
| `toolbar` | `{ label, action, variant? }[]` | no | Buttons above the tree. `variant` is `primary` (default) or `default`. |
| `selection` | `'single' \| 'multiple' \| 'leaf'` | no | Default `single`. `leaf` lets the user select only leaf nodes. |
| `metadata.title` | `string` | no | Heading above the tree. |

There is no `actions` field on the spec. Writes belong to the nodes.

## Nodes

`endpoint` returns a raw array. The client loads it through the `http` action:

```json
[
  { "id": 1, "name": "Engineering", "parentId": null, "link": "#/departments/1",
    "_actions": { "delete": { "method": "DELETE", "url": "/departments/1" } } },
  { "id": 2, "name": "Frontend", "parentId": 1, "link": "#/departments/2",
    "_actions": { "delete": { "method": "DELETE", "url": "/departments/2" } } }
]
```

- A node is a **root** when its `parentField` is `null`, missing, or names an id that is not in the list. A node with a missing parent (an orphan) is shown at the top level, not hidden.
- Each node may carry `_actions.delete`, a finished HTTP action. Only `delete` is used by the tree. A node with no `_actions.delete` cannot be deleted.
- A spec with no nodes shows "No data.".

## Buttons

| Button | Shows when | Behavior |
|--------|------------|----------|
| Toolbar buttons | `toolbar` is set | Dispatch their action, for example a `navigate` to a create form. |
| **Edit** | `linkField` is set | Enabled when exactly one node with a link is selected. Navigates to that node's link. |
| **Delete** | At least one node has `_actions.delete` | Enabled when any node is selected. A dialog asks to confirm. |

Delete sends each selected node's own `delete` action, one after the other, with no body. It does not stop at the first failure: it tries every selected node. Then it shows one toast per problem class:

- nodes that failed, with their ids (error toast);
- nodes with no `delete` action, with their ids (warning toast);
- a success toast, only if there were no failures and no skipped nodes.

The selection clears. If at least one node was deleted, the client reloads the tree and dispatches `refresh`. The client does not delete a node's children. If the server should delete them, the server must do it.

## Building the spec

```typescript
import { TreeView, withRowActions } from '@retrofit-ui/builder-zod';

app.get('/api/ui/departments/tree', (_req, res) => {
  res.json(
    new TreeView()
      .endpoint({ method: 'GET', url: '/departments' })
      .idField('id')
      .parentField('parentId')
      .labelField('name')
      .linkField('link')
      .selection('multiple')
      .toolbar('New', { type: 'navigate', to: '#/departments/new' })
      .metadata({ title: 'Department Structure' })
      .build(),
  );
});

// The node endpoint adds each node's link and its finished delete.
app.get('/departments', (_req, res) => {
  const nodes = store.all().map((d) => ({ ...d, link: `#/departments/${d.id}` }));
  res.json(withRowActions(nodes, { delete: { method: 'DELETE', url: '/departments/{id}' } }));
});
```

The builder defaults are `idField: 'id'`, `parentField: 'parentId'` and `labelField: 'name'`. `endpoint()` is required: `build()` throws without it. The builder has no `delete()` method, because the builder never sees the nodes. Use `withRowActions` in the node endpoint, as above.

To open a tree from a table, use a toolbar button or a row action. See [Table view](/guide/table-view#row-links-and-row-actions).
