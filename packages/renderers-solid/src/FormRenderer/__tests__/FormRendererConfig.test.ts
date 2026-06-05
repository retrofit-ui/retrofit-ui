import { describe, expect, it } from 'vitest';
import { FormRendererConfig } from '../FormRenderer.config';

describe('FormRendererConfig.canRender', () => {
  it('returns true for an object with a fields array', () => {
    expect(FormRendererConfig.canRender({ fields: [] })).toBe(true);
  });

  it('returns false for null', () => {
    expect(FormRendererConfig.canRender(null)).toBe(false);
  });

  it('returns false for a non-object', () => {
    expect(FormRendererConfig.canRender('string')).toBe(false);
    expect(FormRendererConfig.canRender(42)).toBe(false);
  });

  it('returns false when fields is not an array', () => {
    expect(FormRendererConfig.canRender({ fields: 'not-array' })).toBe(false);
  });

  it('returns false for an object without fields', () => {
    expect(FormRendererConfig.canRender({ columns: [], data: [] })).toBe(false);
  });
});
