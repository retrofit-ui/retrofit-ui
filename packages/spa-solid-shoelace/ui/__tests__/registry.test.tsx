// @vitest-environment jsdom
import type {
  ActionDescriptor,
  ActionEntry,
  CardSpec,
  FormSpec,
  PageSpec,
  Spec,
  SpecNode,
  TableSpec,
} from '@retrofit-ui/core';
import { HashRouter, Route } from '@solidjs/router';
import { createSignal, For, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDispatch, useActions, useHttp } from '../actions';
import { eventsForCalendar, saveEvent } from '../CalendarView';
import { defineKind, defineKit, RenderSpec } from '../kinds';
import { createRenderer } from '../renderer';
import { SpecRenderer } from '../SpecRenderer';
import { showToast } from '../toast';

// Test kinds and actions, registered the way an app registers its own.
interface BadgeSpec extends SpecNode<'test.badge'> {
  label: string;
}
interface StackSpec extends SpecNode<'test.stack'> {
  children: Spec[];
}
interface InnerSpec extends SpecNode<'test.inner'> {}
interface ButtonSpec extends SpecNode<'test.button'> {
  action: TestAction;
}
type TestAction =
  | ActionDescriptor<'test.a'>
  | ActionDescriptor<'test.b'>
  | ActionDescriptor<'test.c'>
  | ActionDescriptor<'test.echo'>
  | ActionDescriptor<'test.nobody'>;

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'test.badge': BadgeSpec;
    'test.stack': StackSpec;
    'test.inner': InnerSpec;
    'test.button': ButtonSpec;
  }
  interface ActionKinds {
    'test.a': ActionEntry<ActionDescriptor<'test.a'>, { row: number }, string>;
    'test.b': ActionEntry<ActionDescriptor<'test.b'>, { row: number }, string>;
    'test.c': ActionEntry<ActionDescriptor<'test.c'>, { row: number }, string>;
    'test.echo': ActionEntry<
      ActionDescriptor<'test.echo'>,
      { row: number },
      string
    >;
    'test.nobody': ActionEntry<
      ActionDescriptor<'test.nobody'>,
      { row: number },
      string
    >;
  }
}

vi.mock('../toast', async (orig) => ({
  ...(await orig<typeof import('../toast')>()),
  showToast: vi.fn(),
}));

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  window.location.hash = '';
  vi.restoreAllMocks();
});

function mount(ui: () => JSX.Element): HTMLElement {
  const root = document.createElement('div');
  document.body.appendChild(root);
  dispose = render(ui, root);
  return root;
}

const badge = defineKind({
  kind: 'test.badge',
  component: (props) => <span class="badge">{props.spec.label}</span>,
});

// A custom container: proves built-in kinds nest inside custom ones.
const stack = defineKind({
  kind: 'test.stack',
  component: (props) => (
    <section class="stack">
      <For each={props.spec.children}>{(c) => <RenderSpec spec={c} />}</For>
    </section>
  ),
});

const testKit = defineKit({ name: 'test', kinds: [badge, stack] });

