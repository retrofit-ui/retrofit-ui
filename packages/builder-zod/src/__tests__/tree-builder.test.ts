import { describe, expect, it } from 'vitest';
import { TreeViewBuilder } from '../tree-builder';

const ep = { method: 'GET' as const, url: '/api/ui/nodes/tree/data' };

describe('TreeViewBuilder', () => {
  it('throws if endpoint() not called', () => {
    expect(() => new TreeViewBuilder().build()).toThrow(
      'TreeViewBuilder: endpoint() is required',
    );
  });

  it('uses default idField, parentField, labelField', () => {
    const spec = new TreeViewBuilder().endpoint(ep).build();
    expect(spec.idField).toBe('id');
    expect(spec.parentField).toBe('parentId');
    expect(spec.labelField).toBe('name');
  });

  it('idField() overrides default', () => {
    const spec = new TreeViewBuilder().endpoint(ep).idField('uid').build();
    expect(spec.idField).toBe('uid');
  });

  it('parentField() overrides default', () => {
    const spec = new TreeViewBuilder().endpoint(ep).parentField('pid').build();
    expect(spec.parentField).toBe('pid');
  });

  it('labelField() overrides default', () => {
    const spec = new TreeViewBuilder().endpoint(ep).labelField('title').build();
    expect(spec.labelField).toBe('title');
  });

  it('selection() sets selection field', () => {
    const spec = new TreeViewBuilder()
      .endpoint(ep)
      .selection('multiple')
      .build();
    expect(spec.selection).toBe('multiple');
  });

  it('selection field omitted from spec when not set', () => {
    const spec = new TreeViewBuilder().endpoint(ep).build();
    expect('selection' in spec).toBe(false);
  });

  it('metadata() sets metadata.title', () => {
    const spec = new TreeViewBuilder()
      .endpoint(ep)
      .metadata({ title: 'Category Tree' })
      .build();
    expect(spec.metadata?.title).toBe('Category Tree');
  });

  it('metadata omitted from spec when not set', () => {
    const spec = new TreeViewBuilder().endpoint(ep).build();
    expect('metadata' in spec).toBe(false);
  });

  it('fluent chaining returns same instance', () => {
    const builder = new TreeViewBuilder();
    expect(builder.endpoint(ep)).toBe(builder);
    expect(builder.idField('id')).toBe(builder);
    expect(builder.parentField('parentId')).toBe(builder);
    expect(builder.labelField('name')).toBe(builder);
    expect(builder.selection('single')).toBe(builder);
    expect(builder.metadata({})).toBe(builder);
  });

  it('build() produces a valid TreeSpec shape', () => {
    const spec = new TreeViewBuilder()
      .endpoint(ep)
      .idField('nodeId')
      .parentField('parentNodeId')
      .labelField('displayName')
      .selection('leaf')
      .metadata({ title: 'Nodes' })
      .build();

    expect(spec).toMatchObject({
      endpoint: ep,
      idField: 'nodeId',
      parentField: 'parentNodeId',
      labelField: 'displayName',
      selection: 'leaf',
      metadata: { title: 'Nodes' },
    });
  });
});
