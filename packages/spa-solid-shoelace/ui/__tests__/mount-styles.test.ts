// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tags = () => document.head.querySelectorAll('style[data-retrofit-ui]');

beforeEach(() => {
  document.head.replaceChildren();
  vi.resetModules();
});

describe('prebuilt bundle styles', () => {
  it('injects one style on import, once even after re-import', async () => {
    await import('../mount');
    expect(tags()).toHaveLength(1);
    expect(tags()[0]?.textContent).toContain('.retrofit-');
    expect(tags()[0]?.textContent).toContain('--sl-');
    vi.resetModules();
    await import('../mount');
    expect(tags()).toHaveLength(1);
  });

  it('goes before host styles so they win by source order', async () => {
    const host = document.createElement('style');
    document.head.append(host);
    await import('../mount');
    const kids = [...document.head.children];
    expect(kids.indexOf(tags()[0] as Element)).toBeLessThan(kids.indexOf(host));
  });
});
