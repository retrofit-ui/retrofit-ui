export { createExpressRouter, createRetrofitApp } from './adapters/express';
export { serveUiShell } from './adapters/ui-shell';
export { defineConfig, defineRetrofitConfig } from './config';
export { FormRegistry } from './registry';
export { ResourceBuilder, resource } from './resource-builder';
export { zodToJsonSchema } from './schema-utils';
export type {
  FormConfig,
  ResourceConfig,
  RetrofitConfig,
  RetrofitTheme,
} from './types';
