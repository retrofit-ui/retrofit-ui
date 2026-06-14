import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';

import type { TreeSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';
import { showToast } from './toast';
import { buildTree } from './tree-utils';
import type { TreeNode } from './tree-utils';

function TreeItem(props: { treeNode: TreeNode; spec: TreeSpec }) {
  return (
    <sl-tree-item data-id={String(props.treeNode.node[props.spec.idField] ?? '')}>
      {String(props.treeNode.node[props.spec.labelField] ?? '')}
      <For each={props.treeNode.children}>
        {(child) => <TreeItem treeNode={child} spec={props.spec} />}
      </For>
    </sl-tree-item>
  );
}

export function TreeView() {
  const params = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [spec] = createResource(
    () => params.resource,
    async (resource) => {
      const res = await fetch(`${apiBase}/${resource}/tree`);
      if (!res.ok) throw new Error(`Failed to fetch tree spec for ${resource}`);
      return (await res.json()) as TreeSpec;
    },
  );

  const [flatNodes] = createResource(spec, async (s) => {
    const res = await fetch(s.endpoint.url, { method: s.endpoint.method });
    if (!res.ok) throw new Error('Failed to fetch tree data');
    return (await res.json()) as Record<string, unknown>[];
  });

  const treeRoots = () => {
    const s = spec();
    const nodes = flatNodes();
    if (!s || !nodes) return [];
    return buildTree(nodes, s.idField, s.parentField);
  };

  const [selectedIds, setSelectedIds] = createSignal<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  async function handleDelete() {
    const s = spec();
    if (!s?.actions?.delete) return;
    setDeleting(true);
    try {
      for (const id of selectedIds()) {
        const url = s.actions.delete.url.replace('{id}', id);
        const res = await fetch(url, { method: s.actions.delete.method });
        if (!res.ok) {
          showToast('danger', `Delete failed for id ${id}`);
          return;
        }
      }
      setShowDeleteDialog(false);
      setSelectedIds([]);
      showToast('success', 'Deleted successfully');
    } finally {
      setDeleting(false);
    }
  }

  const isLoading = () => spec.loading || flatNodes.loading;
  const loadError = () => spec.error ?? flatNodes.error;

  return (
    <>
      <Show when={isLoading()}>
        <div class="retrofit-view">
          <sl-skeleton effect="sheen" style={{ height: '1.5rem', 'margin-bottom': '0.5rem' }} />
          <sl-skeleton effect="sheen" style={{ height: '1.5rem', 'margin-bottom': '0.5rem' }} />
          <sl-skeleton effect="sheen" style={{ height: '1.5rem' }} />
        </div>
      </Show>
      <Show when={loadError()}>
        <div class="retrofit-view">
          <p class="retrofit-error-message">Error: {String(loadError())}</p>
        </div>
      </Show>
      <Show when={spec() && flatNodes()}>
        <div class="retrofit-view">
          <div class="retrofit-page-header">
            <h1 class="retrofit-page-title">
              {spec()?.metadata?.title ?? params.resource}
            </h1>
            <Show when={spec()?.actions?.create}>
              <sl-button
                variant="primary"
                on:click={() => navigate(`/${params.resource}/new`)}
              >
                New
              </sl-button>
            </Show>
          </div>
          <Show
            when={treeRoots().length > 0}
            fallback={<p class="retrofit-empty">No data.</p>}
          >
            <sl-tree
              selection={spec()?.selection ?? 'single'}
              on:sl-selection-change={(e: Event) => {
                const items = (e as CustomEvent<{ selection: HTMLElement[] }>).detail.selection;
                setSelectedIds(items.map((el) => (el as HTMLElement & { dataset: DOMStringMap }).dataset.id ?? '').filter(Boolean));
              }}
            >
              <For each={treeRoots()}>
                {(root) => <TreeItem treeNode={root} spec={spec()!} />}
              </For>
            </sl-tree>
          </Show>
          <Show when={spec()?.actions}>
            <div style={{ display: 'flex', gap: '8px', 'margin-top': '1rem' }}>
              <Show when={spec()?.actions?.update}>
                <sl-button
                  variant="default"
                  disabled={selectedIds().length !== 1}
                  on:click={() => {
                    if (selectedIds().length !== 1) return;
                    navigate(`/${params.resource}/${selectedIds()[0]}`);
                  }}
                >
                  Edit
                </sl-button>
              </Show>
              <Show when={spec()?.actions?.delete}>
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
