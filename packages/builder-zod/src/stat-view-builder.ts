import type { Stat, StatSpec } from '@retrofit-ui/core';

export class StatViewBuilder {
  private _stats: Stat[] = [];
  private _title?: string;

  stat(stat: Stat): this {
    this._stats.push(stat);
    return this;
  }

  title(title: string): this {
    this._title = title;
    return this;
  }

  build(): StatSpec {
    return {
      kind: 'stat',
      stats: this._stats,
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const StatView = StatViewBuilder;
