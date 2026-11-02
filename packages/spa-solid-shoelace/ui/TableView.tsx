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

import type {
  Cell,
  Column,
  RowActions,
  TableSpec,
  ToolbarButton,
} from '@retrofit-ui/core';

function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function formatCellValue(col: Column, row: Record<string, unknown>): string {
  const raw = row[col.key];
  if (raw == null) return '';
  if (col.type === 'boolean') return raw ? '✓' : '✗';
  if (col.type === 'date') {
    const d = new Date(`${String(raw)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
  }
  if (col.type === 'datetime') {
    const d = new Date(String(raw));
    return Number.isNaN(d.getTime())
      ? String(raw)
      : d.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
  }
  if (col.type === 'time') {
    const parts = String(raw).split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : String(raw);
  }
  return String(raw);
}

import {
  batch,
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from 'solid-js';
import { useActions, useHttp } from './actions';
import { usePage } from './page-context';
import { showToast } from './toast';
import { cellFormatted, cellValue, listUrl, rawRow } from './utils';

/** A row's own finished writes, if it has any. */
function writesOf(row: Record<string, unknown>): RowActions | undefined {
  return cellValue(row._actions) as RowActions | undefined;
}

/**
 * The row's record for a save: its raw values minus spec data, exactly
 * `_actions`, the `rowLinkField` field and each `rowActions[].linkField`.
 * Every other field, including a producer's own `_id` or `_rev`, is sent.
 */
function recordOf(
  values: Record<string, unknown>,
  spec: TableSpec,
): Record<string, unknown> {
  const specFields = new Set([
    '_actions',
    ...(spec.rowLinkField ? [spec.rowLinkField] : []),
    ...(spec.rowActions ?? []).map((a) => a.linkField),
  ]);
  return Object.fromEntries(
    Object.entries(values).filter(([k]) => !specFields.has(k)),
  );
}

/** Whether the table needs an actions column. */
function tableHasActions(
  spec: TableSpec,
  rows: Record<string, unknown>[] | undefined,
): boolean {
  return (
    spec.columns.some((c) => c.editable) ||
    (spec.rowActions?.length ?? 0) > 0 ||
    !!rows?.some((row) => writesOf(row))
  );
}

/** A row's finished link in `field`, if it has one. */
function linkOf(
  row: Record<string, unknown>,
  field: string | undefined,
): string | undefined {
  if (!field) return undefined;
  const link = cellValue(row[field]);
  return typeof link === 'string' && link !== '' ? link : undefined;
}

/** Buttons above a view, each dispatching its action. */
export function Toolbar(props: { buttons: ToolbarButton[] | undefined }) {
  const { dispatch } = useActions();
  return (
    <Show when={(props.buttons?.length ?? 0) > 0}>
      <div class="retrofit-toolbar">
        <For each={props.buttons}>
          {(button) => (
            <sl-button
              variant={button.variant ?? 'primary'}
              on:click={() => void dispatch(button.action)}
            >
              {button.label}
            </sl-button>
          )}
        </For>
      </div>
    </Show>
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

  if (props.col.type === 'datetime') {
    return (
      <sl-input
        type="datetime-local"
        prop:value={isoToDatetimeLocal(strVal())}
        style={{ 'min-width': '160px' }}
        on:sl-change={(e: Event) => {
          props.onChange(
            datetimeLocalToIso(
              (e.target as EventTarget & { value: string }).value,
            ),
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
  const raw = () => cellValue(props.value);
  const formatted = () => cellFormatted(props.value);
  const display = () =>
    formatted() ?? formatCellValue(props.col, { [props.col.key]: raw() });
  const strVal = () => String(raw() ?? '');
  const badgeVariant = () => props.col.badgeVariants?.[strVal()];
  const numVal = () => Number(raw() ?? 0);

  return (
    <Switch fallback={<span>{display()}</span>}>
      <Match when={formatted() !== undefined && !badgeVariant()}>
        <span>{formatted()}</span>
      </Match>
      <Match when={props.col.type === 'boolean'}>
        <span>{raw() ? '✓' : '✗'}</span>
      </Match>
      <Match when={badgeVariant()}>
        {(variant) => (
          <sl-badge variant={variant()}>{formatted() ?? strVal()}</sl-badge>
        )}
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

function NewRow(props: { spec: TableSpec; onCreated: () => void }) {
  const send = useHttp();
  const { dispatch } = useActions();
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
      const res = await send(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values()),
      });
      if (res.ok) {
        setValues(emptyValues());
        showToast('success', 'Created successfully');
        props.onCreated();
        void dispatch({ type: 'refresh' });
      }
    } finally {
      setAdding(false);
    }
  }

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
    </tr>
  );
}

function DataRow(props: {
  row: Record<string, unknown>;
  spec: TableSpec;
  hasActions: boolean;
  onRefresh: () => void;
}) {
  const send = useHttp();
  const { dispatch } = useActions();
  const rowLink = () => linkOf(props.row, props.spec.rowLinkField);
  const writes = () => writesOf(props.row);
  const canEdit = () =>
    !!writes()?.update && props.spec.columns.some((c) => c.editable);
  const [editing, setEditing] = createSignal(false);
  const [values, setValues] = createSignal<Record<string, unknown>>(
    rawRow(props.row),
  );
  const [saving, setSaving] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);

  function startEdit() {
    setValues(rawRow(props.row));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setValues(rawRow(props.row));
  }

  async function saveEdit() {
    const ep = writes()?.update;
    if (!ep) return;
    setSaving(true);
    const body = recordOf(values(), props.spec);
    try {
      const res = await send(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditing(false);
        showToast('success', 'Saved successfully');
        props.onRefresh();
        void dispatch({ type: 'refresh' });
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow() {
    const ep = writes()?.delete;
    if (!ep) return;
    setShowDeleteDialog(false);
    setDeleting(true);
    try {
      const res = await send(ep.url, { method: ep.method });
      if (res.ok) {
        showToast('success', 'Deleted successfully');
        props.onRefresh();
        void dispatch({ type: 'refresh' });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <tr
        class="retrofit-tr"
        classList={{ 'retrofit-tr--clickable': !editing() && !!rowLink() }}
        onClick={() => {
          const to = rowLink();
          if (!editing() && to) void dispatch({ type: 'navigate', to });
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
        <Show when={props.hasActions}>
          <td
            class="retrofit-td"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
              <Show when={!editing() && canEdit()}>
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
              <Show when={writes()?.delete}>
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
                  <Show when={linkOf(props.row, action.linkField)}>
                    {(to) => (
                      <sl-button
                        size="small"
                        variant="neutral"
                        on:click={() =>
                          void dispatch({ type: 'navigate', to: to() })
                        }
                      >
                        {action.label}
                      </sl-button>
                    )}
                  </Show>
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

export function TableViewComponent(props: { spec: TableSpec }) {
  const send = useHttp();
  const [currentPage, setCurrentPage] = createSignal(1);
  const [currentPageSize, setCurrentPageSize] = createSignal<number | null>(
    null,
  );

  const [sort, setSort] = createSignal<{
    key: string;
    order: 'asc' | 'desc';
  }>();
  const toggleSort = (key: string) =>
    batch(() => {
      setSort((s) =>
        s?.key === key && s.order === 'asc'
          ? { key, order: 'desc' }
          : { key, order: 'asc' },
      );
      setCurrentPage(1);
    });

  const page = usePage();

  // Refetches when the page, page size, inline rows, the surrounding page's
  // filters or its version change.
  const [data, { refetch }] = createResource(
    () =>
      [
        currentPage(),
        currentPageSize(),
        props.spec.rows,
        page?.filters(),
        page?.filterNames(),
        sort(),
        page?.version(),
      ] as const,
    async ([
      pageNumber,
      pageSizeOverride,
      inlineRows,
      filters,
      filterNames,
      activeSort,
    ]) => {
      if (inlineRows) return inlineRows;
      const ep = props.spec.endpoints?.list;
      if (!ep) return [];
      const pagination = props.spec.metadata?.pagination;
      const pageSize = pageSizeOverride ?? pagination?.pageSize;
      // Only the page's own filters: other search params stay in the url.
      const pageFilters = Object.fromEntries(
        Object.entries(filters ?? {}).filter(([k]) => filterNames?.has(k)),
      );
      const url = listUrl(ep.url, {
        ...pageFilters,
        ...(pagination && { page: pageNumber, pageSize }),
        sort: activeSort?.key,
        order: activeSort?.order,
      });
      const res = await send(url);
      if (!res.ok) throw new Error('Failed to fetch table data');
      const raw = (await res.json()) as Record<string, unknown>[];
      return raw.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, { value: v } satisfies Cell]),
        ),
      );
    },
  );

  const hasInlineEdit = () => props.spec.columns.some((c) => c.editable);
  const hasActions = () => tableHasActions(props.spec, data());

  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title || props.spec.toolbar?.length}>
        <div class="retrofit-page-header">
          <Show when={props.spec.metadata?.title}>
            <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
          </Show>
          <Toolbar buttons={props.spec.toolbar} />
        </div>
      </Show>
      <Show when={data.loading}>
        <table class="retrofit-table">
          <tbody>
            <For each={Array(5).fill(null)}>
              {() => (
                <tr class="retrofit-tr">
                  <For each={Array(props.spec.columns.length || 4).fill(null)}>
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
      </Show>
      <Show when={data.error}>
        <p class="retrofit-error-message">Error: {String(data.error)}</p>
      </Show>
      <Show when={data()}>
        {(rows) => (
          <>
            <table class="retrofit-table">
              <thead class="retrofit-thead">
                <tr>
                  <For each={props.spec.columns}>
                    {(col) => (
                      <th
                        class="retrofit-th"
                        style={{
                          'text-align': col.alignment,
                          width: col.width,
                        }}
                        aria-sort={
                          col.sortable && !props.spec.rows
                            ? sort()?.key !== col.key
                              ? 'none'
                              : sort()?.order === 'asc'
                                ? 'ascending'
                                : 'descending'
                            : undefined
                        }
                      >
                        <Show
                          when={col.sortable && !props.spec.rows}
                          fallback={col.label}
                        >
                          <button
                            type="button"
                            class="retrofit-sort-button"
                            onClick={() => toggleSort(col.key)}
                          >
                            {col.label}
                            <Show when={sort()?.key === col.key}>
                              <span aria-hidden="true">
                                {sort()?.order === 'asc' ? ' ▲' : ' ▼'}
                              </span>
                            </Show>
                          </button>
                        </Show>
                      </th>
                    )}
                  </For>
                  <Show when={hasActions()}>
                    <th class="retrofit-th">Actions</th>
                  </Show>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={rows().length > 0 || hasInlineEdit()}
                  fallback={
                    <tr>
                      <td
                        colspan={
                          props.spec.columns.length + (hasActions() ? 1 : 0)
                        }
                        class="retrofit-empty"
                      >
                        No data.
                      </td>
                    </tr>
                  }
                >
                  <For each={rows()}>
                    {(row) => (
                      <DataRow
                        row={row}
                        spec={props.spec}
                        hasActions={hasActions()}
                        onRefresh={() => void refetch()}
                      />
                    )}
                  </For>
                  <Show when={hasInlineEdit() && props.spec.endpoints?.create}>
                    <NewRow
                      spec={props.spec}
                      onCreated={() => void refetch()}
                    />
                  </Show>
                </Show>
              </tbody>
            </table>
            <Show
              when={
                (rows().length > 0 || hasInlineEdit()) &&
                props.spec.metadata?.pagination
              }
            >
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
                        disabled={currentPage() >= totalPages() || undefined}
                        on:click={() => setCurrentPage((p) => p + 1)}
                      />
                    </sl-button-group>
                    <span class="retrofit-pagination-label">
                      Page {currentPage()} of {totalPages()}
                    </span>
                    <Show
                      when={(pagination().pageSizeOptions?.length ?? 0) > 0}
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
          </>
        )}
      </Show>
    </div>
  );
}
