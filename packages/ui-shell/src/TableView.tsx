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
    <div style={{ padding: '1rem' }}>
      <Show when={table.loading}>
        <p>Loading...</p>
      </Show>
      <Show when={table.error}>
        <p style={{ color: 'red' }}>Error: {String(table.error)}</p>
      </Show>
      <Show when={table()}>
        {(t) => (
          <div>
            <div
              style={{
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center',
                'margin-bottom': '1rem',
              }}
            >
              <h1 style={{ margin: 0 }}>
                {t().metadata?.title ?? params.resource}
              </h1>
              <Show when={t().metadata?.createUrl}>
                <button
                  type="button"
                  onClick={() => navigate(`/${params.resource}/new`)}
                >
                  New
                </button>
              </Show>
            </div>
            <Show when={t().data.length > 0} fallback={<p>No data.</p>}>
              <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
                <thead>
                  <tr>
                    <For each={t().columns}>
                      {(col) => (
                        <th
                          style={{
                            'text-align': col.alignment,
                            padding: '0.5rem',
                            'border-bottom': '2px solid #ccc',
                          }}
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
                        style={{
                          cursor: t().metadata?.rowLink ? 'pointer' : undefined,
                        }}
                        onClick={() => rowClick(row as Record<string, unknown>)}
                      >
                        <For each={t().columns}>
                          {(col) => (
                            <td
                              style={{
                                'text-align': col.alignment,
                                padding: '0.5rem',
                                'border-bottom': '1px solid #eee',
                              }}
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
