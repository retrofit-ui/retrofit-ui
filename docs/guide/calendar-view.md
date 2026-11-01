# Calendar View

The calendar view (`kind: 'calendar'`) draws events on a calendar with [FullCalendar](https://fullcalendar.io/). The producer puts all events in the spec. The view makes no request to load them.

::: details Spec

```json
{
  "kind": "calendar",
  "defaultView": "month",
  "editable": true,
  "toolbar": [{ "label": "New", "action": { "type": "navigate", "to": "#/events/new" } }],
  "events": [
    {
      "id": "1",
      "title": "Team standup",
      "start": "2026-06-15T09:00:00",
      "end": "2026-06-15T09:30:00",
      "color": "#3b82f6",
      "link": "#/events/1",
      "actions": { "update": { "method": "PUT", "url": "/events/1" } }
    }
  ],
  "metadata": { "title": "Team Calendar" }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `events` | `CalendarEvent[]` | yes | The events. |
| `defaultView` | `'month' \| 'week' \| 'day' \| 'list'` | no | First view. Default `month`. |
| `editable` | `boolean` | no | Allows drag and resize. Default `false`. |
| `toolbar` | `{ label, action, variant? }[]` | no | Buttons above the calendar. `variant` is `primary` (default) or `default`. |
| `metadata.title` | `string` | no | Heading above the calendar. |

The user can always switch between the four views with the buttons of the calendar header: month, week, day and list.

## Events

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `id` | `string` | yes | Unique id. It must be a string. |
| `title` | `string` | yes | Label on the calendar. |
| `start` | `string` | yes | ISO 8601 date or date-time. |
| `end` | `string` | no | ISO 8601 date or date-time. |
| `color` | `string` | no | CSS color of the event. |
| `allDay` | `boolean` | no | Shows the event as all-day. |
| `link` | `string` | no | Finished link, for example `#/events/3`. Clicking the event dispatches `navigate` to it. An event with no link does nothing on click. |
| `actions.update` | `{ method, url }` | no | This event's finished save. Needed for drag and resize. |

There is no create or delete endpoint on the calendar. A toolbar button navigates to a create form, and an event `link` opens the record.

## Drag and resize

An event moves only when both of these are true: `editable` is `true` on the spec, and the event has `actions.update`. An event without its own `update` is read-only.

When the user drops or resizes an event, the client sends the event's `update` action through the `http` action, with a JSON body:

```json
{ "start": "2026-06-16T09:00:00+02:00", "end": "2026-06-16T09:30:00+02:00" }
```

`end` is left out when the event has none. The values are ISO 8601 strings from FullCalendar; an all-day event gives dates. If the request fails, the event goes back to its old place. If it succeeds, the client dispatches `refresh`, so whatever owns the spec fetches it again. There is no toast.

## Building the spec

```typescript
import { CalendarView } from '@retrofit-ui/builder-zod';

app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    CalendarView.events(
      store.all().map((e) => ({
        id: String(e.id),
        title: e.title,
        start: e.start,
        end: e.end,
        color: e.color,
        link: `#/events/${e.id}`,
      })),
    )
      .title('Team Calendar')
      .defaultView('week')
      .editable()
      .toolbar('New', { type: 'navigate', to: '#/events/new' })
      .update({ method: 'PUT', url: '/events/{id}' })
      .build(),
  );
});
```

| Builder method | Effect |
|----------------|--------|
| `CalendarView.events(events)` | Starts a builder. |
| `defaultView(view)` | Sets `defaultView`. |
| `editable(value = true)` | Sets `editable`. |
| `title(t)` | Sets `metadata.title`. |
| `toolbar(label, action, variant?)` | Adds a toolbar button. |
| `update(directive)` | Gives every event `actions.update`, with `{name}` in the URL filled from the event on the server. It throws if an event has no value for a placeholder. |

`update()` alone does not make events draggable. Call `editable()` too.
