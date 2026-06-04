import type { ZodTypeAny } from 'zod';

export function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  // Minimal inline converter — replace with a proper lib (zod-to-json-schema) when needed.
  // This covers the common cases used by retrofit-ui.
  // Zod v4: _def.type is the discriminant; field names changed from v3.
  const def = schema._def as unknown as Record<string, unknown>;
  const type = def.type as string;

  if (type === 'object') {
    const shape = def.shape as Record<string, ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(val as ZodTypeAny);
      const valType = (
        (val as ZodTypeAny)._def as unknown as Record<string, unknown>
      ).type;
      if (valType !== 'optional') required.push(key);
    }
    return { type: 'object', properties, required };
  }

  if (type === 'string') return { type: 'string' };
  if (type === 'number') return { type: 'number' };
  if (type === 'boolean') return { type: 'boolean' };
  if (type === 'array')
    return { type: 'array', items: zodToJsonSchema(def.element as ZodTypeAny) };
  if (type === 'optional') return zodToJsonSchema(def.innerType as ZodTypeAny);
  if (type === 'enum')
    return {
      type: 'string',
      enum: Object.values(def.entries as Record<string, unknown>),
    };

  return {};
}
