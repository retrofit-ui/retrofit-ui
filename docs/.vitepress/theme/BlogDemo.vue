<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Post } from '../../../examples/js/blog/src/schemas';
import {
  buildPostFormSpec,
  buildPostRenderSpec,
  buildPostsTableSpec,
} from '../../../examples/js/blog/src/specs';
import type MultiViewDemo from './MultiViewDemo.vue';
import type { DemoView } from './MultiViewDemo.vue';

const demo = ref<InstanceType<typeof MultiViewDemo>>();

let _worker: { stop: () => void } | null = null;

const _posts: Post[] = [
  {
    id: 1,
    title: 'Getting started with retrofit-ui',
    slug: 'getting-started',
    status: 'published',
    author: 'alice',
    updatedAt: '2025-06-01',
    body: '# Getting Started with retrofit-ui\n\n**retrofit-ui** generates a full admin UI from your Zod schemas — no frontend code required.\n\n## Why server-driven?\n\nWhen the server owns the UI spec, adding a field to your Zod schema is all you need to do. The form updates on the next request — zero frontend work.\n\n## Quick example\n\n```typescript\nconst bundle = TableFormWorkflowBundle\n  .schema(PostSchema)\n  .list({ method: "GET", url: "/posts" })\n  .build();\n```',
  },
  {
    id: 2,
    title: 'Building server-driven admin UIs',
    slug: 'server-driven-uis',
    status: 'published',
    author: 'bob',
    updatedAt: '2025-06-10',
    body: '# Server-Driven Admin UIs\n\nThe key insight: your server already knows the shape of your data. retrofit-ui lets the server describe the UI — columns, fields, validation — and the SPA renders it without any custom frontend code.',
  },
  {
    id: 3,
    title: 'Advanced table patterns',
    slug: 'advanced-tables',
    status: 'draft',
    author: 'alice',
    updatedAt: '2025-06-20',
    body: '# Advanced Table Patterns\n\nSortable columns, filterable enums, row actions, and pagination — all configured server-side.',
  },
];
let _nextId = 4;

const tableSpec = buildPostsTableSpec(_posts);
const editFormSpec = buildPostFormSpec(_posts[0]);
const renderSpec = buildPostRenderSpec(_posts[0]);

const views: DemoView[] = [
  { label: 'Table', spec: tableSpec },
  { label: 'Edit Form', spec: editFormSpec },
  { label: 'Preview', spec: renderSpec },
];

onMounted(async () => {
  if (typeof window === 'undefined') return;

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      http.get('/posts', () => HttpResponse.json([..._posts])),
      http.get('/posts/:id', ({ params }) => {
        const post = _posts.find((p) => p.id === Number(params.id));
        if (!post) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(post);
      }),
      http.post('/posts', async ({ request }) => {
        const body = (await request.json()) as Partial<Post>;
        const post: Post = {
          id: _nextId++,
          title: '',
          slug: '',
          body: '',
          status: 'draft',
          author: 'you',
          updatedAt: new Date().toISOString().slice(0, 10),
          ...body,
        };
        _posts.push(post);
        return HttpResponse.json(post, { status: 201 });
      }),
      http.put('/posts/:id', async ({ params, request }) => {
        const body = (await request.json()) as Partial<Post>;
        const idx = _posts.findIndex((p) => p.id === Number(params.id));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        Object.assign(_posts[idx], body);
        return HttpResponse.json(_posts[idx]);
      }),
      http.delete('/posts/:id', ({ params }) => {
        const idx = _posts.findIndex((p) => p.id === Number(params.id));
        if (idx !== -1) _posts.splice(idx, 1);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await _worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }

  await demo.value?.start(views);
});
</script>

<template>
  <MultiViewDemo ref="demo" />
</template>
