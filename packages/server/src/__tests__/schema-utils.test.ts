import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { zodToJsonSchema } from '../schema-utils'

describe('zodToJsonSchema', () => {
  it('converts a simple object schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() })
    const json = zodToJsonSchema(schema)
    expect(json.type).toBe('object')
    expect((json.properties as Record<string, unknown>).name).toEqual({ type: 'string' })
    expect((json.properties as Record<string, unknown>).age).toEqual({ type: 'number' })
  })

  it('marks optional fields as non-required', () => {
    const schema = z.object({ name: z.string(), bio: z.string().optional() })
    const json = zodToJsonSchema(schema)
    expect(json.required).toContain('name')
    expect((json.required as string[])).not.toContain('bio')
  })

  it('converts enum schema', () => {
    const schema = z.enum(['a', 'b', 'c'])
    const json = zodToJsonSchema(schema)
    expect(json.type).toBe('string')
    expect(json.enum).toEqual(['a', 'b', 'c'])
  })
})
