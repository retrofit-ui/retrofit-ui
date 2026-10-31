// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIslands } from '../islands';
import { defineKind, defineKit } from '../kinds';

afterEach(() => {
  document.body.replaceChildren();
  window.location.hash = '';
  vi.restoreAllMocks();
});

const badgeKit = defineKit({
  name: 'test',
  kinds: [
    defineKind({
      kind: 'test.badge',
      component: (p) => <b>{(p.spec as { label: string }).label}</b>,
    }),
  ],
});

function rootWith(html: string) {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

describe('createIslands', () => {
  it('renders kit kinds in inline islands and unmounts them', () => {
    const root = rootWith(
      `<div id="a" data-retrofit='{"kind":"test.badge","label":"hi"}'></div>`,
    );
    const islands = createIslands({ rootElement: root, kits: [badgeKit] });
    expect(root.querySelector('#a')?.textContent).toBe('hi');
    islands.unmountAll();
    expect(root.querySelector('#a')?.textContent).toBe('');
  });

  it('gives independent controllers per call', () => {
    const r1 = rootWith(
      `<div data-retrofit='{"kind":"text","content":"x"}'></div>`,
    );
    const r2 = rootWith(
      `<div data-retrofit='{"kind":"text","content":"y"}'></div>`,
    );
    const a = createIslands({ rootElement: r1 });
    createIslands({ rootElement: r2 });
    a.unmountAll();
    expect(r1.textContent).toBe('');
    expect(r2.textContent).toBe('y');
  });

  it('fetches data-retrofit-src through an http action override', async () => {
    const root = rootWith(`<div id="a" data-retrofit-src="/spec"></div>`);
    const http = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ kind: 'text', content: 'from override' }),
        ),
    );
    createIslands({ rootElement: root, actions: { http } });
    await vi.waitFor(() =>
      expect(root.querySelector('#a')?.textContent).toBe('from override'),
    );
    expect(http).toHaveBeenCalledOnce();
  });
});
