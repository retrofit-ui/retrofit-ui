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

  fieldOverride(key: string, override: Partial<Field>): this {
    this._fieldOverrides[key] = { ...this._fieldOverrides[key], ...override };
    return this;
  }
}

/**
 * Pure data holder produced by {@link WorkflowBundleBuilder.build}. Holds the
 * two complementary specs (table + form). Serving them is the host server's
 * job — see the JS examples for the plain-Express route wiring.
 */
export class WorkflowBundle {
  constructor(
    readonly tableSpec: TableSpec,
    readonly formSpec: FormSpec,
  ) {}
}

export class WorkflowBundleBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _tableCustomizer = new TableCustomizer();
  private _formCustomizer = new FormCustomizer();
  private _endpoints: {
    list?: EndpointDirective;
    find?: EndpointDirective;
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

  list(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, list: directive };
    return this;
  }

  find(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, find: directive };
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
    if (this._endpoints.find) tableBuilder.find(this._endpoints.find);
    if (this._endpoints.create) tableBuilder.create(this._endpoints.create);
    if (this._endpoints.update) tableBuilder.update(this._endpoints.update);
    if (this._endpoints.delete) tableBuilder.delete(this._endpoints.delete);
    const tableSpec = tableBuilder.build();

    // Build form spec
    const formBuilder = new FormSpecBuilder(this._schema, this._updateSchema);
    for (const [key, override] of Object.entries(
      this._formCustomizer._fieldOverrides,
    )) {
      formBuilder.fieldOverride(key, override);
    }
    if (this._endpoints.create) formBuilder.create(this._endpoints.create);
    if (this._endpoints.update) formBuilder.update(this._endpoints.update);
    if (this._endpoints.delete) formBuilder.delete(this._endpoints.delete);
    const formSpecResult = formBuilder.build();

    return new WorkflowBundle(tableSpec, formSpecResult);
  }
}

export const TableFormWorkflowBundle = WorkflowBundleBuilder;
