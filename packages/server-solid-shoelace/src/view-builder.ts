import type {
  Column,
  EndpointDirective,
  FieldOption,
  RowAction,
  TableSpec,
} from '@retrofit-ui/core';
import { tableFromSchema } from '@retrofit-ui/schema-builder-zod';
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

function getDef(schema: ZodTypeAny): Record<string, unknown> {
  return schema._def as unknown as Record<string, unknown>;
}

function unwrapOptional(schema: ZodTypeAny): ZodTypeAny {
  const def = getDef(schema);
  return def.type === 'optional' ? (def.innerType as ZodTypeAny) : schema;
}

function deriveEnumOptions(schema: ZodTypeAny): FieldOption[] | undefined {
  const inner = unwrapOptional(schema);
  const def = getDef(inner);
  if (def.type !== 'enum') return undefined;
  const entries = def.entries as Record<string, unknown> | undefined;
  if (!entries) return undefined;
  return Object.values(entries).map((v) => ({
    label: String(v),
    value: v as string,
  }));
}

export class TableViewBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _columnOverrides: Record<string, Partial<Column>> = {};
  private _rowActions: RowAction[] = [];
  private _visibleKeys?: string[];
  private _endpoints: TableSpec['endpoints'] = {};
  private _rows?: Record<string, unknown>[];
  private _metadata?: TableSpec['metadata'];

  private constructor(private readonly _schema: ZodObject<S>) {}

  static schema<S extends ZodRawShape>(
    schema: ZodObject<S>,
  ): TableViewBuilder<S> {
    return new TableViewBuilder(schema);
  }

  static forRows<S extends ZodRawShape>(
    schema: ZodObject<S>,
    rows: Record<string, unknown>[],
  ): TableViewBuilder<S> {
    return TableViewBuilder.schema(schema).rows(rows);
  }

  rows(rows: Record<string, unknown>[]): this {
    this._rows = rows;
    return this;
  }

  /** Columns in updateSchema are marked editable; others are read-only in inline edit mode. */
  updateSchema(schema: ZodObject<ZodRawShape>): this {
    this._updateSchema = schema;
    return this;
  }

  columnOverride(key: string, override: Partial<Column>): this {
    this._columnOverrides[key] = { ...this._columnOverrides[key], ...override };
    return this;
  }

  rowAction(action: RowAction): this {
    this._rowActions.push(action);
    return this;
  }

  metadata(meta: TableSpec['metadata']): this {
    this._metadata = meta;
    return this;
  }

  /** Only include these column keys in the output spec. */
  visibleColumns(keys: string[]): this {
    this._visibleKeys = keys;
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

  build(): TableSpec {
    const editableKeys = this._updateSchema
      ? new Set(Object.keys(this._updateSchema.shape))
      : null;

    const shape = this._schema.shape as unknown as Record<string, ZodTypeAny>;
    const baseColumns = tableFromSchema(this._schema, []).build().columns;

    let columns = baseColumns.map((col) => {
      const editable = editableKeys ? editableKeys.has(col.key) : false;
      const options = deriveEnumOptions(shape[col.key] as ZodTypeAny);
      const base: Column = { ...col, editable, ...(options && { options }) };
      const override = this._columnOverrides[col.key];
      return override ? { ...base, ...override } : base;
    });

    if (this._visibleKeys) {
      const keySet = new Set(this._visibleKeys);
      columns = columns.filter((c) => keySet.has(c.key));
    }

    return {
      columns,
      endpoints: this._endpoints,
      ...(this._rows !== undefined && { rows: this._rows }),
      ...(this._rowActions.length > 0 && { rowActions: this._rowActions }),
      ...(this._metadata !== undefined && { metadata: this._metadata }),
    };
  }
}

export const TableView = TableViewBuilder;
