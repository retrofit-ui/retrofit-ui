import type { EndpointDirective, TimelineSpec } from '@retrofit-ui/core';

export class TimelineViewBuilder {
  private _timestampField: string | undefined;
  private _titleField: string | undefined;
  private _descriptionField: string | undefined;
  private _variantField: string | undefined;
  private _iconField: string | undefined;
  private _metadataTitle: string | undefined;

  private constructor(private readonly _endpoint: EndpointDirective) {}

  static endpoint(directive: EndpointDirective): TimelineViewBuilder {
    return new TimelineViewBuilder(directive);
  }

  timestampField(name: string): this {
    this._timestampField = name;
    return this;
  }

  titleField(name: string): this {
    this._titleField = name;
    return this;
  }

  descriptionField(name: string): this {
    this._descriptionField = name;
    return this;
  }

  variantField(name: string): this {
    this._variantField = name;
    return this;
  }

  iconField(name: string): this {
    this._iconField = name;
    return this;
  }

  title(t: string): this {
    this._metadataTitle = t;
    return this;
  }

  build(): TimelineSpec {
    if (!this._timestampField)
      throw new Error('TimelineViewBuilder: timestampField() is required');
    if (!this._titleField)
      throw new Error('TimelineViewBuilder: titleField() is required');
    return {
      endpoint: this._endpoint,
      fields: {
        timestamp: this._timestampField,
        title: this._titleField,
        ...(this._descriptionField && { description: this._descriptionField }),
        ...(this._variantField && { variant: this._variantField }),
        ...(this._iconField && { icon: this._iconField }),
      },
      ...(this._metadataTitle && { metadata: { title: this._metadataTitle } }),
    };
  }
}

export const TimelineView = TimelineViewBuilder;
