# Plan: Calendar view for event/scheduling data (CalendarSpec) — Issue #64

## Goal

Add a fifth core view type, `CalendarSpec`, that renders a month/week/day/list calendar powered by FullCalendar. The view is reached at `/:resource/calendar` in the SPA and served by a `CalendarViewBuilder` on the server side.

---

## Feedback addressed (PR review by thenomadlad)

> The calendar view data should be built serverside — the UI shouldn't load and fetch the events separately. Update the spec to contain actual calendar event elements each with fully populated data instead of a get endpoint to fetch the data and decide how it should be shown. Follow the same philosophy we follow for tableview or formview (where the value for each row/field was already populated serverside).

**How addressed:** The previous design had `endpoint: EndpointDirective` in `CalendarSpec` — the UI would call that URL at runtime to fetch events, then map field names via a `fields` object. This is replaced with an `events: CalendarEvent[]` array that the server populates before serialising the spec, exactly like `TableSpec.rows`. The UI no longer makes a separate fetch for event data; it renders `spec.events` directly.

> In addition, create an example calendar example app in `examples/js/personal-agenda` which contains a table view of events and a calendar view as well.

**How addressed:** A new `examples/js/personal-agenda` section is added below (section 9).

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** All top-level view spec types live here. `CalendarEvent` and `CalendarSpec` follow the same pattern as `TableSpec` (plain TypeScript interfaces, no Zod schema).

**What to add** (after the `MarkdownViewSpec` interface):

```typescript
/** A single calendar event, fully populated server-side. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;       // ISO 8601 datetime or date string
  end?: string;        // ISO 8601; if absent FullCalendar uses a 1-hour slot
  color?: string;      // hex or CSS named colour
  allDay?: boolean;
}

/** Returned by GET /api/ui/{resource}/calendar — drives the calendar view. */
export interface CalendarSpec {
  events: CalendarEvent[];                            // pre-populated server-side
  defaultView?: 'month' | 'week' | 'day' | 'list';  // default: 'month'
  editable?: boolean;                                 // allow drag-to-move/resize; requires update endpoint
  endpoints?: {
    find?:   EndpointDirective;   // click event → navigate to form
    create?: EndpointDirective;   // click empty slot → open create form with pre-filled date
    update?: EndpointDirective;   // drag-to-reschedule
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
```

**What must remain true:** The existing interfaces (`TableSpec`, `FormSpec`, `MarkdownViewSpec`, `TreeSpec`) are unchanged. `EndpointDirective` and `RowAction` are unchanged.

**What changed from original plan:** Removed `endpoint: EndpointDirective` (the events-fetch URL) and `fields` (field-name mapping). Added `CalendarEvent` interface and `events: CalendarEvent[]` to `CalendarSpec`.

---

### 2. `packages/server-solid-shoelace/src/calendar-builder.ts` (NEW FILE)

**Why:** `TableViewBuilder` lives in its own file (`view-builder.ts`). Calendar gets its own file to keep concerns separate and match that precedent.

**Implementation:**

```typescript
import type { CalendarEvent, CalendarSpec, EndpointDirective } from '@retrofit-ui/core';

export class CalendarViewBuilder {
  private _events: CalendarEvent[] = [];
  private _defaultView?: CalendarSpec['defaultView'];
  private _editable?: boolean;
  private _endpoints: CalendarSpec['endpoints'] = {};
  private _title?: string;

  static events(events: CalendarEvent[]): CalendarViewBuilder {
    const b = new CalendarViewBuilder();
    b._events = events;
    return b;
  }

  defaultView(view: NonNullable<CalendarSpec['defaultView']>): this { this._defaultView = view; return this; }
  editable(editable = true): this { this._editable = editable; return this; }
  title(title: string): this { this._title = title; return this; }

  find(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, find: directive }; return this; }
  create(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, create: directive }; return this; }
  update(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, update: directive }; return this; }
  delete(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, delete: directive }; return this; }

  build(): CalendarSpec {
    return {
      events: this._events,
      ...(this._defaultView && { defaultView: this._defaultView }),
      ...(this._editable !== undefined && { editable: this._editable }),
      ...(Object.keys(this._endpoints ?? {}).length > 0 && { endpoints: this._endpoints }),
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const CalendarView = CalendarViewBuilder;
```

