import { z } from 'zod';
import { FieldOptionSchema } from './form';

export const ColumnTypeSchema = z.enum([
  'string',
  'number',
  'date',
  'boolean',
  'enum',
  'custom',
]);
export type ColumnType = z.infer<typeof ColumnTypeSchema>;

export const ColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: ColumnTypeSchema,
  sortable: z.boolean().default(false),
  filterable: z.boolean().default(false),
  editable: z.boolean().default(false),
  width: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  options: z.array(FieldOptionSchema).optional(),
});
export type Column = z.infer<typeof ColumnSchema>;

export const TableMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  defaultSort: z
    .object({
      key: z.string(),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
  pageSize: z.number().int().positive().default(25),
  totalRows: z.number().int().nonnegative().optional(),
  rowLink: z.string().optional(),
  createUrl: z.string().optional(),
});
export type TableMetadata = z.infer<typeof TableMetadataSchema>;

export const TableSchema = z.object({
  columns: z.array(ColumnSchema).min(1),
  data: z.array(z.record(z.string(), z.unknown())),
  metadata: TableMetadataSchema.optional(),
});
export type Table = z.infer<typeof TableSchema>;
