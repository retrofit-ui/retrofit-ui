# Event Handling

In all three adoption styles, retrofit-ui events are **declarative HTTP calls** defined in the spec. When a user clicks "Save", "Delete", or a row, the renderer reads an `EndpointDirective` from the spec — a `{ method, url }` pair — and fires that HTTP request. Your server handles the mutation; the renderer handles success/error feedback (toast, form reset, row removal).

```typescript
// The only supported event contract today
interface EndpointDirective {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // {id} is substituted from the row or route param
}
```

The sections below show the same four event scenarios — **form submit (create)**, **row delete**, **row click (navigation)**, and **inline cell edit** — in each adoption style.

## Scenario comparison

### 1. Form submit — creating a new item

The spec's `endpoints.create` fires when the user submits the "New" form.

::: code-group

```typescript [Hosted SPA (JS server)]
// Server-side — spec endpoint
app.get('/api/ui/items/new', (_req, res) => {
  res.json(
    FormView.schema(ItemSchema)
      .create({ method: 'POST', url: '/items' })
      .build(),
  );
});

// The SPA reads endpoints.create from the FormSpec and POSTs /items on submit.
// On success: shows a toast and navigates back to #/items.
// No frontend code needed.
```

```html [Script Islands (HTML)]
<!-- Form spec served from /api/ui/items/new -->
<div data-retrofit-src="/api/ui/items/new"></div>

<!-- The renderer fetches the FormSpec, renders the form,
     and fires POST /items on submit. Same HTTP event, no JS needed. -->
```

```tsx [SolidJS Components]
import { createResource } from 'solid-js';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import type { RootSpec } from '@retrofit-ui/core';

function NewItemForm() {
  // Fetch the form spec (or build it inline)
  const [spec] = createResource(async () => {
    const res = await fetch('/api/ui/items/new');
    return res.json() as Promise<RootSpec>;
  });

  return (
    <Show when={spec()}>
      {(s) => <SpecRenderer spec={s()} apiBase="/api/ui" />}
    </Show>
  );
}
// SpecRenderer reads endpoints.create from the spec and POSTs /items on submit.
// The HTTP event is the same — the difference is how the spec arrives.
```

:::

---

### 2. Row delete — removing an item

The spec's `endpoints.delete` wires a per-row delete button. The URL pattern `{id}` is substituted at click time.

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
// On confirm: fires DELETE /items/42, removes the row from the UI.
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

<SpecRenderer spec={spec} apiBase="/api/ui" />
// SpecRenderer fires DELETE /items/{id} on confirm.
// Callback hooks (onDelete, onSuccess) are not available today —
// see the note at the bottom of this page.
```

:::

---

### 3. Row click — navigating to a form

Setting `endpoints.find` on a `TableSpec` makes rows clickable. The renderer navigates to the item's form on click.

::: code-group

```typescript [Hosted SPA (JS server)]
app.get('/api/ui/items', (_req, res) => {
  res.json(
    TableView.schema(ItemSchema)
      .list({ method: 'GET', url: '/items' })
      .find({ method: 'GET', url: '/items/{id}' })  // enables row click
      .build(),
  );
});

// Clicking a row navigates to #/items/42.
// The SPA fetches /api/ui/items/42 (a FormSpec) and renders the edit form.
// No frontend code needed.
```

```html [Script Islands (HTML)]
<!-- Table with find enabled -->
<div data-retrofit-src="/api/ui/items"></div>

<!-- Row click navigates to #/items/{id} within the island.
     The island manages its own navigation internally — the host page URL
     does not change. -->
```

```tsx [SolidJS Components]
import { HashRouter, Route, useNavigate } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';

const tableSpec = {
  kind: 'table' as const,
  columns: [{ key: 'id', label: 'ID', type: 'number' as const }],
  endpoints: {
    list: { method: 'GET' as const, url: '/items' },
    find: { method: 'GET' as const, url: '/items/{id}' }, // enables row click
  },
};

// find is set → router context required; rows navigate on click
function ItemsApp() {
  return (
    <HashRouter>
      <Route path="/" component={() =>
        <SpecRenderer spec={tableSpec} apiBase="/api/ui" />
      } />
      <Route path="/:id" component={() => {
        // Your own form, or another SpecRenderer pointing at the FormSpec
        return <SpecRenderer spec={/* fetch formSpec */} apiBase="/api/ui" />;
      }} />
    </HashRouter>
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

<SpecRenderer spec={spec} apiBase="/api/ui" />
// PUT /items/{id} fires on row save — same HTTP contract as the other styles.
```

:::

---

## What's declarative-only means in practice

Every event above reduces to a single rule: **the spec says which HTTP endpoint to call; the renderer calls it**. Your server handles the mutation. The renderer handles feedback — toasts, row removal, form reset — based on the HTTP response.

There is no callback prop, no `onSave`, no `onDelete`. You cannot intercept the HTTP call or run custom logic in the browser when an event fires. If you need that, you need your server to handle it and reflect the result back in the next spec response.

## The SolidJS Components path toward callbacks

The SolidJS Components style is the only one where callback props are architecturally natural. Because `SpecRenderer` is a real SolidJS component receiving props, a future `onAction` prop would fit cleanly:

```tsx
// Hypothetical future API — not implemented today
<SpecRenderer
  spec={spec}
  apiBase="/api/ui"
  onAction={(event) => {
    // event: { type: 'create' | 'update' | 'delete', id?: string, payload?: unknown }
    myAnalytics.track(event.type, { resource: 'items', id: event.id });
  }}
/>
```

In the Hosted SPA and Script Islands styles, there is no JSX boundary where such a prop could be passed — the renderer is fully self-contained. If event interception matters for your use case today, the SolidJS Components style is the right adoption path.