**Key decisions:**

- `CalendarViewBuilder.events(events)` is the static factory, mirroring `TableView.forRows(schema, rows)`. Events are the primary data — they are required to start.
- `editable(editable = true)` keeps the no-arg convenience (`CalendarView.events([...]).editable()`).
- `build()` omits optional keys entirely rather than setting them to `undefined`, matching the pattern in `TableViewBuilder`.

**What changed from original plan:** Removed `static endpoint()` factory and all `*Field()` setter methods. Factory is now `static events()`.

---

### 3. `packages/server-solid-shoelace/src/index.ts`

**Why:** All public exports for the server package flow through this file.

**What to add:**

```typescript
export type { CalendarEvent, CalendarSpec } from '@retrofit-ui/core';
export { CalendarView, CalendarViewBuilder } from './calendar-builder';
```

The re-export of `CalendarEvent` is new (it did not exist before). The rest follows the existing pattern.

---

### 4. `packages/spa-solid-shoelace/package.json`

**Why:** FullCalendar is not yet a dependency.

**What to add** (under `devDependencies`, matching the pattern for all other deps in this package):

```json
"@fullcalendar/core": "^6.0.0",
"@fullcalendar/daygrid": "^6.0.0",
"@fullcalendar/timegrid": "^6.0.0",
"@fullcalendar/interaction": "^6.0.0"
```

All four FullCalendar packages must be at the same major version. The `interaction` plugin is required for `dateClick` (click on empty slot to create) even when `editable` is `false`.

After editing, run `pnpm install` from the repo root.

---

### 5. `packages/spa-solid-shoelace/vite.config.ts`

**Why:** FullCalendar uses multiple ESM packages that Vite sometimes fails to pre-bundle correctly. Adding them to `optimizeDeps.include` prevents HMR issues in development.

**What to add:**

```typescript
optimizeDeps: {
  include: [
    '@fullcalendar/core',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
  ],
},
```

---

### 6. `packages/spa-solid-shoelace/ui/CalendarView.tsx` (NEW FILE)

**Why:** Follows the pattern of `FormView.tsx`, `TableView.tsx`, `MarkdownView.tsx` — one file per view type.

**What changed from original plan:** Removed the `events` callback (which previously fetched from `spec.endpoint.url`). FullCalendar now receives `events: spec.events` — a static array populated by the server. No `substituteParams` helper needed.

**Structure (two-component approach):**

