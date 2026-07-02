import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';

import type {
  CalendarSpec,
  CardSpec,
  Column,
  DetailsSpec,
  FilterFormSpec,
  FormSpec,
  LayoutConfig,
  MarkdownViewSpec,
  PageSpec,
  StatSpec,
  TableSpec,
  TabsSpec,
  TextSpec,
  TimelineSpec,
  TreeSpec,
  ViewSpec,
} from '@retrofit-ui/core';
import { useSearchParams } from '@solidjs/router';
import {
  createContext,
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  on,
  Show,
  Switch,
  useContext,
} from 'solid-js';
import { CalendarViewComponent } from './CalendarView';
import { MarkdownViewComponent } from './MarkdownView';
import { StatViewComponent } from './StatView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';
import { showToast } from './toast';
import { cellFormatted, cellValue } from './utils';

// ── Datetime helpers ─────────────────────────────────────────────────────────

function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

// ── Cell formatting ──────────────────────────────────────────────────────────

function formatCellValue(col: Column, row: Record<string, unknown>): string {
  const formatted = cellFormatted(row[col.key]);
  if (formatted != null) return formatted;
  const raw = cellValue(row[col.key]);
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

// ── Shared refresh mechanism ────────────────────────────────────────────────

interface RefreshCtx {
  count: () => number;
  refresh: () => void;
}

const PageRefreshContext = createContext<RefreshCtx>({
  count: () => 0,
  refresh: () => {},
});

// ── Utilities ────────────────────────────────────────────────────────────────

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function substituteParams(
  url: string,
  params: Record<string, string | string[] | undefined>,
): string {
  return url.replace(/\{(\w+)\}/g, (_, key: string) =>
    encodeURIComponent(firstParam(params[key])),
  );
}

// ── FilterFormPane ────────────────────────────────────────────────────────────

function FilterFormPane(props: { spec: FilterFormSpec }) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div
      class="retrofit-filter-form"
      style={{
        display: 'flex',
        gap: 'var(--sl-spacing-medium)',
        'flex-wrap': 'wrap',
        'align-items': 'flex-end',
      }}
    >
      <For each={props.spec.fields}>
        {(field) => (
          <div>
            <Switch>
              <Match when={field.type === 'select'}>
                <sl-select
                  label={field.label}
                  prop:value={firstParam(searchParams[field.name])}
                  on:sl-change={(e: Event) => {
                    setSearchParams({
                      [field.name]: (
                        e.target as EventTarget & { value: string }
                      ).value,
                    });
                  }}
                >
                  <sl-option value="">
                    {field.placeholder ?? `All ${field.label}`}
                  </sl-option>
                  <For each={field.options ?? []}>
                    {(opt) => (
                      <sl-option value={String(opt.value)}>
                        {opt.label}
                      </sl-option>
                    )}
                  </For>
                </sl-select>
              </Match>
              <Match when={field.type === 'datetime'}>
                <sl-input
                  type="datetime-local"
                  label={field.label}
                  placeholder={field.placeholder}
                  prop:value={isoToDatetimeLocal(
                    firstParam(searchParams[field.name]),
                  )}
                  on:sl-change={(e: Event) => {
                    setSearchParams({
                      [field.name]: datetimeLocalToIso(
                        (e.target as EventTarget & { value: string }).value,
                      ),
                    });
                  }}
                />
              </Match>
              <Match
                when={
                  field.type === 'text' ||
                  field.type === 'date' ||
                  field.type === 'time'
                }
              >
                <sl-input
                  type={field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  prop:value={firstParam(searchParams[field.name])}
                  on:sl-input={(e: Event) => {
                    setSearchParams({
                      [field.name]: (
                        e.target as EventTarget & { value: string }
                      ).value,
                    });
                  }}
                />
              </Match>
            </Switch>
          </div>
        )}
      </For>
    </div>
  );
}

// ── FormPane ──────────────────────────────────────────────────────────────────

