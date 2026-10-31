import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  Action,
  ActionEntry,
  ActionType,
  CardSpec,
  ContainerSpec,
  Field,
  FlexSpec,
  PageSpec,
  Spec,
  SpecKind,
  SpecNode,
  SpecOf,
  StatSpec,
  TableSpec,
} from '..';

// An app's own kind and action, registered the way an app would.
interface RatingSpec extends SpecNode<'test.rating'> {
  score: number;
}
interface RateAction {
  type: 'test.rate';
  stars: number;
}
declare module '..' {
  interface SpecKinds {
    'test.rating': RatingSpec;
  }
  interface ActionKinds {
    'test.rate': ActionEntry<RateAction, { itemId: string }, boolean>;
  }
}

// These tests are checked by `tsc` (pnpm typecheck); each @ts-expect-error
// fails the build if the line it guards stops being an error.
describe('Spec', () => {
  it('nests a registered app kind inside built-in containers', () => {
    const page: PageSpec = {
      kind: 'page',
      children: [
        {
          kind: 'card',
          header: 'Scores',
          children: [{ kind: 'test.rating', score: 4 }],
        },
        { kind: 'flex', children: [{ kind: 'text', content: 'hi' }] },
      ],
    };
    expect(page.children).toHaveLength(2);
  });

  it('rejects unregistered kinds and malformed built-ins', () => {
    const children: Spec[] = [
      // @ts-expect-error not a registered kind
      { kind: 'test.unknown' },
      // @ts-expect-error a stat needs `stats`
      { kind: 'stat' },
      // @ts-expect-error `score` belongs to test.rating, not text
      { kind: 'text', content: 'x', score: 1 },
    ];
    expect(children).toHaveLength(3);
  });

  it('rejects field types the renderer has no input for', () => {
    const field: Field = {
      name: 'x',
      label: 'X',
      // @ts-expect-error radio was dropped; use radio-group
      type: 'radio',
    };
    expect(field.name).toBe('x');
  });

  it('narrows by kind', () => {
    const narrow = (spec: Spec) =>
      spec.kind === 'test.rating' ? spec.score : 0;
    expect(narrow({ kind: 'test.rating', score: 3 })).toBe(3);
    expectTypeOf<SpecOf<'stat'>>().toEqualTypeOf<StatSpec>();
    expectTypeOf<SpecOf<'test.rating'>>().toEqualTypeOf<RatingSpec>();
  });

  it('gives containers one supertype whose children are any Spec', () => {
    expectTypeOf<CardSpec>().toExtend<ContainerSpec<'card'>>();
    expectTypeOf<FlexSpec>().toExtend<ContainerSpec>();
    expectTypeOf<PageSpec['children']>().toEqualTypeOf<Spec[]>();
    expectTypeOf<TableSpec>().toExtend<SpecNode<'table'>>();
    expectTypeOf<'test.rating'>().toExtend<SpecKind>();
  });

  it('has no wrapped page-child shape', () => {
    const children: Spec[] = [
      // @ts-expect-error tables are flat everywhere; there is no { spec } wrapper
      { kind: 'table', spec: { kind: 'table', columns: [], endpoints: {} } },
    ];
    expect(children).toHaveLength(1);
    const filter: Spec = { kind: 'filter-form', fields: [] };
    expect(filter.kind).toBe('filter-form');
  });

  it('has no table-level update/delete; rows carry their own writes', () => {
    const table: TableSpec = {
      kind: 'table',
      columns: [],
      endpoints: {
        // @ts-expect-error writes are per row, in each row's `_actions`
        update: { method: 'PUT', url: '/c/{id}' },
      },
    };
    expect(table.kind).toBe('table');
  });
});

describe('Action', () => {
  it('registers app action types alongside the built-ins', () => {
    expectTypeOf<'test.rate'>().toExtend<ActionType>();
    expectTypeOf<'navigate'>().toExtend<ActionType>();
    const actions: Action[] = [
      { type: 'navigate', to: '#/x' },
      { type: 'refresh' },
      { type: 'test.rate', stars: 5 },
      // @ts-expect-error a navigate action needs `to`
      { type: 'navigate' },
      // @ts-expect-error not a registered action type
      { type: 'test.unknown' },
    ];
    expect(actions).toHaveLength(5);
  });
});
