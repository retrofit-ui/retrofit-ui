import { Calendar, type EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { CalendarEvent, CalendarSpec } from '@retrofit-ui/core';
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

/** An event without its own update can't be dragged or resized. */
export function eventsForCalendar(events: CalendarSpec['events']) {
  return events.map((e) => (e.actions?.update ? e : { ...e, editable: false }));
}

/** Saves a drag or resize through the event's own update; reverts on failure, else refreshes. */
export async function saveEvent(
  info: EventDropArg | EventResizeDoneArg,
  send: ReturnType<typeof useHttp>,
  dispatch: ReturnType<typeof useActions>['dispatch'],
) {
  const ep = (info.event.extendedProps.actions as CalendarEvent['actions'])
    ?.update;
  if (!ep) {
    info.revert();
    return;
  }
  let res: Response;
  try {
    res = await send(ep.url, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      // An event without an end has endStr ''; send no end rather than ''.
      body: JSON.stringify({
        start: info.event.startStr,
        ...(info.event.endStr && { end: info.event.endStr }),
      }),
    });
  } catch {
    info.revert();
    return;
  }
  if (res.ok) void dispatch({ type: 'refresh' });
  else info.revert();
}

function CalendarStandalone(props: { spec: CalendarSpec }) {
  const send = useHttp();
  const { dispatch } = useActions();
  let el!: HTMLDivElement;
  let cal: Calendar | undefined;

  onMount(() => {
    const spec = props.spec;
    cal = new Calendar(el, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: viewNameToFullCalendar(spec.defaultView),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      editable: !!spec.editable,
      events: eventsForCalendar(spec.events),
      // An event's `link` (kept in extendedProps by FullCalendar) opens it.
      eventClick: (info) => {
        const link: unknown = info.event.extendedProps.link;
        if (typeof link === 'string' && link !== '') {
          info.jsEvent.preventDefault();
          void dispatch({ type: 'navigate', to: link });
        }
      },
      // Each event saves through its own finished `actions.update`.
      eventDrop: (info) => void saveEvent(info, send, dispatch),
      eventResize: (info) => void saveEvent(info, send, dispatch),
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
