import { describe, expect, it } from 'vitest';
import { TableRendererConfig } from '../TableRenderer.config';

describe('TableRendererConfig.canRender', () => {
  it('returns true for an object with columns array and data', () => {
    expect(TableRendererConfig.canRender({ columns: [], data: [] })).toBe(true);
  });

  it('returns false for null', () => {
    expect(TableRendererConfig.canRender(null)).toBe(false);
  });

  it('returns false for a non-object', () => {
    expect(TableRendererConfig.canRender('string')).toBe(false);
    expect(TableRendererConfig.canRender(42)).toBe(false);
  });

  it('returns false when columns is not an array', () => {
    expect(
      TableRendererConfig.canRender({ columns: 'not-array', data: [] }),
    ).toBe(false);
  });

  it('returns false for an object without data', () => {
    expect(TableRendererConfig.canRender({ columns: [] })).toBe(false);
  });

  it('returns false for an object without columns', () => {
    expect(TableRendererConfig.canRender({ fields: [] })).toBe(false);
  });
});
