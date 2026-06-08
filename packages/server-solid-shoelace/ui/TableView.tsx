import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';

import type { Column, TableSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

interface TableViewData {
  spec: TableSpec;
  data: Record<string, unknown>[];
}

async function fetchTableView(
  resource: string,
  apiBase: string,
): Promise<TableViewData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const spec = (await res.json()) as TableSpec;

  let data: Record<string, unknown>[] = [];
  if (spec.endpoints?.list) {
    const dataRes = await fetch(spec.endpoints.list.url);
    if (dataRes.ok) {
      data = (await dataRes.json()) as Record<string, unknown>[];
    }
  }

  return { spec, data };
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
        props.onRefresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow() {
    const ep = props.spec.endpoints?.delete;
    if (!ep) return;
    if (!confirm('Delete this item?')) return;
    setDeleting(true);
    const id = String(props.row[idField()]);
    const url = ep.url.replace('{id}', id);
    try {
      const res = await fetch(url, { method: ep.method });
      if (res.ok) props.onRefresh();
    } finally {
      setDeleting(false);
    }
  }

  const hasActions = () =>
    hasInlineEdit() ||
    !!props.spec.endpoints?.delete ||
    (props.spec.rowActions?.length ?? 0) > 0;

  return (
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
              fallback={
                <span>
                  {col.type === 'boolean'
                    ? props.row[col.key]
                      ? '✓'
                      : '✗'
                    : String(props.row[col.key] ?? '')}
                </span>
              }
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
                on:click={deleteRow}
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

  const hasInlineEdit = () =>
    view()?.spec.columns.some((c) => c.editable) ?? false;
  const hasActions = () =>
    hasInlineEdit() ||
    !!view()?.spec.endpoints?.delete ||
    (view()?.spec.rowActions?.length ?? 0) > 0;

  return (
    <div class="retrofit-view">
      <Show when={view.loading}>
        <p class="retrofit-muted">Loading...</p>
      </Show>
      <Show when={view.error}>
        <p class="retrofit-error-message">Error: {String(view.error)}</p>
      </Show>
      <Show when={view()}>
        {(v) => (
          <div>
            <div class="retrofit-page-header">
              <h1 class="retrofit-page-title">
                {v().spec.metadata?.title ?? params.resource}
              </h1>
              <Show when={v().spec.endpoints?.create && !hasInlineEdit()}>
                <sl-button
                  variant="primary"
                  on:click={() => navigate(`/${params.resource}/new`)}
                >
                  New
                </sl-button>
              </Show>
            </div>
            <Show
              when={v().data.length > 0 || hasInlineEdit()}
              fallback={<p class="retrofit-empty">No data.</p>}
            >
              <table class="retrofit-table">
                <thead class="retrofit-thead">
                  <tr>
                    <For each={v().spec.columns}>
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
                  <For each={v().data}>
                    {(row) => (
                      <DataRow
                        row={row}
                        spec={v().spec}
                        resource={params.resource}
                        onRefresh={() => void refetch()}
                      />
                    )}
                  </For>
                  <Show when={hasInlineEdit() && v().spec.endpoints?.create}>
                    <NewRow spec={v().spec} onCreated={() => void refetch()} />
                  </Show>
                </tbody>
              </table>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
