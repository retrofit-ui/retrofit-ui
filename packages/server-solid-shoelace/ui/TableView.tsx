import '@shoelace-style/shoelace/dist/components/button/button.js';

import type { Table } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, For, Show } from 'solid-js';

async function fetchTable(resource: string): Promise<Table> {
  const res = await fetch(`/api/ui/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch table for ${resource}`);
  return res.json() as Promise<Table>;
}

function extractId(
  rowLink: string,
  row: Record<string, unknown>,
): string | undefined {
  const match = rowLink.match(/\{(\w+)\}/);
  if (!match) return undefined;
  const fieldName = match[1];
  if (!fieldName) return undefined;
  const val = row[fieldName];
  return val != null ? String(val) : undefined;
}

export function TableView() {
  const params = useParams<{ resource: string }>();
  const navigate = useNavigate();

  const [table] = createResource(() => params.resource, fetchTable);

  function rowClick(row: Record<string, unknown>) {
    const t = table();
    if (!t?.metadata?.rowLink) return;
    const id = extractId(t.metadata.rowLink, row);
    if (id) {
      navigate(`/${params.resource}/${id}`);
    }
  }

  return (
    <div class="retrofit-view">
      <Show when={table.loading}>
        <p class="retrofit-muted">Loading...</p>
      </Show>
      <Show when={table.error}>
        <p class="retrofit-error-message">Error: {String(table.error)}</p>
      </Show>
      <Show when={table()}>
        {(t) => (
          <div>
            <div class="retrofit-page-header">
              <h1 class="retrofit-page-title">
                {t().metadata?.title ?? params.resource}
              </h1>
              <Show when={t().metadata?.createUrl}>
                <sl-button
                  variant="primary"
                  on:click={() => navigate(`/${params.resource}/new`)}
                >
                  New
                </sl-button>
              </Show>
            </div>
            <Show
              when={t().data.length > 0}
              fallback={<p class="retrofit-empty">No data.</p>}
            >
              <table class="retrofit-table">
                <thead class="retrofit-thead">
                  <tr>
                    <For each={t().columns}>
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
                  <For each={t().data}>
                    {(row) => (
                      <tr
                        class={`retrofit-tr${t().metadata?.rowLink ? ' retrofit-tr--clickable' : ''}`}
                        onClick={() => rowClick(row as Record<string, unknown>)}
                      >
                        <For each={t().columns}>
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
