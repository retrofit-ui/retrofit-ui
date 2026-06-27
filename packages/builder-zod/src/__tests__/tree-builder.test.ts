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

  it('create() populates actions.create', () => {
    const createEp = { method: 'POST' as const, url: '/api/nodes' };
    const spec = new TreeViewBuilder().endpoint(ep).create(createEp).build();
    expect(spec.actions?.create).toEqual(createEp);
  });

  it('update() populates actions.update', () => {
    const updateEp = { method: 'PUT' as const, url: '/api/nodes/{id}' };
    const spec = new TreeViewBuilder().endpoint(ep).update(updateEp).build();
    expect(spec.actions?.update).toEqual(updateEp);
  });

  it('delete() populates actions.delete', () => {
    const deleteEp = { method: 'DELETE' as const, url: '/api/nodes/{id}' };
    const spec = new TreeViewBuilder().endpoint(ep).delete(deleteEp).build();
    expect(spec.actions?.delete).toEqual(deleteEp);
  });

  it('actions object omitted from spec when no actions configured', () => {
    const spec = new TreeViewBuilder().endpoint(ep).build();
    expect('actions' in spec).toBe(false);
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
    const deleteEp = { method: 'DELETE' as const, url: '/api/nodes/{id}' };
    const spec = new TreeViewBuilder()
      .endpoint(ep)
      .idField('nodeId')
      .parentField('parentNodeId')
      .labelField('displayName')
      .selection('leaf')
      .delete(deleteEp)
      .metadata({ title: 'Nodes' })
      .build();

    expect(spec).toMatchObject({
      endpoint: ep,
      idField: 'nodeId',
      parentField: 'parentNodeId',
      labelField: 'displayName',
      selection: 'leaf',
      actions: { delete: deleteEp },
      metadata: { title: 'Nodes' },
    });
  });
});
