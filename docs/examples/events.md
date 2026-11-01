# Events Example

**Pattern: `calendar` view with drag-to-update, next to a table and forms**

Events show in a month calendar, a table and a filtered page. All three link to the same edit form.

Run it locally (serves on port 3000, or `PORT`):

```bash
just example events
# or: pnpm --filter @retrofit-ui-examples/events dev
```

## What it demonstrates

- `calendar` built with `CalendarView.events(...)`: `defaultView`, `editable`, a toolbar action and an `update` endpoint
- Per-event `link` (navigation as data) and `color`
- `z.string().datetime()` fields: the table shows `start` and `end` as dates and the form uses a `datetime` input
- `page` with a `filter-form` over a list-backed `table`
- A `nav` menu in `/retrofit.json`

## Routes

From `src/server.ts`:

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/events/calendar` | `/api/ui/events/calendar` | `calendar` |
| `/events` | `/api/ui/events` | `table` |
| `/events/new` | `/api/ui/events/new` | `form` (create) |
| `/events/:id` | `/api/ui/events/{id}` | `form` (edit) |
| `/events-by-category` | `/api/ui/events-by-category` | `page`: `filter-form` + `table` |

`/events/calendar` comes before `crudRoutes('events')`, so "calendar" is never read as an id.

## The calendar

```typescript
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
  .update({ method: 'PUT', url: '/events/{id}' })
  .build();
```

Each event opens its `link`. With `editable`, a moved event is written through the `update` action. See [the contract](/guide/contract) for the request body.

## The table and form

```typescript
TableView.forRows(EventSchema, store.all())
  .visibleColumns(['title', 'start', 'end', 'category'])
  .rowLink((row) => `#/events/${String(row.id)}`)
  .toolbar('New', { type: 'navigate', to: '#/events/new' })
  .build();

formSpec(EventSchema, CreateEventSchema)
  .title('Event')
  .fieldOverride('description', { type: 'textarea' })
  .fieldOverride('allDay', { type: 'switch' })
  .onDone({ type: 'navigate', to: '#/events' });
```
