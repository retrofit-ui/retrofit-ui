<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();

let _worker: { stop: () => void } | null = null;

const _contacts = [
  {
    id: 1,
    name: 'Alice Chen',
    email: 'alice@example.com',
    phone: '+1 555 010 0001',
    type: 'customer',
  },
  {
    id: 2,
    name: 'Bob Martinez',
    email: 'bob@acmecorp.io',
    phone: '+1 555 020 0002',
    type: 'partner',
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@startup.dev',
    phone: '+44 20 7946 0003',
    type: 'lead',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@enterprise.co',
    phone: '+1 555 040 0004',
    type: 'customer',
  },
];
let _nextId = 5;

const spec = {
  kind: 'page',
  title: 'Contacts',
  layout: { direction: 'column' },
  children: [
    {
      kind: 'table',
      spec: {
        kind: 'table',
        columns: [
          { key: 'id', label: 'ID', type: 'number' },
          { key: 'name', label: 'Name', type: 'string', sortable: true },
          { key: 'email', label: 'Email', type: 'string', filterable: true },
          { key: 'phone', label: 'Phone', type: 'string' },
          {
            key: 'type',
            label: 'Type',
            type: 'enum',
            options: [
              { label: 'Customer', value: 'customer' },
              { label: 'Partner', value: 'partner' },
              { label: 'Lead', value: 'lead' },
            ],
            editable: true,
          },
        ],
        endpoints: {
          list: { method: 'GET', url: '/contacts' },
          create: { method: 'POST', url: '/contacts' },
          update: { method: 'PUT', url: '/contacts/{id}' },
          delete: { method: 'DELETE', url: '/contacts/{id}' },
        },
      },
    },
  ],
};

onMounted(async () => {
  if (typeof window === 'undefined') return;
  await nextTick();
  if (!root.value) return;

  if (!_worker) {
    const { setupWorker } = await import('msw/browser');
    const { http, HttpResponse } = await import('msw');
    _worker = setupWorker(
      http.get('/contacts', () => HttpResponse.json([..._contacts])),
      http.post('/contacts', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const contact = { id: _nextId++, type: 'lead', ...body };
        _contacts.push(contact as (typeof _contacts)[0]);
        return HttpResponse.json(contact, { status: 201 });
      }),
      http.put('/contacts/:id', async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const idx = _contacts.findIndex((c) => c.id === Number(params.id));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        Object.assign(_contacts[idx], body);
        return HttpResponse.json(_contacts[idx]);
      }),
      http.delete('/contacts/:id', ({ params }) => {
        const idx = _contacts.findIndex((c) => c.id === Number(params.id));
        if (idx !== -1) _contacts.splice(idx, 1);
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
