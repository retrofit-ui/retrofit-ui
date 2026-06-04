import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import express from 'express';
import { ContactSchema, UpdateContactSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/api/ui/contacts', (_req, res) => {
  const table = tableFromSchema(ContactSchema, store.all())
    .withTitle('Contacts')
    .withRowLink('/api/ui/contacts/{id}')
    .withCreateUrl('/api/ui/contacts/new')
    .withColumnOverrides({
      name: { sortable: true },
      email: { filterable: true },
    })
    .build();
  res.json(table);
});

app.get('/api/ui/contacts/new', (_req, res) => {
  const form = formFromSchema(ContactSchema)
    .withMutability(UpdateContactSchema)
    .withTitle('New Contact')
    .withSubmit({ method: 'POST', url: '/api/ui/contacts' })
    .withFieldOverrides({
      notes: { type: 'textarea' },
      phone: {
        placeholder: '+1 555 000 0000',
        validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
      },
    })
    .build();
  res.json(form);
});

app.get('/api/ui/contacts/:id', (req, res) => {
  const id = req.params.id ?? '';
  const entity = store.find(id);
  if (!entity) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const form = formFromSchema(ContactSchema)
    .withMutability(UpdateContactSchema)
    .withTitle('Edit Contact')
    .withSubmit({ method: 'PUT', url: `/api/ui/contacts/${id}` })
    .withDelete({ method: 'DELETE', url: `/api/ui/contacts/${id}` })
    .withFieldOverrides({
      notes: { type: 'textarea' },
      phone: {
        placeholder: '+1 555 000 0000',
        validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
      },
    })
    .build();
  res.json({ spec: form, entity });
});

app.post('/api/ui/contacts', (req, res) => {
  const result = UpdateContactSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const contact = store.create(result.data);
  res.status(201).json(contact);
});

app.put('/api/ui/contacts/:id', (req, res) => {
  const id = req.params.id ?? '';
  const result = UpdateContactSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const updated = store.update(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/ui/contacts/:id', (req, res) => {
  const id = req.params.id ?? '';
  const deleted = store.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).send();
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Contacts API running at http://localhost:${PORT}`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/contacts`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/contacts/new`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/contacts/1`);
});
