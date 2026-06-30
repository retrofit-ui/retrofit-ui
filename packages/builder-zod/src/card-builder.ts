import type { CardSpec, ViewSpec } from '@retrofit-ui/core';

export class CardViewBuilder {
  private _header?: string;
  private _children: ViewSpec[] = [];
  private _footer?: ViewSpec;

  header(text: string): this {
    this._header = text;
    return this;
  }

  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  footer(spec: ViewSpec): this {
    this._footer = spec;
    return this;
  }

  build(): CardSpec {
    return {
      kind: 'card',
      ...(this._header !== undefined && { header: this._header }),
      children: this._children,
      ...(this._footer !== undefined && { footer: this._footer }),
    };
  }
}

export const CardView = CardViewBuilder;