describe('kind registry', () => {
  it('renders a custom kind nested inside built-in containers', () => {
    const { SpecRenderer: R } = createRenderer({ kits: [testKit] });
    const root = mount(() => (
      <R
        spec={{
          kind: 'flex',
          children: [
            {
              kind: 'card',
              header: 'Card',
              children: [{ kind: 'test.badge', label: 'deep' }],
            },
          ],
        }}
      />
    ));
    expect(root.querySelector('.badge')?.textContent).toBe('deep');
  });

  it('renders built-in kinds nested inside a custom container', () => {
    const { SpecRenderer: R } = createRenderer({ kits: [testKit] });
    const root = mount(() => (
      <R
        spec={{
          kind: 'test.stack',
          children: [
            { kind: 'text', content: 'plain text' },
            { kind: 'test.badge', label: 'sibling' },
          ],
        }}
      />
    ));
    expect(root.querySelector('.stack p')?.textContent).toBe('plain text');
    expect(root.querySelector('.stack .badge')?.textContent).toBe('sibling');
  });

  it('lets a kit replace a built-in kind', () => {
    const kit = defineKit({
      name: 'override',
      kinds: [
        defineKind({
          kind: 'text',
          component: (props) => <em>{props.spec.content}</em>,
        }),
      ],
    });
    const { SpecRenderer: R } = createRenderer({ kits: [kit] });
    const root = mount(() => (
      <R spec={{ kind: 'card', children: [{ kind: 'text', content: 'x' }] }} />
    ));
    expect(root.querySelector('em')?.textContent).toBe('x');
  });

  it('draws the fallback for unregistered and missing kinds', () => {
    const Fallback = (props: { spec: { kind?: unknown } }) => (
      <i class="fallback">{String(props.spec.kind ?? 'none')}</i>
    );
    const { SpecRenderer: R } = createRenderer({ fallback: Fallback });
    // Specs from a server are only as typed as the server makes them.
    const fromServer = JSON.parse('[{ "kind": "nope" }, {}]') as Spec[];
    const root = mount(() => (
      <R spec={{ kind: 'flex', children: fromServer }} />
    ));
    const drawn = [...root.querySelectorAll('.fallback')].map(
      (e) => e.textContent,
    );
    expect(drawn).toEqual(['nope', 'none']);
  });

  it('shows the unsupported message by default', () => {
    const root = mount(() => (
      <SpecRenderer spec={JSON.parse('{ "kind": "nope" }') as Spec} />
    ));
    expect(root.textContent).toContain('Unsupported spec kind: "nope"');
  });

  it('follows a spec that is replaced after mounting', () => {
    const { SpecRenderer: R } = createRenderer({ kits: [testKit] });
    const [label, setLabel] = createSignal('before');
    const root = mount(() => (
      <R
        spec={{
          kind: 'card',
          children: [{ kind: 'test.badge', label: label() }],
        }}
      />
    ));
    setLabel('after');
    expect(root.querySelector('.badge')?.textContent).toBe('after');
  });

  it('gives a nested default SpecRenderer the surrounding kinds', () => {
    const inner = defineKind({
      kind: 'test.inner',
      component: () => (
        <SpecRenderer spec={{ kind: 'test.badge', label: 'inherited' }} />
      ),
    });
    const { SpecRenderer: R } = createRenderer({
      kits: [testKit, defineKit({ name: 'inner', kinds: [inner] })],
    });
    const root = mount(() => <R spec={{ kind: 'test.inner' }} />);
    expect(root.querySelector('.badge')?.textContent).toBe('inherited');
  });

  it('checks kinds and their specs at compile time', () => {
    // Checked by `tsc` (pnpm typecheck): each @ts-expect-error fails the
    // build if the line it guards stops being an error.
    defineKind({
      // @ts-expect-error not a registered kind
      kind: 'test.unregistered',
      component: () => <span />,
    });
    defineKind({
      kind: 'test.badge',
      // @ts-expect-error a badge spec has no `score`
      component: (props) => <span>{props.spec.score}</span>,
    });
    const card: CardSpec = {
      kind: 'card',
      // @ts-expect-error a badge needs a `label`
      children: [{ kind: 'test.badge' }],
    };
    expect(card.kind).toBe('card');
  });
});

