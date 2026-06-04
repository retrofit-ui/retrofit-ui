import { FormRendererConfig } from './FormRenderer';
import { TableRendererConfig } from './TableRenderer';

export { FormRenderer, FormRendererConfig } from './FormRenderer';
export {
  clearRegistry,
  getRenderer,
  getRendererForSchema,
  registerRenderer,
} from './registry';
export { TableRenderer, TableRendererConfig } from './TableRenderer';
export type { RendererConfig } from './types';

export const defaultRenderers = [TableRendererConfig, FormRendererConfig];