```tsx
import '@fullcalendar/core/index.css';
import '@fullcalendar/daygrid/index.css';
import '@fullcalendar/timegrid/index.css';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, onCleanup, onMount, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

function viewNameToFullCalendar(view: CalendarSpec['defaultView']): string {
  switch (view) {
    case 'week': return 'timeGridWeek';
    case 'day':  return 'timeGridDay';
    case 'list': return 'listWeek';
    default:     return 'dayGridMonth';
  }
}

function substituteParams(url: string, params: Record<string, string>): string {
  return url.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? '');
}

function CalendarInner(props: { spec: CalendarSpec; resource: string }) {
  let el!: HTMLDivElement;
  let cal: Calendar | undefined;
  const navigate = useNavigate();

  onMount(() => {
    const spec = props.spec;
    const isEditable = !!(spec.editable && spec.endpoints?.update);

    cal = new Calendar(el, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: viewNameToFullCalendar(spec.defaultView),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      editable: isEditable,
      selectable: !!spec.endpoints?.create,
      events: spec.events,          // pre-populated by server; no client-side fetch
      eventClick: (info) => {
        if (!spec.endpoints?.find) return;
        navigate(`/${props.resource}/${info.event.id}`);
      },
      dateClick: (info) => {
        if (!spec.endpoints?.create) return;
        navigate(`/${props.resource}/new?start=${encodeURIComponent(info.dateStr)}`);
      },
      eventDrop: async (info) => {
        const ep = spec.endpoints?.update;
        if (!ep) { info.revert(); return; }
        const url = substituteParams(ep.url, { id: info.event.id });
        const res = await fetch(url, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: info.event.startStr, end: info.event.endStr }),
        });
        if (!res.ok) info.revert();
      },
      eventResize: async (info) => {
        const ep = spec.endpoints?.update;
        if (!ep) { info.revert(); return; }
        const url = substituteParams(ep.url, { id: info.event.id });
        const res = await fetch(url, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: info.event.startStr, end: info.event.endStr }),
        });
        if (!res.ok) info.revert();
      },
    });
    cal.render();
  });

  onCleanup(() => cal?.destroy());

  return <div ref={el} class="retrofit-calendar" />;
}

export function CalendarView() {
  const params = useParams<{ resource: string }>();
  const apiBase = useContext(ApiBaseContext);

  const [spec] = createResource(
    () => params.resource,
    async (resource) => {
      const res = await fetch(`${apiBase}/${resource}/calendar`);
      if (!res.ok) throw new Error(`Failed to fetch calendar spec for ${resource}`);
      return (await res.json()) as CalendarSpec;
    },
  );

  return (
    <>
      <Show when={spec.loading}>
        <div class="retrofit-view"><p class="retrofit-muted">Loading calendar…</p></div>
      </Show>
      <Show when={spec.error}>
        <div class="retrofit-view">
          <p class="retrofit-error-message">Error: {String(spec.error)}</p>
        </div>
      </Show>
      <Show when={spec()}>
        {(s) => (
          <div class="retrofit-view">
            <Show when={s().metadata?.title}>
              {(title) => <h1 class="retrofit-page-title">{title()}</h1>}
            </Show>
            <CalendarInner spec={s()} resource={params.resource} />
          </div>
        )}
      </Show>
    </>
  );
}
```

**Why two-component approach:** `CalendarInner` uses `onMount`, which SolidJS guarantees runs only after the DOM is attached. Wrapping in `<Show when={spec()}>` ensures `CalendarInner` mounts (and `onMount` fires) only once the spec is available. Trying to initialise FullCalendar via `createEffect` in the outer component, then destroy and recreate on spec changes, is messy — the two-component split is the clean SolidJS pattern here.

---

### 7. `packages/spa-solid-shoelace/ui/App.tsx`

**Why:** The SPA router must know about the `/:resource/calendar` route.

**Critical ordering constraint:** The new route must be registered **before** `/:resource/:id`. `@solidjs/router` matches routes in declaration order. If `/:resource/:id` comes first, navigating to `#/events/calendar` would match it with `id='calendar'`, loading `FormView` instead of `CalendarView`.

**Change:**

```tsx
import { CalendarView } from './CalendarView';

// In the route list:
<Route path="/:resource" component={TableView} />
<Route path="/:resource/new" component={FormView} />
<Route path="/:resource/calendar" component={CalendarView} />   // ← ADD before /:resource/:id
<Route path="/:resource/:id/render" component={MarkdownView} />
<Route path="/:resource/:id" component={FormView} />
```

---

### 8. `packages/spa-solid-shoelace/ui/layout.css`

**Why:** FullCalendar's default styles use its own CSS variables. We override the key ones to align with Shoelace design tokens.

**What to add** (at the end of the file):