describe('actions', () => {
  // A leaf that dispatches its spec's action once, with an input, on mount.
  function kitWithButton(onResult: (r: unknown) => void) {
    return defineKit({
      name: 'buttons',
      kinds: [
        defineKind({
          kind: 'test.button',
          component: (props) => {
            const { dispatch } = useActions();
            void dispatch(props.spec.action, { row: 7 }).then(
              onResult,
              (e: Error) => onResult(`error: ${e.message}`),
            );
            return <span />;
          },
        }),
      ],
    });
  }
  const button = (type: TestAction['type']): ButtonSpec => ({
    kind: 'test.button',
    action: { type } as TestAction,
  });

  it('resolves render-scoped, then renderer, then kit handlers', async () => {
    const results: unknown[] = [];
    const kit = kitWithButton((r) => results.push(r));
    kit.actions = {
      'test.a': () => 'kit-a',
      'test.b': () => 'kit-b',
      'test.c': () => 'kit-c',
    };
    const { Root } = createRenderer({
      kits: [kit],
      actions: { 'test.b': () => 'renderer-b', 'test.c': () => 'renderer-c' },
    });
    mount(() => (
      <Root actions={{ 'test.c': () => 'scoped-c' }}>
        <RenderSpec spec={button('test.a')} />
        <RenderSpec spec={button('test.b')} />
        <RenderSpec spec={button('test.c')} />
      </Root>
    ));
    await vi.waitFor(() => expect(results).toHaveLength(3));
    expect(results).toEqual(['kit-a', 'renderer-b', 'scoped-c']);
  });

  it('passes the input through and lets an override delegate with next()', async () => {
    const results: unknown[] = [];
    const kit = kitWithButton((r) => results.push(r));
    kit.actions = { 'test.echo': (_a, input) => `kit:${input.row}` };
    const { SpecRenderer: R } = createRenderer({
      kits: [kit],
      actions: {
        'test.echo': async (_a, _i, next) => `wrapped(${await next()})`,
      },
    });
    mount(() => <R spec={button('test.echo')} />);
    await vi.waitFor(() => expect(results).toEqual(['wrapped(kit:7)']));
  });

  it('lets next() replace the action and input, and keeps the originals when omitted', async () => {
    const seen: unknown[] = [];
    const dispatch = createDispatch(
      {
        http: (a, i) => {
          seen.push([a.url, i?.init?.method]);
          return new Response();
        },
      },
      {
        http: (a, i, next) =>
          a.url === '/keep'
            ? next()
            : a.url === '/input'
              ? next(undefined, { init: { ...i?.init, method: 'PUT' } })
              : next({ ...a, url: '/rewritten' }),
      },
    );
    await dispatch(
      { method: 'GET', url: '/keep' },
      { init: { method: 'GET' } },
    );
    await dispatch(
      { method: 'GET', url: '/input' },
      { init: { method: 'GET' } },
    );
    await dispatch({ method: 'GET', url: '/other' });
    expect(seen).toEqual([
      ['/keep', 'GET'],
      ['/input', 'PUT'],
      ['/rewritten', undefined],
    ]);
  });

  it('rejects an action type nobody handles', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const results: unknown[] = [];
    const { SpecRenderer: R } = createRenderer({
      kits: [kitWithButton((r) => results.push(r))],
    });
    mount(() => <R spec={button('test.nobody')} />);
    await vi.waitFor(() =>
      expect(results).toEqual(['error: No handler for action "test.nobody"']),
    );
  });

  it('routes built-in http requests through an overridden http handler', async () => {
    const seen: string[] = [];
    function Probe() {
      const send = useHttp();
      void send('/items/1', { method: 'DELETE' });
      return <span />;
    }
    const { Root } = createRenderer({
      actions: {
        http: (action) => {
          seen.push(`${action.method} ${action.url}`);
          return new Response(null, { status: 204 });
        },
      },
    });
    mount(() => (
      <Root>
        <Probe />
      </Root>
    ));
    await vi.waitFor(() => expect(seen).toEqual(['DELETE /items/1']));
  });

  it('checks actions, inputs and handlers at compile time', () => {
    function Probe() {
      const { dispatch } = useActions();
      const ok = () => {
        void dispatch({ type: 'navigate', to: '#/x' });
        void dispatch({ type: 'test.a' }, { row: 1 });
        const response: Promise<Response> = dispatch(
          { method: 'GET', url: '/x' },
          {},
        );
        return response;
      };
      const bad = () => {
        // @ts-expect-error a navigate action needs `to`
        void dispatch({ type: 'navigate' });
        // @ts-expect-error not a registered action type
        void dispatch({ type: 'test.unregistered' });
        // @ts-expect-error test.a's input is { row: number }
        void dispatch({ type: 'test.a' }, { row: 'one' });
        // @ts-expect-error test.a needs its input
        void dispatch({ type: 'test.a' });
      };
      void ok;
      void bad;
      return <span />;
    }
    // A void-result type's handler may return anything, like a void callback.
    createRenderer({ actions: { refresh: () => 1 } });
    // Separate literals: TS reports only the excess property when an object
    // literal also has one, which would hide the other error.
    createRenderer({
      actions: {
        'test.a': (_action, input) => String(input.row),
        // @ts-expect-error test.b resolves to a string
        'test.b': () => 2,
      },
    });
    createRenderer({
      actions: {
        // @ts-expect-error no handler can be registered for an unknown type
        'test.unregistered': () => 'x',
      },
    });
    mount(() => <Probe />);
  });
});

