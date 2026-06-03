import type { RendererConfig } from '../types'
import type { Table } from '@retrofit-ui/core'
import { TableRenderer } from './TableRenderer'

function isTableSchema(schema: unknown): schema is Table {
  if (typeof schema !== 'object' || schema === null) return false
  return 'columns' in schema && 'data' in schema && Array.isArray((schema as Table).columns)
}

export const TableRendererConfig: RendererConfig<{ table: Table }> = {
  name: 'table',
  component: TableRenderer,
  canRender: isTableSchema,
  metadata: { displayName: 'Table' },
}
