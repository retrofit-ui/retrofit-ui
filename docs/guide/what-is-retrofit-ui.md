# What is retrofit-ui?

retrofit-ui is a framework for **declarative, server-driven UI**. Your server describes a piece of UI as JSON — a table, a form, a timeline — and the browser renders it, with no frontend code required. You declare the components on the backend, often straight from your existing Zod (JS) or Java schemas.

Admin and internal tools are the obvious fit, but they're just one use case: anything you can describe declaratively is fair game.

## The problem it solves

Every time you add a field to a database table, you repeat the same work in three places: the backend model, the API response, and the frontend that displays it. When that UI lives in a separate frontend codebase, the third step lags behind or gets skipped entirely.

retrofit-ui eliminates the third step — the server that owns the data also describes the UI.

## How it works

Instead of the browser knowing how to render your data, the **server describes the UI as JSON**. The browser's SPA reads that description and renders the appropriate component.

<figure class="img-placeholder">
  <span class="img-placeholder__label">Image placeholder · request flow</span>
  <p class="img-placeholder__brief"><strong>A sequence diagram, Browser ↔ Server.</strong> Three labelled round-trips stacked top to bottom: (1) <code>GET /retrofit-ui</code> → returns the SPA static bundle ("served once"); (2) <code>GET /api/ui/todos</code> → returns <strong>TableSpec JSON</strong> (<code>{ columns, endpoints }</code>), annotated "SPA renders the table shell"; (3) <code>GET /todos</code> → returns the row array <code>[{ id, title, … }]</code>, annotated "SPA fills the rows." Emphasise that only the spec + data change over time — the bundle is static. Light + dark variants.</p>
</figure>

The SPA itself never changes. When you add a column to your schema, the `TableSpec` JSON changes, and the browser renders the new column automatically on the next load.

## The spec types

Three JSON specs drive three view types:

| Spec | Served at | Renders |
|------|-----------|---------|
| `TableSpec` | `GET /api/ui/{resource}` | A data table with optional inline editing |
| `FormSpec` | `GET /api/ui/{resource}/{id}` | A create/edit/delete form |
| `MarkdownViewSpec` | `GET /api/ui/{resource}/{id}/render` | A rendered markdown document |

All three are plain JSON. Any server — Node.js, Java, Go, Python — can produce them.

## The `/retrofit.json` handshake

When the SPA first loads, it fetches `/retrofit.json` from the same origin:

```json
{ "apiBase": "/api/ui", "theme": "light" }
```

This tells the SPA where your spec endpoints live and which Shoelace theme to apply. retrofit-ui's server helpers write this endpoint automatically.

## Server-driven advantages

**Enum options come from the server.** If your `status` field is `z.enum(['draft', 'published'])`, the form renders a `<select>` with those options. Add `'archived'` to the enum and it appears in the form on the next request — no frontend change, no redeploy.

**Validation rules come from the server.** A `min: 3` on a description field is expressed in the `FormSpec`. The SPA enforces it. Change it on the server, the browser enforces the new rule immediately.

**Fields hidden from users are controlled server-side.** Fields in the full schema but absent from the `updateSchema` render as read-only. The server decides what users can edit.

## What retrofit-ui is not

- It is not a general-purpose web app framework for hand-authored, pixel-perfect marketing pages. It renders declarative components your server describes — CRUD tools being the most common.
- It does not generate code. The SPA is a pre-built bundle you serve as static assets.
- It does not replace your REST API. Your existing endpoints stay unchanged; the spec endpoints sit alongside them.
