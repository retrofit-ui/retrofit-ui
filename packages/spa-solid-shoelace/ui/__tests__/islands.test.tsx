// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActions } from '../actions';
import { createIslands } from '../islands';
import { defineKind, defineKit } from '../kinds';

afterEach(() => {
  document.body.replaceChildren();
  window.location.hash = '';
  vi.restoreAllMocks();
});

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'rk.btn': { kind: 'rk.btn'; label: string };
  }
}

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

  const refreshKit = defineKit({
    name: 'rk',
    kinds: [
      defineKind({
        kind: 'rk.btn',
        component: (p) => {
          const { dispatch } = useActions();
          return (
            <button
              type="button"
              onClick={() => void dispatch({ type: 'refresh' })}
            >
              {(p.spec as { label: string }).label}
            </button>
          );
        },
      }),
    ],
  });

  it('refetches a src island on refresh, re-applying the inline patch', async () => {
    const root = rootWith(
      `<div id="a" data-retrofit-src="/spec" data-retrofit='{"label":"patched"}'></div>`,
    );
    let n = 0;
    const http = vi.fn(async () => {
      n++;
      return new Response(JSON.stringify({ kind: 'rk.btn', label: `v${n}` }));
    });
    createIslands({ rootElement: root, kits: [refreshKit], actions: { http } });
    await vi.waitFor(() => expect(root.querySelector('button')).toBeTruthy());
    expect(root.querySelector('button')?.textContent).toBe('patched');
    root.querySelector('button')?.click();
    await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(2));
    expect((http.mock.calls as unknown[][])[1]?.[0]).toMatchObject({
      method: 'GET',
      url: '/spec',
    });
    // The patch wins over the refetched label.
    await new Promise((r) => setTimeout(r, 10));
    expect(root.querySelector('button')?.textContent).toBe('patched');
  });

  it('shows the new spec after refresh and keeps the old one on error', async () => {
    const root = rootWith(`<div id="a" data-retrofit-src="/spec"></div>`);
    let n = 0;
    const http = vi.fn(async () => {
      n++;
      if (n === 3) return new Response('no', { status: 500 });
      return new Response(JSON.stringify({ kind: 'rk.btn', label: `v${n}` }));
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    createIslands({ rootElement: root, kits: [refreshKit], actions: { http } });
    await vi.waitFor(() => expect(root.querySelector('button')).toBeTruthy());
    root.querySelector('button')?.click();
    await vi.waitFor(() =>
      expect(root.querySelector('button')?.textContent).toBe('v2'),
    );
    root.querySelector('button')?.click();
    await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
    await new Promise((r) => setTimeout(r, 10));
    expect(root.querySelector('button')?.textContent).toBe('v2');
  });

  it('runs after a user refresh handler that calls next(), not one that does not', async () => {
    // The user's handlers sit inside the island's, so the island refetches
    // only when they pass the action on with next().
    for (const pass of [true, false]) {
      const root = rootWith(`<div data-retrofit-src="/spec"></div>`);
      const http = vi.fn(
        async () =>
          new Response(JSON.stringify({ kind: 'rk.btn', label: 'x' })),
      );
      const refresh = vi.fn((_a: unknown, _i: unknown, next: () => unknown) =>
        pass ? next() : undefined,
      );
      createIslands({
        rootElement: root,
        kits: [refreshKit],
        actions: { http, refresh: refresh as never },
      });
      await vi.waitFor(() => expect(root.querySelector('button')).toBeTruthy());
      root.querySelector('button')?.click();
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
      await new Promise((r) => setTimeout(r, 10));
      expect(http).toHaveBeenCalledTimes(pass ? 2 : 1);
    }
  });

  it('ignores a superseded refetch that resolves last', async () => {
    const root = rootWith(`<div data-retrofit-src="/spec"></div>`);
    const res = (label: string) =>
      new Response(JSON.stringify({ kind: 'rk.btn', label }));
    const pending: ((r: Response) => void)[] = [];
    let n = 0;
    const http = vi.fn(() => {
      if (++n === 1) return Promise.resolve(res('v1'));
      return new Promise<Response>((r) => pending.push(r));
    });
    createIslands({ rootElement: root, kits: [refreshKit], actions: { http } });
    await vi.waitFor(() => expect(root.querySelector('button')).toBeTruthy());
    root.querySelector('button')?.click();
    root.querySelector('button')?.click();
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]?.(res('second'));
    await vi.waitFor(() =>
      expect(root.querySelector('button')?.textContent).toBe('second'),
    );
    pending[0]?.(res('first'));
    await new Promise((r) => setTimeout(r, 10));
    expect(root.querySelector('button')?.textContent).toBe('second');
  });
});
