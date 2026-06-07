// Key demo: the valid values for `status` (draft/published/archived) live
// exclusively in UpdatePostSchema on the server. To add a new state such as
// 'review', change the enum here — the client form regenerates automatically
// with no frontend changes required. This is the server-driven UI principle.

import {
  createRetrofitApp,
  resource,
} from '@retrofit-ui/server-solid-shoelace';
import { PostSchema, UpdatePostSchema } from './schemas';
import { store } from './store';

const app = createRetrofitApp({
  theme: {
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
  },
  resources: {
    posts: resource(PostSchema)
      .updateSchema(UpdatePostSchema)
      .columnOverride('title', { sortable: true, filterable: true })
      .columnOverride('status', { filterable: true })
      .fieldOverride('body', { type: 'textarea' })
      .fieldOverride('slug', {
        helpText: 'lowercase, hyphens only',
        validation: { pattern: '^[a-z0-9-]+$' },
      })
      .fieldOverride('tags', { helpText: 'comma-separated' })
      .fieldOverride('title', { validation: { max: 200 } })
      .list(() => store.all())
      .find((id) => store.find(id))
      .create((data) =>
        store.create({
          ...(data as object),
          author: 'Anonymous',
          updatedAt: new Date().toISOString(),
        }),
      )
      .update((id, data) =>
        store.update(id, {
          ...(data as object),
          updatedAt: new Date().toISOString(),
        }),
      )
      .delete((id) => store.delete(id))
      .build(),
  },
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Blog server running at http://localhost:${PORT}`);
});
