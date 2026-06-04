import type { ComponentType } from 'react';

export interface RendererConfig<P = Record<string, unknown>> {
  name: string;
  component: ComponentType<P>;
  canRender: (schema: unknown) => boolean;
  metadata?: {
    displayName?: string;
    description?: string;
  };
}
