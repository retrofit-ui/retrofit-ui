// Pure spec builders for the blog example (posts). Imported by src/server.ts
// AND docs/.vitepress/theme/BlogDemo.vue. No Node-only imports.

import type { MarkdownViewSpec } from '@retrofit-ui/builder-zod';
import {
  filterForm,
  formSpec,
  pageSpec,
  TableView,
  TimelineView,
} from '@retrofit-ui/builder-zod';
import { type Post, PostSchema, UpdatePostSchema } from './schemas';

export const AUTHORS = [
  { id: 'alice', name: 'Alice Smith' },
  { id: 'bob', name: 'Bob Jones' },
  { id: 'carol', name: 'Carol White' },
];

export const blogTheme = {
  cssVariables: {
    '--sl-color-primary-50': '#fdf4ff',
    '--sl-color-primary-100': '#fae8ff',
    '--sl-color-primary-200': '#f5d0fe',
    '--sl-color-primary-300': '#f0abfc',
    '--sl-color-primary-400': '#e879f9',
    '--sl-color-primary-500': '#d946ef',
    '--sl-color-primary-600': '#c026d3',
    '--sl-color-primary-700': '#a21caf',
    '--sl-color-primary-800': '#86198f',
    '--sl-color-primary-900': '#701a75',
    '--sl-color-primary-950': '#4a044e',
  },
  extraCss: `.retrofit-thead { background-color: #701a75; }
.retrofit-th { color: #fdf4ff; border-bottom-color: #86198f; }`,
};

export function buildPostsTableSpec(rows: Post[]) {
  return TableView.forRows(PostSchema, rows)
    .columnOverride('title', { sortable: true })
    .columnOverride('status', {
      filterable: true,
      badgeVariants: {
        draft: 'neutral',
        published: 'success',
        archived: 'warning',
      },
    })
    .rowAction({ label: 'Preview', routePattern: '/{id}/render' })
    .rowAction({ label: 'History', routePattern: '/{id}/timeline' })
    .find({ method: 'GET', url: '/posts/{id}' })
    .create({ method: 'POST', url: '/posts' })
    .build();
}

export function buildPostFormSpec(entity: Post | null) {
  const builder = formSpec(PostSchema, UpdatePostSchema)
    .fieldOverride('body', { type: 'markdown' })
    .fieldOverride('slug', {
      helpText: 'lowercase, hyphens only',
      validation: { pattern: '^[a-z0-9-]+$' },
    })
    .fieldOverride('tags', { type: 'tags' })
    .fieldOverride('title', { validation: { max: 200 } })
    .fieldOverride('author', {
      type: 'select',
      label: 'Author',
      options: AUTHORS.map((a) => ({ label: a.name, value: a.id })),
    })
    .fieldOverride('status', { type: 'radio-group' })
    .create({ method: 'POST', url: '/posts' })
    .update({ method: 'PUT', url: '/posts/{id}' })
    .delete({ method: 'DELETE', url: '/posts/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  return builder.build();
}

export function buildPostRenderSpec(post: Post): MarkdownViewSpec {
  return {
    kind: 'markdown',
    content: String(post.body ?? ''),
    metadata: { title: 'Preview' },
  };
}

export function buildPostTimelineSpec(post: Post) {
  const variantMap: Record<string, 'success' | 'primary' | 'neutral'> = {
    published: 'success',
    draft: 'primary',
    archived: 'neutral',
  };
  return TimelineView.events([
    {
      timestamp: post.updatedAt,
      title: `Marked as ${post.status}`,
      description: `Status changed to '${post.status}'.`,
      variant: variantMap[post.status] ?? 'neutral',
    },
    {
      timestamp: '2026-01-01T00:00:00.000Z',
      title: 'Created',
      description: 'Post was created.',
      variant: 'neutral',
    },
  ])
    .title('Post History')
    .build();
}

export function buildPostsByStatusSpec() {
  return pageSpec()
    .title('Posts by Status')
    .filterForm(
      filterForm()
        .field('status', {
          type: 'select',
          label: 'Status',
          placeholder: 'All Statuses',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
        })
        .build(),
    )
    .table(
      TableView.schema(PostSchema)
        .visibleColumns(['title', 'author', 'status', 'updatedAt'])
        .list({ method: 'GET', url: '/posts?status={status}' })
        .build(),
    )
    .build();
}
