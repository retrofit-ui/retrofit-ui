import type {
  Column,
  EndpointDirective,
  Field,
  FormSpec,
  TableSpec,
} from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import { FormSpecBuilder } from './form-builder';
import { TableViewBuilder } from './view-builder';

export class TableCustomizer {
  readonly _columnOverrides: Record<string, Partial<Column>> = {};
  _metadata?: TableSpec['metadata'];

  columnOverride(key: string, override: Partial<Column>): this {
    this._columnOverrides[key] = { ...this._columnOverrides[key], ...override };
    return this;
  }

  metadata(meta: TableSpec['metadata']): this {
    this._metadata = meta;
    return this;
  }
}

export class FormCustomizer {
  readonly _fieldOverrides: Record<string, Partial<Field>> = {};
  _title?: string;

  fieldOverride(key: string, override: Partial<Field>): this {
    this._fieldOverrides[key] = { ...this._fieldOverrides[key], ...override };
    return this;
  }

  /** The record's name in form headings: "New <title>", "Edit <title>". */
  title(title: string): this {
    this._title = title;
    return this;
  }
}

type FormFactory = (edit?: {
  values: Record<string, unknown>;
  params: Record<string, string | number>;
}) => FormSpec;

/**
 * Produced by {@link WorkflowBundleBuilder.build}: the resource's table, plus
 * its create form and, per record, its edit form. Serving them is the host
 * server's job — see the JS examples for the plain-Express route wiring.
 */
export class WorkflowBundle {
  constructor(
    readonly tableSpec: TableSpec,
    private readonly _form: FormFactory,
  ) {}

  /** The create form: submits to `create`. */
  get createForm(): FormSpec {
    return this._form();
  }

  /**
   * One record's edit form: prefilled with `values`, submitting to `update`
   * with `{param}`s filled from `params`, e.g. `editForm(post, { id: post.id })`.
   */
  editForm(
    values: Record<string, unknown>,
    params: Record<string, string | number>,
  ): FormSpec {
    return this._form({ values, params });
  }
}

export class WorkflowBundleBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _tableCustomizer = new TableCustomizer();
  private _formCustomizer = new FormCustomizer();
  private _route?: string;
  private _endpoints: {
    list?: EndpointDirective;
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  } = {};

  private constructor(private readonly _schema: ZodObject<S>) {}

  static schema<S extends ZodRawShape>(
    schema: ZodObject<S>,
  ): WorkflowBundleBuilder<S> {
    return new WorkflowBundleBuilder(schema);
  }

  updateSchema(schema: ZodObject<ZodRawShape>): this {
    this._updateSchema = schema;
    return this;
  }

  table(customiser: (t: TableCustomizer) => TableCustomizer): this {
    this._tableCustomizer = customiser(new TableCustomizer());
    return this;
  }

  form(customiser: (f: FormCustomizer) => FormCustomizer): this {
    this._formCustomizer = customiser(new FormCustomizer());
    return this;
  }

  /**
   * The resource's hash route, e.g. `/contacts` (see `crudRoutes`). Gives the
   * table a "New" button to `<route>/new` and sends forms back to `<route>`
   * when done.
   */
  route(path: string): this {
    this._route = `/${path.replace(/^[#/]+|\/+$/g, '')}`;
    return this;
  }

  list(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, list: directive };
    return this;
  }

  create(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, create: directive };
    return this;
  }

  update(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, update: directive };
    return this;
  }

  delete(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, delete: directive };
    return this;
  }

  build(): WorkflowBundle {
    // Build table spec — no updateSchema here so columns are NOT editable inline;
    // the bundle uses the form view route for mutations, not inline editing.
    const tableBuilder = TableViewBuilder.schema(this._schema);
    for (const [key, override] of Object.entries(
      this._tableCustomizer._columnOverrides,
    )) {
      tableBuilder.columnOverride(key, override);
    }
    if (this._tableCustomizer._metadata) {
      tableBuilder.metadata(this._tableCustomizer._metadata);
    }
    if (this._endpoints.list) tableBuilder.list(this._endpoints.list);
    if (this._endpoints.create) tableBuilder.create(this._endpoints.create);
    const route = this._route;
    if (route && this._endpoints.create) {
      tableBuilder.toolbar('New', { type: 'navigate', to: `#${route}/new` });
    }
    const tableSpec = tableBuilder.build();

    const schema = this._schema;
    const updateSchema = this._updateSchema;
    const customizer = this._formCustomizer;
    const endpoints = this._endpoints;
    const makeForm: FormFactory = (edit) => {
      const form = new FormSpecBuilder(schema, updateSchema);
      for (const [key, override] of Object.entries(
        customizer._fieldOverrides,
      )) {
        form.fieldOverride(key, override);
      }
      if (customizer._title) form.title(customizer._title);
      if (route) form.onDone({ type: 'navigate', to: `#${route}` });
      if (edit) {
        form.edit().values(edit.values).params(edit.params);
        if (endpoints.update) form.update(endpoints.update);
        if (endpoints.delete) form.delete(endpoints.delete);
      } else if (endpoints.create) {
        form.create(endpoints.create);
      }
      return form.build();
    };

    return new WorkflowBundle(tableSpec, makeForm);
  }
}

export const TableFormWorkflowBundle = WorkflowBundleBuilder;
