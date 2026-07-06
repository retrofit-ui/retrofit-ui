---
'@retrofit-ui/spa-solid-shoelace': minor
---

Add a drawer-based navigation to the SPA, driven by `/retrofit.json`.

`retrofit.json` gains three optional fields:

- `title` — sets the drawer header title and document title
- `nav` — list of `{ label, href, icon? }` items rendered inside the drawer. `undefined` uses a built-in default (a single "Home" link at `/`); pass `null`, `false`, or `[]` to hide the nav entirely
- The drawer is **hidden by default**. A floating hamburger button (top-left) opens it; Shoelace's built-in close button, backdrop click, or Escape key closes it again. Clicking a nav item also closes the drawer

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

The drawer overlays content (with backdrop) rather than pushing it, so the main pane never reflows on toggle. Backends that don't need a nav at all can set `nav: false` (or `nav: []`) — the SPA renders full-width with no toggle button. The active nav item is highlighted based on the current hash-router path (including nested routes like `/posts/1`).

Built on `sl-drawer` for focus trap, keyboard navigation, and ARIA plumbing.
