<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MultiViewDemo, { type DemoView } from './MultiViewDemo.vue';

const demo = ref<InstanceType<typeof MultiViewDemo>>();

let _worker: { stop: () => void } | null = null;

const _posts = [
  {
    id: 1,
    title: 'Getting started with retrofit-ui',
    slug: 'getting-started',
    status: 'published',
    author: 'Alice',
    updatedAt: '2025-06-01',
    body: '# Getting Started with retrofit-ui\n\n**retrofit-ui** generates a full admin UI from your Zod schemas — no frontend code required.\n\n## Why server-driven?\n\nWhen the server owns the UI spec, adding a field to your Zod schema is all you need to do. The form updates on the next request — zero frontend work.\n\n## Quick example\n\n```typescript\nconst bundle = TableFormWorkflowBundle\n  .schema(PostSchema)\n  .list({ method: "GET", url: "/posts" })\n  .build();\n```',
  },
  {
    id: 2,
    title: 'Building server-driven admin UIs',
    slug: 'server-driven-uis',
    status: 'published',
    author: 'Bob',
    updatedAt: '2025-06-10',
    body: '# Server-Driven Admin UIs\n\nThe key insight: your server already knows the shape of your data. retrofit-ui lets the server describe the UI — columns, fields, validation — and the SPA renders it without any custom frontend code.',
  },
  {
    id: 3,
    title: 'Advanced table patterns',
    slug: 'advanced-tables',
    status: 'draft',
    author: 'Alice',
    updatedAt: '2025-06-20',
    body: '# Advanced Table Patterns\n\nSortable columns, filterable enums, row actions, and pagination — all configured server-side.',
  },
];
let _nextId = 4;

const tableSpec = {
  kind: 'table',
  title: 'Posts',
  columns: [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'title', label: 'Title', type: 'string', sortable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      filterable: true,
      editable: true,
    },
    { key: 'author', label: 'Author', type: 'string' },
    { key: 'updatedAt', label: 'Updated', type: 'string' },
  ],
  endpoints: {
    list: { method: 'GET', url: '/posts' },
    create: { method: 'POST', url: '/posts' },
  },
};

// Mirrors what the server returns at GET /api/ui/posts/:id
const editFormSpec = {
  kind: 'form',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      value: 'Getting started with retrofit-ui',
      validation: { max: 200 },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      value: 'getting-started',
      helpText: 'lowercase, hyphens only',
      validation: { pattern: '^[a-z0-9-]+$' },
    },
    {
      name: 'body',
      label: 'Body',
      type: 'markdown',
      required: true,
      value: '# Getting Started\n\nretrofit-ui generates a full admin UI from your Zod schemas.',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      value: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text',
      required: false,
      helpText: 'comma-separated',
      value: 'retrofit, admin, tutorial',
    },
    { name: 'author', label: 'Author', type: 'text', required: false, readOnly: true, value: 'Alice' },
    { name: 'updatedAt', label: 'Updated', type: 'text', required: false, readOnly: true, value: '2025-06-01' },
  ],
  endpoints: {
    create: { method: 'POST', url: '/posts' },
    update: { method: 'PUT', url: '/posts/{id}' },
    delete: { method: 'DELETE', url: '/posts/{id}' },
  },
  metadata: { title: 'Edit Post' },
};

// Mirrors what the server returns at GET /api/ui/posts/:id/render
const renderSpec = {
  kind: 'markdown',
  entityEndpoint: { method: 'GET', url: '/posts/{id}' },
  field: 'body',
  entityId: '1',
  metadata: { title: 'Render Preview' },
};

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
        const body = (await request.json()) as Record<string, unknown>;
        const post = {
          id: _nextId++,
          status: 'draft',
          author: 'You',
          updatedAt: new Date().toISOString().slice(0, 10),
          body: '',
          ...body,
        };
        _posts.push(post as (typeof _posts)[0]);
        return HttpResponse.json(post, { status: 201 });
      }),
      http.put('/posts/:id', async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
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
