import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'password',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'switch',
  'radio',
  'radio-group',
  'textarea',
  'markdown',
  'file',
  'color',
  'tags',
  'rating',
]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FieldValidationSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});
export type FieldValidation = z.infer<typeof FieldValidationSchema>;

export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});
export type FieldOption = z.infer<typeof FieldOptionSchema>;

export const FieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: FieldTypeSchema,
  required: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  validation: FieldValidationSchema.optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(FieldOptionSchema).optional(),
  value: z.unknown().optional(),
  colorFormat: z.enum(['hex', 'rgb', 'hsl']).optional(),
  colorSwatches: z.array(z.string()).optional(),
  ratingMax: z.number().int().positive().optional(),
  ratingPrecision: z.number().positive().optional(),
});
export type Field = z.infer<typeof FieldSchema>;

export const ActionSchema = z.object({
  method: z.string(),
  url: z.string(),
});
export type Action = z.infer<typeof ActionSchema>;

export const FormMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  submitLabel: z.string().default('Submit'),
  layout: z
    .enum(['single-column', 'two-column', 'auto'])
    .default('single-column'),
  submitAction: ActionSchema.optional(),
  deleteAction: ActionSchema.optional(),
  newEntityUrl: z.string().optional(),
});
export type FormMetadata = z.infer<typeof FormMetadataSchema>;

export const FormSchema = z.object({
  fields: z.array(FieldSchema).min(1),
  metadata: FormMetadataSchema.optional(),
});
export type Form = z.infer<typeof FormSchema>;
