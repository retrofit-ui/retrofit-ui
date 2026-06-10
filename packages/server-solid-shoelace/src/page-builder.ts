import type {
  FilterField,
  FilterFormSpec,
  FormSpec,
  MarkdownViewSpec,
  PageSpec,
  Pane,
  TableSpec,
} from '@retrofit-ui/core';

export class FilterFormSpecBuilder {
  private _fields: FilterField[] = [];

  field(name: string, config: Omit<FilterField, 'name'>): this {
    this._fields.push({ name, ...config });
    return this;
  }

  build(): FilterFormSpec {
    return { fields: this._fields };
  }
}

export function filterForm(): FilterFormSpecBuilder {
  return new FilterFormSpecBuilder();
}

export class PageSpecBuilder {
  private _title?: string;
  private _panes: Pane[] = [];

  title(t: string): this {
    this._title = t;
    return this;
  }

  filterForm(spec: FilterFormSpec): this {
    this._panes.push({ kind: 'filter-form', spec });
    return this;
  }

  form(spec: FormSpec, title?: string): this {
    this._panes.push({
      kind: 'form',
      spec,
      ...(title !== undefined && { title }),
    });
    return this;
  }

  table(spec: TableSpec): this {
    this._panes.push({ kind: 'table', spec });
    return this;
  }

  markdown(spec: MarkdownViewSpec): this {
    this._panes.push({ kind: 'markdown', spec });
    return this;
  }

  build(): PageSpec {
    return {
      kind: 'page',
      ...(this._title !== undefined && { title: this._title }),
      panes: this._panes,
    };
  }
}

export function pageSpec(): PageSpecBuilder {
  return new PageSpecBuilder();
}
