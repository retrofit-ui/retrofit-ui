// @vitest-environment jsdom
import type {
  FormSpec,
  RetrofitConfig,
  Spec,
  TableSpec,
} from '@retrofit-ui/core';
import { render } from 'solid-js/web';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, specUrl } from '../App';
import { useActions } from '../actions';
import { defineKind, defineKit } from '../kinds';
import { createRenderer } from '../renderer';
import { createShell } from '../shell';

// Toasts animate with APIs jsdom lacks, and these tests don't look at them.
vi.mock('../toast', () => ({ showToast: vi.fn(), ToastContainer: () => null }));

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  window.location.hash = '';
  vi.restoreAllMocks();
});

function mountApp(config: RetrofitConfig) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  dispose = render(
    () => <App config={config} renderer={createRenderer()} />,
    root,
  );
  return root;
}

/** Serves specs by url; records every request. */
function serve(specs: Record<string, Spec | (() => Spec)>) {
  const requests: string[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    requests.push(`${init?.method ?? 'GET'} ${url}`);
    const spec = specs[url];
    if (!spec)
      return new Response('{}', { status: url.startsWith('/api') ? 404 : 200 });
    return new Response(
      JSON.stringify(typeof spec === 'function' ? spec() : spec),
    );
  });
  return requests;
}

const text = (content: string): Spec => ({ kind: 'text', content });

describe('the shell', () => {
  it('fills a route param into its spec url, encoded', () => {
    expect(
      specUrl(
        '/api/ui/',
        { path: '/posts/:id', spec: '/posts/{id}' },
        { id: 'a b' },
      ),
    ).toBe('/api/ui/posts/a%20b');
  });

  it('renders the spec its route points at', async () => {
    serve({ '/api/ui/posts/7': text('post seven') });
    window.location.hash = '#/posts/7';
    const root = mountApp({
      routes: [{ path: '/posts/:id', spec: '/posts/{id}' }],
    });
    await vi.waitFor(() => expect(root.textContent).toContain('post seven'));
  });

  it("refetches the screen's spec on refresh", async () => {
    let count = 0;
    const requests = serve({ '/api/ui/count': () => text(`count ${++count}`) });
    function RefreshButton() {
      const { dispatch } = useActions();
      return (
        <button
          type="button"
          onClick={() => void dispatch({ type: 'refresh' })}
        >
          refresh
        </button>
      );
    }
    const root = document.createElement('div');
    document.body.appendChild(root);
    window.location.hash = '#/';
    const kit = defineKit({
      name: 'refresher',
      kinds: [
        defineKind({
          kind: 'text',
          component: (p) => (
            <>
              <span>{p.spec.content}</span>
              <RefreshButton />
            </>
          ),
        }),
      ],
    });
    dispose = render(
      () => (
        <App
          config={{ routes: [{ path: '/', spec: '/count' }] }}
          renderer={createRenderer({ kits: [kit] })}
        />
      ),
      root,
    );
    await vi.waitFor(() => expect(root.textContent).toContain('count 1'));
    root.querySelector('button')?.click();
    await vi.waitFor(() => expect(root.textContent).toContain('count 2'));
    expect(requests.filter((r) => r === 'GET /api/ui/count')).toHaveLength(2);
  });

  it('says so for a path with no route', async () => {
    serve({});
    window.location.hash = '#/nowhere';
    const root = mountApp({ routes: [{ path: '/', spec: '/' }] });
    await vi.waitFor(() =>
      expect(root.textContent).toContain('No route for "/nowhere"'),
    );
  });

  it('refuses a config without routes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ apiBase: '/api/ui' })),
    );
    const root = document.createElement('div');
    dispose = await createShell().mount(root);
    expect(root.textContent).toContain('/retrofit.json has no "routes"');
  });
});

