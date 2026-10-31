import { describe, expect, it } from 'vitest';
import { listUrl } from '../utils';

describe('listUrl', () => {
  it('appends non-empty values and omits empty ones', () => {
    expect(listUrl('/c', { page: 2, pageSize: 20, type: '' })).toBe(
      '/c?page=2&pageSize=20',
    );
  });

  it('keeps the query already on the url', () => {
    expect(listUrl('/c?x=1', { sort: 'name' })).toBe('/c?x=1&sort=name');
  });

  it('returns the url unchanged when nothing is set', () => {
    expect(listUrl('/c', { sort: undefined })).toBe('/c');
  });
});
