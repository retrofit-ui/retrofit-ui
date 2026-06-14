import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

import type { Column, PageSpec, TableSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import {
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  useContext,
} from 'solid-js';
import { ApiBaseContext } from './App';
import { PageView } from './PageView';
import { showToast } from './toast';

type ResourceData =
  | { kind: 'page'; spec: PageSpec }
  | { kind: 'table'; spec: TableSpec; data: Record<string, unknown>[] };

async function fetchTableView(
  resource: string,
  apiBase: string,
): Promise<ResourceData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const json = (await res.json()) as Record<string, unknown>;

  if (json.kind === 'page') {
    return { kind: 'page', spec: json as unknown as PageSpec };
  }

  const spec = json as unknown as TableSpec;
  let data: Record<string, unknown>[] = [];
  if (spec.rows) {
    data = spec.rows;
  } else if (spec.endpoints?.list) {
    const dataRes = await fetch(spec.endpoints.list.url);
    if (dataRes.ok) {
      data = (await dataRes.json()) as Record<string, unknown>[];
    }
  }

  return { kind: 'table', spec, data };
}

function extractIdField(findUrl: string): string {
  const match = findUrl.match(/\{(\w+)\}/);
  return match?.[1] ?? 'id';
}

function substitutePattern(
  pattern: string,
  row: Record<string, unknown>,
): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(row[key] ?? ''),
  );
}

