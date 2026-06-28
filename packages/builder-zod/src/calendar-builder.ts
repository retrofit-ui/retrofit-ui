import type {
  CalendarEvent,
  CalendarSpec,
  EndpointDirective,
} from '@retrofit-ui/core';

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

  find(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, find: directive };
    return this;
  }
  create(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, create: directive };
    return this;
  }
  update(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, update: directive };
    return this;
  }
  delete(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, delete: directive };
    return this;
  }

  build(): CalendarSpec {
    return {
      kind: 'calendar',
      events: this._events,
      ...(this._defaultView && { defaultView: this._defaultView }),
      ...(this._editable !== undefined && { editable: this._editable }),
      ...(Object.keys(this._endpoints ?? {}).length > 0 && {
        endpoints: this._endpoints,
      }),
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const CalendarView = CalendarViewBuilder;
