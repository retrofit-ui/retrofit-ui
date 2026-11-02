import type {
  Action,
  ReadEndpoint,
  ToolbarButton,
  TreeSpec,
} from '@retrofit-ui/core';

/** Nodes carry their own writes: the endpoint's handler adds them with `withRowActions()`. */
export class TreeViewBuilder {
  private _endpoint?: ReadEndpoint;
  private _idField = 'id';
  private _parentField = 'parentId';
  private _labelField = 'name';
  private _selection?: TreeSpec['selection'];
  private _metadata?: TreeSpec['metadata'];
  private _linkField?: string;
  private _toolbar: ToolbarButton[] = [];

  endpoint(directive: ReadEndpoint): this {
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

  /** The field in each node holding its link; "Edit" opens the selected one's. */
  linkField(field: string): this {
    this._linkField = field;
    return this;
  }

  /** A button above the tree, e.g. "New". */
  toolbar(
    label: string,
    action: Action,
    variant?: ToolbarButton['variant'],
  ): this {
    this._toolbar.push({ label, action, ...(variant && { variant }) });
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
      kind: 'tree',
      endpoint: this._endpoint,
      idField: this._idField,
      parentField: this._parentField,
      labelField: this._labelField,
      ...(this._selection && { selection: this._selection }),
      ...(this._linkField && { linkField: this._linkField }),
      ...(this._toolbar.length > 0 && { toolbar: this._toolbar }),
      ...(this._metadata && { metadata: this._metadata }),
    };
  }
}

export const TreeView = TreeViewBuilder;