describe('pages', () => {
  function inRouter(ui: () => JSX.Element) {
    return mount(() => (
      <HashRouter>
        <Route path="/*all" component={ui} />
      </HashRouter>
    ));
  }
  const listTable: TableSpec = {
    kind: 'table',
    columns: [{ key: 'name', label: 'Name', type: 'string' }],
    endpoints: { list: { method: 'GET', url: '/items' } },
  };

  it('fills page filters into a table list url and refetches when they change', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[{"name":"a"}]');
    });
    window.location.hash = '#/?status=open';
    const page: PageSpec = {
      kind: 'page',
      children: [
        {
          kind: 'filter-form',
          fields: [{ name: 'status', label: 'Status', type: 'text' }],
        },
        listTable,
      ],
    };
    inRouter(() => <SpecRenderer spec={page} />);
    await vi.waitFor(() =>
      expect(fetched.filter((url) => url.startsWith('/items'))).toEqual([
        '/items?status=open',
      ]),
    );
    window.location.hash = '#/?status=a%20b';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    // Only the table's requests: Shoelace fetches its icons too.
    const items = () => fetched.filter((url) => url.startsWith('/items'));
    await vi.waitFor(() =>
      expect(items()).toEqual(['/items?status=open', '/items?status=a+b']),
    );
  });

  it("sends only the page's filter names, not other search params", async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[]');
    });
    window.location.hash = '#/?tab=2&status=open';
    const page: PageSpec = {
      kind: 'page',
      children: [
        {
          kind: 'grid',
          children: [
            {
              kind: 'filter-form',
              fields: [{ name: 'status', label: 'Status', type: 'text' }],
            },
          ],
        },
        listTable,
      ],
    };
    inRouter(() => <SpecRenderer spec={page} />);
    await vi.waitFor(() =>
      expect(fetched.filter((url) => url.startsWith('/items'))).toEqual([
        '/items?status=open',
      ]),
    );
  });

  it('forwards a filter name added by a swapped page spec', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[]');
    });
    window.location.hash = '#/?status=open&owner=me';
    const withFields = (...names: string[]): PageSpec => ({
      kind: 'page',
      children: [
        {
          kind: 'filter-form',
          fields: names.map((name) => ({ name, label: name, type: 'text' })),
        },
        listTable,
      ],
    });
    const [spec, setSpec] = createSignal(withFields('status'));
    inRouter(() => <SpecRenderer spec={spec()} />);
    const items = () => fetched.filter((url) => url.startsWith('/items'));
    await vi.waitFor(() => expect(items()).toEqual(['/items?status=open']));
    setSpec(withFields('status', 'owner'));
    await vi.waitFor(() =>
      expect(items().at(-1)).toBe('/items?status=open&owner=me'),
    );
  });

  it('warns once when a filter writer uses a reserved query name', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response('[]'),
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const page: PageSpec = {
      kind: 'page',
      children: [
        {
          kind: 'filter-form',
          fields: [
            { name: 'sort', label: 'Sort', type: 'text' },
            { name: 'page', label: 'Page', type: 'text' },
          ],
        },
        listTable,
      ],
    };
    mount(() => <SpecRenderer spec={page} />);
    const reserved = () =>
      warn.mock.calls.filter((c) => String(c[0]).includes('reserved'));
    expect(reserved()).toHaveLength(1);
    expect(String(reserved()[0]?.[0])).toContain('page, sort');
  });

  it('keeps filters in memory when there is no router', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[]');
    });
    const page: PageSpec = {
      kind: 'page',
      children: [
        {
          kind: 'form',
          fields: [{ name: 'status', label: 'Status', type: 'text' }],
          endpoints: {},
          metadata: { autoSubmit: true },
        },
        listTable,
      ],
    };
    const root = mount(() => <SpecRenderer spec={page} />);
    const items = () => fetched.filter((url) => url.startsWith('/items'));
    await vi.waitFor(() => expect(items()).toEqual(['/items']));
    // autoSubmit writes the field to the page's filters, and the table follows.
    const input = root.querySelector('sl-input');
    if (!input) throw new Error('the form has no input');
    input.value = 'done';
    input.dispatchEvent(new Event('sl-input'));
    await vi.waitFor(() =>
      expect(items()).toEqual(['/items', '/items?status=done']),
    );
  });

  it('refreshes sibling tables after a form in the page writes', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[]');
    });
    const form: FormSpec = {
      kind: 'form',
      fields: [{ name: 'name', label: 'Name', type: 'text' }],
      endpoints: { create: { method: 'POST', url: '/items' } },
      metadata: { title: 'New item', submitLabel: 'Add' },
    };
    const writes: string[] = [];
    const { SpecRenderer: R } = createRenderer({
      actions: {
        http: async (action, _input, next) => {
          if (action.method !== 'GET')
            writes.push(`${action.method} ${action.url}`);
          return next();
        },
      },
    });
    const root = inRouter(() => (
      <R spec={{ kind: 'page', children: [form, listTable] }} />
    ));
    // The table's list requests, not the form's POST.
    const items = () => fetched.filter((url) => url.startsWith('/items'));
    await vi.waitFor(() => expect(items()).toHaveLength(1));
    // Inside a page a form draws its own title and label, without routed chrome.
    expect(root.querySelector('.retrofit-form-title')?.textContent).toBe(
      'New item',
    );
    expect(root.querySelector('.retrofit-back-btn')).toBeNull();
    const submit = root.querySelector('sl-button[type="submit"]');
    expect(submit?.textContent?.trim()).toBe('Add');
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(writes).toEqual(['POST /items']));
    // The table refetches once the write succeeds.
    await vi.waitFor(() => expect(items()).toHaveLength(2));
  });
});

