# Event Handling

In all three adoption styles, retrofit-ui events are **declarative actions** defined in the spec. When a user clicks "Save", "Delete", or a row, the renderer reads an action from the spec and dispatches it. Most are HTTP calls — an `EndpointDirective`, a `{ method, url }` pair — which your server handles; the renderer handles success/error feedback (toast, form reset, row removal). Moving between screens is a `navigate` action whose target the server has already resolved.

```typescript
// An http action: every endpoint in a spec is one
interface EndpointDirective {
  type?: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // arrives finished, except {id} in a table's inline update/delete url
}

// Moving to another screen, e.g. { type: 'navigate', to: '#/items/42' }
interface NavigateAction {
  type: 'navigate';
  to: string;
}
```

The sections below show the same four event scenarios — **form submit (create)**, **row delete**, **row click (navigation)**, and **inline cell edit** — in each adoption style.

## Scenario comparison

### 1. Form submit — creating a new item

The spec's `endpoints.create` fires when the user submits a create form.

::: code-group

```typescript [Hosted SPA (JS server)]
// Server-side — the spec endpoint for the route #/items/new
app.get('/api/ui/items/new', (_req, res) => {
  res.json(
    formSpec(ItemSchema)
      .create({ method: 'POST', url: '/items' })
      .onDone({ type: 'navigate', to: '#/items' })
      .build(),
  );
});

// The SPA reads endpoints.create from the FormSpec and POSTs /items on submit.
// On success: shows a toast, then dispatches onDone — back to #/items.
// No frontend code needed.
```

```html [Script Islands (HTML)]
<!-- Form spec served from /api/ui/items/new -->
<div data-retrofit-src="/api/ui/items/new"></div>

<!-- The renderer fetches the FormSpec, renders the form,
     and fires POST /items on submit. Same HTTP event, no JS needed. -->
```

```tsx [SolidJS Components]
import { createResource, Show } from 'solid-js';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { Spec } from '@retrofit-ui/core';

function NewItemForm() {
  // Fetch the form spec (or build it inline)
  const [spec] = createResource(async () => {
    const res = await fetch('/api/ui/items/new');
    return res.json() as Promise<Spec>;
  });

  return (
    <Show when={spec()}>
      {(s) => <SpecRenderer spec={s()} />}
    </Show>
  );
}
// SpecRenderer reads endpoints.create from the spec and POSTs /items on submit.
// The HTTP event is the same — the difference is how the spec arrives.
```

:::

---

### 2. Row delete — removing an item

The spec's `endpoints.delete` wires a per-row delete button. `{id}` in its url is filled from the row's id field at click time — the one url the client completes from a row.

::: code-group

```typescript [Hosted SPA (JS server)]
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .list({ method: 'GET', url: '/items' })
      .delete({ method: 'DELETE', url: '/items/{id}' })
      .build(),
  );
});

// The SPA shows a delete button per row.
// On confirm: fires DELETE /items/42, then refreshes the table.
```

```html [Script Islands (HTML)]
<div data-retrofit-src="/api/ui/items"></div>

<!-- Spec must include endpoints.delete for the button to appear.
     The renderer fires DELETE /items/{id} on confirm — no JS in the page. -->
```

```tsx [SolidJS Components]
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';

const spec = {
  kind: 'table' as const,
  columns: [{ key: 'id', label: 'ID', type: 'number' as const },
            { key: 'name', label: 'Name', type: 'string' as const }],
  endpoints: {
    list:   { method: 'GET' as const,    url: '/items' },
    delete: { method: 'DELETE' as const, url: '/items/{id}' },
  },
};

<SpecRenderer spec={spec} />
// SpecRenderer fires DELETE /items/{id} on confirm, through the `http`
// action — pass `actions` to wrap it (see the bottom of this page).
```

:::

---

### 3. Row click — navigating to a form

A row is clickable when it carries a link: the server resolves each row's link and names the field holding it in `rowLinkField`. On click the renderer dispatches `{ type: 'navigate', to: <that link> }` — it never builds the link itself.

::: code-group

```typescript [Hosted SPA (JS server)]
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.forRows(ItemSchema, items)
      .rowLink((row) => `#/items/${String(row.id)}`) // enables row click
      .build(),
  );
});

