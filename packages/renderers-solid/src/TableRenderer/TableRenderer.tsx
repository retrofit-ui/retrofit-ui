import type { Table } from '@retrofit-ui/core';
import { createMemo, createSignal, For, Show } from 'solid-js';

interface Props {
  table: Table;
}

export function TableRenderer(props: Props) {
  const [sortKey, setSortKey] = createSignal<string | null>(
    props.table.metadata?.defaultSort?.key ?? null,
  );
  const [sortDir, setSortDir] = createSignal<'asc' | 'desc'>(
    props.table.metadata?.defaultSort?.direction ?? 'asc',
  );
  const [filterValues, setFilterValues] = createSignal<Record<string, string>>(
    {},
  );

  const filteredData = createMemo(() =>
    props.table.data.filter((row) =>
      Object.entries(filterValues()).every(
        ([key, val]) =>
          val === '' ||
          String(row[key] ?? '')
            .toLowerCase()
            .includes(val.toLowerCase()),
      ),
    ),
  );

  const sortedData = createMemo(() => {
    const key = sortKey();
    if (!key) return filteredData();
    return [...filteredData()].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp =
        String(av ?? '') < String(bv ?? '')
          ? -1
          : String(av ?? '') > String(bv ?? '')
            ? 1
            : 0;
      return sortDir() === 'asc' ? cmp : -cmp;
    });
  });

  function handleSort(key: string) {
    if (sortKey() === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div>
      <Show when={props.table.metadata?.title}>
        <h2>{props.table.metadata?.title}</h2>
      </Show>
      <Show when={props.table.columns.some((c) => c.filterable)}>
        <div>
          <For each={props.table.columns.filter((c) => c.filterable)}>
            {(col) => (
              <input
                placeholder={`Filter ${col.label}`}
                value={filterValues()[col.key] ?? ''}
                onChange={(e) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    [col.key]: e.currentTarget.value,
                  }))
                }
              />
            )}
          </For>
        </div>
      </Show>
      <Show when={sortedData().length > 0} fallback={<p>No data.</p>}>
        <table>
          <thead>
            <tr>
              <For each={props.table.columns}>
                {(col) => (
                  <th
                    style={{
                      'text-align': col.alignment,
                      cursor: col.sortable ? 'pointer' : undefined,
                    }}
                    onClick={
                      col.sortable ? () => handleSort(col.key) : undefined
                    }
                  >
                    {col.label}
                    <Show when={col.sortable && sortKey() === col.key}>
                      {sortDir() === 'asc' ? ' ▲' : ' ▼'}
                    </Show>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={sortedData()}>
              {(row) => (
                <tr>
                  <For each={props.table.columns}>
                    {(col) => (
                      <td style={{ 'text-align': col.alignment }}>
                        {String(row[col.key] ?? '')}
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
  );
}
