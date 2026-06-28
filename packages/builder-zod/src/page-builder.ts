import type {
  FilterField,
  FilterFormSpec,
  FormSpec,
  LayoutConfig,
  MarkdownViewSpec,
  PageSpec,
  TableSpec,
  ViewSpec,
} from '@retrofit-ui/core';

// ── FilterFormSpecBuilder (unchanged) ────────────────────────────────────────

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

// ── LayoutContainerBuilder ────────────────────────────────────────────────────

export class LayoutContainerBuilder {
  private _children: ViewSpec[] = [];

  constructor(
    private readonly _kind: 'flex' | 'grid',
    private readonly _props: object = {},
  ) {}

  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  form(spec: FormSpec, title?: string): this {
    return this.add({
      kind: 'form',
      spec,
      ...(title !== undefined && { title }),
    });
  }

  table(spec: TableSpec): this {
    return this.add({ kind: 'table', spec });
  }

  filterForm(spec: FilterFormSpec): this {
    return this.add({ kind: 'filter-form', spec });
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add({ kind: 'markdown', spec });
  }

  build(): ViewSpec {
    return {
      kind: this._kind,
      ...this._props,
      children: this._children,
    } as unknown as ViewSpec;
  }
}

/** Shorthand: flex row. */
export function row(gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('flex', {
    direction: 'row' as const,
    ...(gap !== undefined && { gap }),
  });
}

/** Shorthand: flex column. */
export function col(gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('flex', {
    direction: 'column' as const,
    ...(gap !== undefined && { gap }),
  });
}

/** Shorthand: CSS grid with n equal columns. */
export function grid(columns: number, gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('grid', {
    columns,
    ...(gap !== undefined && { gap }),
  });
}

// ── PageSpecBuilder ───────────────────────────────────────────────────────────

export class PageSpecBuilder {
  private _title?: string;
  private _layout?: LayoutConfig;
  private _children: ViewSpec[] = [];

  title(t: string): this {
    this._title = t;
    return this;
  }

  /** Set the layout for the root container. */
  layout(config: LayoutConfig): this {
    this._layout = config;
    return this;
  }

  /** Add any ViewSpec (leaf or nested layout container) as a child. */
  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  // Convenience shortcuts — sugar over .add()
  filterForm(spec: FilterFormSpec): this {
    return this.add({ kind: 'filter-form', spec });
  }

  form(spec: FormSpec, title?: string): this {
    return this.add({
      kind: 'form',
      spec,
      ...(title !== undefined && { title }),
    });
  }

  table(spec: TableSpec): this {
    return this.add({ kind: 'table', spec });
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add({ kind: 'markdown', spec });
  }

  build(): PageSpec {
    return {
      kind: 'page',
      ...(this._title !== undefined && { title: this._title }),
      ...(this._layout !== undefined && { layout: this._layout }),
      children: this._children,
    };
  }
}

export function pageSpec(): PageSpecBuilder {
  return new PageSpecBuilder();
}
