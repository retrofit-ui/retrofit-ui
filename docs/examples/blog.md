# Blog Example

**Pattern: hand-built `table`, `form`, `markdown` and `timeline` specs linked by navigation data**

The blog admin serves five post screens (list, new, edit, rendered view, timeline) and a posts-by-status page, and links them with server-resolved navigation. The server also serves a second resource, reviews, with its own table and form.

<BlogDemo />

::: tip
The demo above shows the posts table live. Add a post or filter by status. All data is mocked in the browser with MSW.
:::

Run it locally (serves on port 3000, or `PORT`):

```bash
just example blog
# or: pnpm --filter @retrofit-ui-examples/blog dev
```

## What it demonstrates

- Navigation as data: `rowLink`, `rowAction`, a toolbar action, `onDone` and `back`
- Server-driven enums: the `status` options come from `UpdatePostSchema` on the server
- `columnOverride` with `sortable` and `badgeVariants`
- `fieldOverride` for `markdown`, `tags`, `select` and `radio-group` fields, plus `pattern` and a length bound
- `markdown` and `timeline` views, and a `nav` menu in `/retrofit.json`

## Routes

From `src/server.ts`:

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/posts` | `/api/ui/posts` | `table` |
| `/posts/new` | `/api/ui/posts/new` | `form` (create) |
| `/posts/:id` | `/api/ui/posts/{id}` | `form` (edit) |
| `/posts/:id/render` | `/api/ui/posts/{id}/render` | `markdown` |
| `/posts/:id/timeline` | `/api/ui/posts/{id}/timeline` | `timeline` |
| `/posts-by-status` | `/api/ui/posts-by-status` | `page`: `filter-form` + `table` |
| `/reviews`, `/reviews/new`, `/reviews/:id` | `/api/ui/reviews...` | `table` and `form` |

Static paths come before `/:id`, so "new" is never read as an id.

## The posts table

From `src/specs.ts` (abridged). Each link is a finished hash route; the client does not build URLs.

```typescript
TableView.forRows(PostSchema, rows)
  .columnOverride('title', { sortable: true })
  .columnOverride('status', {
    badgeVariants: { draft: 'neutral', published: 'success', archived: 'warning' },
  })
  .rowLink((row) => `#/posts/${String(row.id)}`)
  .rowAction('Preview', (row) => `#/posts/${String(row.id)}/render`)
  .rowAction('History', (row) => `#/posts/${String(row.id)}/timeline`)
  .toolbar('New', { type: 'navigate', to: '#/posts/new' })
  .metadata({ title: 'Posts' })
  .build();
```

## The form

Abridged: the real form also overrides `tags` and `author`.

```typescript
formSpec(PostSchema, UpdatePostSchema)
  .title('Post')
  .fieldOverride('body', { type: 'markdown' })
  .fieldOverride('slug', {
    helpText: 'lowercase, hyphens only',
    validation: { pattern: '^[a-z0-9-]+$' },
  })
  .fieldOverride('title', { validation: { max: 200 } })
  .fieldOverride('status', { type: 'radio-group' })
  .onDone({ type: 'navigate', to: '#/posts' });
```

Add `'review'` to the `status` enum in `src/schemas.ts` and the form shows the new option. No frontend change is needed.

## Markdown and timeline

The preview is a plain spec. `metadata.back` is a `navigate` action.

```typescript
{
  kind: 'markdown',
  content: String(post.body ?? ''),
  metadata: { title: 'Preview', back: { type: 'navigate', to: `#/posts/${String(post.id)}` } },
}
```

The history screen uses `TimelineView.events([...]).title('Post History').back(...)`. Markdown is sanitized before it renders.
