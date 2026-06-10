import type { FieldOption } from './form';
import type { FormSpec, MarkdownViewSpec, TableSpec } from './resource-spec';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: FieldOption[];
  placeholder?: string;
}

export interface FilterFormSpec {
  fields: FilterField[];
}

export type Pane =
  | { kind: 'filter-form'; spec: FilterFormSpec }
  | { kind: 'form'; spec: FormSpec; title?: string }
  | { kind: 'table'; spec: TableSpec }
  | { kind: 'markdown'; spec: MarkdownViewSpec };

export interface PageSpec {
  kind: 'page';
  title?: string;
  panes: Pane[];
}