```css
/* Calendar view */
.retrofit-calendar {
  font-family: var(--sl-font-sans);
}

.retrofit-calendar .fc-toolbar-title {
  font-size: var(--sl-font-size-x-large);
  font-weight: var(--sl-font-weight-semibold);
  color: var(--sl-color-neutral-900);
}

.retrofit-calendar .fc-button {
  background-color: var(--sl-color-neutral-0);
  border-color: var(--sl-color-neutral-300);
  color: var(--sl-color-neutral-700);
  font-family: var(--sl-font-sans);
  font-size: var(--sl-font-size-small);
  border-radius: var(--sl-border-radius-medium);
}

.retrofit-calendar .fc-button:hover {
  background-color: var(--sl-color-neutral-50);
  border-color: var(--sl-color-neutral-400);
}

.retrofit-calendar .fc-button-primary:not(:disabled).fc-button-active,
.retrofit-calendar .fc-button-primary:not(:disabled):active {
  background-color: var(--sl-color-primary-600);
  border-color: var(--sl-color-primary-600);
  color: var(--sl-color-neutral-0);
}

.retrofit-calendar .fc-today-button {
  background-color: var(--sl-color-primary-600);
  border-color: var(--sl-color-primary-600);
  color: var(--sl-color-neutral-0);
}

.retrofit-calendar .fc-daygrid-day.fc-day-today {
  background-color: var(--sl-color-primary-50);
}

.retrofit-calendar .fc-col-header-cell {
  background-color: var(--sl-color-neutral-50);
  font-size: var(--sl-font-size-small);
  font-weight: var(--sl-font-weight-semibold);
  color: var(--sl-color-neutral-600);
}

.retrofit-calendar .fc-event {
  border-radius: var(--sl-border-radius-small);
  font-size: var(--sl-font-size-small);
  font-family: var(--sl-font-sans);
}

.retrofit-calendar td,
.retrofit-calendar th {
  border-color: var(--sl-color-neutral-200);
}
```

---

### 9. `examples/js/personal-agenda/` (NEW EXAMPLE)

**Why:** Requested in PR review. Demonstrates the calendar view alongside a table view on the same data set, showing that both views can be served from the same in-memory store.

**Directory structure** (mirroring `examples/js/todos/`):

```
examples/js/personal-agenda/
  package.json
  tsconfig.json
  playwright.config.ts
  src/
    server.ts
    store.ts
  e2e/
    agenda.spec.ts
```

**`src/store.ts`** — in-memory event store:

```typescript
import type { CalendarEvent } from '@retrofit-ui/server-solid-shoelace';

// seed data covers multiple months so the calendar has visible events
const seed: CalendarEvent[] = [
  { id: '1', title: 'Team standup',   start: '2026-06-16T09:00:00', end: '2026-06-16T09:30:00', color: '#3b82f6' },
  { id: '2', title: 'Design review',  start: '2026-06-18T14:00:00', end: '2026-06-18T15:00:00' },
  { id: '3', title: 'Summer offsite', start: '2026-06-22', end: '2026-06-25', allDay: true, color: '#10b981' },
  { id: '4', title: 'Dentist',        start: '2026-07-03T11:00:00', end: '2026-07-03T12:00:00' },
  { id: '5', title: 'Q3 kickoff',     start: '2026-07-07T10:00:00', end: '2026-07-07T11:30:00', color: '#f59e0b' },
];

let events = [...seed];

export const store = {
  all: () => events,
  find: (id: string) => events.find(e => e.id === id),
  create: (body: Partial<CalendarEvent>) => {
    const e: CalendarEvent = { id: String(Date.now()), title: '', start: '', ...body };
    events.push(e);
    return e;
  },
  update: (id: string, body: Partial<CalendarEvent>) => {
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...body };
    return events[idx];
  },
  delete: (id: string) => { events = events.filter(e => e.id !== id); },
};
```

**`src/server.ts`** — two views of the same data:

