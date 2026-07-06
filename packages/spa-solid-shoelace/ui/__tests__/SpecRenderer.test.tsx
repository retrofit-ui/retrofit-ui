import { HashRouter, Route } from '@solidjs/router';
import { cleanup, render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import { afterEach, describe, expect, it } from 'vitest';
import type { AnySpec, ExtensionRegistry, Renderer } from '../registry';
import { SpecRenderer } from '../SpecRenderer';

// ── Test helpers ──────────────────────────────────────────────────────────────

/**
 * Mount SpecRenderer under a HashRouter. PageView uses useSearchParams, so any
 * spec that recurses through a page/container needs a router in scope.
 */
function renderSpec(spec: unknown, extensions?: ExtensionRegistry) {
  return render(() => (
    <HashRouter>
      <Route
        path="/*all"
        component={() => (
          // biome-ignore lint/suspicious/noExplicitAny: test specs use custom kinds
          <SpecRenderer
            spec={spec as any}
            apiBase="/api"
            extensions={extensions}
          />
        )}
      />
    </HashRouter>
  ));
}

// A custom leaf kind. Ignores Dispatch — it renders no children.
const MyWidget: Renderer<{ kind: 'my-widget'; label: string }> = (props) => (
  <div class="my-widget">widget:{props.spec.label}</div>
);

// A custom container kind. Renders its children back through Dispatch, so any
// registered kind (built-in or custom) nested inside it resolves correctly.
interface MyPanelSpec {
  kind: 'my-panel';
  children: AnySpec[];
}
const MyPanel: Renderer<MyPanelSpec> = (props) => (
  <div class="my-panel">
    <For each={props.spec.children}>
      {(child) => <props.Dispatch spec={child} />}
    </For>
  </div>
);

const EXT: ExtensionRegistry = {
  'my-widget': MyWidget,
  'my-panel': MyPanel,
};

afterEach(cleanup);

// ── Regression guard: no extensions, built-ins unchanged ──────────────────────

describe('SpecRenderer without extensions', () => {
  it('renders a page with built-in text/stat/card children exactly as before', () => {
    const spec = {
      kind: 'page',
      title: 'Dashboard',
      children: [
        { kind: 'text', content: 'hello world' },
        {
          kind: 'stat',
          stats: [{ label: 'Reviews', value: 128 }],
        },
        {
          kind: 'card',
          header: 'Card header',
          children: [{ kind: 'text', content: 'in card' }],
        },
      ],
    };
    const { container } = renderSpec(spec);

    expect(container.querySelector('.retrofit-page-title')?.textContent).toBe(
      'Dashboard',
    );
    expect(container.textContent).toContain('hello world');
    expect(container.querySelector('.retrofit-stat-value')?.textContent).toBe(
      '128',
    );
    expect(container.querySelector('.retrofit-stat-label')?.textContent).toBe(
      'Reviews',
    );
    expect(container.textContent).toContain('in card');
  });

  it('shows "Unknown spec kind" for an unregistered kind', () => {
    const { container } = renderSpec({ kind: 'my-widget', label: 'x' });
    expect(container.querySelector('.retrofit-error-message')?.textContent).toBe(
      'Unknown spec kind',
    );
    expect(container.querySelector('.my-widget')).toBeNull();
  });
});

// ── Custom leaf at the top level ──────────────────────────────────────────────

describe('custom leaf kind', () => {
  it('renders at the top level when registered', () => {
    const { container } = renderSpec(
      { kind: 'my-widget', label: 'top' },
      EXT,
    );
    expect(container.querySelector('.my-widget')?.textContent).toBe(
      'widget:top',
    );
    expect(container.querySelector('.retrofit-error-message')).toBeNull();
  });

  it('renders when nested inside a built-in flex (the core bug)', () => {
    const spec = {
      kind: 'page',
      children: [
        {
          kind: 'flex',
          children: [{ kind: 'my-widget', label: 'in-flex' }],
        },
      ],
    };
    const { container } = renderSpec(spec, EXT);
    expect(container.querySelector('.my-widget')?.textContent).toBe(
      'widget:in-flex',
    );
  });

  it('renders inside a built-in grid', () => {
    const spec = {
      kind: 'page',
      children: [
        {
          kind: 'grid',
          columns: 2,
          children: [{ kind: 'my-widget', label: 'in-grid' }],
        },
      ],
    };
    const { container } = renderSpec(spec, EXT);
    expect(container.querySelector('.my-widget')?.textContent).toBe(
      'widget:in-grid',
    );
  });

  it('renders inside a card body and a card footer', () => {
    const spec = {
      kind: 'card',
      children: [{ kind: 'my-widget', label: 'body' }],
      footer: { kind: 'my-widget', label: 'footer' },
    };
    const { container } = renderSpec(spec, EXT);
    const widgets = container.querySelectorAll('.my-widget');
    const texts = Array.from(widgets).map((w) => w.textContent);
    expect(texts).toContain('widget:body');
    expect(texts).toContain('widget:footer');
  });

  it('renders inside a tabs panel', () => {
    const spec = {
      kind: 'page',
      children: [
        {
          kind: 'tabs',
          tabs: [
            {
              label: 'Tab one',
              children: [{ kind: 'my-widget', label: 'in-tab' }],
            },
          ],
        },
      ],
    };
    const { container } = renderSpec(spec, EXT);
    expect(container.querySelector('.my-widget')?.textContent).toBe(
      'widget:in-tab',
    );
  });
});

// ── Custom container via Dispatch ─────────────────────────────────────────────

describe('custom container kind', () => {
  it('renders mixed built-in and custom children through Dispatch', () => {
    const spec = {
      kind: 'my-panel',
      children: [
        { kind: 'text', content: 'built-in child' },
        { kind: 'my-widget', label: 'custom child' },
      ],
    };
    const { container } = renderSpec(spec, EXT);
    const panel = container.querySelector('.my-panel');
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain('built-in child');
    expect(panel?.querySelector('.my-widget')?.textContent).toBe(
      'widget:custom child',
    );
  });

  it('threads the registry all the way down: custom kind in custom container in built-in flex', () => {
    const spec = {
      kind: 'page',
      children: [
        {
          kind: 'flex',
          children: [
            {
              kind: 'my-panel',
              children: [{ kind: 'my-widget', label: 'deep' }],
            },
          ],
        },
      ],
    };
    const { container } = renderSpec(spec, EXT);
    const panel = container.querySelector('.my-panel');
    expect(panel?.querySelector('.my-widget')?.textContent).toBe(
      'widget:deep',
    );
  });

  it('renders an empty custom container without crashing', () => {
    const { container } = renderSpec(
      { kind: 'my-panel', children: [] },
      EXT,
    );
    expect(container.querySelector('.my-panel')?.textContent).toBe('');
  });
});

// ── Override precedence ───────────────────────────────────────────────────────

describe('extension precedence over built-ins', () => {
  it('a registered card renderer overrides the built-in card', () => {
    const MyCard: Renderer = () => <div class="my-card">overridden</div>;
    const spec = {
      kind: 'card',
      header: 'ignored',
      children: [{ kind: 'text', content: 'ignored too' }],
    };
    const { container } = renderSpec(spec, { card: MyCard });
    expect(container.querySelector('.my-card')?.textContent).toBe('overridden');
    // The built-in card renders an <sl-card>; the override must replace it.
    expect(container.querySelector('sl-card')).toBeNull();
  });

  it('overrides the built-in flex at the recursive level', () => {
    const MyFlex: Renderer = () => <div class="my-flex">flex-overridden</div>;
    const spec = {
      kind: 'page',
      children: [{ kind: 'flex', children: [] }],
    };
    const { container } = renderSpec(spec, { flex: MyFlex });
    expect(container.querySelector('.my-flex')?.textContent).toBe(
      'flex-overridden',
    );
  });

  it('leaves built-ins intact when not overridden', () => {
    const spec = {
      kind: 'page',
      children: [{ kind: 'flex', children: [{ kind: 'text', content: 'x' }] }],
    };
    const { container } = renderSpec(spec, EXT);
    // No flex override registered → built-in flex renders its text child.
    expect(container.textContent).toContain('x');
    expect(container.querySelector('.my-flex')).toBeNull();
  });
});
