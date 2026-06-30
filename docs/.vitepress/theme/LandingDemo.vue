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
        { label: 'View types', value: 8 },
        { label: 'Lines of frontend to write', value: 0 },
        { label: 'SDKs', value: 2, description: 'JavaScript (Zod) and Java' },
        { label: 'Minutes to first view', value: 5 },
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
          header: 'Schema-driven',
          children: [
            {
              kind: 'text',
              content:
                'One Zod or Java schema. Columns, fields, and validation are derived — never duplicated.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Server-owned',
          children: [
            {
              kind: 'text',
              content:
                'Your endpoint returns specs. Change the schema; the UI updates on the next request — no redeploy.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Polyglot',
          children: [
            {
              kind: 'text',
              content:
                'Any language that can emit the JSON contract gets the full UI — JS, Java, Go, Python.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Themeable',
          children: [
            {
              kind: 'text',
              content:
                'Built on Shoelace web components. Override CSS custom properties — no framework conflicts.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Incremental adoption',
          children: [
            {
              kind: 'text',
              content:
                'SPA, script island, or SolidJS component — take as much or as little as you need.',
              variant: 'muted',
            },
          ],
        },
        {
          kind: 'card',
          header: 'Composable layouts',
          children: [
            {
              kind: 'text',
              content:
                'Nest views inside page specs. Grid, flex, tabs, cards — all driven from JSON.',
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
              spec: {
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
                  update: { method: 'PUT', url: '/landing/tasks/{id}' },
                  delete: { method: 'DELETE', url: '/landing/tasks/{id}' },
                },
              },
            },
          ],
        },
        {
          label: 'Form',
          children: [
            {
              kind: 'form',
              spec: {
                kind: 'form',
                fields: [
                  {
                    name: 'name',
                    label: 'Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Jane Smith',
                  },
                  {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
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
                endpoints: {},
                metadata: { title: 'Get in touch' },
              },
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
                  timestamp: '2025-01-15T09:00:00Z',
                  title: 'Project kickoff',
                  description: 'Initial schema design and architecture',
                  variant: 'primary',
                },
                {
                  timestamp: '2025-03-01T14:00:00Z',
                  title: 'Table view shipped',
                  description:
                    'First production view type — full CRUD with inline edit',
                  variant: 'success',
                },
                {
                  timestamp: '2025-05-20T10:00:00Z',
                  title: 'Java SDK released',
                  description:
                    'Spring Boot autoconfiguration — zero-config setup',
                  variant: 'success',
                },
                {
                  timestamp: '2025-08-10T11:00:00Z',
                  title: 'Composite layouts',
                  description: 'Page, flex, grid, and filter-form nesting',
                  variant: 'primary',
                },
                {
                  timestamp: '2025-11-04T09:00:00Z',
                  title: 'Card component',
                  description:
                    'Container cards with header, children, and footer actions',
                  variant: 'primary',
                },
              ],
            },
          ],
        },
        {
          label: 'Stats',
          children: [
            {
              kind: 'stat',
              stats: [
                { label: 'Weekly active apps', value: 1240, format: 'number' },
                { label: 'Spec renders / day', value: 48500, format: 'number' },
                { label: 'Avg time to first view', value: '4.8m' },
                { label: 'Uptime', value: 99.97, format: 'percent' },
              ],
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
          summary: 'Do I need to learn a new templating language?',
          body: 'No. You return plain JSON from any endpoint. The spec format is documented and stays stable across versions.',
        },
        {
          summary: 'Can I customize the appearance?',
          body: 'Yes. retrofit-ui is built on Shoelace web components — override any CSS custom property to match your design system. You can also supply a custom stylesheet.',
        },
        {
          summary: 'What backends are supported?',
          body: 'Any backend that can emit JSON. First-class SDKs exist for JavaScript/TypeScript (via Zod) and Java (Spring Boot autoconfiguration). Any other language works too — the spec is just JSON.',
        },
        {
          summary: 'Can I use it without a Java or Node server?',
          body: 'Yes — the SPA is fully standalone. Point your endpoints at any HTTP API that returns the spec contract.',
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
      http.get('/landing/tasks', () => HttpResponse.json([..._tasks])),
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
