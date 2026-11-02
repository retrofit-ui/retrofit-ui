<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();

let _worker: { stop: () => void } | null = null;

const _tasks = [
  { id: 1, title: 'Design token audit', status: 'done', priority: 'high' },
  {
    id: 2,
    title: 'Migrate auth middleware',
    status: 'in_progress',
    priority: 'high',
  },
  { id: 3, title: 'Write API docs', status: 'in_progress', priority: 'medium' },
  { id: 4, title: 'Set up staging env', status: 'todo', priority: 'medium' },
  {
    id: 5,
    title: 'Load test the new endpoints',
    status: 'todo',
    priority: 'low',
  },
];
let _nextTaskId = 6;

const spec = {
  kind: 'page',
  layout: { direction: 'column', gap: 'var(--sl-spacing-4x-large)' },
  children: [
    // KPI row
    {
      kind: 'stat',
      stats: [
        { label: 'Built-in kinds', value: 15 },
        { label: 'Built-in action types', value: 3 },
        { label: 'Delivery modes', value: 3 },
      ],
    },

    // Feature highlights
    {
      kind: 'grid',
      columns: 3,
      gap: 'var(--sl-spacing-large)',
      children: [
        {
          kind: 'card',
          header: 'Typed contract',
          children: [
            {
              kind: 'text',
              content:
                '@retrofit-ui/core types every spec, and ships a generated JSON Schema for producers in other languages.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Producers decide what',
          children: [
            {
              kind: 'text',
              content:
                'A backend or a model returns the spec: rows, fields, links, and the writes each row allows.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Renderers decide how',
          children: [
            {
              kind: 'text',
              content:
                'The frontend owns components, styling, and action handlers, e.g. one http handler that adds auth headers.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Finished data',
          children: [
            {
              kind: 'text',
              content:
                'Links and per-row writes arrive resolved. The spec has no templates or expressions to evaluate.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Extend with kits',
          children: [
            {
              kind: 'text',
              content:
                'A new kind is a type augmentation, a producer that emits it, and a kit that renders it.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Three delivery modes',
          children: [
            {
              kind: 'text',
              content:
                'Hosted SPA, script islands in pages you own, or SolidJS components.',
              variant: 'muted',
            },
          ],
        },
      ],
    },

    // Live tabbed view-type demos
    {
      kind: 'tabs',
      tabs: [
        {
          label: 'Table',
          children: [
            {
              kind: 'table',
              columns: [
                {
                  key: 'title',
                  label: 'Task',
                  type: 'string',
                  editable: true,
                },
                {
                  key: 'status',
                  label: 'Status',
                  type: 'enum',
                  editable: true,
                  options: [
                    { label: 'Todo', value: 'todo' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Done', value: 'done' },
                  ],
                  badgeVariants: {
                    todo: 'neutral',
                    in_progress: 'primary',
                    done: 'success',
                  },
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  type: 'enum',
                  options: [
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                  ],
                  badgeVariants: {
                    low: 'neutral',
                    medium: 'warning',
                    high: 'danger',
                  },
                },
              ],
              endpoints: {
                list: { method: 'GET', url: '/landing/tasks' },
                create: { method: 'POST', url: '/landing/tasks' },
              },
            },
          ],
        },
        {
          label: 'Form',
          children: [
            {
              kind: 'form',
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  validation: { required: true },
                  placeholder: 'Jane Smith',
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  validation: { required: true },
                  placeholder: 'jane@example.com',
                },
                {
                  name: 'role',
                  label: 'Role',
                  type: 'select',
                  options: [
                    { label: 'Engineer', value: 'engineer' },
                    { label: 'Designer', value: 'designer' },
                    { label: 'Product', value: 'product' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'message',
                  label: 'Message',
                  type: 'textarea',
                  placeholder: 'What are you building?',
                },
              ],
              endpoints: {
                create: { method: 'POST', url: '/landing/contact' },
              },
              metadata: { title: 'Get in touch (demo)', submitLabel: 'Send' },
            },
          ],
        },
        {
          label: 'Timeline',
          children: [
            {
              kind: 'timeline',
              events: [
                {
                  timestamp: '2026-03-02T09:00:00Z',
                  title: 'Order placed',
                  description: 'Order #1042, 3 items',
                  variant: 'primary',
                },
                {
                  timestamp: '2026-03-02T15:30:00Z',
                  title: 'Payment confirmed',
                  variant: 'success',
                },
                {
                  timestamp: '2026-03-03T11:00:00Z',
                  title: 'Shipped',
                  description: 'Carrier delayed pickup by one day',
                  variant: 'warning',
                },
                {
                  timestamp: '2026-03-05T10:15:00Z',
                  title: 'Delivered',
                  variant: 'success',
                },
              ],
              metadata: { title: 'Order #1042 (demo data)' },
            },
          ],
        },
        {
          label: 'Stats',
          children: [
            {
              kind: 'stat',
              stats: [
                { label: 'Orders', value: 1240, format: 'number' },
                {
                  label: 'Revenue',
                  value: 48500,
                  format: 'currency',
                  currency: 'EUR',
                },
                { label: 'Refund rate', value: 0.021, format: 'percent' },
                {
                  label: 'Avg delivery',
                  value: '2.4 days',
                  description: 'Pre-formatted by the server',
                },
              ],
              metadata: { title: 'Store overview (demo data)' },
            },
          ],
        },
      ],
    },

    // FAQ
    {
      kind: 'details',
      items: [
        {
          summary: 'Is there a templating language?',
          body: 'No. A spec is plain JSON with finished values: links and per-row writes arrive resolved. If a screen needs behaviour a spec cannot express, add a new kind.',
        },
        {
          summary: 'Is the spec format stable?',
          body: 'Not yet. The packages are pre-1.0 and specs carry no version field, so a breaking change to a kind breaks producers that emit the old shape.',
        },
        {
          summary: 'Which backends are supported?',
          body: 'Any that can emit JSON. TypeScript producers can use @retrofit-ui/builder-zod; other languages write the JSON against the generated JSON Schema in @retrofit-ui/core.',
        },
        {
          summary: 'Can I customize the appearance?',
          body: 'Yes. Set Shoelace CSS custom properties through the theme, target the retrofit-* classes, or replace a built-in kind with your own component in a kit.',
        },
      ],
    },
  ],
};

// Warm orange palette mapped onto Shoelace's primary scale so the
// spec-rendered area (tab indicators, focus rings, primary buttons)
// matches the landing-page brand instead of the default indigo.
const WARM_PRIMARY: Record<string, string> = {
  '--sl-color-primary-50': '#fdf4ee',
  '--sl-color-primary-100': '#fbe6d3',
  '--sl-color-primary-200': '#f5c89e',
  '--sl-color-primary-300': '#eea766',
  '--sl-color-primary-400': '#e8763e',
  '--sl-color-primary-500': '#d56428',
  '--sl-color-primary-600': '#c85c24',
  '--sl-color-primary-700': '#a64a1d',
  '--sl-color-primary-800': '#823917',
  '--sl-color-primary-900': '#5e2a11',
  '--sl-color-primary-950': '#3a1a0a',
};

onMounted(async () => {
  if (typeof window === 'undefined') return;
  await nextTick();
  if (!root.value) return;

  for (const [key, value] of Object.entries(WARM_PRIMARY)) {
    root.value.style.setProperty(key, value);
  }

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      // Each row carries its finished writes, as a real server would send.
      http.get('/landing/tasks', () =>
        HttpResponse.json(
          _tasks.map((t) => ({
            ...t,
            _actions: {
              update: { method: 'PUT', url: `/landing/tasks/${t.id}` },
              delete: { method: 'DELETE', url: `/landing/tasks/${t.id}` },
            },
          })),
        ),
      ),
      http.post('/landing/tasks', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const task = {
          id: _nextTaskId++,
          status: 'todo',
          priority: 'medium',
          ...body,
        };
        _tasks.push(task as (typeof _tasks)[0]);
        return HttpResponse.json(task, { status: 201 });
      }),
      http.post('/landing/contact', () =>
        HttpResponse.json({ ok: true }, { status: 201 }),
      ),
      http.put('/landing/tasks/:id', async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const idx = _tasks.findIndex((t) => t.id === Number(params.id));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        Object.assign(_tasks[idx], body);
        return HttpResponse.json(_tasks[idx]);
      }),
      http.delete('/landing/tasks/:id', ({ params }) => {
        const idx = _tasks.findIndex((t) => t.id === Number(params.id));
        if (idx !== -1) _tasks.splice(idx, 1);
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
    <div ref="root" class="rf-showcase-body" />
    <template #fallback>
      <div class="rf-showcase-loading">Loading demo…</div>
    </template>
  </ClientOnly>
</template>
