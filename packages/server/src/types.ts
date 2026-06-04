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
}

export interface RetrofitConfig {
  forms?: Record<string, FormConfig>;
  resources?: Record<string, ResourceConfig>;
  customRenderers?: unknown[];
  withUiShell?: boolean;
}
