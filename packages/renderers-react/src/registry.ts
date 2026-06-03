import type { RendererConfig } from './types'

const registry = new Map<string, RendererConfig>()

export function registerRenderer(config: RendererConfig): void {
  registry.set(config.name, config)
}

export function getRenderer(name: string): RendererConfig | undefined {
  return registry.get(name)
}

export function getRendererForSchema(schema: unknown): RendererConfig | undefined {
  for (const config of registry.values()) {
    if (config.canRender(schema)) return config
  }
  return undefined
}

export function clearRegistry(): void {
  registry.clear()
}
