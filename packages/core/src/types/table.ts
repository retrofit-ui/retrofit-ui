import type { FieldOption } from './form';

export type ColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'enum'
  | 'custom';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'neutral'
  | 'warning'
  | 'danger';

/** One table column. Omitted flags default to `false`, alignment to `left`. */
export interface Column {
  key: string;
  label: string;
  type: ColumnType;
  /** Clicking the header sorts through the `sort` and `order` query params. */
  sortable?: boolean;
  editable?: boolean;
  /** A CSS width for the column, e.g. `12rem`. */
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  options?: FieldOption[];
  /** Badge colour per cell value, for enum columns. */
  badgeVariants?: Record<string, BadgeVariant>;
  format?: 'currency' | 'bytes' | 'percent' | 'decimal';
  currency?: string;
}

/** A table cell: the raw value plus, optionally, its server-formatted display text. */
export interface Cell {
  value: unknown;
  formatted?: string;
}
