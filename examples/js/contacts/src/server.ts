import {
  createExpressRouter,
  defineConfig,
  filterForm,
  formSpec,
  pageSpec,
  retrofitUi,
  StatViewBuilder,
  TableFormWorkflowBundle,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { z } from 'zod';
import { ContactSchema, UpdateContactSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/contacts', (req, res) => {
  const type = req.query.type as string | undefined;
  const all = type ? store.byType(type) : store.all();
  if (req.query.page !== undefined || req.query.pageSize !== undefined) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 2);
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

const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
      '--sl-color-primary-50': '#f0fdf4',
      '--sl-color-primary-100': '#dcfce7',
      '--sl-color-primary-200': '#bbf7d0',
      '--sl-color-primary-300': '#86efac',
      '--sl-color-primary-400': '#4ade80',
      '--sl-color-primary-500': '#22c55e',
      '--sl-color-primary-600': '#16a34a',
      '--sl-color-primary-700': '#15803d',
      '--sl-color-primary-800': '#166534',
      '--sl-color-primary-900': '#14532d',
      '--sl-color-primary-950': '#052e16',
    },
    extraCss: `.retrofit-thead { background-color: #14532d; }
.retrofit-th { color: #f0fdf4; border-bottom-color: #166534; }`,
  },
});

TableFormWorkflowBundle.schema(ContactSchema)
  .updateSchema(UpdateContactSchema)
  .table((t) =>
    t
      .columnOverride('name', { sortable: true })
      .columnOverride('email', { filterable: true })
      .metadata({ pagination: { pageSize: 2, totalRows: store.all().length } }),
  )
  .form((f) =>
    f.fieldOverride('notes', { type: 'textarea' }).fieldOverride('phone', {
      placeholder: '+1 555 000 0000',
      validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
    }),
  )
  .list({ method: 'GET', url: '/contacts?page={page}&pageSize={pageSize}' })
  .find({ method: 'GET', url: '/contacts/{id}' })
  .create({ method: 'POST', url: '/contacts' })
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .delete({ method: 'DELETE', url: '/contacts/{id}' })
  .build()
  .register(app, retrofit, '/api/ui/contacts', undefined, (id) =>
    store.find(id),
  );

// Stacked layout: filter → new-contact form (type pre-filled) → table
// Navigate to /#/contacts-by-type
app.get('/api/ui/contacts-by-type', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Contacts by Type')
        .filterForm(
          filterForm()
            .field('type', {
              type: 'select',
              label: 'Contact Type',
              placeholder: 'All Types',
              options: [
                { label: 'Work', value: 'work' },
                { label: 'Personal', value: 'personal' },
                { label: 'Other', value: 'other' },
              ],
            })
            .build(),
        )
        .form(
          formSpec(ContactSchema, UpdateContactSchema)
            .fieldOverride('notes', { type: 'textarea' })
            .fieldOverride('phone', { placeholder: '+1 555 000 0000' })
            .create({ method: 'POST', url: '/contacts' })
            .build(),
          'Add Contact',
        )
        .table(
          TableView.schema(ContactSchema)
            .visibleColumns(['name', 'email', 'phone', 'type'])
            .list({ method: 'GET', url: '/contacts?type={type}' })
            .build(),
        )
        .build(),
    ),
  );
});

app.use(
  createExpressRouter(
    defineConfig({
      resources: {
        dashboard: {
          schema: z.object({}),
          stats: () =>
            new StatViewBuilder()
              .title('Contacts Dashboard')
              .stat({
                label: 'Total Contacts',
                value: store.all().length,
                format: 'number',
              })
              .build(),
        },
      },
    }),
  ),
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Contacts server running at http://localhost:${PORT}`);
});
