# Blog Example

**Pattern: manual `TableView` + `formSpec` + `MarkdownViewSpec` — full three-view setup**

The blog example is the most complete example in the repo. It uses all three view types and demonstrates the key server-driven advantage: status enum values live exclusively on the server.

<BlogDemo />

::: tip
The demo above shows the posts table live — try adding a new post or filtering by status. All data is mocked in the browser with MSW.
:::

Run it locally:
```bash
just example js blog
```

## What it demonstrates

- Separate `TableView` and `formSpec` endpoints (not using `WorkflowBundle`)
- A `rowAction` linking from the table to the markdown render view
- `fieldOverride` for markdown textarea, custom slug validation, and max-length
- Server-driven enums: `status` options come from `UpdatePostSchema` on the server
- The three-endpoint pattern: list table, edit form, markdown render

## Schemas

```typescript
const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.string().optional(),
  author: z.string(),    // server-controlled
  updatedAt: z.string(), // server-controlled
});

// author and updatedAt excluded → read-only on the edit form
const UpdatePostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.string().optional(),
});
```

## Three spec endpoints

```typescript
// 1. Table view — sortable title, filterable status, Preview row action
app.get('/api/ui/posts', (_req, res) => {
  res.json(
    retrofit(
      TableView.schema(PostSchema)
        .columnOverride('title', { sortable: true })
        .columnOverride('status', { filterable: true })
        .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
        .find({ method: 'GET', url: '/posts/{id}' })
        .list({ method: 'GET', url: '/posts' })
        .create({ method: 'POST', url: '/posts' })
        .build(),
    ),
  );
});

// 2. Form view — markdown body, slug validation, handles both /new and /:id
app.get('/api/ui/posts/:id', (_req, res) => {
  res.json(
    retrofit(
      formSpec(PostSchema, UpdatePostSchema)
        .fieldOverride('body', { type: 'markdown' })
        .fieldOverride('slug', {
          helpText: 'lowercase, hyphens only',
          validation: { pattern: '^[a-z0-9-]+$' },
        })
        .fieldOverride('tags', { helpText: 'comma-separated' })
        .fieldOverride('title', { validation: { max: 200 } })
        .find({ method: 'GET', url: '/posts/{id}' })
        .create({ method: 'POST', url: '/posts' })
        .update({ method: 'PUT', url: '/posts/{id}' })
        .delete({ method: 'DELETE', url: '/posts/{id}' })
        .build(),
    ),
  );
});

// 3. Markdown render spec
app.get('/api/ui/posts/:id/render', (_req, res) => {
  res.json(
    retrofit({
      entityEndpoint: { method: 'GET', url: '/posts/{id}' },
      field: 'body',
      metadata: { title: 'Preview' },
    } satisfies MarkdownViewSpec),
  );
});
```

## The server-driven enum story

`author` and `updatedAt` are absent from `UpdatePostSchema` — the server sets them. Users see them on the edit form as read-only, and they are hidden on the create form.

`status` is in `UpdatePostSchema`. The SPA derives the `<sl-select>` options directly from the Zod enum: `['draft', 'published', 'archived']`. To add a new status like `'review'`, change the enum in `UpdatePostSchema`. The form updates on the next request — zero frontend work.

## Why not `WorkflowBundle` here?

`WorkflowBundle` works when the table and form share the same schema and endpoints. The blog needs `rowAction` on the table (for the Preview button) and a separate markdown render endpoint. Using separate `TableView` and `formSpec` calls is more explicit and more flexible for these cases.
