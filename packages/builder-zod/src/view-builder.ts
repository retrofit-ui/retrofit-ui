import type {
  Action,
  Cell,
  Column,
  EndpointDirective,
  FieldOption,
  ReadEndpoint,
  RowAction,
  TableSpec,
  ToolbarButton,
} from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { getShape, zodFieldToColumn } from './mappers';
import { withRowActions } from './row-actions';

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

/** Resolves one row's link, or nothing for no link. */
export type RowLink = (row: Record<string, unknown>) => string | undefined;

// Row fields the builder adds to carry each row's resolved links.
const ROW_LINK = '_link';
const rowActionField = (i: number) => `_action${i}`;

export class TableViewBuilder<S extends ZodRawShape> {
  private _updateSchema?: ZodObject<ZodRawShape>;
  private _columnOverrides: Record<string, Partial<Column>> = {};
  private _formatters = new Map<string, (v: unknown) => string>();
  private _rowActions: { label: string; link: RowLink }[] = [];
  private _rowLink?: RowLink;
  private _rowLinkField?: string;
  private _toolbar: ToolbarButton[] = [];
  private _visibleKeys?: string[];
  private _endpoints: TableSpec['endpoints'] = {};
  private _writes: { update?: EndpointDirective; delete?: EndpointDirective } =
    {};
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

  /**
   * Makes each row open `link(row)`, e.g. `(r) => `#/posts/${r.id}``. Links
   * are resolved here, per row, so the client does no templating. Applies to
   * inline `rows()`; for rows fetched from `list()`, see `rowLinkField()`.
   */
  rowLink(link: RowLink): this {
    this._rowLink = link;
    return this;
  }

  /** For `list()` rows: the field in each fetched row that holds its link. */
  rowLinkField(field: string): this {
    this._rowLinkField = field;
    return this;
  }

  /** A per-row button opening `link(row)`; rows it returns no link for get none. */
  rowAction(label: string, link: RowLink): this {
    this._rowActions.push({ label, link });
    return this;
  }

  /** A button above the table, e.g. `toolbar('New', { type: 'navigate', to: '#/posts/new' })`. */
  toolbar(
    label: string,
    action: Action,
    variant?: ToolbarButton['variant'],
  ): this {
    this._toolbar.push({ label, action, ...(variant && { variant }) });
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

  list(directive: ReadEndpoint): this {
    this._endpoints = { ...this._endpoints, list: directive };
    return this;
  }

  create(directive: EndpointDirective): this {
    this._endpoints = { ...this._endpoints, create: directive };
    return this;
  }

  /**
   * Each inline row's save, its `{name}`s filled from the row. For `list()`
   * rows, the list handler adds them with `withRowActions()`; `build()`
   * throws when there are no inline `rows()`.
   */
  update(directive: EndpointDirective): this {
    this._writes = { ...this._writes, update: directive };
    return this;
  }

  /** Each inline row's delete; see `update()`. */
  delete(directive: EndpointDirective): this {
    this._writes = { ...this._writes, delete: directive };
    return this;
  }

  build(): TableSpec {
    const editableKeys = this._updateSchema
      ? new Set(Object.keys(this._updateSchema.shape))
      : null;

    const shape = this._schema.shape as unknown as Record<string, ZodTypeAny>;
    const baseColumns = Object.entries(getShape(this._schema)).map(
      ([key, schema]) => zodFieldToColumn(key, schema),
    );

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

    const hasWrites = Object.keys(this._writes).length > 0;
    if (hasWrites && this._rows === undefined) {
      throw new Error(
        "TableViewBuilder: update()/delete() fill inline rows() only; for a list() table, add each row's _actions in the list handler with withRowActions()",
      );
    }
    if (this._formatters.size > 0 && this._rows === undefined) {
      throw new Error(
        'TableViewBuilder: a format function fills inline rows() only; list() rows come from your handler, so either use a built-in format ("currency", "bytes", "percent", "decimal") or send `{ value, formatted }` for the field from your list handler',
      );
    }
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
            if (hasWrites) {
              const [withWrites] = withRowActions([row], this._writes);
              cells._actions = { value: withWrites?._actions };
            }
            const link = this._rowLink?.(row);
            if (link) cells[ROW_LINK] = { value: link };
            this._rowActions.forEach((action, i) => {
              const to = action.link(row);
              if (to) cells[rowActionField(i)] = { value: to };
            });
            return cells;
          })
        : undefined;

    const rowLinkField =
      this._rowLinkField ?? (this._rowLink ? ROW_LINK : undefined);

    return {
      kind: 'table' as const,
      columns,
      endpoints: this._endpoints,
      ...(rows !== undefined && { rows }),
      ...(rowLinkField !== undefined && { rowLinkField }),
      ...(this._toolbar.length > 0 && { toolbar: this._toolbar }),
      ...(this._rowActions.length > 0 && {
        rowActions: this._rowActions.map(
          ({ label }, i): RowAction => ({
            label,
            linkField: rowActionField(i),
          }),
        ),
      }),
      ...(this._metadata !== undefined && { metadata: this._metadata }),
    };
  }
}

export const TableView = TableViewBuilder;
