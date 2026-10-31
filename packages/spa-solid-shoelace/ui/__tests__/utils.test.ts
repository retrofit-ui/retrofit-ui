import { describe, expect, it } from 'vitest';
import { substitutePattern } from '../utils';

describe('substitutePattern', () => {
  it('substitutes page and pageSize placeholders', () => {
    expect(
      substitutePattern('/items?page={page}&limit={pageSize}', {
        page: '2',
        pageSize: '20',
      }),
    ).toBe('/items?page=2&limit=20');
  });

  it('returns URL unchanged when no placeholders match', () => {
    expect(
      substitutePattern('/items?sort=name', { page: '2', pageSize: '20' }),
    ).toBe('/items?sort=name');
  });

  it('substitutes only the matching placeholder when only one is present', () => {
    expect(
      substitutePattern('/items?page={page}', { page: '3', pageSize: '10' }),
    ).toBe('/items?page=3');
  });
});
