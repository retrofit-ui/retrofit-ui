import type {
  Column,
  EndpointDirective,
  Field,
  ResourceSpec,
} from '@retrofit-ui/core';
import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import type { ZodObject, ZodRawShape } from 'zod';

export class TableViewBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _columnOverrides: Record<string, Partial<Column>> = {};
  private _fieldOverrides: Record<string, Partial<Field>> = {};
  private _endpoints: ResourceSpec['endpoints'] = {};

  private constructor(private readonly _schema: ZodObject<S>) {}

  static schema<S extends ZodRawShape>(
    schema: ZodObject<S>,
  ): TableViewBuilder<S> {
    return new TableViewBuilder(schema);
  }

  updateSchema(schema: ZodObject<ZodRawShape>): this {
    this._updateSchema = schema;
    return this;
  }

  columnOverride(key: string, override: Partial<Column>): this {
    this._columnOverrides[key] = { ...this._columnOverrides[key], ...override };
    return this;
  }

  fieldOverride(key: string, override: Partial<Field>): this {
    this._fieldOverrides[key] = { ...this._fieldOverrides[key], ...override };
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

  build(): ResourceSpec {
    const baseColumns = tableFromSchema(this._schema, []).build().columns;
    const columns = baseColumns.map((col) => {
      const override = this._columnOverrides[col.key];
      return override ? { ...col, ...override } : col;
    });

    const formBuilder = formFromSchema(this._schema);
    if (this._updateSchema) {
      formBuilder.withMutability(this._updateSchema);
    }
    const baseFields = formBuilder.build().fields;
    const fields = baseFields.map((field) => {
      const override = this._fieldOverrides[field.name];
      return override ? { ...field, ...override } : field;
    });

    return { columns, fields, endpoints: this._endpoints };
  }
}

export const TableView = TableViewBuilder;
