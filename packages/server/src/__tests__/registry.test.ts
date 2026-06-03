import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { FormRegistry } from '../registry'
import { defineConfig } from '../config'

const config = defineConfig({
  forms: {
    contact: {
      schema: z.object({ name: z.string(), email: z.string().email() }),
      renderer: 'form',
      onSubmit: async () => {},
    },
  },
})

describe('FormRegistry', () => {
  it('lists registered forms', () => {
    const registry = new FormRegistry(config)
    const list = registry.list()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('contact')
    expect(list[0].renderer).toBe('form')
  })

  it('retrieves a form by id', () => {
    const registry = new FormRegistry(config)
    expect(registry.get('contact')).toBeDefined()
    expect(registry.get('missing')).toBeUndefined()
  })

  it('checks existence with has()', () => {
    const registry = new FormRegistry(config)
    expect(registry.has('contact')).toBe(true)
    expect(registry.has('nope')).toBe(false)
  })
})
