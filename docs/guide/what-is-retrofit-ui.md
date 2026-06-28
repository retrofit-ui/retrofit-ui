# What is retrofit-ui?

retrofit-ui is a server-driven admin UI framework. You define your data schemas on the server — using Zod (JS) or plain Java — and retrofit-ui renders a full-featured admin interface in the browser with no frontend code required.

## The problem it solves

Every time you add a field to a database table, you repeat the same work in three places: the backend model, the API response, and the frontend form. If the admin UI is separate from the main app, that frontend step often lags behind or gets skipped entirely.

retrofit-ui eliminates the third step.

## How it works

Instead of the browser knowing how to render your data, the **server describes the UI as JSON**. The browser's SPA reads that description and renders the appropriate component.

```text
Browser ──GET /retrofit-ui──────────────► SPA (static assets, served once)
   │
   ├── GET /api/ui/todos ──────────────► TableSpec JSON
   │                                      { columns: [...], endpoints: {...} }
   │                                              │
   │                                              └──► SPA renders <table>
   │
   └── GET /todos ─────────────────────► [{ id:1, title:"Buy milk", ... }]
                                                  │
                                                  └──► SPA fills table rows
```

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

- It is not a general-purpose UI framework. It renders admin-style CRUD interfaces.
- It does not generate code. The SPA is a pre-built bundle you serve as static assets.
- It does not replace your REST API. Your existing endpoints stay unchanged; the spec endpoints sit alongside them.
