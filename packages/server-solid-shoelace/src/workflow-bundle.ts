import type {
  Column,
  EndpointDirective,
  Field,
  FormSpec,
  TableSpec,
} from '@retrofit-ui/core';
import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import type express from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

export class TableCustomizer {
  readonly _columnOverrides: Record<string, Partial<Column>> = {};

  columnOverride(key: string, override: Partial<Column>): this {
    this._columnOverrides[key] = { ...this._columnOverrides[key], ...override };
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

export class WorkflowBundle {
  constructor(
    readonly tableSpec: TableSpec,
    readonly formSpec: FormSpec,
  ) {}

  register(
    app: express.Express,
    retrofit: <T>(spec: T) => T,
    path: string,
  ): void {
    app.get(path, (_req, res) => {
      res.json(retrofit(this.tableSpec));
    });
    app.get(`${path}/:id`, (_req, res) => {
      res.json(retrofit(this.formSpec));
    });
  }
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
    const baseColumns = tableFromSchema(this._schema, []).build().columns;
    const columns = baseColumns.map((col) => {
      const override = this._tableCustomizer._columnOverrides[col.key];
      return override ? { ...col, ...override } : col;
    });

    const formBuilder = formFromSchema(this._schema);
    if (this._updateSchema) {
      formBuilder.withMutability(this._updateSchema);
    }
    const baseFields = formBuilder.build().fields;
    const fields = baseFields.map((field) => {
      const override = this._formCustomizer._fieldOverrides[field.name];
      return override ? { ...field, ...override } : field;
    });

    const tableSpec: TableSpec = {
      columns,
      endpoints: {
        ...(this._endpoints.list && { list: this._endpoints.list }),
        ...(this._endpoints.find && { find: this._endpoints.find }),
        ...(this._endpoints.create && { create: this._endpoints.create }),
      },
    };

    const formSpec: FormSpec = {
      fields,
      endpoints: {
        ...(this._endpoints.find && { find: this._endpoints.find }),
        ...(this._endpoints.create && { create: this._endpoints.create }),
        ...(this._endpoints.update && { update: this._endpoints.update }),
        ...(this._endpoints.delete && { delete: this._endpoints.delete }),
      },
    };

    return new WorkflowBundle(tableSpec, formSpec);
  }
}

export const TableFormWorkflowBundle = WorkflowBundleBuilder;
