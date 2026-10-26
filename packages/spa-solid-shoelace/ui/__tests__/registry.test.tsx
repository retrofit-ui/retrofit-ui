// @vitest-environment jsdom
import { createSignal, For, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActions, useHttp } from '../actions';
import { defineKind, defineKit, RenderSpec, type SpecNode } from '../kinds';
import { createRenderer } from '../renderer';
import { SpecRenderer } from '../SpecRenderer';

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

/** Spec literals with extra fields, typed as the renderer sees them. */
const node = (spec: object) => spec as SpecNode;

function mount(ui: () => JSX.Element): HTMLElement {
  const root = document.createElement('div');
  document.body.appendChild(root);
  dispose = render(ui, root);
  return root;
}

interface BadgeSpec {
  kind: 'test.badge';
  label: string;
}
const badge = defineKind<BadgeSpec>({
  kind: 'test.badge',
  component: (props) => <span class="badge">{props.spec.label}</span>,
});

// A custom container: proves built-in kinds nest inside custom ones.
interface StackSpec {
  kind: 'test.stack';
  children: { kind: string }[];
}
const stack = defineKind<StackSpec>({
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
        spec={node({
          kind: 'flex',
          children: [
            {
              kind: 'card',
              header: 'Card',
              children: [{ kind: 'test.badge', label: 'deep' }],
            },
          ],
        })}
      />
    ));
    expect(root.querySelector('.badge')?.textContent).toBe('deep');
  });

  it('renders built-in kinds nested inside a custom container', () => {
    const { SpecRenderer: R } = createRenderer({ kits: [testKit] });
    const root = mount(() => (
      <R
        spec={node({
          kind: 'test.stack',
          children: [
            { kind: 'text', content: 'plain text' },
            { kind: 'test.badge', label: 'sibling' },
          ],
        })}
      />
    ));
    expect(root.querySelector('.stack p')?.textContent).toBe('plain text');
    expect(root.querySelector('.stack .badge')?.textContent).toBe('sibling');
  });

  it('lets a kit replace a built-in kind', () => {
    const kit = defineKit({
      name: 'override',
      kinds: [
        defineKind<{ kind: 'text'; content: string }>({
          kind: 'text',
          component: (props) => <em>{props.spec.content}</em>,
        }),
      ],
    });
    const { SpecRenderer: R } = createRenderer({ kits: [kit] });
    const root = mount(() => (
      <R
        spec={node({
          kind: 'card',
          children: [{ kind: 'text', content: 'x' }],
        })}
      />
    ));
    expect(root.querySelector('em')?.textContent).toBe('x');
  });

  it('draws the fallback for unknown and missing kinds', () => {
    const Fallback = (props: { spec: { kind?: unknown } }) => (
      <i class="fallback">{String(props.spec.kind ?? 'none')}</i>
    );
    const { SpecRenderer: R } = createRenderer({ fallback: Fallback });
    const root = mount(() => (
      <R
        spec={node({
          kind: 'flex',
          children: [{ kind: 'nope' }, {} as { kind: string }],
        })}
      />
    ));
    const drawn = [...root.querySelectorAll('.fallback')].map(
      (e) => e.textContent,
    );
    expect(drawn).toEqual(['nope', 'none']);
  });

  it('shows the unsupported message by default', () => {
    const root = mount(() => <SpecRenderer spec={node({ kind: 'nope' })} />);
    expect(root.textContent).toContain('Unsupported spec kind: "nope"');
  });

  it('renders a wrapped page child and a flat one alike', () => {
    const root = mount(() => (
      <SpecRenderer
        spec={node({
          kind: 'flex',
          children: [
            {
              kind: 'markdown',
              spec: { kind: 'markdown', content: 'wrapped' },
            } as { kind: string },
            { kind: 'markdown', content: 'flat' } as { kind: string },
          ],
        })}
      />
    ));
    const blocks = [...root.querySelectorAll('.retrofit-markdown')].map((e) =>
      e.textContent?.trim(),
    );
    expect(blocks).toEqual(['wrapped', 'flat']);
  });

  it('follows a spec that is replaced after mounting', () => {
    const { SpecRenderer: R } = createRenderer({ kits: [testKit] });
    const [label, setLabel] = createSignal('before');
    const root = mount(() => (
      <R
        spec={node({
          kind: 'card',
          children: [{ kind: 'test.badge', label: label() }],
        })}
      />
    ));
    setLabel('after');
    expect(root.querySelector('.badge')?.textContent).toBe('after');
  });

  it('gives a nested default SpecRenderer the surrounding kinds', () => {
    const inner = defineKind<{ kind: 'test.inner' }>({
      kind: 'test.inner',
      component: () => (
        <SpecRenderer spec={node({ kind: 'test.badge', label: 'inherited' })} />
      ),
    });
    const { SpecRenderer: R } = createRenderer({
      kits: [testKit, defineKit({ name: 'inner', kinds: [inner] })],
    });
    const root = mount(() => <R spec={node({ kind: 'test.inner' })} />);
    expect(root.querySelector('.badge')?.textContent).toBe('inherited');
  });
});

describe('actions', () => {
  // A leaf that dispatches its spec's action once, with an input, on mount.
  interface ButtonSpec {
    kind: 'test.button';
    action: { type: string };
  }
  const button = (type: string): ButtonSpec => ({
    kind: 'test.button',
    action: { type },
  });
  function kitWithButton(onResult: (r: unknown) => void) {
    return defineKit({
      name: 'buttons',
      kinds: [
        defineKind<ButtonSpec>({
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
    kit.actions = {
      'test.echo': (_a: unknown, input: { row: number }) => `kit:${input.row}`,
    };
    const { SpecRenderer: R } = createRenderer({
      kits: [kit],
      actions: {
        'test.echo': async (
          _a: unknown,
          _i: unknown,
          next: () => Promise<unknown>,
        ) => `wrapped(${String(await next())})`,
      },
    });
    mount(() => <R spec={button('test.echo')} />);
    await vi.waitFor(() => expect(results).toEqual(['wrapped(kit:7)']));
  });

  it('accepts interface-typed kit actions', () => {
    // Type-level: kits declare actions as interfaces, which have no index
    // signature; dispatch must accept them. Checked by `tsc`, run by typecheck.
    interface AddToCart {
      type: 'test.add-to-cart';
      mode: 'now' | 'later';
    }
    function Probe() {
      const { dispatch } = useActions();
      const add: AddToCart = { type: 'test.add-to-cart', mode: 'now' };
      void dispatch(add, { id: 1 }).catch(() => {});
      void dispatch({ type: 'navigate', to: '#/x' }).catch(() => {});
      // Known gap: `{ type: 'navigate' }` without `to` also type-checks, as
      // it matches ActionDescriptor; TS can't exclude built-in type names
      // from `string`. The navigate handler would then receive no `to`.
      return <span />;
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { Root } = createRenderer({ actions: { navigate: () => {} } });
    mount(() => (
      <Root>
        <Probe />
      </Root>
    ));
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
        http: (action: { method: string; url: string }) => {
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
});
