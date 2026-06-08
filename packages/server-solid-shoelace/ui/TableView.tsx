import '@shoelace-style/shoelace/dist/components/button/button.js';

import type { ResourceSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

interface TableViewData {
  spec: ResourceSpec;
  data: unknown[];
}

async function fetchTableView(
  resource: string,
  apiBase: string,
): Promise<TableViewData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const spec = (await res.json()) as ResourceSpec;

  let data: unknown[] = [];
  if (spec.endpoints?.list) {
    const dataRes = await fetch(spec.endpoints.list.url);
    if (dataRes.ok) {
      data = (await dataRes.json()) as unknown[];
    }
  }

  return { spec, data };
}

function extractIdField(findUrl: string): string {
  const match = findUrl.match(/\{(\w+)\}/);
  return match?.[1] ?? 'id';
}

export function TableView() {
  const params = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [view] = createResource(
    () => params.resource,
    (resource) => fetchTableView(resource, apiBase),
  );

  function rowClick(row: Record<string, unknown>) {
    const v = view();
    if (!v?.spec.endpoints?.find) return;
    const idField = extractIdField(v.spec.endpoints.find.url);
    const id = row[idField];
    if (id != null) {
      navigate(`/${params.resource}/${String(id)}`);
    }
  }

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
              <Show when={v().spec.endpoints?.create}>
                <sl-button
                  variant="primary"
                  on:click={() => navigate(`/${params.resource}/new`)}
                >
                  New
                </sl-button>
              </Show>
            </div>
            <Show
              when={v().data.length > 0}
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
                  </tr>
                </thead>
                <tbody>
                  <For each={v().data}>
                    {(row) => (
                      <tr
                        class={`retrofit-tr${v().spec.endpoints?.find ? ' retrofit-tr--clickable' : ''}`}
                        onClick={() => rowClick(row as Record<string, unknown>)}
                      >
                        <For each={v().spec.columns}>
                          {(col) => (
                            <td
                              class="retrofit-td"
                              style={{ 'text-align': col.alignment }}
                            >
                              {String(
                                (row as Record<string, unknown>)[col.key] ?? '',
                              )}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
