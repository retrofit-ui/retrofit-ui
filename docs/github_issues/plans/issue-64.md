# Plan: Calendar view for event/scheduling data (CalendarSpec) — Issue #64

## Goal

Add a fifth core view type, `CalendarSpec`, that renders a month/week/day/list calendar powered by FullCalendar. The view is reached at `/:resource/calendar` in the SPA and served by a `CalendarViewBuilder` on the server side.

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** All top-level view spec types live here (`TableSpec`, `FormSpec`, `MarkdownViewSpec`). `CalendarSpec` follows the same pattern — a plain TypeScript interface, no Zod schema, no runtime dependencies.

**What to add** (after the `MarkdownViewSpec` interface):

```typescript
/** Returned by GET /api/ui/{resource}/calendar — drives the calendar view. */
export interface CalendarSpec {
  endpoint: EndpointDirective;    // fetches events; URL may contain {start} and {end} date params
  fields: {
    id: string;                   // field name for event ID
    start: string;                // field name for start datetime
    end?: string;                 // field name for end datetime (optional; FullCalendar uses 1hr default)
    title: string;                // field name for event display title
    color?: string;               // field name for event colour (hex or CSS named colour)
    allDay?: string;              // field name for boolean all-day flag
  };
  defaultView?: 'month' | 'week' | 'day' | 'list';  // default: 'month'
  editable?: boolean;             // allow drag-to-move and resize; requires update endpoint
  endpoints?: {
    find?:   EndpointDirective;   // click event → navigate to form
    create?: EndpointDirective;   // click empty slot → open create form with pre-filled date
    update?: EndpointDirective;   // drag-to-reschedule
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
```

**What must remain true:** The existing three interfaces (`TableSpec`, `FormSpec`, `MarkdownViewSpec`) are unchanged. `EndpointDirective` and `RowAction` are unchanged.

---

### 2. `packages/server-solid-shoelace/src/calendar-builder.ts` (NEW FILE)

**Why:** `TableViewBuilder` lives in its own file (`view-builder.ts`). Calendar gets its own file to keep concerns separate and match that precedent.

**Implementation:**

```typescript
import type { CalendarSpec, EndpointDirective } from '@retrofit-ui/core';

export class CalendarViewBuilder {
  private _endpoint!: EndpointDirective;
  private _fields: CalendarSpec['fields'] = { id: 'id', start: 'start', title: 'title' };
  private _defaultView?: CalendarSpec['defaultView'];
  private _editable?: boolean;
  private _endpoints: CalendarSpec['endpoints'] = {};
  private _title?: string;

  static endpoint(directive: EndpointDirective): CalendarViewBuilder {
    const b = new CalendarViewBuilder();
    b._endpoint = directive;
    return b;
  }

  idField(field: string): this { this._fields = { ...this._fields, id: field }; return this; }
  startField(field: string): this { this._fields = { ...this._fields, start: field }; return this; }
  endField(field: string): this { this._fields = { ...this._fields, end: field }; return this; }
  titleField(field: string): this { this._fields = { ...this._fields, title: field }; return this; }
  colorField(field: string): this { this._fields = { ...this._fields, color: field }; return this; }
  allDayField(field: string): this { this._fields = { ...this._fields, allDay: field }; return this; }
  defaultView(view: NonNullable<CalendarSpec['defaultView']>): this { this._defaultView = view; return this; }
  editable(editable = true): this { this._editable = editable; return this; }
  title(title: string): this { this._title = title; return this; }

  find(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, find: directive }; return this; }
  create(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, create: directive }; return this; }
  update(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, update: directive }; return this; }
  delete(directive: EndpointDirective): this { this._endpoints = { ...this._endpoints, delete: directive }; return this; }

  build(): CalendarSpec {
    return {
      endpoint: this._endpoint,
      fields: this._fields,
      ...(this._defaultView && { defaultView: this._defaultView }),
      ...(this._editable !== undefined && { editable: this._editable }),
      ...(Object.keys(this._endpoints).length > 0 && { endpoints: this._endpoints }),
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const CalendarView = CalendarViewBuilder;
```

