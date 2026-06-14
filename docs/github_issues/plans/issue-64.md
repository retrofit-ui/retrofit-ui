# Plan: Calendar view for event/scheduling data (CalendarSpec) — Issue #64

## Context and current state

The branch `feat/issue-64` contains an initial implementation of `CalendarSpec` using a **client-side fetch** approach: the spec carries `endpoint: EndpointDirective` and `fields: { id, start, title, ... }`, and the SPA calls the endpoint at render time inside FullCalendar's `events` async callback. This was rejected in PR review:

> The calendar view data should be built serverside — the UI shouldn't load and fetch the events separately. Update the spec to contain actual calendar event elements each with fully populated data instead of a get endpoint to fetch the data and decide how it should be shown. Follow the same philosophy we follow for tableview or formview.
>
> In addition, create an example calendar example app in `examples/js/personal-agenda` which contains a table view of events and a calendar view as well.

The revised design mirrors `TableSpec.rows`: the server populates `events: CalendarEvent[]` before serialising the spec, and the SPA renders the array directly. No second fetch.

---

## What is already done — do not touch these files

| File | Status |
|------|--------|
| `packages/spa-solid-shoelace/ui/App.tsx` | Route `/:resource/calendar` already added before `/:resource/:id` |
| `packages/spa-solid-shoelace/package.json` | All 5 FullCalendar packages already in `devDependencies` (`core`, `daygrid`, `timegrid`, `interaction`, `list`) |
| `packages/spa-solid-shoelace/vite.config.ts` | `optimizeDeps.include` for all 5 packages already present |
| `packages/spa-solid-shoelace/ui/layout.css` | `.retrofit-calendar` CSS overrides using Shoelace tokens already present |
| `packages/server-solid-shoelace/src/index.ts` | `CalendarView`, `CalendarViewBuilder`, `CalendarSpec` already exported — only `CalendarEvent` is missing |

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Current state:** `CalendarSpec` uses `endpoint: EndpointDirective` and `fields: { id, start, title, end?, color?, allDay? }`. No `CalendarEvent` type exists.

**What must remain true after:** All existing interfaces (`TableSpec`, `FormSpec`, `MarkdownViewSpec`, `TreeSpec`, `EndpointDirective`, `RowAction`) are unchanged.

**Changes:**

Remove the old `CalendarSpec` interface (lines 83–102). Replace with:

```typescript
/** A single calendar event, fully populated server-side. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;    // ISO 8601 datetime or date string
  end?: string;     // ISO 8601; FullCalendar defaults to 1-hour slot when absent
  color?: string;   // hex or CSS named colour
  allDay?: boolean;
}

/** Returned by GET /api/ui/{resource}/calendar — drives the calendar view. */
export interface CalendarSpec {
  events: CalendarEvent[];                           // pre-populated server-side
  defaultView?: 'month' | 'week' | 'day' | 'list'; // default: 'month'
  editable?: boolean;                                // drag-to-move/resize; requires update endpoint
  endpoints?: {
    find?:   EndpointDirective; // click event → navigate to form
    create?: EndpointDirective; // click empty slot → open create form with pre-filled date
    update?: EndpointDirective; // drag-to-reschedule
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
```

---

### 2. `packages/server-solid-shoelace/src/calendar-builder.ts`

**Current state:** Uses `static endpoint(directive)` factory and `idField()`, `startField()`, `endField()`, `titleField()`, `colorField()`, `allDayField()` setters.

**What must remain true after:** `CalendarView` export alias still works. `build()` output is JSON-serializable and omits undefined optional keys.

**Replace the entire file with:**

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

**Key change:** Factory is now `CalendarViewBuilder.events(events)` — events are required to start the builder. All `*Field()` setters are removed.

---

### 3. `packages/spa-solid-shoelace/ui/CalendarView.tsx`

**Current state:** The `CalendarInner` component passes an `async events(info)` callback to FullCalendar that calls `fetch(spec.endpoint.url)` and maps `spec.fields.*` onto the results. This is the client-side fetch pattern.

**What must remain true after:** Loading/error/content states still work. `CalendarInner` still uses `onMount`/`onCleanup` pattern. `eventDrop` and `eventResize` still revert on non-OK response. Two-component structure (`CalendarView` + `CalendarInner`) is retained.

**Replace the entire file with:**

