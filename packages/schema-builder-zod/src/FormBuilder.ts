import type { Field, Form, FormMetadata } from '@retrofit-ui/core';
import { FormSchema } from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import { getShape, zodFieldToField } from './mappers';

export class FormBuilder<S extends ZodRawShape> {
  private mutabilityKeys: Set<string> | null = null;
  private submitAction?: FormMetadata['submitAction'];
  private deleteAction?: FormMetadata['deleteAction'];
  private newEntityUrl?: string;
  private title?: string;
  private description?: string;
  private overrides: Record<string, Partial<Field>> = {};

  constructor(private readonly fullSchema: ZodObject<S>) {}

  withMutability(updateSchema: ZodObject<ZodRawShape>): this {
    this.mutabilityKeys = new Set(Object.keys(updateSchema.shape));
    return this;
  }

  withSubmit(action: { method: string; url: string }): this {
    this.submitAction = action;
    return this;
  }

  withDelete(action: { method: string; url: string }): this {
    this.deleteAction = action;
    return this;
  }

  withNewEntityUrl(url: string): this {
    this.newEntityUrl = url;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withFieldOverrides(overrides: Record<string, Partial<Field>>): this {
    this.overrides = { ...this.overrides, ...overrides };
    return this;
  }

  build(): Form {
    const shape = getShape(this.fullSchema);
    const fields: Field[] = Object.entries(shape).map(([key, fieldSchema]) => {
      const readOnly =
        this.mutabilityKeys !== null && !this.mutabilityKeys.has(key);
      const base = zodFieldToField(key, fieldSchema, readOnly);
      const override = this.overrides[key];
      return override ? { ...base, ...override } : base;
    });

    const metadata: FormMetadata = {
      submitLabel: 'Submit',
      layout: 'single-column',
      ...(this.title && { title: this.title }),
      ...(this.description && { description: this.description }),
      ...(this.submitAction && { submitAction: this.submitAction }),
      ...(this.deleteAction && { deleteAction: this.deleteAction }),
      ...(this.newEntityUrl && { newEntityUrl: this.newEntityUrl }),
    };

    return FormSchema.parse({ fields, metadata });
  }
}

export function formFromSchema<S extends ZodRawShape>(
  schema: ZodObject<S>,
): FormBuilder<S> {
  return new FormBuilder(schema);
}
