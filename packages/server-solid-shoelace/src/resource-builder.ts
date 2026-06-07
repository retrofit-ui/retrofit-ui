import type { Column, Field } from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import type { ResourceConfig } from './types';

export class ResourceBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _columnOverrides: Record<string, Partial<Column>> = {};
  private _fieldOverrides: Record<string, Partial<Field>> = {};
  private _list?: ResourceConfig['list'];
  private _find?: ResourceConfig['find'];
  private _create?: ResourceConfig['create'];
  private _update?: ResourceConfig['update'];
  private _delete?: ResourceConfig['delete'];

  constructor(private readonly _schema: ZodObject<S>) {}

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

  list(fn: () => unknown[] | Promise<unknown[]>): this {
    this._list = fn;
    return this;
  }

  find(fn: (id: string) => unknown | Promise<unknown>): this {
    this._find = fn;
    return this;
  }

  create(fn: (data: unknown) => unknown | Promise<unknown>): this {
    this._create = fn;
    return this;
  }

  update(fn: (id: string, data: unknown) => unknown | Promise<unknown>): this {
    this._update = fn;
    return this;
  }

  delete(fn: (id: string) => unknown | Promise<unknown>): this {
    this._delete = fn;
    return this;
  }

  build(): ResourceConfig<S> {
    return {
      schema: this._schema,
      ...(this._updateSchema && { updateSchema: this._updateSchema }),
      ...(Object.keys(this._columnOverrides).length > 0 && {
        columnOverrides: this._columnOverrides,
      }),
      ...(Object.keys(this._fieldOverrides).length > 0 && {
        fieldOverrides: this._fieldOverrides,
      }),
      ...(this._list && { list: this._list }),
      ...(this._find && { find: this._find }),
      ...(this._create && { create: this._create }),
      ...(this._update && { update: this._update }),
      ...(this._delete && { delete: this._delete }),
    };
  }
}

export function resource<S extends ZodRawShape>(
  schema: ZodObject<S>,
): ResourceBuilder<S> {
  return new ResourceBuilder(schema);
}
