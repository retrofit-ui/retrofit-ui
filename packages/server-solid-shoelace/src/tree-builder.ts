import type { EndpointDirective, TreeSpec } from '@retrofit-ui/core';

export class TreeViewBuilder {
  private _endpoint?: EndpointDirective;
  private _idField = 'id';
  private _parentField = 'parentId';
  private _labelField = 'name';
  private _selection?: TreeSpec['selection'];
  private _actions: NonNullable<TreeSpec['actions']> = {};
  private _metadata?: TreeSpec['metadata'];

  endpoint(directive: EndpointDirective): this {
    this._endpoint = directive;
    return this;
  }

  idField(field: string): this {
    this._idField = field;
    return this;
  }

  parentField(field: string): this {
    this._parentField = field;
    return this;
  }

  labelField(field: string): this {
    this._labelField = field;
    return this;
  }

  selection(mode: NonNullable<TreeSpec['selection']>): this {
    this._selection = mode;
    return this;
  }

  create(directive: EndpointDirective): this {
    this._actions = { ...this._actions, create: directive };
    return this;
  }

  update(directive: EndpointDirective): this {
    this._actions = { ...this._actions, update: directive };
    return this;
  }

  delete(directive: EndpointDirective): this {
    this._actions = { ...this._actions, delete: directive };
    return this;
  }

  metadata(meta: TreeSpec['metadata']): this {
    this._metadata = meta;
    return this;
  }

  build(): TreeSpec {
    if (!this._endpoint) {
      throw new Error('TreeViewBuilder: endpoint() is required');
    }
    return {
      endpoint: this._endpoint,
      idField: this._idField,
      parentField: this._parentField,
      labelField: this._labelField,
      ...(this._selection && { selection: this._selection }),
      ...(Object.keys(this._actions).length > 0 && { actions: this._actions }),
      ...(this._metadata && { metadata: this._metadata }),
    };
  }
}

export const TreeView = TreeViewBuilder;
