import type { EndpointDirective, Field, FormSpec } from '@retrofit-ui/core';
import { formFromSchema } from '@retrofit-ui/schema-builder-zod';
import type { ZodObject, ZodRawShape } from 'zod';

export class FormSpecBuilder<S extends ZodRawShape> {
  private _fieldOverrides: Record<string, Partial<Field>> = {};
  private _endpoints: FormSpec['endpoints'] = {};
  private _entity?: Record<string, unknown>;

  constructor(
    private readonly _schema: ZodObject<S>,
    private readonly _updateSchema?: ZodObject<ZodRawShape>,
  ) {}

  fieldOverride(key: string, override: Partial<Field>): this {
    this._fieldOverrides[key] = { ...this._fieldOverrides[key], ...override };
    return this;
  }

  values(entity: Record<string, unknown>): this {
    this._entity = entity;
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

  build(): FormSpec {
    const builder = formFromSchema(this._schema);
    if (this._updateSchema) {
      builder.withMutability(this._updateSchema);
    }
    const baseFields = builder.build().fields;
    const fields = baseFields.map((field) => {
      const withOverride = this._fieldOverrides[field.name]
        ? { ...field, ...this._fieldOverrides[field.name] }
        : field;
      if (this._entity && this._entity[withOverride.name] !== undefined) {
        return { ...withOverride, value: this._entity[withOverride.name] };
      }
      return withOverride;
    });
    return { fields, endpoints: this._endpoints };
  }
}

export function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>,
): FormSpecBuilder<S> {
  return new FormSpecBuilder(schema, updateSchema);
}
