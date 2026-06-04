import type { FormConfig, RetrofitConfig } from './types';

export class FormRegistry {
  private readonly forms: Map<string, FormConfig>;

  constructor(config: RetrofitConfig) {
    this.forms = new Map(Object.entries(config.forms ?? {}));
  }

  get(id: string): FormConfig | undefined {
    return this.forms.get(id);
  }

  list(): Array<{ id: string; renderer: string }> {
    return Array.from(this.forms.entries()).map(([id, cfg]) => ({
      id,
      renderer: cfg.renderer,
    }));
  }

  has(id: string): boolean {
    return this.forms.has(id);
  }
}
