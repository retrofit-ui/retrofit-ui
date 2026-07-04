<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Contact } from '../../../examples/js/contacts/src/schemas';
import {
  buildContactFormSpec,
  buildContactsPageSpec,
} from '../../../examples/js/contacts/src/specs';
import type MultiViewDemo from './MultiViewDemo.vue';
import type { DemoView } from './MultiViewDemo.vue';

const demo = ref<InstanceType<typeof MultiViewDemo>>();

let _worker: { stop: () => void } | null = null;

const _contacts: Contact[] = [
  {
    id: 1,
    name: 'Alice Chen',
    email: 'alice@example.com',
    phone: '+1 555 010 0001',
    type: 'work',
  },
  {
    id: 2,
    name: 'Bob Martinez',
    email: 'bob@acmecorp.io',
    phone: '+1 555 020 0002',
    type: 'work',
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@startup.dev',
    phone: '+44 20 7946 0003',
    type: 'personal',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@enterprise.co',
    phone: '+1 555 040 0004',
    type: 'other',
  },
];
let _nextId = 5;

const tableSpec = buildContactsPageSpec(_contacts.length);
const editFormSpec = buildContactFormSpec(_contacts.length, _contacts[0]);

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
        const body = (await request.json()) as Partial<Contact>;
        const contact: Contact = {
          id: _nextId++,
          name: '',
          email: '',
          type: 'other',
          ...body,
        };
        _contacts.push(contact);
        return HttpResponse.json(contact, { status: 201 });
      }),
      http.put('/contacts/:id', async ({ params, request }) => {
        const body = (await request.json()) as Partial<Contact>;
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
