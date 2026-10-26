import type {
  EndpointDirective,
  Field,
  FormLayoutConfig,
  FormSpec,
} from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import { getShape, zodFieldToField } from './mappers';

export class FormSpecBuilder<S extends ZodRawShape> {
  private _fieldOverrides: Record<string, Partial<Field>> = {};
  private _endpoints: FormSpec['endpoints'] = {};
  private _entity?: Record<string, unknown>;
  private _autoSubmit = false;
  private _layout?: FormLayoutConfig;

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

  autoSubmit(): this {
    this._autoSubmit = true;
    return this;
  }

  layout(config: FormLayoutConfig): this {
    this._layout = config;
    return this;
  }

  build(): FormSpec {
    // A field the update schema leaves out can't be changed once created.
    const updatable = this._updateSchema
      ? new Set(Object.keys(this._updateSchema.shape))
      : null;
    const baseFields = Object.entries(getShape(this._schema)).map(
      ([key, schema]) =>
        zodFieldToField(key, schema, updatable !== null && !updatable.has(key)),
    );
    const fields = baseFields.map((field) => {
      const withOverride = this._fieldOverrides[field.name]
        ? { ...field, ...this._fieldOverrides[field.name] }
        : field;
      if (this._entity && this._entity[withOverride.name] !== undefined) {
        return { ...withOverride, value: this._entity[withOverride.name] };
      }
      return withOverride;
    });
    return {
      kind: 'form' as const,
      fields,
      endpoints: this._endpoints,
      ...((this._autoSubmit || this._layout) && {
        metadata: {
          ...(this._autoSubmit && { autoSubmit: true }),
          ...(this._layout && { layout: this._layout }),
        },
      }),
    };
  }
}

export function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>,
): FormSpecBuilder<S> {
  return new FormSpecBuilder(schema, updateSchema);
}