function CellInput(props: {
  col: Column;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const strVal = () => String(props.value ?? '');

  if (props.col.type === 'boolean') {
    return (
      <sl-checkbox
        prop:checked={!!props.value}
        on:sl-change={(e: Event) =>
          props.onChange(
            (e.target as EventTarget & { checked: boolean }).checked,
          )
        }
      />
    );
  }

  if (props.col.type === 'enum' && props.col.options) {
    return (
      <sl-select
        prop:value={strVal()}
        style={{ 'min-width': '100px' }}
        on:sl-change={(e: Event) =>
          props.onChange((e.target as EventTarget & { value: string }).value)
        }
      >
        <For each={props.col.options}>
          {(opt) => (
            <sl-option value={String(opt.value)}>{opt.label}</sl-option>
          )}
        </For>
      </sl-select>
    );
  }

  return (
    <sl-input
      type={props.col.type === 'number' ? 'number' : 'text'}
      prop:value={strVal()}
      style={{ 'min-width': '80px' }}
      on:sl-input={(e: Event) => {
        const raw = (e.target as EventTarget & { value: string }).value;
        props.onChange(
          props.col.type === 'number' && raw !== '' ? Number(raw) : raw,
        );
      }}
    />
  );
}

function CellDisplay(props: { col: Column; value: unknown }) {
  const strVal = () => String(props.value ?? '');

  if (props.col.type === 'boolean') {
    return <span>{props.value ? '✓' : '✗'}</span>;
  }

  if (props.col.display === 'relative') {
    return (
      <sl-tooltip content={strVal()}>
        <sl-relative-time date={strVal()} />
      </sl-tooltip>
    );
  }

  return <span>{strVal()}</span>;
}

function DataRow(props: {
  row: Record<string, unknown>;
  spec: TableSpec;
  resource: string;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();
  const hasInlineEdit = () => props.spec.columns.some((c) => c.editable);
  const [editing, setEditing] = createSignal(false);
  const [values, setValues] = createSignal<Record<string, unknown>>({
    ...props.row,
  });
  const [saving, setSaving] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);

  const idField = () =>
    props.spec.endpoints?.find
      ? extractIdField(props.spec.endpoints.find.url)
      : 'id';

  function startEdit() {
    setValues({ ...props.row });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setValues({ ...props.row });
  }

  async function saveEdit() {
    const ep = props.spec.endpoints?.update;
    if (!ep) return;
    setSaving(true);
    const id = String(props.row[idField()]);
    const url = ep.url.replace('{id}', id);
    try {
      const res = await fetch(url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values()),
      });
      if (res.ok) {
        setEditing(false);
        showToast('success', 'Saved successfully');
        props.onRefresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow() {
    const ep = props.spec.endpoints?.delete;
    if (!ep) return;
    setShowDeleteDialog(false);
    setDeleting(true);
    const id = String(props.row[idField()]);
    const url = ep.url.replace('{id}', id);
    try {
      const res = await fetch(url, { method: ep.method });
      if (res.ok) {
        showToast('success', 'Deleted successfully');
        props.onRefresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  const hasActions = () =>
    hasInlineEdit() ||
    !!props.spec.endpoints?.delete ||
    (props.spec.rowActions?.length ?? 0) > 0;

  return (
    <>
      <tr
        class={`retrofit-tr${!editing() && props.spec.endpoints?.find ? ' retrofit-tr--clickable' : ''}`}
        onClick={() => {
          if (editing()) return;
          if (!props.spec.endpoints?.find) return;
          const id = props.row[idField()];
          if (id != null) navigate(`/${props.resource}/${String(id)}`);
        }}
      >
        <For each={props.spec.columns}>
          {(col) => (
            <td
              class="retrofit-td"
              style={{ 'text-align': col.alignment }}
              onClick={(e) => editing() && e.stopPropagation()}
              onKeyDown={(e) => editing() && e.stopPropagation()}
            >
              <Show
                when={editing() && col.editable}
                fallback={<CellDisplay col={col} value={props.row[col.key]} />}
              >
                <CellInput
                  col={col}
                  value={values()[col.key]}
                  onChange={(v) =>
                    setValues((prev) => ({ ...prev, [col.key]: v }))
                  }
                />
              </Show>
            </td>
          )}
        </For>
        <Show when={hasActions()}>
          <td
            class="retrofit-td"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
              <Show when={!editing() && hasInlineEdit()}>
                <sl-button size="small" variant="default" on:click={startEdit}>
                  Edit
                </sl-button>
              </Show>
              <Show when={editing()}>
                <sl-button
                  size="small"
                  variant="primary"
                  disabled={saving()}
                  on:click={saveEdit}
                >
                  Save
                </sl-button>
                <sl-button size="small" variant="default" on:click={cancelEdit}>
                  Cancel
                </sl-button>
              </Show>
              <Show when={!!props.spec.endpoints?.delete}>
                <sl-button
                  size="small"
                  variant="danger"
                  disabled={deleting()}
                  on:click={() => setShowDeleteDialog(true)}
                >
                  Delete
                </sl-button>
              </Show>
              <For each={props.spec.rowActions ?? []}>
                {(action) => (
                  <sl-button
                    size="small"
                    variant="neutral"
                    on:click={() => {
                      const resolved = substitutePattern(
                        action.routePattern,
                        props.row,
                      );
                      navigate(`/${props.resource}${resolved}`);
                    }}
                  >
                    {action.label}
                  </sl-button>
                )}
              </For>
            </div>
          </td>
        </Show>
      </tr>
      <sl-dialog label="Delete item?" prop:open={showDeleteDialog()}>
        This action cannot be undone.
        <sl-button
          slot="footer"
          variant="default"
          on:click={() => setShowDeleteDialog(false)}
        >
          Cancel
        </sl-button>
        <sl-button slot="footer" variant="danger" on:click={deleteRow}>
          Delete
        </sl-button>
      </sl-dialog>
    </>
  );
}

function NewRow(props: { spec: TableSpec; onCreated: () => void }) {
  const emptyValues = () =>
    Object.fromEntries(
      props.spec.columns.map((col) => [
        col.key,
        col.type === 'boolean' ? false : col.type === 'number' ? 0 : '',
      ]),
    );
  const [values, setValues] = createSignal<Record<string, unknown>>(
    emptyValues(),
  );
  const [adding, setAdding] = createSignal(false);

  async function handleAdd() {
    const ep = props.spec.endpoints?.create;
    if (!ep) return;
    setAdding(true);
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values()),
      });
      if (res.ok) {
        setValues(emptyValues());
        showToast('success', 'Created successfully');
        props.onCreated();
      }
    } finally {
      setAdding(false);
    }
  }

  const hasActions = () =>
    !!props.spec.endpoints?.delete || (props.spec.rowActions?.length ?? 0) > 0;

  return (
    <tr class="retrofit-tr retrofit-tr--new">
      <For each={props.spec.columns}>
        {(col) => (
          <td class="retrofit-td">
            <Show when={col.editable} fallback={<span />}>
              <CellInput
                col={col}
                value={values()[col.key]}
                onChange={(v) =>
                  setValues((prev) => ({ ...prev, [col.key]: v }))
                }
              />
            </Show>
          </td>
        )}
      </For>
      <Show when={hasActions()}>
        <td class="retrofit-td">
          <sl-button
            size="small"
            variant="primary"
            disabled={adding()}
            on:click={handleAdd}
          >
            Add
          </sl-button>
        </td>
      </Show>
    </tr>
  );
}

export function TableView() {
  const params = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [view, { refetch }] = createResource(
    () => params.resource,
    (resource) => fetchTableView(resource, apiBase),
  );

  const tableData = () =>
    view()?.kind === 'table'
      ? (view() as {
          kind: 'table';
          spec: TableSpec;
          data: Record<string, unknown>[];
        })
      : null;

  const hasInlineEdit = () =>
    tableData()?.spec.columns.some((c) => c.editable) ?? false;
  const hasActions = () =>
    hasInlineEdit() ||
    !!tableData()?.spec.endpoints?.delete ||
    (tableData()?.spec.rowActions?.length ?? 0) > 0;

  return (
    <>
      <Show when={view.loading}>
        <div class="retrofit-view">
          <table class="retrofit-table">
            <tbody>
              <For each={Array(5).fill(null)}>
                {() => (
                  <tr class="retrofit-tr">
                    <For each={Array(4).fill(null)}>
                      {() => (
                        <td class="retrofit-td">
                          <sl-skeleton effect="sheen" />
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
      <Show when={view.error}>
        <div class="retrofit-view">
          <p class="retrofit-error-message">Error: {String(view.error)}</p>
        </div>
      </Show>
      <Show when={view()}>
        {(v) => (
          <Switch>
            <Match when={v().kind === 'page'}>
              <PageView
                spec={(v() as { kind: 'page'; spec: PageSpec }).spec}
                onRefresh={() => void refetch()}
              />
            </Match>
            <Match when={v().kind === 'table'}>
              <div class="retrofit-view">
                <div class="retrofit-page-header">
                  <h1 class="retrofit-page-title">
                    {tableData()?.spec.metadata?.title ?? params.resource}
                  </h1>
                  <Show
                    when={
                      tableData()?.spec.endpoints?.create && !hasInlineEdit()
                    }
                  >
                    <sl-button
                      variant="primary"
                      on:click={() => navigate(`/${params.resource}/new`)}
                    >
                      New
                    </sl-button>
                  </Show>
                </div>
                <Show
                  when={(tableData()?.data.length ?? 0) > 0 || hasInlineEdit()}
                  fallback={<p class="retrofit-empty">No data.</p>}
                >
                  <table class="retrofit-table">
                    <thead class="retrofit-thead">
                      <tr>
                        <For each={tableData()?.spec.columns ?? []}>
                          {(col) => (
                            <th
                              class="retrofit-th"
                              style={{ 'text-align': col.alignment }}
                            >
                              {col.label}
                            </th>
                          )}
                        </For>
                        <Show when={hasActions()}>
                          <th class="retrofit-th">Actions</th>
                        </Show>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={tableData()?.data ?? []}>
                        {(row) => (
                          <DataRow
                            row={row}
                            spec={
                              tableData()?.spec ?? {
                                columns: [],
                                endpoints: {},
                              }
                            }
                            resource={params.resource}
                            onRefresh={() => void refetch()}
                          />
                        )}
                      </For>
                      <Show
                        when={
                          hasInlineEdit() && tableData()?.spec.endpoints?.create
                        }
                      >
                        <NewRow
                          spec={
                            tableData()?.spec ?? { columns: [], endpoints: {} }
                          }
                          onCreated={() => void refetch()}
                        />
                      </Show>
                    </tbody>
                  </table>
                </Show>
              </div>
            </Match>
          </Switch>
        )}
      </Show>
    </>
  );
}
