import type { Table } from '@retrofit-ui/core'
import { useState } from 'react'

interface Props {
  table: Table
}

export function TableRenderer({ table }: Props) {
  const { columns, data, metadata } = table
  const [sortKey, setSortKey] = useState<string | null>(
    metadata?.defaultSort?.key ?? null,
  )
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    metadata?.defaultSort?.direction ?? 'asc',
  )
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const filteredData = data.filter((row) =>
    Object.entries(filterValues).every(([key, val]) =>
      val === '' || String(row[key] ?? '').toLowerCase().includes(val.toLowerCase()),
    ),
  )

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        const cmp = String(av ?? '') < String(bv ?? '') ? -1 : String(av ?? '') > String(bv ?? '') ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filteredData

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      {metadata?.title && <h2>{metadata.title}</h2>}
      {columns.some((c) => c.filterable) && (
        <div>
          {columns
            .filter((c) => c.filterable)
            .map((col) => (
              <input
                key={col.key}
                placeholder={`Filter ${col.label}`}
                value={filterValues[col.key] ?? ''}
                onChange={(e) =>
                  setFilterValues((prev) => ({ ...prev, [col.key]: e.target.value }))
                }
              />
            ))}
        </div>
      )}
      {sortedData.length === 0 ? (
        <p>No data.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ textAlign: col.alignment, cursor: col.sortable ? 'pointer' : undefined }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: table rows keyed by stable index
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.alignment }}>
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