describe('server-resolved navigation', () => {
  it('opens a row, a row action and a toolbar button through their links', async () => {
    const table: TableSpec = {
      kind: 'table',
      columns: [{ key: 'name', label: 'Name', type: 'string' }],
      rows: [
        {
          name: { value: 'Ada' },
          _link: { value: '#/people/1' },
          _history: { value: '#/people/1/history' },
        },
        { name: { value: 'Bo' }, _link: { value: '#/people/2' } },
      ],
      rowLinkField: '_link',
      rowActions: [{ label: 'History', linkField: '_history' }],
      toolbar: [
        { label: 'New', action: { type: 'navigate', to: '#/people/new' } },
      ],
      endpoints: {},
    };
    serve({ '/api/ui/people': table });
    window.location.hash = '#/people';
    const root = mountApp({ routes: [{ path: '/people', spec: '/people' }] });
    await vi.waitFor(() => expect(root.textContent).toContain('Bo'));

    // A row action shows only on the rows that carry its link.
    const history = [...root.querySelectorAll('sl-button')].filter(
      (b) => b.textContent?.trim() === 'History',
    );
    expect(history).toHaveLength(1);
    history[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(window.location.hash).toBe('#/people/1/history');

    window.location.hash = '#/people';
    await vi.waitFor(() => expect(root.textContent).toContain('Bo'));
    const bo = [...root.querySelectorAll('tbody tr')].find((tr) =>
      tr.textContent?.includes('Bo'),
    ) as HTMLElement;
    bo.click();
    expect(window.location.hash).toBe('#/people/2');

    window.location.hash = '#/people';
    await vi.waitFor(() => expect(root.textContent).toContain('New'));
    const newButton = [...root.querySelectorAll('sl-button')].find(
      (b) => b.textContent?.trim() === 'New',
    );
    newButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(window.location.hash).toBe('#/people/new');
  });

  it('submits an edit form to its resolved update endpoint and dispatches onDone', async () => {
    const form: FormSpec = {
      kind: 'form',
      fields: [{ name: 'name', label: 'Name', type: 'text', value: 'Ada' }],
      endpoints: {
        create: { method: 'POST', url: '/people' },
        update: { method: 'PUT', url: '/people/1' },
        delete: { method: 'DELETE', url: '/people/1' },
      },
      metadata: {
        title: 'Person',
        mode: 'edit',
        onDone: { type: 'navigate', to: '#/people' },
      },
    };
    const requests = serve({ '/api/ui/people/1': form });
    window.location.hash = '#/people/1';
    const root = mountApp({
      routes: [{ path: '/people/:id', spec: '/people/{id}' }],
    });
    await vi.waitFor(() => expect(root.textContent).toContain('Edit Person'));
    expect(
      root.querySelector('sl-button[type="submit"]')?.textContent?.trim(),
    ).toBe('Save');
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(requests).toContain('PUT /people/1'));
    await vi.waitFor(() => expect(window.location.hash).toBe('#/people'));
    expect(requests).not.toContain('POST /people');
  });

  it('refetches the route spec after a write by a form in a page', async () => {
    const page: Spec = {
      kind: 'page',
      children: [
        {
          kind: 'form',
          fields: [{ name: 'name', label: 'Name', type: 'text' }],
          endpoints: { create: { method: 'POST', url: '/people' } },
        },
      ],
    };
    const requests = serve({ '/api/ui/people': page });
    window.location.hash = '#/people';
    const root = mountApp({ routes: [{ path: '/people', spec: '/people' }] });
    await vi.waitFor(() => expect(root.querySelector('form')).not.toBeNull());
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(requests).toContain('POST /people'));
    await vi.waitFor(() =>
      expect(requests.filter((r) => r === 'GET /api/ui/people')).toHaveLength(
        2,
      ),
    );
  });

  it('submits a create form to its create endpoint', async () => {
    const form: FormSpec = {
      kind: 'form',
      fields: [{ name: 'name', label: 'Name', type: 'text' }],
      endpoints: { create: { method: 'POST', url: '/people' } },
      metadata: { title: 'Person' },
    };
    const requests = serve({ '/api/ui/people/new': form });
    window.location.hash = '#/people/new';
    const root = mountApp({
      routes: [{ path: '/people/new', spec: '/people/new' }],
    });
    await vi.waitFor(() => expect(root.textContent).toContain('New Person'));
    // No onDone, so no Back button.
    expect(root.querySelector('.retrofit-back-btn')).toBeNull();
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(requests).toContain('POST /people'));
  });
});
