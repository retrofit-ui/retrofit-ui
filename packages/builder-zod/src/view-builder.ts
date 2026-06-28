import type {
  Cell,
  Column,
  EndpointDirective,
  FieldOption,
  RowAction,
  TableSpec,
} from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { tableFromSchema } from './TableBuilder';

function getDef(schema: ZodTypeAny): Record<string, unknown> {
  return schema._def as unknown as Record<string, unknown>;
}

function unwrapOptional(schema: ZodTypeAny): ZodTypeAny {
  const def = getDef(schema);
  return def.type === 'optional' ? (def.innerType as ZodTypeAny) : schema;
}

/** The `{param}` name from an endpoint url (e.g. /todos/{id} -> "id"). */
function idParam(endpoint: EndpointDirective | undefined): string | undefined {
  return endpoint?.url.match(/\{(\w+)\}/)?.[1];
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
  private _formatters = new Map<string, (v: unknown) => string>();
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

  columnOverride(
    key: string,
    override: Omit<Partial<Column>, 'format'> & {
      format?: NonNullable<Column['format']> | ((v: unknown) => string);
    },
  ): this {
    const { format, ...rest } = override;
    const colOverride: Partial<Column> = rest as Partial<Column>;
    if (typeof format === 'function') {
      this._formatters.set(key, format);
    } else if (format !== undefined) {
      colOverride.format = format;
    }
    if (Object.keys(colOverride).length > 0) {
      this._columnOverrides[key] = {
        ...this._columnOverrides[key],
        ...colOverride,
      };
    }
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

    // Row links and update/delete URLs are keyed by an id field. Derive it from
    // whichever endpoint carries a {param} (find/update/delete should agree) and
    // expose it explicitly so the SPA doesn't have to re-parse the url. Tables
    // with no navigating/mutating endpoint don't need an id at all.
    const idField =
      idParam(this._endpoints.find) ??
      idParam(this._endpoints.update) ??
      idParam(this._endpoints.delete);
    const columnKeys = new Set(columns.map((c) => c.key));

    const rows =
      this._rows !== undefined
        ? this._rows.map((row) => {
            const cells = Object.fromEntries(
              columns.map((col) => {
                const value = row[col.key];
                const formatter = this._formatters.get(col.key);
                const cell: Cell = formatter
                  ? { value, formatted: formatter(value) }
                  : { value };
                return [col.key, cell];
              }),
            );
            // Carry the id even when it is hidden via visibleColumns(), so the
            // client can still resolve a row link / mutation target.
            if (
              idField !== undefined &&
              !columnKeys.has(idField) &&
              row[idField] !== undefined
            ) {
              cells[idField] = { value: row[idField] };
            }
            return cells;
          })
        : undefined;

    return {
      kind: 'table' as const,
      columns,
      ...(idField !== undefined && { idField }),
      endpoints: this._endpoints,
      ...(rows !== undefined && { rows }),
      ...(this._rowActions.length > 0 && { rowActions: this._rowActions }),
      ...(this._metadata !== undefined && { metadata: this._metadata }),
    };
  }
}

export const TableView = TableViewBuilder;