**Key decisions:**

- `CalendarViewBuilder.endpoint(directive)` is a static factory (mirrors `TableViewBuilder.schema(schema)`). Endpoint is the required starting point — everything else is optional.
- `editable(editable = true)` matches the issue's API (`CalendarView.endpoint(...).editable()` without arg means `true`).
- `build()` omits optional keys entirely rather than setting them to `undefined`, matching the pattern in `TableViewBuilder`.

---

### 3. `packages/server-solid-shoelace/src/index.ts`

**Why:** All public exports for the server package flow through this file.

**What to add:**

```typescript
export type { CalendarSpec } from '@retrofit-ui/core';
export { CalendarView, CalendarViewBuilder } from './calendar-builder';
```

The re-export of `CalendarSpec` from `@retrofit-ui/core` follows the existing pattern where `TableSpec`, `FormSpec`, etc. are all re-exported here for convenience.

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

All four FullCalendar packages must be at the same major version. The `interaction` plugin is required for drag-and-drop (`editable: true`) and for `dateClick` (click on empty slot to create). Even when `editable` is `false`, `dateClick` is only available with `interactionPlugin` present.

After editing, run `pnpm install` from the repo root.

---

### 5. `packages/spa-solid-shoelace/vite.config.ts`

**Why:** FullCalendar uses multiple ESM packages that Vite sometimes fails to pre-bundle correctly, causing HMR issues in development. Adding them to `optimizeDeps.include` prevents this.

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

**Structure (two-component approach):**

