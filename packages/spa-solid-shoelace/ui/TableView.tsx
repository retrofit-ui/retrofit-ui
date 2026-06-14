import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/format-bytes/format-bytes.js';
import '@shoelace-style/shoelace/dist/components/format-number/format-number.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { Cell, Column, PageSpec, TableSpec } from '@retrofit-ui/core';

function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function formatCellValue(col: Column, row: Record<string, unknown>): string {
  const raw = row[col.key];
  if (raw == null) return '';
  if (col.type === 'boolean') return raw ? '✓' : '✗';
  if (col.type === 'date') {
    const d = new Date(`${String(raw)}T00:00:00`);
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
  }
  if (col.type === 'datetime') {
    const d = new Date(String(raw));
    return isNaN(d.getTime())
      ? String(raw)
      : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  if (col.type === 'time') {
    const parts = String(raw).split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : String(raw);
  }
  return String(raw);
}
import { useNavigate, useParams } from '@solidjs/router';
import {
  createEffect,
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
import { substitutePattern } from './utils';

type ResourceData =
  | { kind: 'page'; spec: PageSpec }
  | { kind: 'table'; spec: TableSpec; data: Record<string, Cell>[] };

async function fetchTableView(
  resource: string,
  apiBase: string,
  page: number,
  pageSizeOverride: number | null,
): Promise<ResourceData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const json = (await res.json()) as Record<string, unknown>;

  if (json.kind === 'page') {
    return { kind: 'page', spec: json as unknown as PageSpec };
  }

  const spec = json as unknown as TableSpec;
  let data: Record<string, Cell>[] = [];
  if (spec.rows) {
    data = spec.rows;
  } else if (spec.endpoints?.list) {
    const pagination = spec.metadata?.pagination;
    let url = spec.endpoints.list.url;
    if (pagination) {
      const pageSize = pageSizeOverride ?? pagination.pageSize;
      url = substitutePattern(url, {
        page: String(page),
        pageSize: String(pageSize),
      });
    }
    const dataRes = await fetch(url);
    if (dataRes.ok) {
      const raw = (await dataRes.json()) as Record<string, unknown>[];
      data = raw.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, { value: v } satisfies Cell]),
        ),
      );
    }
  }

  return { kind: 'table', spec, data };
}

function extractIdField(findUrl: string): string {
  const match = findUrl.match(/\{(\w+)\}/);
  return match?.[1] ?? 'id';
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

  if (props.col.type === 'datetime') {
    return (
      <sl-input
        type="datetime-local"
        prop:value={isoToDatetimeLocal(strVal())}
        style={{ 'min-width': '160px' }}
        on:sl-change={(e: Event) => {
          props.onChange(
            datetimeLocalToIso((e.target as EventTarget & { value: string }).value),
          );
        }}
      />
    );
  }

  return (
    <sl-input
      type={
        props.col.type === 'number'
          ? 'number'
          : props.col.type === 'date'
            ? 'date'
            : props.col.type === 'time'
              ? 'time'
              : 'text'
      }
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
  const display = () => formatCellValue(props.col, { [props.col.key]: props.value });
  const strVal = () => String(props.value ?? '');
  const badgeVariant = () => props.col.badgeVariants?.[strVal()];
  const numVal = () => Number(props.value ?? 0);

  return (
    <Switch fallback={<span>{display()}</span>}>
      <Match when={props.col.type === 'boolean'}>
        <span>{props.value ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => <sl-badge variant={variant()}>{strVal()}</sl-badge>}
      </Match>
      <Match when={props.col.format === 'bytes'}>
        <sl-format-bytes value={numVal()} />
      </Match>
      <Match when={props.col.format === 'percent'}>
        <sl-format-number value={numVal()} type="percent" />
      </Match>
      <Match when={props.col.format === 'currency'}>
        <sl-format-number
          value={numVal()}
          type="currency"
          currency={props.col.currency ?? 'USD'}
        />
      </Match>
      <Match when={props.col.format === 'decimal'}>
        <sl-format-number value={numVal()} />
      </Match>
    </Switch>
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

  const [currentPage, setCurrentPage] = createSignal(1);
  const [currentPageSize, setCurrentPageSize] = createSignal<number | null>(
    null,
  );

  createEffect(() => {
    params.resource;
    setCurrentPage(1);
    setCurrentPageSize(null);
  });

  const [view, { refetch }] = createResource(
    () => [params.resource, currentPage(), currentPageSize()] as const,
    ([resource, page, pageSizeOverride]) =>
      fetchTableView(resource, apiBase, page, pageSizeOverride),
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
                  <Show when={tableData()?.spec.metadata?.pagination}>
                    {(pagination) => {
                      const totalPages = () =>
                        Math.max(
                          1,
                          Math.ceil(
                            pagination().totalRows /
                              (currentPageSize() ?? pagination().pageSize),
                          ),
                        );
                      return (
                        <div class="retrofit-pagination">
                          <sl-button-group label="Page navigation">
                            <sl-icon-button
                              name="chevron-left"
                              label="Previous page"
                              disabled={currentPage() <= 1 || undefined}
                              on:click={() => setCurrentPage((p) => p - 1)}
                            />
                            <sl-icon-button
                              name="chevron-right"
                              label="Next page"
                              disabled={
                                currentPage() >= totalPages() || undefined
                              }
                              on:click={() => setCurrentPage((p) => p + 1)}
                            />
                          </sl-button-group>
                          <span class="retrofit-pagination-label">
                            Page {currentPage()} of {totalPages()}
                          </span>
                          <Show
                            when={
                              (pagination().pageSizeOptions?.length ?? 0) > 0
                            }
                          >
                            <sl-select
                              size="small"
                              prop:value={String(
                                currentPageSize() ?? pagination().pageSize,
                              )}
                              on:sl-change={(e: Event) => {
                                setCurrentPageSize(
                                  Number(
                                    (
                                      e.target as EventTarget & {
                                        value: string;
                                      }
                                    ).value,
                                  ),
                                );
                                setCurrentPage(1);
                              }}
                            >
                              <For each={pagination().pageSizeOptions ?? []}>
                                {(size) => (
                                  <sl-option value={String(size)}>
                                    {size} per page
                                  </sl-option>
                                )}
                              </For>
                            </sl-select>
                          </Show>
                        </div>
                      );
                    }}
                  </Show>
                </Show>
              </div>
            </Match>
          </Switch>
        )}
      </Show>
    </>
  );
}
