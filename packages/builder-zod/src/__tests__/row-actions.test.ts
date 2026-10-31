import { describe, expect, it } from 'vitest';
import { withRowActions } from '../row-actions';

describe('withRowActions', () => {
  it("fills each row's write urls from the row", () => {
    expect(
      withRowActions([{ id: 7 }], {
        update: { method: 'PUT', url: '/c/{id}' },
      }),
    ).toEqual([
      { id: 7, _actions: { update: { method: 'PUT', url: '/c/7' } } },
    ]);
  });

  it('encodes values', () => {
    const [row] = withRowActions([{ id: 'a b' }], {
      delete: { method: 'DELETE', url: '/c/{id}' },
    });
    expect(row?._actions.delete?.url).toBe('/c/a%20b');
  });

  it('fills different placeholders by name', () => {
    const [row] = withRowActions([{ slug: 's', key: 'k' }], {
      update: { method: 'PUT', url: '/u/{slug}/{key}' },
    });
    expect(row?._actions.update?.url).toBe('/u/s/k');
  });

  it('throws when a row has no value for a placeholder', () => {
    expect(() =>
      withRowActions([{ id: 1 }], {
        delete: { method: 'DELETE', url: '/c/{slug}' },
      }),
    ).toThrow(/slug/);
  });
});