```tsx
import '@fullcalendar/core/index.css';
import '@fullcalendar/daygrid/index.css';
import '@fullcalendar/timegrid/index.css';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
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
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: viewNameToFullCalendar(spec.defaultView),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      editable: isEditable,
      selectable: !!spec.endpoints?.create,
      events: spec.events,   // static array — no client-side fetch
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

**Key change:** `events: spec.events` replaces the `async events(info)` callback. The `substituteParams` helper is retained for `eventDrop`/`eventResize` URL substitution. `EventSourceFuncArg` import is removed.

---

### 4. `packages/server-solid-shoelace/src/index.ts`

**What to add:** One line — re-export `CalendarEvent` alongside the already-exported `CalendarSpec`:

```typescript
export type { CalendarEvent, CalendarSpec, ... } from '@retrofit-ui/core';
```

Specifically, add `CalendarEvent` to the existing `export type { ... } from '@retrofit-ui/core'` block.

---

## Files to rewrite (tests)

### 5. `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts`

**Current state:** Tests use `CalendarViewBuilder.endpoint(...)` and `*Field()` methods — the old API.

**Replace entirely with:**

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
    expect(round.events[0]?.id).toBe('1');
  });

  it('CalendarView is an alias for CalendarViewBuilder', async () => {
    const { CalendarView } = await import('../calendar-builder');
    expect(CalendarView).toBe(CalendarViewBuilder);
  });
});
```

---

### 6. `packages/core/src/types/__tests__/resource-spec.test.ts`

**Current state:** The `CalendarSpec` describe block tests the old `endpoint`+`fields` shape.

**Replace only the `CalendarSpec` describe block** (leave `TableSpec.metadata.pagination` tests untouched):

```typescript
import type { CalendarEvent, CalendarSpec } from '../resource-spec';

describe('CalendarSpec', () => {
  it('minimal spec requires only events array', () => {
    const spec: CalendarSpec = { events: [] };
    expect(spec.events).toEqual([]);
  });

  it('CalendarEvent accepts a fully populated event', () => {
    const ev: CalendarEvent = {
      id: '1',
      title: 'Meeting',
      start: '2026-06-15T09:00:00',
      end: '2026-06-15T10:00:00',
      color: '#3b82f6',
      allDay: false,
    };
    expect(ev.title).toBe('Meeting');
  });

  it('CalendarSpec accepts all optional fields', () => {
    const spec: CalendarSpec = {
      events: [{ id: '1', title: 'Meeting', start: '2026-06-15T09:00:00' }],
      defaultView: 'month',
      editable: true,
      endpoints: {
        find:   { method: 'GET',    url: '/events/{id}' },
        create: { method: 'POST',   url: '/events' },
        update: { method: 'PUT',    url: '/events/{id}' },
        delete: { method: 'DELETE', url: '/events/{id}' },
      },
      metadata: { title: 'Events' },
    };
    expect(spec.defaultView).toBe('month');
    expect(spec.metadata?.title).toBe('Events');
    expect(spec.endpoints?.find?.url).toBe('/events/{id}');
  });
});
```

---

### 7. `packages/server-solid-shoelace/src/__tests__/express.test.ts`

**Current state:** The calendar integration test (around line 66 and line 481) uses `CalendarViewBuilder.endpoint(...)`.

**Update** the calendar route fixture and integration test describe block to use `CalendarViewBuilder.events(...)`:

```typescript
// route fixture (~line 66):
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    CalendarViewBuilder
      .events([{ id: '1', title: 'Meeting', start: '2026-06-15T09:00:00' }])
      .defaultView('month')
      .build(),
  );
});

// integration test describe block (~line 481):
describe('CalendarViewBuilder – express integration', () => {
  it('GET /api/ui/events/calendar returns a valid CalendarSpec with embedded events', async () => {
    const res = await fetch(`${baseUrl}/api/ui/events/calendar`);
    expect(res.status).toBe(200);
    const data = await res.json() as { events: { id: string; title: string }[]; defaultView: string };
    expect(data.defaultView).toBe('month');
    expect(data.events).toHaveLength(1);
    expect(data.events[0]?.id).toBe('1');
    expect(data.events[0]?.title).toBe('Meeting');
  });
});
```

---

## New file to create: `examples/js/personal-agenda/`

Mirror the structure of `examples/js/todos/`. Create these 6 files:

### `examples/js/personal-agenda/package.json`

Copy `examples/js/todos/package.json` and:
- Change `"name"` to `"personal-agenda"`
- Change `"description"` to something about events/calendar
- Keep all deps identical (same `@retrofit-ui/server-solid-shoelace workspace:*`, express, tsx, etc.)

