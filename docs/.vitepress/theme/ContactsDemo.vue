<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type MultiViewDemo from './MultiViewDemo.vue';
import type { DemoView } from './MultiViewDemo.vue';

const demo = ref<InstanceType<typeof MultiViewDemo>>();

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

// Mirrors GET /api/ui/contacts — PageSpec with col() layout wrapping the table
const tableSpec = {
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

// Mirrors GET /api/ui/contacts/:id — FormSpec with contact #1 pre-populated
const editFormSpec = {
  kind: 'form',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      value: 'Alice Chen',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      value: 'alice@example.com',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
      value: '+1 555 010 0001',
      placeholder: '+1 555 000 0000',
      validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: false,
      value: 'customer',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Partner', value: 'partner' },
        { label: 'Lead', value: 'lead' },
      ],
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      value: '',
    },
  ],
  endpoints: {
    update: { method: 'PUT', url: '/contacts/{id}' },
    delete: { method: 'DELETE', url: '/contacts/{id}' },
  },
  metadata: { title: 'Edit Contact' },
};

const views: DemoView[] = [
  { label: 'Table', spec: tableSpec },
  { label: 'Edit Form', spec: editFormSpec },
];

onMounted(async () => {
  if (typeof window === 'undefined') return;

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

  await demo.value?.start(views);
});
</script>

<template>
  <MultiViewDemo ref="demo" />
</template>
