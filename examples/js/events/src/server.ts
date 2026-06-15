import {
  CalendarView,
  filterForm,
  formSpec,
  pageSpec,
  retrofitUi,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { CreateEventSchema, EventSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/events', (req, res) => {
  const category = req.query.category as string | undefined;
  res.json(category ? store.byCategory(category) : store.all());
});
app.get('/events/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/events', (req, res) => res.json(store.create(req.body)));
app.put('/events/:id', (req, res) =>
  res.json(store.update(req.params.id, req.body)),
);
app.delete('/events/:id', (req, res) => {
  store.delete(req.params.id);
  res.json({ ok: true });
});

const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
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
    },
    extraCss: `.retrofit-thead { background-color: #312e81; }
.retrofit-th { color: #eef2ff; border-bottom-color: #3730a3; }`,
  },
});

const categoryColors: Record<string, string> = {
  meeting: '#4f46e5',
  webinar: '#0891b2',
  workshop: '#d97706',
  social: '#16a34a',
};

// /calendar must be registered before /:id so Express doesn't treat 'calendar' as an id
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    retrofit(
      CalendarView.events(
        store.all().map((e) => ({
          id: String(e.id),
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay ?? false,
          color: categoryColors[e.category],
        })),
      )
        .title('Events Calendar')
        .defaultView('month')
        .editable(true)
        .find({ method: 'GET', url: '/events/{id}' })
        .create({ method: 'POST', url: '/events' })
        .update({ method: 'PUT', url: '/events/{id}' })
        .delete({ method: 'DELETE', url: '/events/{id}' })
        .build(),
    ),
  );
});

// Table view: start/end columns are auto-typed as 'datetime' and rendered as
// localised strings — demonstrates the PR 102 datetime column formatting
app.get('/api/ui/events', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(EventSchema, store.all())
        .visibleColumns(['title', 'start', 'end', 'category'])
        .find({ method: 'GET', url: '/events/{id}' })
        .create({ method: 'POST', url: '/events' })
        .build(),
    ),
  );
});

// Form view: start and end fields use z.string().datetime() which auto-maps to
// 'datetime' type, rendering as <input type="datetime-local"> with ISO conversion
app.get('/api/ui/events/:id', (req, res) => {
  const { id } = req.params;
  const isNew = id === 'new';
  const entity = isNew ? undefined : store.find(id);
  const builder = formSpec(EventSchema, CreateEventSchema)
    .fieldOverride('description', { type: 'textarea' })
    .fieldOverride('allDay', { type: 'switch' })
    .update({ method: 'PUT', url: `/events/${id}` })
    .delete({ method: 'DELETE', url: `/events/${id}` });
  if (entity) builder.values(entity as Record<string, unknown>);
  if (isNew) builder.create({ method: 'POST', url: '/events' });
  res.json(retrofit(builder.build()));
});

// Stacked layout: category filter + events table — navigate to /#/events-by-category
app.get('/api/ui/events-by-category', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Events by Category')
        .filterForm(
          filterForm()
            .field('category', {
              type: 'select',
              label: 'Category',
              placeholder: 'All Categories',
              options: [
                { label: 'Meeting', value: 'meeting' },
                { label: 'Webinar', value: 'webinar' },
                { label: 'Workshop', value: 'workshop' },
                { label: 'Social', value: 'social' },
              ],
            })
            .build(),
        )
        .table(
          TableView.schema(EventSchema)
            .visibleColumns(['title', 'start', 'end', 'category'])
            .list({ method: 'GET', url: '/events?category={category}' })
            .build(),
        )
        .build(),
    ),
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Events server running at http://localhost:${PORT}`);
});
