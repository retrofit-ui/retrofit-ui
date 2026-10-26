import type {
  FilterField,
  FilterFormSpec,
  FlexSpec,
  FormSpec,
  GridSpec,
  LayoutConfig,
  MarkdownViewSpec,
  PageSpec,
  Spec,
  TableSpec,
} from '@retrofit-ui/core';

/** A form with `title`, if given, as its metadata title. */
function titled(spec: FormSpec, title?: string): FormSpec {
  return title === undefined
    ? spec
    : { ...spec, metadata: { ...spec.metadata, title } };
}

// ── FilterFormSpecBuilder ────────────────────────────────────────────────────

export class FilterFormSpecBuilder {
  private _fields: FilterField[] = [];

  field(name: string, config: Omit<FilterField, 'name'>): this {
    this._fields.push({ name, ...config });
    return this;
  }

  build(): FilterFormSpec {
    return { kind: 'filter-form', fields: this._fields };
  }
}

export function filterForm(): FilterFormSpecBuilder {
  return new FilterFormSpecBuilder();
}

// ── LayoutContainerBuilder ────────────────────────────────────────────────────

export class LayoutContainerBuilder {
  private _children: Spec[] = [];

  constructor(
    private readonly _kind: 'flex' | 'grid',
    private readonly _props: object = {},
  ) {}

  add(child: Spec): this {
    this._children.push(child);
    return this;
  }

  form(spec: FormSpec, title?: string): this {
    return this.add(titled(spec, title));
  }

  table(spec: TableSpec): this {
    return this.add(spec);
  }

  filterForm(spec: FilterFormSpec): this {
    return this.add(spec);
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add(spec);
  }

  /** Extract the layout configuration for use with PageSpecBuilder.layout(). */
  layoutConfig(): LayoutConfig {
    return { ...this._props } as LayoutConfig;
  }

  build(): FlexSpec | GridSpec {
    return {
      ...this._props,
      kind: this._kind,
      children: this._children,
    } as FlexSpec | GridSpec;
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
  private _children: Spec[] = [];

  title(t: string): this {
    this._title = t;
    return this;
  }

  /** Set the layout for the root container. */
  layout(config: LayoutConfig | LayoutContainerBuilder): this {
    this._layout =
      config instanceof LayoutContainerBuilder ? config.layoutConfig() : config;
    return this;
  }

  /** Add any spec (leaf or nested layout container) as a child. */
  add(child: Spec): this {
    this._children.push(child);
    return this;
  }

  // Convenience shortcuts — sugar over .add()
  filterForm(spec: FilterFormSpec): this {
    return this.add(spec);
  }

  form(spec: FormSpec, title?: string): this {
    return this.add(titled(spec, title));
  }

  table(spec: TableSpec): this {
    return this.add(spec);
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add(spec);
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
