import { z } from 'zod';

export const DetailFieldTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'datetime',
  'time',
  'boolean',
  'url',
  'email',
  'badge',
  'custom',
]);
export type DetailFieldType = z.infer<typeof DetailFieldTypeSchema>;

export const DetailFieldSchema = z.object({
  label: z.string().min(1),
  value: z.unknown(),
  type: DetailFieldTypeSchema.default('text'),
  format: z.string().optional(),
});
export type DetailField = z.infer<typeof DetailFieldSchema>;

export const SectionSchema = z.object({
  title: z.string().optional(),
  fields: z.array(DetailFieldSchema).min(1),
});
export type Section = z.infer<typeof SectionSchema>;

export const DetailViewMetadataSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(['single-column', 'two-column']).default('single-column'),
});
export type DetailViewMetadata = z.infer<typeof DetailViewMetadataSchema>;

export const DetailViewSchema = z.object({
  sections: z.array(SectionSchema).min(1),
  metadata: DetailViewMetadataSchema.optional(),
});
export type DetailView = z.infer<typeof DetailViewSchema>;
