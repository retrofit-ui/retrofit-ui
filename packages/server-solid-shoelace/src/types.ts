import type { Column, Field } from '@retrofit-ui/core';
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

export interface FormConfig {
  schema: ZodTypeAny;
  renderer: string;
  onSubmit: (data: unknown) => void | Promise<void>;
}

export interface ResourceConfig<S extends ZodRawShape = ZodRawShape> {
  schema: ZodObject<S>;
  updateSchema?: ZodObject<ZodRawShape>;
  list?: () => unknown[] | Promise<unknown[]>;
  find?: (id: string) => unknown | Promise<unknown>;
  create?: (data: unknown) => unknown | Promise<unknown>;
  update?: (id: string, data: unknown) => unknown | Promise<unknown>;
  delete?: (id: string) => unknown | Promise<unknown>;
  columnOverrides?: Record<string, Partial<Column>>;
  fieldOverrides?: Record<string, Partial<Field>>;
}

export interface RetrofitTheme {
  /** Shoelace CSS custom property overrides, e.g. { '--sl-color-primary-600': '#7c3aed' } */
  cssVariables?: Record<string, string>;
  /** Raw CSS injected into <style> in the served HTML */
  extraCss?: string;
}

export interface RetrofitConfig {
  forms?: Record<string, FormConfig>;
  resources?: Record<string, ResourceConfig>;
  customRenderers?: unknown[];
  theme?: RetrofitTheme;
  /** Full base path for resource API calls. Default: '/api/ui'.
   *  E.g. 'http://java-server:8080/api/ui' for cross-origin deployments. */
  apiBase?: string;
}
