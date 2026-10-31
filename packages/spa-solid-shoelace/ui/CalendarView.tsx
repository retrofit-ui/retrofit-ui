import { Calendar, type EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { CalendarSpec, RowActions } from '@retrofit-ui/core';
import { onCleanup, onMount, Show } from 'solid-js';
import { useActions, useHttp } from './actions';
import { Toolbar } from './TableView';

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

function CalendarStandalone(props: { spec: CalendarSpec }) {
  const send = useHttp();
  const { dispatch } = useActions();
  let el!: HTMLDivElement;
  let cal: Calendar | undefined;

  onMount(() => {
    const spec = props.spec;
    async function save(info: EventDropArg | EventResizeDoneArg) {
      const ep = (info.event.extendedProps.actions as RowActions | undefined)
        ?.update;
      if (!ep) {
        info.revert();
        return;
      }
      const res = await send(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: info.event.startStr,
          end: info.event.endStr,
        }),
      });
      if (!res.ok) info.revert();
    }

    cal = new Calendar(el, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: viewNameToFullCalendar(spec.defaultView),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      editable: !!spec.editable,
      // An event without its own update can't be dragged or resized.
      events: spec.events.map((e) =>
        e.actions?.update ? e : { ...e, editable: false },
      ),
      // An event's `link` (kept in extendedProps by FullCalendar) opens it.
      eventClick: (info) => {
        const link: unknown = info.event.extendedProps.link;
        if (typeof link === 'string' && link !== '') {
          info.jsEvent.preventDefault();
          void dispatch({ type: 'navigate', to: link });
        }
      },
      // Each event saves through its own finished `actions.update`.
      eventDrop: (info) => void save(info),
      eventResize: (info) => void save(info),
    });
    cal.render();
  });

  onCleanup(() => cal?.destroy());

  return <div ref={el} class="retrofit-calendar" />;
}

export function CalendarViewComponent(props: { spec: CalendarSpec }) {
  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title || props.spec.toolbar?.length}>
        <div class="retrofit-page-header">
          <Show when={props.spec.metadata?.title}>
            {(title) => <h1 class="retrofit-page-title">{title()}</h1>}
          </Show>
          <Toolbar buttons={props.spec.toolbar} />
        </div>
      </Show>
      <CalendarStandalone spec={props.spec} />
    </div>
  );
}
