import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import type { Contact } from './schemas';
import {
  buildContactFormSpec,
  buildContactsByTypeSpec,
  buildContactsPageSpec,
  buildContactsStatsSpec,
  contactsTheme,
} from './specs';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/contacts', (req, res) => {
  const type = req.query.type as string | undefined;
  const all = type ? store.byType(type) : store.all();
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  if (page > 0 && pageSize > 0) {
    const start = (page - 1) * pageSize;
    res.json(all.slice(start, start + pageSize));
  } else {
    res.json(all);
  }
});
app.get('/contacts/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/contacts', (req, res) => res.json(store.create(req.body)));
app.put('/contacts/:id', (req, res) =>
  res.json(store.update(req.params.id, req.body)),
);
app.delete('/contacts/:id', (req, res) => {
  store.delete(req.params.id);
  res.json({ ok: true });
});

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme: contactsTheme }),
);
app.use(express.static(distPath));

app.get('/api/ui/contacts', (_req, res) =>
  res.json(buildContactsPageSpec(store.all().length)),
);

app.get('/api/ui/contacts/:id', (req, res) => {
  const { id } = req.params;
  const entity =
    id !== 'new' ? (store.find(id) as Contact | undefined) : undefined;
  res.json(buildContactFormSpec(store.all().length, entity));
});

app.get('/api/ui/contacts-by-type', (_req, res) =>
  res.json(buildContactsByTypeSpec()),
);

app.get('/api/ui/dashboard/stats', (_req, res) =>
  res.json(buildContactsStatsSpec(store.all().length)),
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Contacts server running at http://localhost:${PORT}`);
});
