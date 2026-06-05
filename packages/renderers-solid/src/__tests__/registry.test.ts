import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearRegistry,
  getRenderer,
  getRendererForSchema,
  registerRenderer,
} from '../registry';
import type { RendererConfig } from '../types';

function makeConfig(
  name: string,
  canRender: (s: unknown) => boolean,
): RendererConfig {
  return {
    name,
    component: vi.fn() as unknown as RendererConfig['component'],
    canRender,
    metadata: { displayName: name },
  };
}

beforeEach(() => {
  clearRegistry();
});

describe('registerRenderer / getRenderer', () => {
  it('retrieves a renderer by name after registering it', () => {
    const config = makeConfig('form', () => false);
    registerRenderer(config);
    expect(getRenderer('form')).toBe(config);
  });

  it('returns undefined for an unknown name', () => {
    expect(getRenderer('nope')).toBeUndefined();
  });

  it('overwrites a previous registration with the same name', () => {
    const first = makeConfig('form', () => false);
    const second = makeConfig('form', () => true);
    registerRenderer(first);
    registerRenderer(second);
    expect(getRenderer('form')).toBe(second);
  });
});

describe('getRendererForSchema', () => {
  it('returns the first renderer whose canRender returns true', () => {
    const tableConfig = makeConfig(
      'table',
      (s) => typeof s === 'object' && s !== null && 'columns' in s,
    );
    const formConfig = makeConfig(
      'form',
      (s) => typeof s === 'object' && s !== null && 'fields' in s,
    );
    registerRenderer(tableConfig);
    registerRenderer(formConfig);

    expect(getRendererForSchema({ fields: [] })).toBe(formConfig);
    expect(getRendererForSchema({ columns: [], data: [] })).toBe(tableConfig);
  });

  it('returns undefined when no renderer matches', () => {
    const config = makeConfig('form', () => false);
    registerRenderer(config);
    expect(getRendererForSchema({ unknown: true })).toBeUndefined();
  });
});

describe('clearRegistry', () => {
  it('removes all registered renderers', () => {
    registerRenderer(makeConfig('form', () => false));
    clearRegistry();
    expect(getRenderer('form')).toBeUndefined();
  });
});
