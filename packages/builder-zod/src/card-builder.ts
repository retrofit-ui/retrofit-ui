import type { CardSpec, Spec } from '@retrofit-ui/core';

export class CardViewBuilder {
  private _header?: string;
  private _children: Spec[] = [];
  private _footer?: Spec;

  header(text: string): this {
    this._header = text;
    return this;
  }

  add(child: Spec): this {
    this._children.push(child);
    return this;
  }

  footer(spec: Spec): this {
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
