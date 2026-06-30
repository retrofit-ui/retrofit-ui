<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();

const MESSAGES: Record<string, string> = {
  '1': 'What does my schedule look like for **today**?',
  '2': 'Are there any **upcoming deadlines** I should know about?',
  '3': 'How does my workload this week **compare to last week**?',
};

const spec = {
  kind: 'page',
  title: 'Agenda Assistant',
  layout: { direction: 'column', gap: '2rem' },
  children: [
    // Turn 1 — user
    {
      kind: 'markdown',
      spec: {
        kind: 'markdown',
        entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
        field: 'text',
        entityId: '1',
      },
    },
    // Turn 1 — assistant: stat overview + timeline
    {
      kind: 'flex',
      direction: 'column',
      gap: '1rem',
      children: [
        {
          kind: 'stat',
          stats: [
            { label: 'Meetings Today', value: 4 },
            {
              label: 'Focus Blocks',
              value: 2,
              description: '3 hours of deep work',
            },
            { label: 'Hours Scheduled', value: '6.5h' },
          ],
        },
        {
          kind: 'timeline',
          events: [
            {
              timestamp: '2026-06-29T09:00:00',
              title: 'Sprint Standup',
              description: '15 min daily sync with engineering team',
              variant: 'primary',
            },
            {
              timestamp: '2026-06-29T11:00:00',
              title: 'Design Review',
              description: 'Review new dashboard wireframes',
              variant: 'neutral',
            },
            {
              timestamp: '2026-06-29T12:30:00',
              title: 'Team Lunch',
              description: 'Monthly team lunch — La Paloma restaurant',
              variant: 'success',
            },
            {
              timestamp: '2026-06-29T14:00:00',
              title: '1:1 with Manager',
              description: 'Weekly check-in and career development',
              variant: 'primary',
            },
            {
              timestamp: '2026-06-29T15:00:00',
              title: 'Focus Block',
              description: 'Deep work: Retrofit UI v1.0 release prep',
              variant: 'warning',
            },
            {
              timestamp: '2026-06-29T16:30:00',
              title: 'Code Review',
              description: 'Review open PRs from the team',
              variant: 'neutral',
            },
          ],
        },
      ],
    },
    // Turn 2 — user
    {
      kind: 'markdown',
      spec: {
        kind: 'markdown',
        entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
        field: 'text',
        entityId: '2',
      },
    },
    // Turn 2 — assistant: deadline stats + table
    {
      kind: 'flex',
      direction: 'column',
      gap: '1rem',
      children: [
        {
          kind: 'stat',
          stats: [
            { label: 'Overdue', value: 1, description: '1 task past due date' },
            {
              label: 'Due This Week',
              value: 2,
              description: 'By end of June 30',
            },
            { label: 'Due Next Week', value: 3, description: 'July 2–8' },
          ],
        },
        {
          kind: 'table',
          spec: {
            kind: 'table',
            columns: [
              { key: 'project', label: 'Project', type: 'string' },
              { key: 'task', label: 'Task', type: 'string' },
              { key: 'dueDate', label: 'Due Date', type: 'string' },
              {
                key: 'priority',
                label: 'Priority',
                type: 'enum',
                options: [
                  { label: 'High', value: 'high' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Low', value: 'low' },
                ],
              },
            ],
            rows: [
              {
                id: 1,
                project: 'Retrofit UI',
                task: 'Ship v1.0 docs',
                dueDate: '2026-06-30',
                priority: 'high',
              },
              {
                id: 2,
                project: 'Mobile App',
                task: 'Fix auth crash',
                dueDate: '2026-06-30',
                priority: 'high',
              },
              {
                id: 3,
                project: 'API',
                task: 'Rate limiting',
                dueDate: '2026-07-02',
                priority: 'medium',
              },
              {
                id: 4,
                project: 'Dashboard',
                task: 'Export CSV',
                dueDate: '2026-07-03',
                priority: 'medium',
              },
              {
                id: 5,
                project: 'Infra',
                task: 'DB migration',
                dueDate: '2026-07-07',
                priority: 'low',
              },
            ],
          },
        },
      ],
    },
    // Turn 3 — user
    {
      kind: 'markdown',
      spec: {
        kind: 'markdown',
        entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
        field: 'text',
        entityId: '3',
      },
    },
    // Turn 3 — assistant: 3-column comparison grid
    {
      kind: 'grid',
      columns: 3,
      gap: '1rem',
      children: [
        {
          kind: 'stat',
          stats: [
            {
              label: 'This Week',
              value: '14h',
              description: 'Meetings + focus time',
            },
          ],
        },
        {
          kind: 'stat',
          stats: [
            {
              label: 'Last Week',
              value: '11h',
              description: 'Meetings + focus time',
            },
          ],
        },
        {
          kind: 'stat',
          stats: [
            {
              label: 'Change',
              value: '+27%',
              description: '3h more than last week',
            },
          ],
        },
      ],
    },
  ],
};

const THEME_CSS_VARS: Record<string, string> = {
  '--sl-color-primary-50': '#eef2ff',
  '--sl-color-primary-100': '#e0e7ff',
  '--sl-color-primary-200': '#c7d2fe',
  '--sl-color-primary-300': '#a5b4fc',
  '--sl-color-primary-400': '#818cf8',
  '--sl-color-primary-500': '#6366f1',
  '--sl-color-primary-600': '#4f46e5',
  '--sl-color-primary-700': '#4338ca',
  '--sl-color-primary-800': '#3730a3',
  '--sl-color-primary-900': '#312e81',
  '--sl-color-primary-950': '#1e1b4b',
};
const THEME_EXTRA_CSS = `.retrofit-thead { background-color: #312e81; }
.retrofit-th { color: #eef2ff; border-bottom-color: #3730a3; }`;

let _worker: { stop: () => void } | null = null;
let _styleEl: HTMLStyleElement | null = null;

onMounted(async () => {
  if (typeof window === 'undefined') return;
  await nextTick(); // wait for <ClientOnly> to render its slot
  if (!root.value) return;

  // Apply indigo theme to the island container (Shoelace inherits via cascade)
  for (const [key, value] of Object.entries(THEME_CSS_VARS)) {
    root.value.style.setProperty(key, value);
  }
  if (!_styleEl) {
    _styleEl = document.createElement('style');
    _styleEl.textContent = THEME_EXTRA_CSS;
    document.head.appendChild(_styleEl);
  }

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      http.get('/api/chat-messages/:id', ({ params }) => {
        const text = MESSAGES[params.id as string];
        if (!text) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json({ id: params.id, text });
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
  _styleEl?.remove();
  _styleEl = null;
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