describe('http interception', () => {
  async function renderWith(spec: Spec) {
    const spy = vi.fn(async () => new Response('[]'));
    const { SpecRenderer: R } = createRenderer({ actions: { http: spy } });
    const root = document.createElement('div');
    document.body.appendChild(root);
    dispose = render(() => <R spec={spec} />, root);
    return spy;
  }

  it('sends a table list load through the http action', async () => {
    const spy = await renderWith({
      kind: 'table',
      columns: [],
      endpoints: { list: { method: 'GET', url: '/rows' } },
    });
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/rows' }),
        expect.anything(),
        expect.any(Function),
      ),
    );
  });

  it('sends a tree load through the http action', async () => {
    const spy = await renderWith({
      kind: 'tree',
      idField: 'id',
      parentField: 'parent',
      labelField: 'name',
      endpoint: { method: 'GET', url: '/nodes' },
    } as Spec);
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/nodes' }),
        expect.anything(),
        expect.any(Function),
      ),
    );
  });
});

describe('row writes', () => {
  const columns: TableSpec['columns'] = [
    { key: 'name', label: 'Name', type: 'string' },
  ];
  const buttons = (root: HTMLElement) =>
    [...root.querySelectorAll('tbody tr sl-button')].map((b) =>
      b.textContent?.trim(),
    );

  it('shows a cell formatted string over format and badgeVariants', async () => {
    const { SpecRenderer: R } = createRenderer({});
    const table: TableSpec = {
      kind: 'table',
      columns: [
        { key: 'amt', label: 'Amt', type: 'number', format: 'currency' },
        {
          key: 'st',
          label: 'St',
          type: 'string',
          badgeVariants: { open: 'success' },
        },
      ],
      endpoints: {},
      rows: [
        {
          amt: { value: 5, formatted: 'five bucks' },
          st: { value: 'open', formatted: 'Is open' },
        },
      ],
    };
    const root = mount(() => <R spec={table} />);
    await vi.waitFor(() =>
      expect(root.querySelectorAll('tbody tr')).toHaveLength(1),
    );
    const tds = root.querySelectorAll('tbody td');
    expect(tds[0]?.textContent).toContain('five bucks');
    expect(tds[0]?.querySelector('sl-format-number')).toBeNull();
    const badge = tds[1]?.querySelector('sl-badge');
    expect(badge?.getAttribute('variant')).toBe('success');
    expect(badge?.textContent).toBe('Is open');
  });

  it('deletes a row through its own finished delete action', async () => {
    const spy = vi.fn(async () => new Response('{}'));
    const { SpecRenderer: R } = createRenderer({ actions: { http: spy } });
    const table: TableSpec = {
      kind: 'table',
      columns,
      endpoints: {},
      rows: [
        {
          name: { value: 'Bo' },
          _actions: {
            value: { delete: { method: 'DELETE', url: '/c/a%20b?v=2' } },
          },
        },
        { name: { value: 'Al' } },
      ],
    };
    const root = mount(() => <R spec={table} />);
    await vi.waitFor(() =>
      expect(root.querySelectorAll('tbody tr')).toHaveLength(2),
    );
    const rows = root.querySelectorAll('tbody tr');
    expect(rows[0]?.textContent).toContain('Delete');
    // A row without `_actions` offers no writes.
    expect(rows[1]?.textContent).not.toContain('Delete');
    expect(rows[1]?.textContent).not.toContain('Edit');
    expect(buttons(root)).toEqual(['Delete']);
    (rows[0]?.querySelector('sl-button') as HTMLElement).click();
    const confirm = [
      ...root.querySelectorAll('sl-dialog sl-button[variant="danger"]'),
    ][0] as HTMLElement;
    confirm.click();
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'DELETE', url: '/c/a%20b?v=2' }),
        expect.anything(),
        expect.any(Function),
      ),
    );
  });

  it("saves an inline edit through the row's own update, without _actions or link fields in the body", async () => {
    const spy = vi.fn(async () => new Response('{}'));
    const { SpecRenderer: R } = createRenderer({ actions: { http: spy } });
    const table: TableSpec = {
      kind: 'table',
      columns: [{ key: 'name', label: 'Name', type: 'string', editable: true }],
      endpoints: {},
      rowLinkField: '_link',
      rowActions: [{ label: 'Open', linkField: '_action0' }],
      rows: [
        {
          name: { value: 'Bo' },
          _link: { value: '#/c/7' },
          _action0: { value: '#/c/7/open' },
          _actions: { value: { update: { method: 'PUT', url: '/c/7' } } },
        },
      ],
    };
    const root = mount(() => <R spec={table} />);
    await vi.waitFor(() => expect(buttons(root)).toEqual(['Edit', 'Open']));
    (
      [...root.querySelectorAll('tbody tr sl-button')].find(
        (b) => b.textContent?.trim() === 'Edit',
      ) as HTMLElement
    ).click();
    await vi.waitFor(() => expect(buttons(root)).toContain('Save'));
    (
      [...root.querySelectorAll('tbody tr sl-button')].find(
        (b) => b.textContent?.trim() === 'Save',
      ) as HTMLElement
    ).click();
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT', url: '/c/7' }),
        { init: expect.objectContaining({ body: '{"name":"Bo"}' }) },
        expect.any(Function),
      ),
    );
  });

  it("sends a producer's own _id and _rev, but not _link, _action0 or _actions", async () => {
    const spy = vi.fn(async () => new Response('{}'));
    const { SpecRenderer: R } = createRenderer({ actions: { http: spy } });
    const table: TableSpec = {
      kind: 'table',
      columns: [{ key: 'name', label: 'Name', type: 'string', editable: true }],
      endpoints: {},
      rowLinkField: '_link',
      rowActions: [{ label: 'Open', linkField: '_action0' }],
      rows: [
        {
          name: { value: 'Bo' },
          _id: { value: 7 },
          _rev: { value: 'r1' },
          _link: { value: '#/c/7' },
          _action0: { value: '#/c/7/open' },
          _actions: { value: { update: { method: 'PUT', url: '/c/7' } } },
        },
      ],
    };
    const root = mount(() => <R spec={table} />);
    const click = (label: string) =>
      (
        [...root.querySelectorAll('tbody tr sl-button')].find(
          (b) => b.textContent?.trim() === label,
        ) as HTMLElement
      ).click();
    await vi.waitFor(() => expect(buttons(root)).toContain('Edit'));
    click('Edit');
    await vi.waitFor(() => expect(buttons(root)).toContain('Save'));
    click('Save');
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT', url: '/c/7' }),
        {
          init: expect.objectContaining({
            body: '{"name":"Bo","_id":7,"_rev":"r1"}',
          }),
        },
        expect.any(Function),
      ),
    );
  });
});

