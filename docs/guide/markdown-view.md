# Markdown View

The markdown view renders a single entity's markdown field as formatted HTML. It is useful for blog posts, notes, or any rich-text content stored as markdown.

## How it works

The SPA navigates to `#/{resource}/{id}/render` and fetches a `MarkdownViewSpec` from the server:

```json
{
  "entityEndpoint": { "method": "GET", "url": "/posts/42" },
  "field": "body"
}
```

It then fetches the entity, extracts the `body` field, parses it with [marked](https://marked.js.org/), and renders the HTML.

## Setup (JS)

```typescript
import type { MarkdownViewSpec } from '@retrofit-ui/server-solid-shoelace';

app.get('/api/ui/posts/:id/render', (req, res) => {
  const spec: MarkdownViewSpec = {
    entityEndpoint: { method: 'GET', url: `/posts/${req.params.id}` },
    field: 'body',
    metadata: { title: 'Post Preview' },
  };
  res.json(retrofit(spec));
});
```

## Linking from the table

Use `rowAction` on the table spec to add a per-row "Preview" button:

```typescript
TableView.schema(PostSchema)
  .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
  .list({ method: 'GET', url: '/posts' })
  .find({ method: 'GET', url: '/posts/{id}' })
  .build();
```

`routePattern` is appended to `#/{resource}/` in the hash router. With `routePattern: '/{id}/render'`, clicking Preview on row 42 navigates to `#/posts/42/render`.

## The back button

The markdown view renders a "← Back" button automatically. It navigates to `#/{resource}/{id}` (the edit form).

## Markdown field type in forms

To let users edit the markdown source, use a `fieldOverride` to set the field type to `'markdown'`:

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .fieldOverride('body', { type: 'markdown' })
  // ...
```

This renders a taller `<sl-textarea>` with "Markdown supported" as the help text.
