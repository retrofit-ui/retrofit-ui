# Markdown View

The markdown view renders a single entity's markdown field as formatted HTML. It is useful for blog posts, notes, or any rich-text content stored as markdown.

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg); font-family: var(--vp-font-family-base, system-ui, sans-serif);">
  <button style="background: none; border: none; font-size: 12px; color: var(--vp-c-text-3); cursor: default; padding: 0; margin-bottom: 12px;">← Back</button>
  <div style="max-width: 640px; line-height: 1.7; color: var(--vp-c-text-1);">
    <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px; color: var(--vp-c-text-1);">Getting Started with Vite</h1>
    <p style="margin: 0 0 14px; font-size: 14px; color: var(--vp-c-text-2);">Vite is a next-generation frontend build tool that dramatically improves the development experience.</p>
    <h2 style="font-size: 16px; font-weight: 600; margin: 20px 0 8px; color: var(--vp-c-text-1);">Why Vite?</h2>
    <p style="margin: 0 0 14px; font-size: 14px; color: var(--vp-c-text-2);">Traditional bundlers process your entire codebase before serving. Vite serves source files over native <code style="background: var(--vp-c-bg-soft); padding: 1px 5px; border-radius: 3px; font-size: 13px;">ESM</code>, making cold starts near-instant.</p>
    <p style="margin: 0; font-size: 14px; color: var(--vp-c-text-2);">To create a new project, run:</p>
    <pre style="background: var(--vp-c-bg-soft); padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto; margin: 10px 0 0;"><code>npm create vite@latest my-app</code></pre>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
const spec: MarkdownViewSpec = {
  entityEndpoint: { method: 'GET', url: '/posts/{id}' },
  field: 'body',
  metadata: { title: 'Post Preview' },
};
```

:::

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
import type { MarkdownViewSpec } from '@retrofit-ui/builder-zod';

// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/pages/posts/:id/render', (req, res) => {
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
