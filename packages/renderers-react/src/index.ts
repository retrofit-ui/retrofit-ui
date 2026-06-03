import { TableRendererConfig } from './TableRenderer'
import { FormRendererConfig } from './FormRenderer'

export type { RendererConfig } from './types'
export { registerRenderer, getRenderer, getRendererForSchema, clearRegistry } from './registry'
export { TableRenderer, TableRendererConfig } from './TableRenderer'
export { FormRenderer, FormRendererConfig } from './FormRenderer'

export const defaultRenderers = [TableRendererConfig, FormRendererConfig]
