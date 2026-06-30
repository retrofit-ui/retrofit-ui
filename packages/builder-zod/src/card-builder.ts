import type { CardFooterButton, CardSpec, ViewSpec } from '@retrofit-ui/core';

export class CardViewBuilder {
  private _header?: string;
  private _children: ViewSpec[] = [];
  private _footer: CardFooterButton[] = [];

  header(text: string): this {
    this._header = text;
    return this;
  }

  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  footerButton(btn: CardFooterButton): this {
    this._footer.push(btn);
    return this;
  }

  build(): CardSpec {
    return {
      kind: 'card',
      ...(this._header !== undefined && { header: this._header }),
      children: this._children,
      ...(this._footer.length > 0 && { footer: this._footer }),
    };
  }
}

export const CardView = CardViewBuilder;
