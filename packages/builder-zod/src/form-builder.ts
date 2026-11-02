import type {
  Action,
  EndpointDirective,
  Field,
  FormLayoutConfig,
  FormSpec,
} from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import { getShape, zodFieldToField } from './mappers';
import { fillUrl } from './row-actions';

function resolveEndpoints(
  endpoints: FormSpec['endpoints'],
  params: Record<string, string | number>,
): FormSpec['endpoints'] {
  return Object.fromEntries(
    Object.entries(endpoints).map(([key, ep]) => [
      key,
      ep && { ...ep, url: fillUrl(ep.url, params) },
    ]),
  ) as FormSpec['endpoints'];
}

export class FormSpecBuilder<S extends ZodRawShape> {
  private _fieldOverrides: Record<string, Partial<Field>> = {};
  private _endpoints: FormSpec['endpoints'] = {};
  private _entity?: Record<string, unknown>;
  private _autoSubmit = false;
  private _layout?: FormLayoutConfig;
  private _title?: string;
  private _submitLabel?: string;
  private _edit = false;
  private _onDone?: Action;
  private _params: Record<string, string | number> = {};

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

  title(title: string): this {
    this._title = title;
    return this;
  }

  submitLabel(label: string): this {
    this._submitLabel = label;
    return this;
  }

  /** An edit form: submits to `update()` and offers `delete()`. */
  edit(): this {
    this._edit = true;
    return this;
  }

  /** Dispatched after a save or delete, and by the Back button. */
  onDone(action: Action): this {
    this._onDone = action;
    return this;
  }

  /**
   * Fills `{name}` in every endpoint url with `params[name]`, here on the
   * server, e.g. `.params({ id: 7 })` turns `/posts/{id}` into `/posts/7`.
   */
  params(params: Record<string, string | number>): this {
    this._params = { ...this._params, ...params };
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
      const override = this._fieldOverrides[field.name];
      const withOverride: Field = override ? { ...field, ...override } : field;
      // An override's validation adds to the schema-derived one (required, min, max).
      if (override?.validation) {
        withOverride.validation = {
          ...field.validation,
          ...override.validation,
        };
      }
      if (this._entity && this._entity[withOverride.name] !== undefined) {
        return { ...withOverride, value: this._entity[withOverride.name] };
      }
      return withOverride;
    });
    const metadata: NonNullable<FormSpec['metadata']> = {
      ...(this._title && { title: this._title }),
      ...(this._edit && { mode: 'edit' as const }),
      ...(this._onDone && { onDone: this._onDone }),
      ...(this._submitLabel && { submitLabel: this._submitLabel }),
      ...(this._autoSubmit && { autoSubmit: true }),
      ...(this._layout && { layout: this._layout }),
    };
    return {
      kind: 'form' as const,
      fields,
      endpoints: resolveEndpoints(this._endpoints, this._params),
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };
  }
}

export function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>,
): FormSpecBuilder<S> {
  return new FormSpecBuilder(schema, updateSchema);
}
