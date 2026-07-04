---
'@retrofit-ui/spa-solid-shoelace': minor
---

Add dashboard shell + left-nav to the SPA, driven by `/retrofit.json`.

`retrofit.json` gains two optional fields:

- `title` — sets the sidebar brand and document title
- `nav` — array of `{ label, href, icon? }` items rendered as a left sidebar

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

When `nav` is omitted the SPA renders full-width with no sidebar, preserving prior behaviour. The active nav item is highlighted based on the current hash-router path (including nested routes like `/posts/1`). `href` values are hash-router paths — the SPA prepends `#` if you don't.
