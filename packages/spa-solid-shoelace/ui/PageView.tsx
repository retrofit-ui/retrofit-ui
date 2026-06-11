import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';

import type {
  FilterFormSpec,
  FormSpec,
  PageSpec,
  TableSpec,
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
              <Match when={field.type === 'text' || field.type === 'date'}>
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
  const [searchParams] = useSearchParams();
  const { refresh } = useContext(PageRefreshContext);

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
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sl-spacing-medium)',
        }}
      >
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
                    label={fieldLabel()}
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
                    label={fieldLabel()}
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
                    <sl-option value="">-- select --</sl-option>
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
                <Show
                  when={
                    !isTextarea() &&
                    field.type !== 'select' &&
                    field.type !== 'checkbox'
                  }
                >
                  <sl-input
                    label={fieldLabel()}
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
        <div>
          <sl-button type="submit" variant="primary" disabled={submitting()}>
            Add
          </sl-button>
        </div>
      </form>
    </div>
  );
}

// ── TablePane ─────────────────────────────────────────────────────────────────

function TablePane(props: { spec: TableSpec }) {
  const [searchParams] = useSearchParams();
  const { count } = useContext(PageRefreshContext);

  const [data] = createResource(
    // Track both search params and the refresh counter so the table refetches
    // whenever the filter changes OR a form pane submits successfully.
    () => JSON.stringify({ sp: searchParams, r: count() }),
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

  return (
    <div class="retrofit-pane">
      <Show when={data.loading}>
        <p class="retrofit-muted">Loading...</p>
      </Show>
      <Show when={data.error}>
        <p class="retrofit-error-message">Error: {String(data.error)}</p>
      </Show>
      <Show when={!data.loading && data() !== undefined}>
        <Show
          when={(data() ?? []).length > 0}
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
              <For each={data() ?? []}>
                {(row) => (
                  <tr class="retrofit-tr">
                    <For each={props.spec.columns}>
                      {(col) => (
                        <td
                          class="retrofit-td"
                          style={{ 'text-align': col.alignment }}
                        >
                          {col.type === 'boolean'
                            ? row[col.key]
                              ? '✓'
                              : '✗'
                            : String(row[col.key] ?? '')}
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

// ── PageView ──────────────────────────────────────────────────────────────────

export function PageView(props: { spec: PageSpec }) {
  const [refreshCount, setRefreshCount] = createSignal(0);
  const ctx: RefreshCtx = {
    count: refreshCount,
    refresh: () => setRefreshCount((n) => n + 1),
  };

  return (
    <PageRefreshContext.Provider value={ctx}>
      <div class="retrofit-view">
        <Show when={props.spec.title}>
          <h1 class="retrofit-page-title">{props.spec.title}</h1>
        </Show>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'column',
            gap: 'var(--sl-spacing-2x-large)',
          }}
        >
          <For each={props.spec.panes}>
            {(pane) => (
              <Switch>
                <Match when={pane.kind === 'filter-form'}>
                  <FilterFormPane
                    spec={
                      (pane as { kind: 'filter-form'; spec: FilterFormSpec })
                        .spec
                    }
                  />
                </Match>
                <Match when={pane.kind === 'form'}>
                  <FormPane
                    spec={
                      (pane as { kind: 'form'; spec: FormSpec; title?: string })
                        .spec
                    }
                    title={
                      (pane as { kind: 'form'; spec: FormSpec; title?: string })
                        .title
                    }
                  />
                </Match>
                <Match when={pane.kind === 'table'}>
                  <TablePane
                    spec={(pane as { kind: 'table'; spec: TableSpec }).spec}
                  />
                </Match>
              </Switch>
            )}
          </For>
        </div>
      </div>
    </PageRefreshContext.Provider>
  );
}
