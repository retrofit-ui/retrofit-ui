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
  CardSpec,
  DetailsSpec,
  FilterFormSpec,
  FlexSpec,
  GridSpec,
  LayoutConfig,
  PageSpec,
  Spec,
  TabsSpec,
  TextSpec,
} from '@retrofit-ui/core';
import { useSearchParams } from '@solidjs/router';
import { createMemo, createSignal, For, Match, Show, Switch } from 'solid-js';
import { ActionHandlers } from './actions';
import { RenderSpec } from './kinds';
import { PageContext, type PageContextValue, usePage } from './page-context';

// ── Datetime helpers ─────────────────────────────────────────────────────────

function isoToDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}
function datetimeLocalToIso(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

// ── FilterFormPane ────────────────────────────────────────────────────────────

/** Writes each change to the surrounding page's filters. */
export function FilterFormPane(props: { spec: FilterFormSpec }) {
  const page = usePage();
  if (!page) {
    console.warn('[retrofit-ui] a filter-form only filters inside a page');
  }
  const filter = (name: string) => page?.filters()[name] ?? '';
  const setFilter = (name: string, value: string) =>
    page?.setFilter(name, value);

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
                  prop:value={filter(field.name)}
                  on:sl-change={(e: Event) => {
                    setFilter(
                      field.name,
                      (e.target as EventTarget & { value: string }).value,
                    );
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
                  prop:value={isoToDatetimeLocal(filter(field.name))}
                  on:sl-change={(e: Event) => {
                    setFilter(
                      field.name,
                      datetimeLocalToIso(
                        (e.target as EventTarget & { value: string }).value,
                      ),
                    );
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
                  prop:value={filter(field.name)}
                  on:sl-input={(e: Event) => {
                    setFilter(
                      field.name,
                      (e.target as EventTarget & { value: string }).value,
                    );
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

// ── BoxPane, flex and grid ────────────────────────────────────────────────────

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

function BoxPane(props: { layout?: LayoutConfig; children: Spec[] }) {
  return (
    <div style={boxStyle(props.layout)}>
      <For each={props.children}>{(child) => <RenderSpec spec={child} />}</For>
    </div>
  );
}

// ── TextViewComponent ───────────────────────────────────────────────────────
//
// Every view here is registered as a built-in kind (see builtins.tsx), and
// every container renders its children through `RenderSpec`, so there is one
// dispatch table for top-level specs and nested ones alike.

export function TextViewComponent(props: { spec: TextSpec }) {
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

// ── TabsViewComponent ─────────────────────────────────────────────────────────

export function TabsViewComponent(props: { spec: TabsSpec }) {
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
              {(child) => <RenderSpec spec={child} />}
            </For>
          </sl-tab-panel>
        )}
      </For>
    </sl-tab-group>
  );
}

// ── DetailsViewComponent ──────────────────────────────────────────────────────

export function DetailsViewComponent(props: { spec: DetailsSpec }) {
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
          {(child) => <RenderSpec spec={child} />}
        </For>
      </div>
      <Show when={props.spec.footer}>
        {(footer) => (
          <div slot="footer">
            <RenderSpec spec={footer()} />
          </div>
        )}
      </Show>
    </sl-card>
  );
}

export function FlexViewComponent(props: { spec: FlexSpec }) {
  return (
    <div style={flexStyle(props.spec)}>
      <For each={props.spec.children}>
        {(child) => <RenderSpec spec={child} />}
      </For>
    </div>
  );
}

export function GridViewComponent(props: { spec: GridSpec }) {
  return (
    <div style={gridStyle(props.spec)}>
      <For each={props.spec.children}>
        {(child) => <RenderSpec spec={child} />}
      </For>
    </div>
  );
}

// ── PageView ──────────────────────────────────────────────────────────────────

type Filters = Pick<PageContextValue, 'filters' | 'setFilter'>;

/**
 * Under a router, a page's filters live in the url's search params, so a
 * filtered view can be linked to and survives a reload. Without one (a spec
 * embedded in an app that doesn't route), they live in memory.
 */
function usePageFilters(): Filters {
  let params: ReturnType<typeof useSearchParams> | undefined;
  try {
    params = useSearchParams();
  } catch {
    // No router above this page.
  }
  if (!params) {
    const [filters, setFilters] = createSignal<Record<string, string>>({});
    return {
      filters,
      setFilter: (name, value) =>
        setFilters((prev) => ({ ...prev, [name]: value })),
    };
  }
  const [searchParams, setSearchParams] = params;
  return {
    filters: () => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(searchParams)) {
        const first = Array.isArray(v) ? v[0] : v;
        if (first !== undefined) out[k] = first;
      }
      return out;
    },
    setFilter: (name, value) => setSearchParams({ [name]: value }),
  };
}

// The table's own list query params; a filter must not use these names.
const RESERVED = ['page', 'pageSize', 'sort', 'order'];

/**
 * The field names of the page's filter writers (filter-forms and autoSubmit
 * forms), found anywhere under its children except inside a nested page.
 */
export function filterNamesOf(children: Spec[]): Set<string> {
  const names = new Set<string>();
  const visit = (node: unknown): void => {
    if (typeof node !== 'object' || node === null) return;
    const spec = node as {
      kind?: unknown;
      fields?: { name: string }[];
      metadata?: { autoSubmit?: boolean };
    };
    if (spec.kind === 'page') return;
    if (
      spec.kind === 'filter-form' ||
      (spec.kind === 'form' && spec.metadata?.autoSubmit)
    ) {
      for (const f of spec.fields ?? []) names.add(f.name);
      return;
    }
    Object.values(node).forEach(visit);
  };
  visit(children);
  return names;
}

export function PageView(props: { spec: PageSpec; onRefresh?: () => void }) {
  const { filters, setFilter } = usePageFilters();
  const [version, setVersion] = createSignal(0);
  const warned = new Set<string>();
  // Follows the spec, so a swapped or refetched page keeps its filters in step.
  const filterNames = createMemo(
    () => {
      const names = filterNamesOf(props.spec.children);
      const reserved = RESERVED.filter((n) => names.has(n) && !warned.has(n));
      if (reserved.length > 0) {
        for (const n of reserved) warned.add(n);
        console.warn(
          `[retrofit-ui] filter names ${reserved.join(', ')} are reserved for a table's list query; rename them`,
        );
      }
      return names;
    },
    undefined,
    // Same names, same set: tables do not refetch for an unrelated spec change.
    {
      equals: (a, b) => a.size === b.size && [...a].every((n) => b.has(n)),
    },
  );
  const page: PageContextValue = {
    filters,
    filterNames,
    setFilter,
    version,
    refresh: () => {
      setVersion((n) => n + 1);
      props.onRefresh?.();
    },
  };

  return (
    <PageContext.Provider value={page}>
      <ActionHandlers
        handlers={{
          // Reload this page's tables, then whatever owns the page's spec.
          refresh: (_action, _input, next) => {
            page.refresh();
            return next();
          },
        }}
      >
        <div class="retrofit-view">
          <Show when={props.spec.title}>
            <h1 class="retrofit-page-title">{props.spec.title}</h1>
          </Show>
          <BoxPane layout={props.spec.layout} children={props.spec.children} />
        </div>
      </ActionHandlers>
    </PageContext.Provider>
  );
}
