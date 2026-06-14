import { describe, expect, it } from 'vitest';
import { buildTree } from '../tree-utils';

describe('buildTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildTree([], 'id', 'parentId')).toEqual([]);
  });

  it('flat list with no children returns array of roots with empty children', () => {
    const nodes = [
      { id: 1, parentId: null, name: 'A' },
      { id: 2, parentId: null, name: 'B' },
    ];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(2);
    expect(result[0]?.children).toHaveLength(0);
    expect(result[1]?.children).toHaveLength(0);
  });

  it('one root with two children', () => {
    const nodes = [
      { id: 1, parentId: null, name: 'Root' },
      { id: 2, parentId: 1, name: 'Child A' },
      { id: 3, parentId: 1, name: 'Child B' },
    ];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(1);
    expect(result[0]?.children).toHaveLength(2);
  });

  it('two-level nesting (grandchildren)', () => {
    const nodes = [
      { id: 1, parentId: null, name: 'Root' },
      { id: 2, parentId: 1, name: 'Child' },
      { id: 3, parentId: 2, name: 'Grandchild' },
    ];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(1);
    expect(result[0]?.children).toHaveLength(1);
    expect(result[0]?.children[0]?.children).toHaveLength(1);
    expect(result[0]?.children[0]?.children[0]?.node.name).toBe('Grandchild');
  });

  it('orphan node (parentId not in list) treated as root', () => {
    const nodes = [
      { id: 1, parentId: 99, name: 'Orphan' },
      { id: 2, parentId: null, name: 'Real root' },
    ];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(2);
  });

  it('node with parentId: null is a root', () => {
    const nodes = [{ id: 1, parentId: null, name: 'Root' }];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(1);
    expect(result[0]?.node.id).toBe(1);
  });

  it('node with parentId: undefined is a root', () => {
    const nodes = [{ id: 1, name: 'Root' }] as Record<string, unknown>[];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(1);
  });

  it('all nodes have same parentId pointing to non-existent node — all treated as roots', () => {
    const nodes = [
      { id: 1, parentId: 999, name: 'A' },
      { id: 2, parentId: 999, name: 'B' },
      { id: 3, parentId: 999, name: 'C' },
    ];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result).toHaveLength(3);
  });

  it('preserves node data on the result', () => {
    const nodes = [{ id: 'abc', parentId: null, name: 'Hello', extra: 42 }];
    const result = buildTree(nodes, 'id', 'parentId');
    expect(result[0]?.node).toEqual({ id: 'abc', parentId: null, name: 'Hello', extra: 42 });
  });

  it('uses custom idField and parentField names', () => {
    const nodes = [
      { uid: 10, pid: null, label: 'Root' },
      { uid: 20, pid: 10, label: 'Child' },
    ];
    const result = buildTree(nodes, 'uid', 'pid');
    expect(result).toHaveLength(1);
    expect(result[0]?.children).toHaveLength(1);
  });
});