describe('table columns', () => {
  const table: TableSpec = {
    kind: 'table',
    columns: [
      { key: 'name', label: 'Name', type: 'string', sortable: true },
      { key: 'age', label: 'Age', type: 'number', sortable: true },
      { key: 'note', label: 'Note', type: 'string', width: '12rem' },
    ],
    endpoints: { list: { method: 'GET', url: '/items' } },
  };
  const th = (root: HTMLElement, label: string) => {
    const el = [...root.querySelectorAll('th')].find((h) =>
      h.textContent?.includes(label),
    );
    if (!el) throw new Error(`no ${label} header`);
    return el;
  };

  const btn = (root: HTMLElement, label: string) => {
    const el = th(root, label).querySelector('button');
    if (!el) throw new Error(`no ${label} button`);
    return el;
  };

  it('sorts by a sortable column through query params', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[{"name":"a"}]');
    });
    const root = mount(() => <SpecRenderer spec={table} />);
    const items = () => fetched.filter((url) => url.startsWith('/items'));
    await vi.waitFor(() => expect(items()).toEqual(['/items']));
    await vi.waitFor(() => expect(root.querySelector('th')).not.toBeNull());
    expect(th(root, 'Name').getAttribute('aria-sort')).toBe('none');
    btn(root, 'Name').click();
    await vi.waitFor(() =>
      expect(items().at(-1)).toBe('/items?sort=name&order=asc'),
    );
    await vi.waitFor(() =>
      expect(th(root, 'Name').getAttribute('aria-sort')).toBe('ascending'),
    );
    expect(th(root, 'Age').getAttribute('aria-sort')).toBe('none');
    // A native button, so Enter and Space click it.
    btn(root, 'Name').click();
    await vi.waitFor(() =>
      expect(items().at(-1)).toBe('/items?sort=name&order=desc'),
    );
    btn(root, 'Age').click();
    await vi.waitFor(() =>
      expect(items().at(-1)).toBe('/items?sort=age&order=asc'),
    );
  });

  it('sorts inline rows locally, nulls last, without a request', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const inline: TableSpec = {
      kind: 'table',
      columns: table.columns,
      endpoints: {},
      rows: [
        { name: { value: 'b' }, age: { value: 30 } },
        { name: { value: 'c' }, age: { value: null } },
        { name: { value: 'a' }, age: { value: 5 } },
        { name: { value: 'd' }, age: { value: 100 } },
      ],
    };
    const root = mount(() => <SpecRenderer spec={inline} />);
    await vi.waitFor(() => expect(root.querySelector('th')).not.toBeNull());
    const names = () =>
      [...root.querySelectorAll('tbody tr')].map(
        (r) => r.querySelector('td')?.textContent,
      );
    expect(names()).toEqual(['b', 'c', 'a', 'd']);
    expect(th(root, 'Age').getAttribute('aria-sort')).toBe('none');
    btn(root, 'Age').click();
    await vi.waitFor(() => expect(names()).toEqual(['a', 'b', 'd', 'c']));
    expect(th(root, 'Age').getAttribute('aria-sort')).toBe('ascending');
    btn(root, 'Age').click();
    await vi.waitFor(() => expect(names()).toEqual(['d', 'b', 'a', 'c']));
    expect(th(root, 'Age').getAttribute('aria-sort')).toBe('descending');
    btn(root, 'Name').click();
    await vi.waitFor(() => expect(names()).toEqual(['a', 'b', 'c', 'd']));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('applies a column width to its header', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response('[{"name":"a"}]'),
    );
    const root = mount(() => <SpecRenderer spec={table} />);
    await vi.waitFor(() => expect(root.querySelector('th')).not.toBeNull());
    expect(th(root, 'Note').style.width).toBe('12rem');
  });

  it('resets to page 1 when the sort changes', async () => {
    const fetched: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      fetched.push(String(input));
      return new Response('[{"name":"a"}]');
    });
    const paged: TableSpec = {
      ...table,
      metadata: { pagination: { pageSize: 1, totalRows: 5 } },
    };
    const root = mount(() => <SpecRenderer spec={paged} />);
    await vi.waitFor(() => expect(root.querySelector('th')).not.toBeNull());
    const next = root.querySelector('sl-icon-button[label="Next page"]');
    if (!next) throw new Error('no Next button');
    next.dispatchEvent(new Event('click'));
    await vi.waitFor(() =>
      expect(fetched.at(-1)).toBe('/items?page=2&pageSize=1'),
    );
    await vi.waitFor(() =>
      expect(root.querySelector('th button')).not.toBeNull(),
    );
    btn(root, 'Name').click();
    await vi.waitFor(() =>
      expect(fetched.at(-1)).toBe(
        '/items?page=1&pageSize=1&sort=name&order=asc',
      ),
    );
  });
});

