import type { Action, TimelineEvent, TimelineSpec } from '@retrofit-ui/core';

export class TimelineViewBuilder {
  private _metadataTitle: string | undefined;
  private _back: Action | undefined;

  private constructor(private readonly _events: TimelineEvent[]) {}

  static events(events: TimelineEvent[]): TimelineViewBuilder {
    return new TimelineViewBuilder(events);
  }

  title(t: string): this {
    this._metadataTitle = t;
    return this;
  }

  /** Adds a Back button dispatching `action`, e.g. a `navigate` to the record. */
  back(action: Action): this {
    this._back = action;
    return this;
  }

  build(): TimelineSpec {
    const metadata = {
      ...(this._metadataTitle && { title: this._metadataTitle }),
      ...(this._back && { back: this._back }),
    };
    return {
      kind: 'timeline',
      events: this._events,
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };
  }
}

export const TimelineView = TimelineViewBuilder;
