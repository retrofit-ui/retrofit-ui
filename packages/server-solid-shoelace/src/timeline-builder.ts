import type { TimelineEvent, TimelineSpec } from '@retrofit-ui/core';

export class TimelineViewBuilder {
  private _metadataTitle: string | undefined;

  private constructor(private readonly _events: TimelineEvent[]) {}

  static events(events: TimelineEvent[]): TimelineViewBuilder {
    return new TimelineViewBuilder(events);
  }

  title(t: string): this {
    this._metadataTitle = t;
    return this;
  }

  build(): TimelineSpec {
    return {
      events: this._events,
      ...(this._metadataTitle && { metadata: { title: this._metadataTitle } }),
    };
  }
}

export const TimelineView = TimelineViewBuilder;
