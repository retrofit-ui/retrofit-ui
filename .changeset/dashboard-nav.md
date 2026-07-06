---
'@retrofit-ui/spa-solid-shoelace': minor
---

Add a collapsible dashboard shell to the SPA, driven by `/retrofit.json`.

`retrofit.json` gains three optional fields:

- `title` — sets the sidebar brand and document title
- `nav` — list of `{ label, href, icon? }` items rendered as a left sidebar. `undefined` uses a built-in default (a single "Home" link at `/`); pass `null`, `false`, or `[]` to hide the sidebar entirely
- The sidebar is **collapsed by default**. A floating hamburger button opens it; a chevron inside the header collapses it again. State persists in `localStorage` under `retrofit-ui:nav-open`

Example server config:

```ts
app.get('/retrofit.json', (_req, res) =>
  res.json({
    apiBase: '/api/ui',
    title: 'Blog Admin',
    theme: blogTheme,
    nav: [
      { label: 'Posts', href: '/posts', icon: 'file-text' },
      { label: 'Reviews', href: '/reviews', icon: 'star' },
    ],
  }),
);
```

Backends that don't need a nav at all can set `nav: false` (or `nav: []`) — the SPA renders full-width with no sidebar and no toggle button. The active nav item is highlighted based on the current hash-router path (including nested routes like `/posts/1`).