```typescript
import { CalendarView, retrofitUi, TableView } from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { store } from './store';

const app = express();
app.use(express.json());

// REST endpoints (used by CalendarView mutation endpoints)
app.get('/events', (_req, res) => res.json(store.all()));
app.get('/events/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/events', (req, res) => res.json(store.create(req.body)));
app.put('/events/:id', (req, res) => res.json(store.update(req.params.id, req.body)));
app.delete('/events/:id', (req, res) => { store.delete(req.params.id); res.json({ ok: true }); });

const retrofit = retrofitUi(app);

// Table view — list all events with columns for title, start, end, allDay
app.get('/api/ui/events', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(/* … column schema … */, store.all())
        .find({ method: 'GET', url: '/events/{id}' })
        .build(),
    ),
  );
});

// Calendar view — events pre-populated server-side
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    retrofit(
      CalendarView.events(store.all())
        .defaultView('month')
        .title('Personal Agenda')
        .find({ method: 'GET', url: '/events/{id}' })
        .create({ method: 'POST', url: '/events' })
        .update({ method: 'PUT', url: '/events/{id}' })
        .editable()
        .build(),
    ),
  );
});

const PORT = process.env.PORT ?? 3002;
app.listen(PORT, () => console.log(`Personal agenda running at http://localhost:${PORT}`));
```

**`package.json`** — copy structure from `examples/js/todos/package.json`; rename package, keep same deps. No Zod/schema-builder needed since we're not using form validation in this example.

**E2E tests** (`e2e/agenda.spec.ts`) — cover:
- Table view renders event rows
- Calendar link in nav is present and navigates to `#/events/calendar`
- Calendar renders the month grid (`.fc-daygrid-body` is visible)
- Seed events appear in the correct cells
- Clicking an event navigates to `#/events/1`

---

## Implementation approach and key decisions

### Server-side data population (revised from original)

