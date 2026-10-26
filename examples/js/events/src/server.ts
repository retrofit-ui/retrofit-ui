import {
  CalendarView,
  crudRoutes,
  filterForm,
  formSpec,
  pageSpec,
  type RetrofitConfig,
  route,
  TableView,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
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

// Serve the SPA bundle + its config. The SPA fetches /retrofit.json for its
// apiBase, theme and routes, then renders each route's spec from /api/ui/*. Any server in any
// language can serve the bundle the same way — see @retrofit-ui/spa-solid-shoelace.
const theme = {
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
};
// Route order matters: the static /events/calendar must come before
// /events/:id (crudRoutes puts /events/new before /events/:id itself).
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme,
  nav: [
    { label: 'Calendar', href: '/events/calendar', icon: 'calendar' },
    { label: 'Events', href: '/events', icon: 'list' },
    { label: 'By Category', href: '/events-by-category', icon: 'funnel' },
  ],
  routes: [
    route('/events/calendar'),
    ...crudRoutes('events'),
    route('/events-by-category'),
  ],
};
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

const categoryColors: Record<string, string> = {
  meeting: '#4f46e5',
  webinar: '#0891b2',
  workshop: '#d97706',
  social: '#16a34a',
};

// /calendar must be registered before /:id so Express doesn't treat 'calendar' as an id
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    CalendarView.events(
      store.all().map((e) => ({
        id: String(e.id),
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay ?? false,
        color: categoryColors[e.category],
        link: `#/events/${e.id}`,
      })),
    )
      .title('Events Calendar')
      .defaultView('month')
      .editable(true)
      .toolbar('New', { type: 'navigate', to: '#/events/new' })
      .create({ method: 'POST', url: '/events' })
      .update({ method: 'PUT', url: '/events/{id}' })
      .delete({ method: 'DELETE', url: '/events/{id}' })
      .build(),
  );
});

// Table view: start/end columns are auto-typed as 'datetime' and rendered as
// localised strings — demonstrates the PR 102 datetime column formatting
app.get('/api/ui/events', (_req, res) => {
  res.json(
    TableView.forRows(EventSchema, store.all())
      .visibleColumns(['title', 'start', 'end', 'category'])
      .rowLink((row) => `#/events/${String(row.id)}`)
      .toolbar('New', { type: 'navigate', to: '#/events/new' })
      .build(),
  );
});

// Form views: start and end fields use z.string().datetime() which auto-maps to
// 'datetime' type, rendering as <input type="datetime-local"> with ISO conversion.
// Create and edit forms are built per request with their endpoints resolved here.
function eventForm() {
  return formSpec(EventSchema, CreateEventSchema)
    .title('Event')
    .fieldOverride('description', { type: 'textarea' })
    .fieldOverride('allDay', { type: 'switch' })
    .onDone({ type: 'navigate', to: '#/events' });
}

// /new must be registered before /:id so Express doesn't treat 'new' as an id
app.get('/api/ui/events/new', (_req, res) => {
  res.json(eventForm().create({ method: 'POST', url: '/events' }).build());
});

app.get('/api/ui/events/:id', (req, res) => {
  const entity = store.find(req.params.id);
  if (!entity) {
    res.status(404).json({ error: `No event ${req.params.id}` });
    return;
  }
  res.json(
    eventForm()
      .edit()
      .values(entity as Record<string, unknown>)
      .params({ id: entity.id })
      .update({ method: 'PUT', url: '/events/{id}' })
      .delete({ method: 'DELETE', url: '/events/{id}' })
      .build(),
  );
});

// Stacked layout: category filter + events table — navigate to /#/events-by-category
app.get('/api/ui/events-by-category', (_req, res) => {
  res.json(
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
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Events server running at http://localhost:${PORT}`);
});
