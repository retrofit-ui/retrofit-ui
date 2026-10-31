// @vitest-environment jsdom
import type { Field, FormSpec } from '@retrofit-ui/core';
import { render } from 'solid-js/web';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { createRenderer } from '../renderer';

vi.mock('../toast', () => ({ showToast: vi.fn(), ToastContainer: () => null }));

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  window.location.hash = '';
  vi.restoreAllMocks();
});

/** Mounts a create form for `fields`; returns the root and the recorded writes. */
async function mountForm(fields: Field[]) {
  const form: FormSpec = {
    kind: 'form',
    fields,
    endpoints: { create: { method: 'POST', url: '/things' } },
  };
  const writes: unknown[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    if (String(input) === '/things') {
      writes.push(JSON.parse(String(init?.body)));
      return new Response('{}');
    }
    return new Response(JSON.stringify(form));
  });
  window.location.hash = '#/new';
  const root = document.createElement('div');
  document.body.appendChild(root);
  dispose = render(
    () => (
      <App
        config={{ routes: [{ path: '/new', spec: '/new' }] }}
        renderer={createRenderer()}
      />
    ),
    root,
  );
  await vi.waitFor(() => expect(root.querySelector('form')).not.toBeNull());
  const submit = () =>
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
  return { root, writes, submit };
}

describe('form validation', () => {
  it('rejects a number below validation.min', async () => {
    const { root, writes, submit } = await mountForm([
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        value: 10,
        validation: { min: 18 },
      },
    ]);
    submit();
    await vi.waitFor(() =>
      expect(root.textContent).toContain('Age must be at least 18'),
    );
    expect(writes).toEqual([]);
  });

  it('rejects text that does not match validation.pattern', async () => {
    const { root, writes, submit } = await mountForm([
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        value: 'A1',
        validation: { pattern: '^[a-z]+$' },
      },
    ]);
    submit();
    await vi.waitFor(() =>
      expect(root.textContent).toContain('Name is invalid'),
    );
    expect(writes).toEqual([]);
  });

  it('bounds text length by validation.max', async () => {
    const { root, submit } = await mountForm([
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        value: 'abcdef',
        validation: { max: 3 },
      },
    ]);
    submit();
    await vi.waitFor(() =>
      expect(root.textContent).toContain('Name must be at most 3 characters'),
    );
  });

  it('skips bounds on an empty optional value', async () => {
    const { writes, submit } = await mountForm([
      { name: 'age', label: 'Age', type: 'number', validation: { min: 18 } },
    ]);
    submit();
    await vi.waitFor(() => expect(writes).toHaveLength(1));
  });
});

describe('multiselect', () => {
  it('renders sl-select[multiple] and submits an array', async () => {
    const { root, writes, submit } = await mountForm([
      {
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
        value: ['a'],
      },
    ]);
    const select = root.querySelector('sl-select[multiple]') as
      | (HTMLElement & { value: unknown })
      | null;
    expect(select).not.toBeNull();
    expect(root.querySelector('sl-input')).toBeNull();
    (select as HTMLElement & { value: unknown }).value = ['a', 'b'];
    select?.dispatchEvent(new Event('sl-change'));
    submit();
    await vi.waitFor(() => expect(writes).toEqual([{ tags: ['a', 'b'] }]));
  });
});