function FormPane(props: { spec: FormSpec; title?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refresh } = useContext(PageRefreshContext);
  const autoSubmit = () => !!props.spec.metadata?.autoSubmit;
  const fLayout = () => props.spec.metadata?.layout;
  const hideLabel = () => fLayout()?.labelPosition === 'hidden';
  const formContainerStyle = () =>
    fLayout()?.columns
      ? {
          display: 'grid',
          'grid-template-columns': `repeat(${String(fLayout()?.columns)}, 1fr)`,
          gap: fLayout()?.gap ?? 'var(--sl-spacing-medium)',
        }
      : {
          display: 'flex',
          'flex-direction': fLayout()?.direction ?? 'column',
          gap: fLayout()?.gap ?? 'var(--sl-spacing-medium)',
          'flex-wrap':
            fLayout()?.direction === 'row' ? ('wrap' as const) : undefined,
        };

  const visibleFields = () => props.spec.fields.filter((f) => !f.readOnly);

  const makeInitValues = (): Record<string, unknown> =>
    Object.fromEntries(
      visibleFields().map((f) => {
        const paramVal = firstParam(searchParams[f.name]);
        if (paramVal) return [f.name, paramVal];
        if (f.type === 'checkbox') return [f.name, false];
        return [f.name, ''];
      }),
    );

  const [values, setValues] = createSignal<Record<string, unknown>>(
    makeInitValues(),
  );
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitting, setSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal<string | undefined>(
    undefined,
  );

  // When filter search params change, update fields that have a matching param.
  // defer:true means this only fires on changes after mount, not on initial render
  // (initial values already come from makeInitValues above).
  createEffect(
    on(
      () => JSON.stringify(searchParams),
      () => {
        const updates: Record<string, unknown> = {};
        for (const f of visibleFields()) {
          const paramVal = firstParam(searchParams[f.name]);
          if (paramVal) updates[f.name] = paramVal;
        }
        if (Object.keys(updates).length > 0) {
          setValues((prev) => ({ ...prev, ...updates }));
        }
      },
      { defer: true },
    ),
  );

  function setValue(name: string, val: unknown) {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (autoSubmit()) {
      setSearchParams({ [name]: String(val) });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const f of visibleFields()) {
      const val = values()[f.name];
      if (f.required && (val === undefined || val === '' || val === null)) {
        errs[f.name] = `${f.label} is required`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;
    const ep = props.spec.endpoints?.create;
    if (!ep) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values()),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        setSubmitError(String(body.error ?? `Request failed: ${res.status}`));
        return;
      }
      setValues(makeInitValues());
      setErrors({});
      showToast('success', 'Created successfully');
      refresh();
    } catch (err) {
      setSubmitError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="retrofit-pane">
      <Show when={props.title}>
        <h2
          style={{
            margin: '0 0 var(--sl-spacing-medium)',
            'font-size': 'var(--sl-font-size-large)',
            'font-weight': 'var(--sl-font-weight-semibold)',
          }}
        >
          {props.title}
        </h2>
      </Show>
      <form onSubmit={handleSubmit} style={formContainerStyle()}>
        <For each={visibleFields()}>
          {(field) => {
            const fieldLabel = () => field.label + (field.required ? ' *' : '');
            const err = () => errors()[field.name];
            const strVal = () => String(values()[field.name] ?? '');
            const isTextarea = () =>
              field.type === 'textarea' || field.type === 'markdown';

            return (
              <div>
                <Show when={isTextarea()}>
                  <sl-textarea
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
                    placeholder={field.placeholder}
                    help-text={field.helpText ?? undefined}
                    prop:value={strVal()}
                    rows={field.type === 'markdown' ? 12 : 4}
                    invalid={!!err() || undefined}
                    on:sl-input={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { value: string }).value,
                      )
                    }
                  />
                </Show>
                <Show when={field.type === 'select'}>
                  <sl-select
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
                    help-text={field.helpText ?? undefined}
                    prop:value={strVal()}
                    invalid={!!err() || undefined}
                    on:sl-change={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { value: string }).value,
                      )
                    }
                  >
                    <sl-option value="">
                      {field.placeholder ?? '-- select --'}
                    </sl-option>
                    <For each={field.options}>
                      {(opt) => (
                        <sl-option value={String(opt.value)}>
                          {opt.label}
                        </sl-option>
                      )}
                    </For>
                  </sl-select>
                </Show>
                <Show when={field.type === 'checkbox'}>
                  <sl-checkbox
                    prop:checked={!!values()[field.name]}
                    invalid={!!err() || undefined}
                    on:sl-change={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { checked: boolean })
                          .checked,
                      )
                    }
                  >
                    {fieldLabel()}
                  </sl-checkbox>
                </Show>
                <Show when={field.type === 'datetime'}>
                  <sl-input
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
                    type="datetime-local"
                    help-text={field.helpText ?? undefined}
                    prop:value={isoToDatetimeLocal(strVal())}
                    invalid={!!err() || undefined}
                    on:sl-change={(e: Event) => {
                      const raw = (e.target as EventTarget & { value: string })
                        .value;
                      setValue(field.name, datetimeLocalToIso(raw));
                    }}
                  />
                </Show>
                <Show
                  when={
                    !isTextarea() &&
                    field.type !== 'select' &&
                    field.type !== 'checkbox' &&
                    field.type !== 'datetime'
                  }
                >
                  <sl-input
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
                    type={field.type}
                    placeholder={field.placeholder}
                    help-text={field.helpText ?? undefined}
                    prop:value={strVal()}
                    invalid={!!err() || undefined}
                    on:sl-input={(e: Event) => {
                      const raw = (e.target as EventTarget & { value: string })
                        .value;
                      setValue(
                        field.name,
                        field.type === 'number' && raw !== ''
                          ? Number(raw)
                          : raw,
                      );
                    }}
                  />
                </Show>
                <Show when={err()}>
                  <p
                    role="alert"
                    style={{
                      margin: 'var(--sl-spacing-2x-small) 0 0',
                      'font-size': 'var(--sl-font-size-small)',
                      color: 'var(--sl-color-danger-600)',
                    }}
                  >
                    {err()}
                  </p>
                </Show>
              </div>
            );
          }}
        </For>
        <Show when={submitError()}>
          <p class="retrofit-error-message">{submitError()}</p>
        </Show>
        <Show when={!autoSubmit()}>
          <div>
            <sl-button type="submit" variant="primary" disabled={submitting()}>
              Add
            </sl-button>
          </div>
        </Show>
      </form>
    </div>
  );
}

