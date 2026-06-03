import { z } from 'zod'

export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'password',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'textarea',
  'file',
])
export type FieldType = z.infer<typeof FieldTypeSchema>

export const FieldValidationSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
})
export type FieldValidation = z.infer<typeof FieldValidationSchema>

export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
})
export type FieldOption = z.infer<typeof FieldOptionSchema>

export const FieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: FieldTypeSchema,
  required: z.boolean().default(false),
  validation: FieldValidationSchema.optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(FieldOptionSchema).optional(),
})
export type Field = z.infer<typeof FieldSchema>

export const FormMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  submitLabel: z.string().default('Submit'),
  layout: z.enum(['single-column', 'two-column', 'auto']).default('single-column'),
})
export type FormMetadata = z.infer<typeof FormMetadataSchema>

export const FormSchema = z.object({
  fields: z.array(FieldSchema).min(1),
  metadata: FormMetadataSchema.optional(),
})
export type Form = z.infer<typeof FormSchema>
