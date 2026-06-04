import type { ZodTypeAny } from 'zod';

export interface FormConfig {
  schema: ZodTypeAny;
  renderer: string;
  onSubmit: (data: unknown) => void | Promise<void>;
}

export interface RetrofitConfig {
  forms: Record<string, FormConfig>;
  customRenderers?: unknown[];
}