// Clicking a row navigates to #/items/42. With a route
// { path: '/items/:id', spec: '/items/{id}' } in /retrofit.json, the SPA
// fetches /api/ui/items/42 (a FormSpec) and renders the edit form.
// No frontend code needed.
```

```html [Script Islands (HTML)]
<!-- Table whose rows carry links -->
<div data-retrofit-src="/api/ui/items"></div>

<!-- Row click dispatches navigate. The built-in handler sets the host page's
     location.hash (or location for a non-hash link); islands have no route
     table, so handling the new hash is the host page's job — or pass
     init({ actions: { navigate } }) to do something else. -->
```

```tsx [SolidJS Components]
import { useNavigate } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

const tableSpec: TableSpec = {
  kind: 'table',
  columns: [{ key: 'id', label: 'ID', type: 'number' }],
  rows: [{ id: { value: 42 }, link: { value: '/items/42' } }],
  rowLinkField: 'link', // enables row click
  endpoints: {},
};

// No router is required: the built-in navigate handler sets location.hash.
// To use your own router instead, handle `navigate` yourself.
function ItemsTable() {
  const navigate = useNavigate();
  return (
    <SpecRenderer
      spec={tableSpec}
      actions={{ navigate: (action) => navigate(action.to) }}
    />
  );
}
```

:::

---

### 4. Inline cell edit — updating in place

Setting `endpoints.update` and marking columns `editable: true` in the spec enables inline cell editing directly in the table row.

::: code-group

```typescript [Hosted SPA (JS server)]
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .updateSchema(ItemSchema.omit({ id: true }))
      .list({ method: 'GET', url: '/items' })
      .update({ method: 'PUT', url: '/items/{id}' })
      .build(),
  );
});

// Editable columns show an edit pencil. On save: fires PUT /items/42 with the row data.
// On success: shows a toast. No frontend code.
```

```html [Script Islands (HTML)]
<div data-retrofit-src="/api/ui/items"></div>

<!-- Spec must include endpoints.update and columns with editable:true.
     The renderer fires PUT /items/{id} on row save. No JS in the page. -->
```

```tsx [SolidJS Components]
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { TableSpec } from '@retrofit-ui/core';

const spec: TableSpec = {
  kind: 'table',
  columns: [
    { key: 'id',     label: 'ID',     type: 'number' },
    { key: 'name',   label: 'Name',   type: 'string', editable: true },
    { key: 'active', label: 'Active', type: 'boolean', editable: true },
  ],
  endpoints: {
    list:   { method: 'GET', url: '/items' },
    update: { method: 'PUT', url: '/items/{id}' },
  },
};

<SpecRenderer spec={spec} />
// PUT /items/{id} fires on row save — same HTTP contract as the other styles.
```

:::

---

## What declarative-only means in practice

Every event above reduces to a single rule: **the spec says what should happen; a handler on the client decides how**. The spec carries finished data — urls, links, `onDone` targets — so the client does no templating beyond filling `{id}` from a row for inline save and delete. Your server handles the mutation. The renderer handles feedback — toasts, row removal, form reset — based on the HTTP response, and tables and forms dispatch `refresh` after a write, which in the hosted SPA refetches the current screen's spec.

There is no `onSave` or `onDelete` prop. What you can do is replace or wrap the handler for an action type: `http` (every write a built-in view makes), `navigate` and `refresh`. If you need custom logic beyond that, have your server handle it and reflect the result back in the next spec response.

## Overriding handlers

Each style takes action handlers. A handler receives the action, its input, and `next()` — the handler further out — so it can wrap the default rather than replace it:

```tsx
<SpecRenderer
  spec={spec}
  actions={{
    http: async (action, input, next) => {
      const response = await next();
      if (response.ok) myAnalytics.track(action.method, { url: action.url });
      return response;
    },
  }}
/>
```

| Style | Where handlers go |
|-------|-------------------|
| Hosted SPA | `createShell({ actions })` in your own client entry — see [Hosted SPA](/guide/hosted-spa#keeping-the-hosted-app-with-custom-kinds) |
| Script Islands | `init({ rootElement, actions })` |
| SolidJS Components | `<SpecRenderer actions={...}>`, `createRenderer({ actions })` or `<renderer.Root actions={...}>` |

The prebuilt hosted bundle (`distPath`) has no hook for handlers: it is `createShell()` with none. See [Extending](/guide/extending#_4-actions) for custom action types.