### `examples/js/personal-agenda/tsconfig.json`

Copy from `examples/js/todos/tsconfig.json` verbatim.

### `examples/js/personal-agenda/playwright.config.ts`

Copy from `examples/js/todos/playwright.config.ts`. Change the port to `3002` (or whatever is free; check existing examples to avoid conflicts).

### `examples/js/personal-agenda/src/store.ts`

```typescript
import type { CalendarEvent } from '@retrofit-ui/server-solid-shoelace';

const seed: CalendarEvent[] = [
  { id: '1', title: 'Team standup',   start: '2026-06-16T09:00:00', end: '2026-06-16T09:30:00', color: '#3b82f6' },
  { id: '2', title: 'Design review',  start: '2026-06-18T14:00:00', end: '2026-06-18T15:00:00' },
  { id: '3', title: 'Summer offsite', start: '2026-06-22',           end: '2026-06-25', allDay: true, color: '#10b981' },
  { id: '4', title: 'Dentist',        start: '2026-07-03T11:00:00', end: '2026-07-03T12:00:00' },
  { id: '5', title: 'Q3 kickoff',     start: '2026-07-07T10:00:00', end: '2026-07-07T11:30:00', color: '#f59e0b' },
];

let events = [...seed];

export const store = {
  all: () => events,
  find: (id: string) => events.find((e) => e.id === id),
  create: (body: Partial<CalendarEvent>): CalendarEvent => {
    const e: CalendarEvent = { id: String(Date.now()), title: '', start: '', ...body };
    events.push(e);
    return e;
  },
  update: (id: string, body: Partial<CalendarEvent>) => {
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...body } as CalendarEvent;
    return events[idx];
  },
  delete: (id: string) => { events = events.filter((e) => e.id !== id); },
};
```

### `examples/js/personal-agenda/src/server.ts`

```typescript
import { CalendarView, retrofitUi, TableView } from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { z } from 'zod';
import { store } from './store';

const app = express();
app.use(express.json());

// REST endpoints (used by CalendarView mutation endpoints)
app.get('/events',     (_req, res) => res.json(store.all()));
app.get('/events/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/events',    (req, res) => res.json(store.create(req.body)));
app.put('/events/:id', (req, res) => res.json(store.update(req.params.id, req.body)));
app.delete('/events/:id', (req, res) => { store.delete(req.params.id); res.json({ ok: true }); });

const EventSchema = z.object({
  id:     z.string(),
  title:  z.string(),
  start:  z.string(),
  end:    z.string().optional(),
  allDay: z.boolean().optional(),
  color:  z.string().optional(),
});

const retrofit = retrofitUi(app);

app.get('/api/ui/events', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(EventSchema, store.all())
        .find({ method: 'GET', url: '/events/{id}' })
        .rowAction({ label: 'Calendar', routePattern: '/calendar' })
        .build(),
    ),
  );
});

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

### `examples/js/personal-agenda/e2e/agenda.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

test('table view renders event rows', async ({ page }) => {
  await page.goto('/#/events');
  await expect(page.locator('.retrofit-table')).toBeVisible();
  await expect(page.locator('text=Team standup')).toBeVisible();
});