The previous plan had `endpoint: EndpointDirective` in `CalendarSpec` — the UI would call that URL at runtime (inside FullCalendar's `events` callback), map field names via a `fields` object, and FullCalendar would re-invoke the callback on month navigation. This is inconsistent with how the rest of the framework works.

The new design embeds `events: CalendarEvent[]` directly in the spec, exactly like `TableSpec.rows`. The server handler (`GET /api/ui/events/calendar`) loads the data and calls `CalendarView.events(store.all()).build()` before responding. FullCalendar receives a static array and renders the events that fall in the current view's date range. Navigation between months/weeks still works — FullCalendar filters the local array.

This means the calendar always shows events for whatever the server returned at spec-load time. If the user needs a different date range, the page reloads. This is intentional and matches the table view philosophy.

### `CalendarSpec` is an interface, not a Zod schema

All three existing view specs in `resource-spec.ts` are plain interfaces. `CalendarSpec` follows the same pattern.

### `ViewSpec` union is NOT updated

`ViewSpec` in `page.ts` is used for children within `PageSpec` (page layout panes). Calendar is a top-level route view, not an embeddable pane — it needs a full-page container for FullCalendar's toolbar and navigation. Embedding calendar inside a flex/grid layout pane is a future enhancement.

### `editable` requires both the flag AND an `update` endpoint

Setting `editable: true` in the spec without an `update` endpoint would result in drag events that silently fail. The component computes `isEditable = !!(spec.editable && spec.endpoints?.update)` — both must be present.

### `eventResize` mirrors `eventDrop`

FullCalendar fires `eventResize` when the user drags the end-edge of an event. Both `eventDrop` and `eventResize` send `{ start, end }` to the `update` endpoint and call `info.revert()` on non-OK response.

### `dateClick` navigates with `?start=` query param

When the user clicks an empty slot, we navigate to `/${resource}/new?start=<ISO date>`. The existing `FormView` does not pre-fill fields from query params today, so this opens an empty create form. Pre-filling is a follow-on enhancement.

### CSS imports from FullCalendar

FullCalendar requires its own CSS files imported as side-effects at the top of `CalendarView.tsx`. Vite bundles them into the SPA's CSS output.

### `@fullcalendar/list` in v6

In FullCalendar v6, the list view may be bundled into `@fullcalendar/core` or require a separate `@fullcalendar/list` package. Verify during implementation and add the package + plugin if needed.

---

## Edge cases to handle

| Edge case | How to handle |
|-----------|---------------|
| `spec.events` is empty | FullCalendar renders an empty calendar — correct behaviour. |
| Event `end` is absent | Omit `end` from the event object. FullCalendar renders it as a 1-hour slot by default. |
| Event `color` is absent | Pass event as-is; FullCalendar uses its default colour. |
| `spec.editable` is true but no `update` endpoint | Compute `isEditable = !!(spec.editable && spec.endpoints?.update)`. No drag allowed; no broken network calls. |
| `eventDrop` / `eventResize` fetch fails | Always call `info.revert()` on non-OK response. |
| `spec.endpoints?.create` absent | Pass `selectable: false` to FullCalendar; `dateClick` is a no-op. |
| `spec.endpoints?.find` absent | `eventClick` handler is a no-op. |
| Calendar spec endpoint returns non-OK | `createResource` throws; `<Show when={spec.error}>` renders the error message. |
| `/:resource/calendar` route matched before `/:resource/:id` | Handled by route declaration order in `App.tsx`. |
| Title absent from spec | `<Show when={s().metadata?.title}>` — no `<h1>` renders, same pattern as `TableView`. |

---

## Tests to write

### Unit tests — `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts` (NEW FILE)

```typescript
import { describe, expect, it } from 'vitest';
import { CalendarViewBuilder } from '../calendar-builder';

const baseEvents = [
  { id: '1', title: 'Meeting', start: '2026-06-15T09:00:00', end: '2026-06-15T10:00:00' },
];

describe('CalendarViewBuilder', () => {
  it('build() includes events and required shape', () => {
    const spec = CalendarViewBuilder.events(baseEvents).build();
    expect(spec.events).toEqual(baseEvents);
  });

  it('build() omits optional fields when not set', () => {
    const spec = CalendarViewBuilder.events([]).build();
    expect(spec.defaultView).toBeUndefined();
    expect(spec.editable).toBeUndefined();
    expect(spec.endpoints).toBeUndefined();
    expect(spec.metadata).toBeUndefined();
  });

  it('build() includes optional fields when set', () => {
    const spec = CalendarViewBuilder.events(baseEvents)
      .defaultView('week')
      .editable()
      .title('My Agenda')
      .find({ method: 'GET', url: '/events/{id}' })
      .create({ method: 'POST', url: '/events' })
      .update({ method: 'PUT', url: '/events/{id}' })
      .delete({ method: 'DELETE', url: '/events/{id}' })
      .build();
    expect(spec.defaultView).toBe('week');
    expect(spec.editable).toBe(true);
    expect(spec.metadata?.title).toBe('My Agenda');
    expect(spec.endpoints?.find).toEqual({ method: 'GET', url: '/events/{id}' });
    expect(spec.endpoints?.create).toEqual({ method: 'POST', url: '/events' });
    expect(spec.endpoints?.update).toEqual({ method: 'PUT', url: '/events/{id}' });
    expect(spec.endpoints?.delete).toEqual({ method: 'DELETE', url: '/events/{id}' });
  });

  it('defaultView maps all four valid values', () => {
    for (const view of ['month', 'week', 'day', 'list'] as const) {
      const spec = CalendarViewBuilder.events([]).defaultView(view).build();
      expect(spec.defaultView).toBe(view);
    }
  });

  it('build() output is JSON-serializable', () => {
    const spec = CalendarViewBuilder.events(baseEvents).build();
    expect(() => JSON.stringify(spec)).not.toThrow();
    const round = JSON.parse(JSON.stringify(spec)) as typeof spec;
    expect(round.events[0].id).toBe('1');
  });

  it('CalendarView is an alias for CalendarViewBuilder', async () => {
    const { CalendarView } = await import('../calendar-builder');
    expect(CalendarView).toBe(CalendarViewBuilder);
  });
});
```

### Unit tests — `packages/core/src/types/__tests__/resource-spec.test.ts` (NEW or updated FILE)

```typescript
import { describe, it, expect } from 'vitest';
import type { CalendarSpec, CalendarEvent } from '../resource-spec';

describe('CalendarSpec', () => {
  it('minimal spec has required fields', () => {
    const spec: CalendarSpec = { events: [] };
    expect(spec.events).toEqual([]);
  });

  it('CalendarEvent accepts fully populated event', () => {
    const ev: CalendarEvent = {
      id: '1', title: 'Meeting',
      start: '2026-06-15T09:00:00', end: '2026-06-15T10:00:00',
      color: '#3b82f6', allDay: false,
    };
    expect(ev.title).toBe('Meeting');
  });
});
```

### Integration tests — `packages/server-solid-shoelace/src/__tests__/express.test.ts`

Add a `describe` block that registers a calendar route and verifies the returned JSON contains embedded events:

```typescript
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    CalendarViewBuilder
      .events([{ id: '1', title: 'Meeting', start: '2026-06-15T09:00:00' }])
      .defaultView('month')
      .build()
  );
});

describe('CalendarViewBuilder – express integration', () => {
  it('GET /api/ui/events/calendar returns a valid CalendarSpec with embedded events', async () => {
    const res = await fetch(`${baseUrl}/api/ui/events/calendar`);
    expect(res.status).toBe(200);
    const data = await res.json() as { events: { id: string; title: string }[]; defaultView: string };
    expect(data.defaultView).toBe('month');
    expect(data.events).toHaveLength(1);
    expect(data.events[0].id).toBe('1');
    expect(data.events[0].title).toBe('Meeting');
  });
});
```

### E2E tests — `examples/js/personal-agenda/e2e/agenda.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

test('table view renders events', async ({ page }) => {
  await page.goto('/#/events');
  await expect(page.locator('.retrofit-table')).toBeVisible();
  await expect(page.locator('text=Team standup')).toBeVisible();
});

test('calendar view renders month grid with events', async ({ page }) => {
  await page.goto('/#/events/calendar');
  await expect(page.locator('.fc-daygrid-body')).toBeVisible();
  await expect(page.locator('text=Team standup')).toBeVisible();
  await expect(page.locator('text=Summer offsite')).toBeVisible();
});

test('clicking event navigates to form view', async ({ page }) => {
  await page.goto('/#/events/calendar');
  await page.locator('.fc-event', { hasText: 'Team standup' }).click();
  await expect(page).toHaveURL(/#\/events\/1/);
});
```

---

## Changeset

This is a new feature (minor bump) affecting two packages:

```
pnpm changeset
# → select: @retrofit-ui/core (minor), @retrofit-ui/server-solid-shoelace (minor)
# Note: spa-solid-shoelace is an internal bundle, not independently versioned
```

---

## Summary of all changes

| File | Change |
|------|--------|
| `packages/core/src/types/resource-spec.ts` | Add `CalendarEvent` interface and updated `CalendarSpec` (events array replaces endpoint+fields) |
| `packages/server-solid-shoelace/src/calendar-builder.ts` | New file: `CalendarViewBuilder` with `static events()` factory + `CalendarView` alias |
| `packages/server-solid-shoelace/src/index.ts` | Export `CalendarView`, `CalendarViewBuilder`; re-export `CalendarEvent`, `CalendarSpec` types |
| `packages/spa-solid-shoelace/package.json` | Add four `@fullcalendar/*` devDependencies |
| `packages/spa-solid-shoelace/vite.config.ts` | Add `optimizeDeps.include` for FullCalendar packages |
| `packages/spa-solid-shoelace/ui/CalendarView.tsx` | New file: `CalendarInner` + `CalendarView`; events from spec, no separate fetch |
| `packages/spa-solid-shoelace/ui/App.tsx` | Add `/:resource/calendar` route before `/:resource/:id`; import `CalendarView` |
| `packages/spa-solid-shoelace/ui/layout.css` | Add `.retrofit-calendar` overrides using Shoelace tokens |
| `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts` | New unit test file |
| `packages/core/src/types/__tests__/resource-spec.test.ts` | New (or updated) type-level test file |
| `packages/server-solid-shoelace/src/__tests__/express.test.ts` | Add integration test verifying embedded events in calendar spec |
| `examples/js/personal-agenda/package.json` | New example app package |
| `examples/js/personal-agenda/tsconfig.json` | New example app tsconfig |
| `examples/js/personal-agenda/playwright.config.ts` | New example app playwright config |
| `examples/js/personal-agenda/src/store.ts` | In-memory event store with seed data |
| `examples/js/personal-agenda/src/server.ts` | Express server with table + calendar view of events |
| `examples/js/personal-agenda/e2e/agenda.spec.ts` | E2E tests for both views |
