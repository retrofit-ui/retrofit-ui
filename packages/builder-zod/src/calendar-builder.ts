import type {
  Action,
  CalendarEvent,
  CalendarSpec,
  EndpointDirective,
  ToolbarButton,
} from '@retrofit-ui/core';
import { withRowActions } from './row-actions';

export class CalendarViewBuilder {
  private _events: CalendarEvent[] = [];
  private _defaultView?: CalendarSpec['defaultView'];
  private _editable?: boolean;
  private _writes: { update?: EndpointDirective; delete?: EndpointDirective } =
    {};
  private _title?: string;
  private _toolbar: ToolbarButton[] = [];

  static events(events: CalendarEvent[]): CalendarViewBuilder {
    const b = new CalendarViewBuilder();
    b._events = events;
    return b;
  }

  defaultView(view: NonNullable<CalendarSpec['defaultView']>): this {
    this._defaultView = view;
    return this;
  }
  editable(editable = true): this {
    this._editable = editable;
    return this;
  }
  title(title: string): this {
    this._title = title;
    return this;
  }

  /** A button above the calendar, e.g. "New". Events open their own `link`. */
  toolbar(
    label: string,
    action: Action,
    variant?: ToolbarButton['variant'],
  ): this {
    this._toolbar.push({ label, action, ...(variant && { variant }) });
    return this;
  }
  /** Each event's drag/resize save, its `{name}`s filled from the event. */
  update(directive: EndpointDirective): this {
    this._writes = { ...this._writes, update: directive };
    return this;
  }
  /** Each event's delete, its `{name}`s filled from the event. */
  delete(directive: EndpointDirective): this {
    this._writes = { ...this._writes, delete: directive };
    return this;
  }

  build(): CalendarSpec {
    const events =
      Object.keys(this._writes).length > 0
        ? withRowActions(this._events, this._writes).map(
            ({ _actions, ...event }) => ({ ...event, actions: _actions }),
          )
        : this._events;
    return {
      kind: 'calendar',
      events,
      ...(this._defaultView && { defaultView: this._defaultView }),
      ...(this._editable !== undefined && { editable: this._editable }),
      ...(this._toolbar.length > 0 && { toolbar: this._toolbar }),
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const CalendarView = CalendarViewBuilder;