test('calendar view renders month grid with seed events', async ({ page }) => {
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

## Implementation approach and key decisions

### Server-side data population (why the original approach was wrong)

The original `CalendarSpec` had `endpoint: EndpointDirective` — the SPA called it inside FullCalendar's `events` async callback (which FullCalendar invokes on every navigation, with `start`/`end` bounds). This is inconsistent with the rest of the framework: `TableSpec.rows` and `FormSpec.fields` are fully populated by the server before the response is sent. The SPA renders, not fetches.

The revised design: `events: CalendarEvent[]` is an array pre-populated by the server handler. FullCalendar receives a static array and filters by the current view's date range locally. Navigation between months/weeks still works — FullCalendar filters the local array. If the user needs a different date range, they reload the page. This matches table view's philosophy.

### `CalendarSpec` is a plain TypeScript interface, not a Zod schema

All existing view specs in `resource-spec.ts` are plain interfaces. `CalendarSpec` follows the same pattern — no Zod schema needed.

### `ViewSpec` union is NOT updated

`ViewSpec` in `page.ts` is used for embedded panes in `PageSpec`. Calendar is a top-level route view and needs the full page for FullCalendar's toolbar. Embedding in a layout pane is a future enhancement.

### `editable` requires both the flag AND an `update` endpoint

`isEditable = !!(spec.editable && spec.endpoints?.update)` — without an update endpoint, dragging is disabled so there are no silent failures.

### `eventResize` mirrors `eventDrop`

Both handlers send `{ start, end }` to the update endpoint and call `info.revert()` on non-OK response.

### `dateClick` navigates with `?start=` query param

Navigates to `/${resource}/new?start=<ISO date>`. `FormView` does not pre-fill from query params today — the create form opens empty. Pre-filling is a follow-on.

### Two-component approach in `CalendarView.tsx`

`CalendarInner` uses `onMount`, which SolidJS guarantees runs only after the DOM is attached. Wrapping in `<Show when={spec()}>` ensures `CalendarInner` mounts only once the spec is ready. Using `createEffect` in a single component to init/destroy FullCalendar on spec changes is messier.

---

## Edge cases to handle

| Edge case | How to handle |
|-----------|---------------|
| `spec.events` is empty | FullCalendar renders an empty calendar grid — correct behaviour |
| Event `end` absent | Omit `end`; FullCalendar renders as a 1-hour slot |
| Event `color` absent | Pass event as-is; FullCalendar uses its default colour |
| `editable: true` but no `update` endpoint | `isEditable = !!(spec.editable && spec.endpoints?.update)` — drag disabled |
| `eventDrop` / `eventResize` fetch fails | Always call `info.revert()` on non-OK |
| `spec.endpoints?.create` absent | `selectable: false` passed to FullCalendar; `dateClick` is a no-op |
| `spec.endpoints?.find` absent | `eventClick` handler returns early |
| Calendar spec fetch returns non-OK | `createResource` throws; `<Show when={spec.error}>` renders error |
| `/:resource/calendar` route ordering | Already handled in `App.tsx` — declared before `/:resource/:id` |
| Title absent from spec | `<Show when={s().metadata?.title}>` — no `<h1>` rendered |

---

## Changeset

New feature (minor bump) affecting two packages:

```bash
pnpm changeset
# select: @retrofit-ui/core (minor), @retrofit-ui/server-solid-shoelace (minor)
# spa-solid-shoelace is an internal bundle, not independently versioned
```

---

## Summary of all changes

| File | Action | Notes |
|------|--------|-------|
| `packages/core/src/types/resource-spec.ts` | **Edit** | Add `CalendarEvent`; replace `CalendarSpec` (remove `endpoint`+`fields`, add `events`) |
| `packages/server-solid-shoelace/src/calendar-builder.ts` | **Rewrite** | Replace `static endpoint()` + `*Field()` with `static events()` factory |
| `packages/spa-solid-shoelace/ui/CalendarView.tsx` | **Rewrite** | Replace async events callback with `events: spec.events` static array |
| `packages/server-solid-shoelace/src/index.ts` | **Edit** | Add `CalendarEvent` to re-exports |
| `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts` | **Rewrite** | Update all tests to use new `static events()` API |
| `packages/core/src/types/__tests__/resource-spec.test.ts` | **Edit** | Replace `CalendarSpec` describe block; add `CalendarEvent` import |
| `packages/server-solid-shoelace/src/__tests__/express.test.ts` | **Edit** | Update calendar fixture and integration test to use `CalendarViewBuilder.events()` |
| `examples/js/personal-agenda/package.json` | **Create** | New example app package |
| `examples/js/personal-agenda/tsconfig.json` | **Create** | Copy from `examples/js/todos/` |
| `examples/js/personal-agenda/playwright.config.ts` | **Create** | Port 3002; copy structure from todos |
| `examples/js/personal-agenda/src/store.ts` | **Create** | In-memory event store with 5 seed events |
| `examples/js/personal-agenda/src/server.ts` | **Create** | Express server with table + calendar views |
| `examples/js/personal-agenda/e2e/agenda.spec.ts` | **Create** | E2E: table renders, calendar renders, event click navigates |
| `packages/spa-solid-shoelace/ui/App.tsx` | **No change** | Route already in place |
| `packages/spa-solid-shoelace/package.json` | **No change** | All 5 FullCalendar packages already present |
| `packages/spa-solid-shoelace/vite.config.ts` | **No change** | `optimizeDeps.include` already present |
| `packages/spa-solid-shoelace/ui/layout.css` | **No change** | `.retrofit-calendar` CSS overrides already present |