```tsx
// CalendarView.tsx
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
      events: async (info) => {
        const url = substituteParams(spec.endpoint.url, {
          start: info.startStr,
          end: info.endStr,
        });
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = (await res.json()) as Record<string, unknown>[];
        return data.map((row) => ({
          id: String(row[spec.fields.id] ?? ''),
          title: String(row[spec.fields.title] ?? ''),
          start: String(row[spec.fields.start] ?? ''),
          ...(spec.fields.end && { end: String(row[spec.fields.end] ?? '') }),
          ...(spec.fields.color && { color: String(row[spec.fields.color] ?? '') }),
          ...(spec.fields.allDay && { allDay: !!row[spec.fields.allDay] }),
        }));
      },
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
          body: JSON.stringify({
            [spec.fields.start]: info.event.startStr,
            ...(spec.fields.end && { [spec.fields.end]: info.event.endStr }),
          }),
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
          body: JSON.stringify({
            [spec.fields.start]: info.event.startStr,
            ...(spec.fields.end && { [spec.fields.end]: info.event.endStr }),
          }),
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

**Why two-component approach:** `CalendarInner` uses `onMount`, which SolidJS guarantees runs only after the component's DOM is attached. By wrapping in `<Show when={spec()}>`, the outer `CalendarView` ensures `CalendarInner` is only mounted (and thus `onMount` only fires) once the spec is available. Trying to initialize FullCalendar inside an `onMount` in `CalendarView` directly while waiting for a resource would require a `createEffect` that tracks the resource, and FullCalendar is not reactive — calling `destroy()` and recreating on every spec change would be messy. The two-component split is the clean SolidJS pattern here.

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

## Implementation approach and key decisions

### `CalendarSpec` is an interface, not a Zod schema

All three existing view specs in `resource-spec.ts` are plain interfaces. `CalendarSpec` follows the same pattern. Zod schemas live in `packages/core/src/types/table.ts` and `form.ts` because they're used for validation by the schema-builder; `CalendarSpec` has no schema-driven builder so no Zod validation is needed.

### `ViewSpec` union is NOT updated

`ViewSpec` in `page.ts` is used for children within `PageSpec` (page layout panes). Calendar is a top-level route view, not an embeddable pane — it needs a full-page container for FullCalendar's toolbar and navigation. Embedding a calendar inside a flex/grid layout pane is a future enhancement.

### FullCalendar's event source function

FullCalendar's `events` callback receives an `info` object with `startStr` and `endStr` (ISO 8601). These are substituted into the spec's `endpoint.url` using the same `{param}` template syntax used elsewhere in the codebase (e.g., `TableView`'s `substitutePattern`). This handles the `?start={start}&end={end}` URL pattern in the issue.

### `editable` requires both the flag AND an `update` endpoint

Setting `editable: true` in the spec without an `update` endpoint would result in drag events that silently fail. The component resolves this by computing `isEditable = !!(spec.editable && spec.endpoints?.update)` — both must be present.

### `eventResize` mirrors `eventDrop`

FullCalendar fires `eventResize` when the user drags the end-edge of an event to change its duration. This needs the same treatment as `eventDrop` — call the update endpoint with the new start/end, and call `info.revert()` on failure. Both handlers are implemented identically.

### `dateClick` navigates with `?start=` query param

When the user clicks an empty slot, we navigate to `/${resource}/new?start=<ISO date>`. The existing `FormView` does not pre-fill fields from query params today, so this link will open an empty create form. Pre-filling from query params is a follow-on enhancement (tracked separately). The nav link is still useful as a shortcut to the create form.

### CSS imports from FullCalendar

FullCalendar requires its own CSS files to be imported. These are imported at the top of `CalendarView.tsx` as side-effect imports. Vite/SolidJS will bundle them into the SPA's CSS output. The imports must use the package path (`@fullcalendar/core/index.css`) — not the compiled dist path — because Vite resolves them through node_modules.

### `@fullcalendar/list` is not a separate package in v6

In FullCalendar v6, the list view is provided by `@fullcalendar/list` but is included in `@fullcalendar/core`'s distribution. Verify during implementation: if `listWeek` view is only available with a separate `@fullcalendar/list` import, add the plugin. The issue's example does not include a list plugin, suggesting it may be built-in, but confirm during implementation.

---

## Edge cases to handle

| Edge case | How to handle |
|-----------|---------------|
| `spec.fields.end` is absent | Omit `end` from the FullCalendar event object. FullCalendar renders it as a 1-hour slot by default. |
| `spec.fields.color` is absent or the field value is null | Use `...(spec.fields.color && { color: ... })` — only include if the field name is configured. |
| `spec.fields.allDay` value is truthy | Map through `!!row[spec.fields.allDay]` coercion. |
| `spec.editable` is true but no `update` endpoint | Compute `isEditable = !!(spec.editable && spec.endpoints?.update)`. No drag allowed; no broken network calls. |
| `eventDrop` / `eventResize` fetch fails | Always call `info.revert()` on non-OK response to snap the event back. |
| `spec.endpoints?.create` absent | Pass `selectable: false` to FullCalendar; don't register `dateClick` behaviour. |
| `spec.endpoints?.find` absent | `eventClick` handler is a no-op. |
| Calendar spec endpoint returns non-OK | `createResource` throws; `<Show when={spec.error}>` renders the error message. |
| Events endpoint returns non-OK | Return `[]` from the FullCalendar `events` function to render an empty calendar. |
| `/:resource/calendar` route matched before `/:resource/:id` | Handled by route declaration order in `App.tsx`. |
| User navigates to a different month | FullCalendar re-invokes the `events` function automatically with updated `startStr`/`endStr`. |
| `startStr`/`endStr` absent from the endpoint URL | `substituteParams` replaces `{start}`/`{end}` with empty string if absent — but a URL without date params returns all events, which is the correct fallback. |
| Title absent from spec | `<Show when={s().metadata?.title}>` means no `<h1>` renders, same pattern as TableView. |

---

## Tests to write

### Unit tests — `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts` (NEW FILE)

```typescript
import { describe, expect, it } from 'vitest';
import { CalendarViewBuilder } from '../calendar-builder';

