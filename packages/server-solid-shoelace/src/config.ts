import type { RetrofitConfig } from './types';

export function defineRetrofitConfig(config: RetrofitConfig): RetrofitConfig {
  return config;
}

export const defineConfig = defineRetrofitConfig;
