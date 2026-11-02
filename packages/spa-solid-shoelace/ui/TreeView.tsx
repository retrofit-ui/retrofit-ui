import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';

import type { RowActions, TreeSpec } from '@retrofit-ui/core';
import { createResource, createSignal, For, Show } from 'solid-js';
import { useActions, useHttp } from './actions';
import { Toolbar } from './TableView';
import { showToast } from './toast';
import type { TreeNode } from './tree-utils';
import { buildTree } from './tree-utils';

function TreeItem(props: { treeNode: TreeNode; spec: TreeSpec }) {
  return (
    <sl-tree-item
      attr:data-id={String(props.treeNode.node[props.spec.idField] ?? '')}
    >
      {String(props.treeNode.node[props.spec.labelField] ?? '')}
      <For each={props.treeNode.children}>
        {(child) => <TreeItem treeNode={child} spec={props.spec} />}
      </For>
    </sl-tree-item>
  );
}

export function TreeViewComponent(props: { spec: TreeSpec }) {
  const send = useHttp();
  const { dispatch } = useActions();
  const [flatNodes, { refetch }] = createResource(async () => {
    const res = await send(props.spec.endpoint.url);
    if (!res.ok) throw new Error('Failed to fetch tree data');
    return (await res.json()) as Record<string, unknown>[];
  });

  const treeRoots = () => {
    const nodes = flatNodes();
    if (!nodes) return [];
    return buildTree(nodes, props.spec.idField, props.spec.parentField);
  };

  const [selectedIds, setSelectedIds] = createSignal<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  const nodeById = (id: string) =>
    flatNodes()?.find((n) => String(n[props.spec.idField]) === id);
  const deleteOf = (node: Record<string, unknown> | undefined) =>
    (node?._actions as RowActions | undefined)?.delete;
  const anyDeletable = () => !!flatNodes()?.some((n) => deleteOf(n));

  // The selected node's finished link, from the spec's linkField.
  const selectedLink = () => {
    const field = props.spec.linkField;
    const [id] = selectedIds();
    if (!field || id === undefined || selectedIds().length !== 1)
      return undefined;
    const link = nodeById(id)?.[field];
    return typeof link === 'string' && link !== '' ? link : undefined;
  };

  async function handleDelete() {
    setDeleting(true);
    const skipped: string[] = [];
    const failed: string[] = [];
    let deleted = 0;
    try {
      for (const id of selectedIds()) {
        const ep = deleteOf(nodeById(id));
        if (!ep) {
          skipped.push(id);
          continue;
        }
        try {
          const res = await send(ep.url, { method: ep.method });
          if (res.ok) deleted++;
          else failed.push(id);
        } catch {
          failed.push(id);
        }
      }
      setShowDeleteDialog(false);
      setSelectedIds([]);
      if (failed.length > 0) {
        showToast('danger', `Delete failed for: ${failed.join(', ')}`);
      }
      if (skipped.length > 0) {
        showToast('warning', `Cannot delete: ${skipped.join(', ')}`);
      } else if (failed.length === 0) {
        showToast('success', 'Deleted successfully');
      }
      if (deleted > 0) {
        void refetch();
        void dispatch({ type: 'refresh' });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Show when={flatNodes.loading}>
        <div class="retrofit-view">
          <sl-skeleton
            effect="sheen"
            style={{ height: '1.5rem', 'margin-bottom': '0.5rem' }}
          />
          <sl-skeleton
            effect="sheen"
            style={{ height: '1.5rem', 'margin-bottom': '0.5rem' }}
          />
          <sl-skeleton effect="sheen" style={{ height: '1.5rem' }} />
        </div>
      </Show>
      <Show when={flatNodes.error}>
        <div class="retrofit-view">
          <p class="retrofit-error-message">Error: {String(flatNodes.error)}</p>
        </div>
      </Show>
      <Show when={flatNodes()}>
        <div class="retrofit-view">
          <Show when={props.spec.metadata?.title || props.spec.toolbar?.length}>
            <div class="retrofit-page-header">
              <Show when={props.spec.metadata?.title}>
                <h1 class="retrofit-page-title">
                  {props.spec.metadata?.title}
                </h1>
              </Show>
              <Toolbar buttons={props.spec.toolbar} />
            </div>
          </Show>
          <Show
            when={treeRoots().length > 0}
            fallback={<p class="retrofit-empty">No data.</p>}
          >
            <sl-tree
              selection={props.spec.selection ?? 'single'}
              on:sl-selection-change={(e: Event) => {
                const items = (e as CustomEvent<{ selection: HTMLElement[] }>)
                  .detail.selection;
                setSelectedIds(
                  items
                    .map(
                      (el) =>
                        (el as HTMLElement & { dataset: DOMStringMap }).dataset
                          .id ?? '',
                    )
                    .filter(Boolean),
                );
              }}
            >
              <For each={treeRoots()}>
                {(root) => <TreeItem treeNode={root} spec={props.spec} />}
              </For>
            </sl-tree>
          </Show>
          <Show when={props.spec.linkField || anyDeletable()}>
            <div style={{ display: 'flex', gap: '8px', 'margin-top': '1rem' }}>
              <Show when={props.spec.linkField}>
                <sl-button
                  variant="default"
                  disabled={!selectedLink()}
                  on:click={() => {
                    const to = selectedLink();
                    if (to) void dispatch({ type: 'navigate', to });
                  }}
                >
                  Edit
                </sl-button>
              </Show>
              <Show when={anyDeletable()}>
                <sl-button
                  variant="danger"
                  disabled={selectedIds().length === 0}
                  on:click={() => setShowDeleteDialog(true)}
                >
                  Delete
                </sl-button>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
      <sl-dialog label="Delete selected items?" prop:open={showDeleteDialog()}>
        This action cannot be undone.
        <sl-button
          slot="footer"
          variant="default"
          on:click={() => setShowDeleteDialog(false)}
        >
          Cancel
        </sl-button>
        <sl-button
          slot="footer"
          variant="danger"
          disabled={deleting()}
          on:click={() => void handleDelete()}
        >
          Delete
        </sl-button>
      </sl-dialog>
    </>
  );
}