describe('CalendarViewBuilder', () => {
  it('build() includes required fields', () => {
    const spec = CalendarViewBuilder
      .endpoint({ method: 'GET', url: '/events?start={start}&end={end}' })
      .idField('id')
      .startField('start')
      .titleField('name')
      .build();
    expect(spec.endpoint).toEqual({ method: 'GET', url: '/events?start={start}&end={end}' });
    expect(spec.fields.id).toBe('id');
    expect(spec.fields.start).toBe('start');
    expect(spec.fields.title).toBe('name');
  });

  it('build() omits optional fields when not set', () => {
    const spec = CalendarViewBuilder
      .endpoint({ method: 'GET', url: '/events' })
      .idField('id').startField('start').titleField('name')
      .build();
    expect(spec.fields.end).toBeUndefined();
    expect(spec.fields.color).toBeUndefined();
    expect(spec.fields.allDay).toBeUndefined();
    expect(spec.defaultView).toBeUndefined();
    expect(spec.editable).toBeUndefined();
    expect(spec.endpoints).toBeUndefined();
    expect(spec.metadata).toBeUndefined();
  });

  it('build() includes optional fields when set', () => {
    const spec = CalendarViewBuilder
      .endpoint({ method: 'GET', url: '/events' })
      .idField('id').startField('start').titleField('name')
      .endField('end')
      .colorField('color')
      .allDayField('isAllDay')
      .defaultView('week')
      .editable()
      .title('My Calendar')
      .find({ method: 'GET', url: '/events/{id}' })
      .create({ method: 'POST', url: '/events' })
      .update({ method: 'PUT', url: '/events/{id}' })
      .delete({ method: 'DELETE', url: '/events/{id}' })
      .build();
    expect(spec.fields.end).toBe('end');
    expect(spec.fields.color).toBe('color');
    expect(spec.fields.allDay).toBe('isAllDay');
    expect(spec.defaultView).toBe('week');
    expect(spec.editable).toBe(true);
    expect(spec.metadata?.title).toBe('My Calendar');
    expect(spec.endpoints?.find).toEqual({ method: 'GET', url: '/events/{id}' });
    expect(spec.endpoints?.create).toEqual({ method: 'POST', url: '/events' });
    expect(spec.endpoints?.update).toEqual({ method: 'PUT', url: '/events/{id}' });
    expect(spec.endpoints?.delete).toEqual({ method: 'DELETE', url: '/events/{id}' });
  });

  it('defaultView maps all four valid values', () => {
    for (const view of ['month', 'week', 'day', 'list'] as const) {
      const spec = CalendarViewBuilder
        .endpoint({ method: 'GET', url: '/events' })
        .idField('id').startField('start').titleField('name')
        .defaultView(view)
        .build();
      expect(spec.defaultView).toBe(view);
    }
  });

  it('build() output is JSON-serializable', () => {
    const spec = CalendarViewBuilder
      .endpoint({ method: 'GET', url: '/events' })
      .idField('id').startField('start').titleField('name')
      .build();
    expect(() => JSON.stringify(spec)).not.toThrow();
    const roundTripped = JSON.parse(JSON.stringify(spec)) as typeof spec;
    expect(roundTripped.endpoint.url).toBe('/events');
  });

  it('CalendarView is an alias for CalendarViewBuilder', async () => {
    const { CalendarView } = await import('../calendar-builder');
    expect(CalendarView).toBe(CalendarViewBuilder);
  });
});
```

### Unit tests — `packages/core/src/types/__tests__/resource-spec.test.ts` (NEW FILE)

The core types are plain TypeScript interfaces with no runtime validation, so tests here verify the TypeScript compiler accepts valid shapes. Write them as compile-time assertions using `satisfies`:

```typescript
import type { CalendarSpec } from '../resource-spec';

// Minimal valid CalendarSpec
const _minimal = {
  endpoint: { method: 'GET' as const, url: '/events' },
  fields: { id: 'id', start: 'start', title: 'name' },
} satisfies CalendarSpec;

