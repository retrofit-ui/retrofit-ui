import type { Component } from 'solid-js';

export interface RendererConfig<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
  component: Component<P>;
  canRender: (schema: unknown) => boolean;
  metadata?: {
    displayName?: string;
    description?: string;
  };
}
