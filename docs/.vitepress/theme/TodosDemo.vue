<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();

// Module-level MSW worker — persists across SPA navigations so we don't
// re-register the service worker on every component mount.
let _worker: { stop: () => void } | null = null;

// In-memory store for MSW (shared across navigations)
const _todos = [
  { id: 1, title: 'Buy groceries', done: false, priority: 'high' },
  { id: 2, title: 'Walk the dog', done: true, priority: 'low' },
  { id: 3, title: 'Read a book', done: false, priority: 'medium' },
];
let _nextId = 4;

const spec = {
  kind: 'table',
  title: 'Todos',
  columns: [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'title', label: 'Title', type: 'string', editable: true },
    { key: 'done', label: 'Done', type: 'boolean', editable: true },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      editable: true,
    },
  ],
  endpoints: {
    list: { method: 'GET', url: '/todos' },
    create: { method: 'POST', url: '/todos' },
    update: { method: 'PUT', url: '/todos/{id}' },
    delete: { method: 'DELETE', url: '/todos/{id}' },
  },
};

onMounted(async () => {
  if (typeof window === 'undefined' || !root.value) return;

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      http.get('/todos', () => HttpResponse.json([..._todos])),
      http.post('/todos', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const todo = {
          id: _nextId++,
          done: false,
          priority: 'medium',
          ...body,
        };
        _todos.push(todo as (typeof _todos)[0]);
        return HttpResponse.json(todo, { status: 201 });
      }),
      http.put('/todos/:id', async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const idx = _todos.findIndex((t) => t.id === Number(params.id));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        Object.assign(_todos[idx], body);
        return HttpResponse.json(_todos[idx]);
      }),
      http.delete('/todos/:id', ({ params }) => {
        const idx = _todos.findIndex((t) => t.id === Number(params.id));
        if (idx !== -1) _todos.splice(idx, 1);
        return new HttpResponse(null, { status: 204 });
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
