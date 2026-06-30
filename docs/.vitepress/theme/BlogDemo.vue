<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();

let _worker: { stop: () => void } | null = null;

const _posts = [
  {
    id: 1,
    title: 'Getting started with retrofit-ui',
    slug: 'getting-started',
    status: 'published',
    author: 'Alice',
    updatedAt: '2025-06-01',
  },
  {
    id: 2,
    title: 'Building server-driven admin UIs',
    slug: 'server-driven-uis',
    status: 'published',
    author: 'Bob',
    updatedAt: '2025-06-10',
  },
  {
    id: 3,
    title: 'Advanced table patterns',
    slug: 'advanced-tables',
    status: 'draft',
    author: 'Alice',
    updatedAt: '2025-06-20',
  },
];
let _nextId = 4;

const spec = {
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

onMounted(async () => {
  if (typeof window === 'undefined') return;
  await nextTick();
  if (!root.value) return;

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      http.get('/posts', () => HttpResponse.json([..._posts])),
      http.post('/posts', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const post = {
          id: _nextId++,
          status: 'draft',
          author: 'You',
          updatedAt: new Date().toISOString().slice(0, 10),
          ...body,
        };
        _posts.push(post as (typeof _posts)[0]);
        return HttpResponse.json(post, { status: 201 });
      }),
    );
    await _worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }

  const controller = await getController();
  controller.mount(spec, root.value);
});

onBeforeUnmount(() => {
  const el = root.value;
  if (el) {
    getController().then((ctrl) => ctrl.unmount(el));
  }
});
</script>

<template>
  <ClientOnly>
    <div class="live-demo-container">
      <div class="live-demo-header">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="4" r="3" fill="currentColor" fill-opacity="0.4" />
          <circle cx="4" cy="4" r="1.5" />
        </svg>
        Live Demo
      </div>
      <div class="live-demo-body" ref="root" />
    </div>
    <template #fallback>
      <div class="live-demo-container">
        <div class="live-demo-loading">Initialising demo…</div>
      </div>
    </template>
  </ClientOnly>
</template>
