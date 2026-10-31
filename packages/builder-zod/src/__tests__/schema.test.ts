import schema from '@retrofit-ui/core/schema.json';
import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CalendarView } from '../calendar-builder';
import { formSpec } from '../form-builder';
import { grid, pageSpec } from '../page-builder';
import { crudRoutes } from '../routes';
import { StatView } from '../stat-view-builder';
import { TreeView } from '../tree-builder';
import { TableView } from '../view-builder';

// `discriminator` reads the schema's `kind` tag, so errors name one kind's fields.
const ajv = new Ajv({ strict: false, discriminator: true });
ajv.addSchema(schema, 'retrofit-ui');
const validateSpec = ajv.getSchema('retrofit-ui#/definitions/BuiltinSpec');
const validateConfig = ajv.getSchema('retrofit-ui#/definitions/RetrofitConfig');

function expectValid(validate: typeof validateSpec, value: unknown) {
  if (!validate) throw new Error('definition missing from the schema');
  const ok = validate(value);
  expect(validate.errors ?? []).toEqual([]);
  expect(ok).toBe(true);
}

const Contact = z.object({ id: z.number(), name: z.string() });
const table = TableView.forRows(Contact, [{ id: 7, name: 'Ada' }])
  .update({ method: 'PUT', url: '/contacts/{id}' })
  .build();

describe('the generated JSON Schema', () => {
  it('accepts a table with row writes', () => {
    expectValid(validateSpec, table);
  });

  it('accepts an edit form', () => {
    const form = formSpec(Contact)
      .edit()
      .values({ id: 7, name: 'Ada' })
      .update({ method: 'PUT', url: '/contacts/{id}' })
      .params({ id: 7 })
      .onDone({ type: 'navigate', to: '#/contacts' })
      .build();
    expectValid(validateSpec, form);
  });

  it('accepts a page nesting a grid of a stat and a table', () => {
    const stat = new StatView().stat({ label: 'Contacts', value: 1 }).build();
    const page = pageSpec()
      .title('Dashboard')
      .add(grid(2).add(stat).table(table).build())
      .build();
    expectValid(validateSpec, page);
  });

  it('accepts a tree and a calendar', () => {
    const tree = new TreeView()
      .endpoint({ method: 'GET', url: '/nodes' })
      .toolbar('New', { type: 'navigate', to: '#/nodes/new' })
      .build();
    const calendar = CalendarView.events([
      { id: '1', title: 'Standup', start: '2026-06-15T09:00:00' },
    ])
      .editable()
      .update({ method: 'PUT', url: '/events/{id}' })
      .build();
    expectValid(validateSpec, tree);
    expectValid(validateSpec, calendar);
  });

  it('accepts an http action where an action goes', () => {
    expectValid(validateSpec, {
      kind: 'markdown',
      content: '# Hi',
      metadata: { back: { method: 'GET', url: '/home' } },
    });
  });

  it('rejects a table without columns and an unknown kind', () => {
    expect(validateSpec?.({ kind: 'table' })).toBe(false);
    expect(validateSpec?.errors?.[0]?.params).toEqual({
      missingProperty: 'columns',
    });
    expect(validateSpec?.({ kind: 'nope' })).toBe(false);
  });

  it('rejects an unknown kind nested in a container', () => {
    const page = { kind: 'page', children: [{ kind: 'nope' }] };
    expect(validateSpec?.(page)).toBe(false);
  });

  it('accepts a config', () => {
    expectValid(validateConfig, { title: 'Blog', routes: crudRoutes('posts') });
  });
});
