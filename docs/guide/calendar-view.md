# Calendar View

The calendar view renders an interactive calendar powered by [FullCalendar](https://fullcalendar.io/). Events are embedded in the spec by the server — the UI displays them, opens an event's link on click, and optionally supports drag-drop rescheduling.

<PreviewBlock>

<div style="font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px;">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-divider);">
    <div style="display: flex; gap: 6px; align-items: center;">
      <button style="padding: 3px 9px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 12px; cursor: default;">‹</button>
      <button style="padding: 3px 9px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 12px; cursor: default;">›</button>
      <button style="padding: 3px 9px; border: 1px solid var(--vp-c-brand-1, #3b82f6); border-radius: 4px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; font-size: 12px; cursor: default;">Today</button>
    </div>
    <div style="font-weight: 600; color: var(--vp-c-text-1);">June 2026</div>
    <div style="display: flex; gap: 4px;">
      <button style="padding: 3px 8px; border: 1px solid var(--vp-c-brand-1, #3b82f6); border-radius: 4px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; font-size: 11px; cursor: default;">Month</button>
      <button style="padding: 3px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Week</button>
      <button style="padding: 3px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">Day</button>
      <button style="padding: 3px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 11px; cursor: default;">List</button>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-divider);">
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Sun</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Mon</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Tue</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Wed</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Thu</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Fri</div>
    <div style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vp-c-text-2);">Sat</div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--vp-c-bg);">
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); font-size: 12px;">31</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">1</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">2</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">3<div style="margin-top: 2px; background: #3b82f6; color: #fff; border-radius: 3px; padding: 1px 4px; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Team standup</div></div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">4</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">5<div style="margin-top: 2px; background: #22c55e; color: #fff; border-radius: 3px; padding: 1px 4px; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Release v2.0</div></div>
    <div style="padding: 6px; min-height: 60px; border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">6</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); font-size: 12px;"></div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">8</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">9</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); background: var(--vp-c-brand-soft, rgba(59,130,246,0.07)); font-size: 12px; color: var(--vp-c-brand-1, #3b82f6); font-weight: 600;">10</div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">11<div style="margin-top: 2px; background: #f59e0b; color: #fff; border-radius: 3px; padding: 1px 4px; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Q2 Review</div></div>
    <div style="padding: 6px; min-height: 60px; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">12</div>
    <div style="padding: 6px; min-height: 60px; border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-1);">13</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
CalendarView.events(events)
  .defaultView('month')
  .title('Team Calendar')
  .build()
```

:::

## How it works

In the hosted SPA, a route in `/retrofit.json` — e.g. `route('/events/calendar')` — points at the endpoint serving the `CalendarSpec`. The spec includes all events pre-populated — no secondary fetches for initial render.

FullCalendar is initialized from the spec's `events` array and options. Clicking an event opens its `link`; dragging to reschedule calls your `update` endpoint directly.

## Basic setup (JS)

```typescript
import { CalendarView } from '@retrofit-ui/builder-zod';

// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/schedule/events/calendar', async (_req, res) => {
  const events = await db.query(
    `SELECT id::text, title, start_at AS start, end_at AS end, color
     FROM events WHERE start_at >= NOW() - INTERVAL '30 days'`,
  );

  res.json(
    CalendarView.events(events)
      .defaultView('month')
      .title('Team Calendar')
      .build(),
  );
});
```

## Event fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✓ | Unique identifier (must be a string) |
| `title` | `string` | ✓ | Event label shown on the calendar |
| `start` | `string` | ✓ | ISO 8601 datetime or date string |
| `end` | `string` | — | ISO 8601 datetime or date string |
| `color` | `string` | — | CSS colour for this event's chip |
| `allDay` | `boolean` | — | Renders as an all-day event when `true` |
| `link` | `string` | — | Finished link opened when the event is clicked, e.g. `#/events/3` |

```typescript
CalendarView.events([
  {
    id: '1',
    title: 'Team standup',
    start: '2026-06-15T09:00:00',
    end: '2026-06-15T09:30:00',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Company holiday',
    start: '2026-06-20',
    allDay: true,
    color: '#22c55e',
  },
]).build();
```

## View modes

```typescript
CalendarView.events(events)
  .defaultView('week')  // 'month' | 'week' | 'day' | 'list'
  .build();
```

| Mode | FullCalendar view | Shows |
|------|------------------|-------|
| `'month'` (default) | `dayGridMonth` | Month grid |
| `'week'` | `timeGridWeek` | 7-day time grid |
| `'day'` | `timeGridDay` | Single-day time grid |
| `'list'` | `listWeek` | Plain list of upcoming events |

Users can switch between all four views using the toolbar buttons.

## CRUD endpoints

Navigation is data in the spec — each event's `link`, and `toolbar` buttons — while endpoints enable event interactions:

```typescript
CalendarView.events(
  rows.map((e) => ({ id: String(e.id), title: e.title, start: e.start, link: `#/events/${e.id}` })),
)
  .toolbar('New', { type: 'navigate', to: '#/events/new' }) // button above the calendar
  .update({ method: 'PUT', url: '/events/{id}' })            // drag-drop / resize → API call
  .editable()
  .build();
```

| Spec field | Trigger | Behaviour |
|------------|---------|-----------|
| event `link` | Click on an event | Dispatches `navigate` to the link; events without one do nothing |
| `toolbar` | Click on a toolbar button | Dispatches the button's action, e.g. a `navigate` to a create form |
| `endpoints.update` | Drag-drop or resize an event | Calls the endpoint with `{ start, end }` in the body, `{id}` filled with the event's id; reverts if the request fails |
| `endpoints.create`, `endpoints.delete` | (no UI trigger) | Carried in the spec for custom integrations; the built-in view doesn't call them |

`editable()` must be set alongside `update` to enable drag-drop and resize. Without it, events are read-only even if `update` is defined.

## Editable calendar

<PreviewBlock title="Editable calendar">

<div style="padding: 14px; background: var(--vp-c-bg-soft);">
  <div style="font-size: 13px; color: var(--vp-c-text-1);">
    <strong>Editable mode</strong> enables two interactions:
  </div>
  <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: var(--vp-c-text-2);">
    <li><strong>Drag to reschedule</strong> — drops the event on a new date/time and PATCHes the server</li>
    <li><strong>Resize</strong> — drag the event's edge to change its end time</li>
  </ul>
  <div style="margin-top: 8px; font-size: 12px; color: var(--vp-c-text-3);">Both revert immediately if the API call fails.</div>
</div>

</PreviewBlock>

::: details Spec

```typescript
CalendarView.events(events)
  .update({ method: 'PATCH', url: '/events/{id}' })
  .editable()
  .build();
```

:::

## Using the standalone renderer

```html
<script src="retrofit-ui.iife.js"></script>

<!-- declarative island — auto-mounted by init() -->
<div data-retrofit-src="/specs/calendar.json"></div>

<!-- or mount explicitly in JS -->
<div id="cal" style="height: 600px;"></div>
<script>
  const ui = RetrofitUI.init({ rootElement: document.body });
  ui.mount(
    {
      kind: 'calendar',
      events: [
        { id: '1', title: 'Launch', start: '2026-07-01', color: '#3b82f6' },
      ],
      defaultView: 'month',
      metadata: { title: 'Product Roadmap' },
    },
    document.getElementById('cal'),
  );
</script>
```
