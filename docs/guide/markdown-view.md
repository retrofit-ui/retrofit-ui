# Markdown View

The markdown view (`kind: 'markdown'`) turns a markdown string into formatted HTML. The producer embeds the markdown in the spec, for example one record's text field. The view makes no request.

::: details Spec

```json
{
  "kind": "markdown",
  "content": "# Getting Started\n\nVite is a **fast** build tool.",
  "metadata": {
    "title": "Post Preview",
    "back": { "type": "navigate", "to": "#/posts/42" }
  }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `content` | `string` | yes | The markdown source. |
| `metadata.title` | `string` | no | Heading above the content. |
| `metadata.back` | action | no | Adds a "Back" button that dispatches this action, for example a `navigate`. Without it, there is no button. |

## Rendering and safety

The client parses `content` with [marked](https://marked.js.org/) and then cleans the HTML with DOMPurify before it puts the HTML in the page. Script tags, event handler attributes such as `onerror`, and other unsafe markup are removed. Producers are trusted for structure, but the markdown text may come from users, so the client always sanitizes it.

The markdown is styled by the `.retrofit-markdown` class. Its width, line height and font size are CSS custom properties; see [Theming](/guide/theming#markdown-typography).

## Extending marked

To add a `marked` extension, such as KaTeX, call `configureMarked` once at startup. It is exported by `@retrofit-ui/spa-solid-shoelace/components`:

```typescript
import { configureMarked } from '@retrofit-ui/spa-solid-shoelace/components';
import markedKatex from 'marked-katex-extension';

configureMarked(markedKatex({ throwOnError: false }));
```

The output of the extension goes through DOMPurify too. Normal extension output, such as KaTeX markup with classes and inline styles, survives. The prebuilt `./renderer` bundle for script islands does not export `configureMarked`.

## Building the spec

There is no markdown builder. Write the object, typed as `MarkdownViewSpec`:

```typescript
import type { MarkdownViewSpec } from '@retrofit-ui/builder-zod';

app.get('/api/ui/posts/:id/preview', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) return void res.status(404).json({ error: `No post ${req.params.id}` });
  const spec: MarkdownViewSpec = {
    kind: 'markdown',
    content: post.body,
    metadata: { title: 'Post Preview', back: { type: 'navigate', to: `#/posts/${post.id}` } },
  };
  res.json(spec);
});
```

Reach this route from a table with a row action. The link is resolved on the server:

```typescript
TableView.forRows(PostSchema, posts)
  .rowAction('Preview', (row) => `#/posts/${String(row.id)}/preview`)
  .build();
```

A `markdown` spec can also sit inside a page. `pageSpec().markdown(spec)` and the layout builders have a `markdown()` shortcut. To let users edit markdown, give a form field the type `markdown`. See [Form view](/guide/form-view).
