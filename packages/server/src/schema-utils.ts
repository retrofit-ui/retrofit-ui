import type { ZodTypeAny } from 'zod'

export function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  // Minimal inline converter — replace with a proper lib (zod-to-json-schema) when needed.
  // This covers the common cases used by retrofit-ui.
  const def = schema._def as Record<string, unknown>
  const typeName = def.typeName as string

  if (typeName === 'ZodObject') {
    const shape = def.shape as (() => Record<string, ZodTypeAny>) | Record<string, ZodTypeAny>
    const resolvedShape = typeof shape === 'function' ? shape() : shape
    const properties: Record<string, unknown> = {}
    const required: string[] = []
    for (const [key, val] of Object.entries(resolvedShape)) {
      properties[key] = zodToJsonSchema(val as ZodTypeAny)
      const valDef = (val as ZodTypeAny)._def as Record<string, unknown>
      if (valDef.typeName !== 'ZodOptional') required.push(key)
    }
    return { type: 'object', properties, required }
  }

  if (typeName === 'ZodString') return { type: 'string' }
  if (typeName === 'ZodNumber') return { type: 'number' }
  if (typeName === 'ZodBoolean') return { type: 'boolean' }
  if (typeName === 'ZodArray') return { type: 'array', items: zodToJsonSchema((def.type as ZodTypeAny)) }
  if (typeName === 'ZodOptional') return zodToJsonSchema(def.innerType as ZodTypeAny)
  if (typeName === 'ZodEnum') return { type: 'string', enum: def.values }

  return {}
}