describe('small behavior fixes', () => {
  it('shows the Add button on a new row with no row actions', async () => {
    const { SpecRenderer: R } = createRenderer({
      actions: { http: vi.fn(async () => new Response('{}')) },
    });
    const table: TableSpec = {
      kind: 'table',
      columns: [{ key: 'name', label: 'Name', type: 'string', editable: true }],
      endpoints: { create: { method: 'POST', url: '/c' } },
      rows: [{ name: { value: 'Bo' } }],
    };
    const root = mount(() => <R spec={table} />);
    await vi.waitFor(() =>
      expect(
        [...root.querySelectorAll('tr.retrofit-tr--new sl-button')].map((b) =>
          b.textContent?.trim(),
        ),
      ).toEqual(['Add']),
    );
  });

  it('dispatches refresh once after an ok calendar save, none after a failure', async () => {
    const update = { method: 'PUT', url: '/e/1' } as const;
    const info = (revert: () => void) =>
      ({
        revert,
        event: {
          extendedProps: { actions: { update } },
          startStr: 's',
          endStr: 'e',
        },
      }) as never;
    for (const mode of ['ok', 'status', 'reject']) {
      const ok = mode === 'ok';
      const send = vi.fn(async () => {
        if (mode === 'reject') throw new Error('network');
        return new Response('{}', { status: ok ? 200 : 500 });
      });
      const dispatch = vi.fn(async () => undefined);
      const revert = vi.fn();
      await saveEvent(info(revert), send as never, dispatch as never);
      expect(send).toHaveBeenCalledWith(
        '/e/1',
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(dispatch).toHaveBeenCalledTimes(ok ? 1 : 0);
      if (ok) expect(dispatch).toHaveBeenCalledWith({ type: 'refresh' });
      expect(revert).toHaveBeenCalledTimes(ok ? 0 : 1);
    }
  });

  it('omits end from the calendar save body when the event has none', async () => {
    const send = vi.fn(async () => new Response('{}'));
    const info = {
      revert: vi.fn(),
      event: {
        extendedProps: { actions: { update: { method: 'PUT', url: '/e/1' } } },
        startStr: '2026-06-15',
        endStr: '',
      },
    } as never;
    await saveEvent(info, send as never, vi.fn() as never);
    expect(send).toHaveBeenCalledWith(
      '/e/1',
      expect.objectContaining({ body: '{"start":"2026-06-15"}' }),
    );
  });

  it('maps an event without actions.update to editable: false', () => {
    const [a, b] = eventsForCalendar([
      {
        title: 'A',
        start: 'x',
        actions: { update: { method: 'PUT', url: '/a' } },
      },
      { title: 'B', start: 'y' },
    ] as never);
    expect(a).not.toHaveProperty('editable');
    expect(b).toMatchObject({ editable: false });
  });

  it.each([
    '500',
    'rejection',
  ])('keeps deleting after a %s, names the failed id and refreshes', async (failure) => {
    // jsdom lacks these; sl-dialog calls them on open.
    const saved = {
      getAnimations: Element.prototype.getAnimations,
      animate: Element.prototype.animate,
      matchMedia: window.matchMedia,
    };
    try {
      Element.prototype.getAnimations = () => [];
      Element.prototype.animate = (() => ({
        addEventListener() {},
        cancel() {},
      })) as never;
      window.matchMedia = (() => ({ matches: false })) as never;
      const del = (id: number) => ({ method: 'DELETE', url: `/n/${id}` });
      const nodes = [1, 2, 3].map((id) => ({
        id,
        parent: null,
        name: `n${id}`,
        _actions: { delete: del(id) },
      }));
      const http = vi.fn(async (a: { url: string; method: string }) => {
        if (a.method !== 'DELETE') return new Response(JSON.stringify(nodes));
        if (a.url === '/n/2' && failure === 'rejection')
          throw new Error('network');
        return new Response('{}', { status: a.url === '/n/2' ? 500 : 200 });
      });
      const refresh = vi.fn();
      const { SpecRenderer: R } = createRenderer({
        actions: { http: http as never, refresh },
      });
      const root = mount(() => (
        <R
          spec={
            {
              kind: 'tree',
              idField: 'id',
              parentField: 'parent',
              labelField: 'name',
              selection: 'multiple',
              endpoint: { method: 'GET', url: '/nodes' },
            } as Spec
          }
        />
      ));
      await vi.waitFor(() =>
        expect(root.querySelectorAll('sl-tree-item').length).toBe(3),
      );
      const items = [...root.querySelectorAll('sl-tree-item')] as HTMLElement[];
      root.querySelector('sl-tree')?.dispatchEvent(
        new CustomEvent('sl-selection-change', {
          detail: { selection: items },
        }),
      );
      await vi.waitFor(() =>
        expect(
          root
            .querySelector('sl-button[variant="danger"]')
            ?.hasAttribute('disabled'),
        ).toBe(false),
      );
      (
        root.querySelector('sl-button[variant="danger"]') as HTMLElement
      ).click();
      (
        root.querySelector(
          'sl-dialog sl-button[variant="danger"]',
        ) as HTMLElement
      ).click();
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
      const urls = http.mock.calls
        .filter(([a]) => a.method === 'DELETE')
        .map(([a]) => a.url);
      expect(urls).toEqual(['/n/1', '/n/2', '/n/3']);
      expect(showToast).toHaveBeenCalledWith('danger', 'Delete failed for: 2');
    } finally {
      Object.assign(Element.prototype, {
        getAnimations: saved.getAnimations,
        animate: saved.animate,
      });
      window.matchMedia = saved.matchMedia;
    }
  });
});
