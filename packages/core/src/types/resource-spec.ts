import type { Field } from './form';
import type { Cell, Column } from './table';

export interface EndpointDirective {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
}

/** Per-row action button shown in the table's actions column. */
export interface RowAction {
  label: string;
  /** Route pattern appended to /#/{resource}/; {id} is substituted from the row. */
  routePattern: string;
}

/** Returned by GET /api/ui/{resource} — drives the table view. */
export interface TableSpec {
  columns: Column[];
  rows?: Record<string, Cell>[];
  endpoints: {
    list?: EndpointDirective; // used by PageView filter-tables
    find?: EndpointDirective; // enables row clicks + ID extraction
    create?: EndpointDirective; // shows "New" button when present
    update?: EndpointDirective; // enables inline row save
    delete?: EndpointDirective; // enables row delete button
  };
  rowActions?: RowAction[];
  metadata?: {
    title?: string;
    pagination?: {
      pageSize: number;
      totalRows: number;
      pageSizeOptions?: number[];
    };
  };
}

export interface FormLayoutConfig {
  direction?: 'row' | 'column';
  gap?: string;
  columns?: number;
  labelPosition?: 'above' | 'hidden';
}

/** Returned by GET /api/ui/{resource}/:id — drives new and edit form views. */
export interface FormSpec {
  fields: Field[];
  endpoints: {
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: {
    title?: string;
    autoSubmit?: boolean;
    layout?: FormLayoutConfig;
  };
}

/** Returned by GET /api/ui/{resource}/:id/render — drives the markdown render view. */
export interface MarkdownViewSpec {
  entityEndpoint: EndpointDirective;
  field: string;
  metadata?: { title?: string };
}

/** Returned by GET /api/ui/{resource}/tree — drives the tree view. */
export interface TreeSpec {
  endpoint: EndpointDirective;
  idField: string;
  parentField: string;
  labelField: string;
  selection?: 'single' | 'multiple' | 'leaf';
  actions?: {
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description?: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  icon?: string;
}

/** Returned by GET /api/ui/{resource}/timeline or GET /api/ui/{resource}/:id/timeline */
export interface TimelineSpec {
  events: TimelineEvent[];
  metadata?: { title?: string };
}