// Full CalendarSpec
const _full = {
  endpoint: { method: 'GET' as const, url: '/events?start={start}&end={end}' },
  fields: { id: 'id', start: 'start', end: 'end', title: 'name', color: 'color', allDay: 'allDay' },
  defaultView: 'month' as const,
  editable: true,
  endpoints: {
    find:   { method: 'GET' as const,    url: '/events/{id}' },
    create: { method: 'POST' as const,   url: '/events' },
    update: { method: 'PUT' as const,    url: '/events/{id}' },
    delete: { method: 'DELETE' as const, url: '/events/{id}' },
  },
  metadata: { title: 'Events' },
} satisfies CalendarSpec;
```

Add a Vitest test file that imports and does a runtime shape check:

```typescript
import { describe, it, expect } from 'vitest';
import type { CalendarSpec } from '../resource-spec';

describe('CalendarSpec', () => {
  it('minimal spec has required fields', () => {
    const spec: CalendarSpec = {
      endpoint: { method: 'GET', url: '/events' },
      fields: { id: 'id', start: 'start', title: 'name' },
    };
    expect(spec.endpoint.url).toBe('/events');
    expect(spec.fields.title).toBe('name');
  });
});
```

If a `resource-spec.test.ts` already exists, add to it. If not, create it.

### Integration tests — verify builder output via a mock Express endpoint

Add a `describe` block to `packages/server-solid-shoelace/src/__tests__/express.test.ts` that registers a calendar route manually and verifies the returned JSON:

```typescript
// In the beforeAll / server setup:
app.get('/api/ui/events/calendar', (_req, res) => {
  res.json(
    CalendarViewBuilder
      .endpoint({ method: 'GET', url: '/events?start={start}&end={end}' })
      .idField('id')
      .startField('start')
      .titleField('name')
      .build()
  );
});

// Test:
describe('CalendarViewBuilder – express integration', () => {
  it('GET /api/ui/events/calendar returns a valid CalendarSpec', async () => {
    const res = await fetch(`${baseUrl}/api/ui/events/calendar`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      endpoint: { method: string; url: string };
      fields: { id: string; start: string; title: string };
    };
    expect(data.endpoint.method).toBe('GET');
    expect(data.fields.id).toBe('id');
    expect(data.fields.start).toBe('start');
    expect(data.fields.title).toBe('name');
  });
});
```

### E2E tests (deferred — requires a new example app)

No existing example has events or scheduling data. E2E tests require:

1. A new `examples/js/events/` example with a minimal events API and `CalendarViewBuilder` setup.
2. Playwright tests in `examples/js/events/e2e/`:
   - Calendar renders the month grid
   - Events appear in the correct cells
   - Clicking an event navigates to the form view (if `find` endpoint is configured)
   - Clicking an empty day navigates to `new?start=...` (if `create` endpoint is configured)
   - Drag-to-reschedule calls the update endpoint (if `editable` and `update` are configured)

This is out of scope for the initial implementation but should be tracked as follow-on work. Unit and integration tests above are the mandatory gate.

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
| `packages/core/src/types/resource-spec.ts` | Add `CalendarSpec` interface |
| `packages/server-solid-shoelace/src/calendar-builder.ts` | New file: `CalendarViewBuilder` class + `CalendarView` alias |
| `packages/server-solid-shoelace/src/index.ts` | Export `CalendarView`, `CalendarViewBuilder`; re-export `CalendarSpec` type |
| `packages/spa-solid-shoelace/package.json` | Add four `@fullcalendar/*` devDependencies |
| `packages/spa-solid-shoelace/vite.config.ts` | Add `optimizeDeps.include` for FullCalendar packages |
| `packages/spa-solid-shoelace/ui/CalendarView.tsx` | New file: `CalendarInner` + `CalendarView` components |
| `packages/spa-solid-shoelace/ui/App.tsx` | Add `/:resource/calendar` route before `/:resource/:id`; import `CalendarView` |
| `packages/spa-solid-shoelace/ui/layout.css` | Add `.retrofit-calendar` overrides using Shoelace tokens |
| `packages/server-solid-shoelace/src/__tests__/calendar-builder.test.ts` | New unit test file (6 tests) |
| `packages/core/src/types/__tests__/resource-spec.test.ts` | New (or updated) type-level test file |
| `packages/server-solid-shoelace/src/__tests__/express.test.ts` | Add integration test for calendar endpoint shape |
