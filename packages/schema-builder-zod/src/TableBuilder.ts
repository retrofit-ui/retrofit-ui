import type { Column, Table, TableMetadata } from '@retrofit-ui/core';
import { TableSchema } from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape } from 'zod';
import { getShape, zodFieldToColumn } from './mappers';

export class TableBuilder<S extends ZodRawShape> {
  private title?: string;
  private description?: string;
  private rowLink?: string;
  private createUrl?: string;
  private overrides: Record<string, Partial<Column>> = {};

  constructor(
    private readonly schema: ZodObject<S>,
    private readonly data: Record<string, unknown>[],
  ) {}

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withRowLink(template: string): this {
    this.rowLink = template;
    return this;
  }

  withCreateUrl(url: string): this {
    this.createUrl = url;
    return this;
  }

  withColumnOverrides(overrides: Record<string, Partial<Column>>): this {
    this.overrides = { ...this.overrides, ...overrides };
    return this;
  }

  build(): Table {
    const shape = getShape(this.schema);
    const columns: Column[] = Object.entries(shape).map(
      ([key, fieldSchema]) => {
        const base = zodFieldToColumn(key, fieldSchema);
        const override = this.overrides[key];
        return override ? { ...base, ...override } : base;
      },
    );

    const metadata: TableMetadata = {
      pageSize: 25,
      ...(this.title && { title: this.title }),
      ...(this.description && { description: this.description }),
      ...(this.rowLink && { rowLink: this.rowLink }),
      ...(this.createUrl && { createUrl: this.createUrl }),
    };

    return TableSchema.parse({ columns, data: this.data, metadata });
  }
}

export function tableFromSchema<S extends ZodRawShape>(
  schema: ZodObject<S>,
  data: Record<string, unknown>[],
): TableBuilder<S> {
  return new TableBuilder(schema, data);
}
