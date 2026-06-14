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
    case 'week':
      return 'timeGridWeek';
    case 'day':
      return 'timeGridDay';
    case 'list':
      return 'listWeek';
    default:
      return 'dayGridMonth';
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
      events: spec.events,
      eventClick: (info) => {
        if (!spec.endpoints?.find) return;
        navigate(`/${props.resource}/${info.event.id}`);
      },
      dateClick: (info) => {
        if (!spec.endpoints?.create) return;
        navigate(
          `/${props.resource}/new?start=${encodeURIComponent(info.dateStr)}`,
        );
      },
      eventDrop: async (info) => {
        const ep = spec.endpoints?.update;
        if (!ep) {
          info.revert();
          return;
        }
        const url = substituteParams(ep.url, { id: info.event.id });
        const res = await fetch(url, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: info.event.startStr,
            end: info.event.endStr,
          }),
        });
        if (!res.ok) info.revert();
      },
      eventResize: async (info) => {
        const ep = spec.endpoints?.update;
        if (!ep) {
          info.revert();
          return;
        }
        const url = substituteParams(ep.url, { id: info.event.id });
        const res = await fetch(url, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: info.event.startStr,
            end: info.event.endStr,
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
      if (!res.ok)
        throw new Error(`Failed to fetch calendar spec for ${resource}`);
      return (await res.json()) as CalendarSpec;
    },
  );

  return (
    <>
      <Show when={spec.loading}>
        <div class="retrofit-view">
          <p class="retrofit-muted">Loading calendar…</p>
        </div>
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