// ── TablePane ─────────────────────────────────────────────────────────────────

function TablePane(props: { spec: TableSpec }) {
  const [searchParams] = useSearchParams();
  const { count } = useContext(PageRefreshContext);

  // Only fires when there is a list endpoint; null source skips the fetch.
  const [fetchedData] = createResource(
    () =>
      props.spec.endpoints?.list
        ? JSON.stringify({ sp: searchParams, r: count() })
        : null,
    async () => {
      const ep = props.spec.endpoints?.list;
      if (!ep) return [] as Record<string, unknown>[];
      const url = substituteParams(
        ep.url,
        searchParams as Record<string, string | undefined>,
      );
      const res = await fetch(url);
      if (!res.ok) return [] as Record<string, unknown>[];
      return res.json() as Promise<Record<string, unknown>[]>;
    },
  );

  // Embedded rows (forRows): read props.spec.rows directly — reactive when
  // the parent re-fetches the page spec and passes a new spec prop.
  const rows = () =>
    props.spec.endpoints?.list
      ? (fetchedData() ?? [])
      : (props.spec.rows ?? []);

  const isLoading = () => !!props.spec.endpoints?.list && fetchedData.loading;
  const hasError = () => !!props.spec.endpoints?.list && !!fetchedData.error;

  return (
    <div class="retrofit-pane">
      <Show when={isLoading()}>
        <p class="retrofit-muted">Loading...</p>
      </Show>
      <Show when={hasError()}>
        <p class="retrofit-error-message">Error: {String(fetchedData.error)}</p>
      </Show>
      <Show when={!isLoading() && !hasError()}>
        <Show
          when={rows().length > 0}
          fallback={<p class="retrofit-empty">No data.</p>}
        >
          <table class="retrofit-table">
            <thead class="retrofit-thead">
              <tr>
                <For each={props.spec.columns}>
                  {(col) => (
                    <th
                      class="retrofit-th"
                      style={{ 'text-align': col.alignment }}
                    >
                      {col.label}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={rows()}>
                {(row) => (
                  <tr class="retrofit-tr">
                    <For each={props.spec.columns}>
                      {(col) => (
                        <td
                          class="retrofit-td"
                          style={{ 'text-align': col.alignment }}
                        >
                          {formatCellValue(col, row)}
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </Show>
    </div>
  );
}

// ── BoxPane + ViewRenderer ────────────────────────────────────────────────────

function boxStyle(lc?: LayoutConfig): Record<string, string | undefined> {
  const isGrid = !!(lc?.columns ?? lc?.columnTemplate);
  if (isGrid) {
    return {
      display: 'grid',
      'grid-template-columns':
        lc?.columnTemplate ?? `repeat(${String(lc?.columns ?? 1)}, 1fr)`,
      gap: lc?.gap ?? 'var(--sl-spacing-2x-large)',
      'align-items': lc?.align,
      'justify-content': lc?.justify,
    };
  }
  return {
    display: 'flex',
    'flex-direction': lc?.direction ?? 'column',
    gap: lc?.gap ?? 'var(--sl-spacing-2x-large)',
    'flex-wrap': lc?.wrap ? 'wrap' : undefined,
    'align-items': lc?.align,
    'justify-content': lc?.justify,
  };
}

function flexStyle(spec: {
  direction?: 'row' | 'column';
  gap?: string;
  wrap?: boolean;
  align?: string;
  justify?: string;
}): Record<string, string | undefined> {
  return {
    display: 'flex',
    'flex-direction': spec.direction ?? 'column',
    gap: spec.gap ?? 'var(--sl-spacing-2x-large)',
    'flex-wrap': spec.wrap ? 'wrap' : undefined,
    'align-items': spec.align,
    'justify-content': spec.justify,
  };
}

function gridStyle(spec: {
  columns?: number;
  columnTemplate?: string;
  gap?: string;
  align?: string;
  justify?: string;
}): Record<string, string | undefined> {
  return {
    display: 'grid',
    'grid-template-columns':
      spec.columnTemplate ?? `repeat(${String(spec.columns ?? 1)}, 1fr)`,
    gap: spec.gap ?? 'var(--sl-spacing-2x-large)',
    'align-items': spec.align,
    'justify-content': spec.justify,
  };
}

function BoxPane(props: { layout?: LayoutConfig; children: ViewSpec[] }) {
  return (
    <div style={boxStyle(props.layout)}>
      <For each={props.children}>
        {(child) => <ViewRenderer spec={child} />}
      </For>
    </div>
  );
}

// ── TextPane ──────────────────────────────────────────────────────────────────

function TextPane(props: { spec: TextSpec }) {
  const style = (): Record<string, string> => {
    if (props.spec.variant === 'muted')
      return { color: 'var(--sl-color-neutral-600)', margin: '0' };
    if (props.spec.variant === 'small')
      return {
        fontSize: 'var(--sl-font-size-small)',
        color: 'var(--sl-color-neutral-600)',
        margin: '0',
      };
    return { margin: '0' };
  };
  return <p style={style()}>{props.spec.content}</p>;
}

// ── TabsPane ──────────────────────────────────────────────────────────────────

function TabsPane(props: { spec: TabsSpec }) {
  return (
    <sl-tab-group placement={props.spec.placement ?? 'top'}>
      <For each={props.spec.tabs}>
        {(tab, i) => (
          <sl-tab slot="nav" panel={`panel-${i()}`} active={i() === 0}>
            {tab.label}
          </sl-tab>
        )}
      </For>
      <For each={props.spec.tabs}>
        {(tab, i) => (
          <sl-tab-panel name={`panel-${i()}`} active={i() === 0}>
            <For each={tab.children}>
              {(child) => <ViewRenderer spec={child} />}
            </For>
          </sl-tab-panel>
        )}
      </For>
    </sl-tab-group>
  );
}

// ── DetailsPane ───────────────────────────────────────────────────────────────

function DetailsPane(props: { spec: DetailsSpec }) {
  return (
    <div>
      <For each={props.spec.items}>
        {(item) => (
          <sl-details summary={item.summary} prop:open={item.open ?? false}>
            {item.body}
          </sl-details>
        )}
      </For>
    </div>
  );
}

// ── CardViewComponent ─────────────────────────────────────────────────────────

export function CardViewComponent(props: { spec: CardSpec }) {
  return (
    <sl-card style={{ display: 'block' }}>
      <Show when={props.spec.header}>
        <div slot="header" class="retrofit-card-header">
          {props.spec.header}
        </div>
      </Show>
      <div class="retrofit-card-body">
        <For each={props.spec.children}>
          {(child) => <ViewRenderer spec={child} />}
        </For>
      </div>
      <Show when={props.spec.footer}>
        {(footer) => (
          <div slot="footer">
            <ViewRenderer spec={footer()} />
          </div>
        )}
      </Show>
    </sl-card>
  );
}

function ViewRenderer(props: { spec: ViewSpec }) {
  return (
    <Switch>
      <Match when={props.spec.kind === 'flex'}>
        {(_item) => {
          const s = props.spec as {
            kind: 'flex';
            direction?: 'row' | 'column';
            gap?: string;
            wrap?: boolean;
            align?: string;
            justify?: string;
            children: ViewSpec[];
          };
          return (
            <div style={flexStyle(s)}>
              <For each={s.children}>
                {(child) => <ViewRenderer spec={child} />}
              </For>
            </div>
          );
        }}
      </Match>
      <Match when={props.spec.kind === 'grid'}>
        {(_item) => {
          const s = props.spec as {
            kind: 'grid';
            columns?: number;
            columnTemplate?: string;
            gap?: string;
            align?: string;
            justify?: string;
            children: ViewSpec[];
          };
          return (
            <div style={gridStyle(s)}>
              <For each={s.children}>
                {(child) => <ViewRenderer spec={child} />}
              </For>
            </div>
          );
        }}
      </Match>
      <Match when={props.spec.kind === 'filter-form'}>
        <FilterFormPane
          spec={
            (props.spec as { kind: 'filter-form'; spec: FilterFormSpec }).spec
          }
        />
      </Match>
      <Match when={props.spec.kind === 'form'}>
        <FormPane
          spec={
            (props.spec as { kind: 'form'; spec: FormSpec; title?: string })
              .spec
          }
          title={
            (props.spec as { kind: 'form'; spec: FormSpec; title?: string })
              .title
          }
        />
      </Match>
      <Match when={props.spec.kind === 'table'}>
        <TablePane
          spec={(props.spec as { kind: 'table'; spec: TableSpec }).spec}
        />
      </Match>
      <Match when={props.spec.kind === 'markdown'}>
        {(_item) => {
          const s = props.spec as { kind: 'markdown'; spec: MarkdownViewSpec };
          return <MarkdownViewComponent spec={s.spec} />;
        }}
      </Match>
      <Match when={props.spec.kind === 'stat'}>
        <StatViewComponent spec={props.spec as StatSpec} />
      </Match>
      <Match when={props.spec.kind === 'calendar'}>
        <CalendarViewComponent spec={props.spec as CalendarSpec} />
      </Match>
      <Match when={props.spec.kind === 'tree'}>
        <TreeViewComponent spec={props.spec as TreeSpec} />
      </Match>
      <Match when={props.spec.kind === 'timeline'}>
        <TimelineViewComponent spec={props.spec as TimelineSpec} />
      </Match>
      <Match when={props.spec.kind === 'card'}>
        <CardViewComponent spec={props.spec as CardSpec} />
      </Match>
      <Match when={props.spec.kind === 'text'}>
        <TextPane spec={props.spec as TextSpec} />
      </Match>
      <Match when={props.spec.kind === 'tabs'}>
        <TabsPane spec={props.spec as TabsSpec} />
      </Match>
      <Match when={props.spec.kind === 'details'}>
        <DetailsPane spec={props.spec as DetailsSpec} />
      </Match>
    </Switch>
  );
}

// ── PageView ──────────────────────────────────────────────────────────────────

export function PageView(props: { spec: PageSpec; onRefresh?: () => void }) {
  const [refreshCount, setRefreshCount] = createSignal(0);
  const ctx: RefreshCtx = {
    count: refreshCount,
    refresh: () => {
      setRefreshCount((n) => n + 1);
      props.onRefresh?.();
    },
  };

  return (
    <PageRefreshContext.Provider value={ctx}>
      <div class="retrofit-view">
        <Show when={props.spec.title}>
          <h1 class="retrofit-page-title">{props.spec.title}</h1>
        </Show>
        <BoxPane layout={props.spec.layout} children={props.spec.children} />
      </div>
    </PageRefreshContext.Provider>
  );
}
