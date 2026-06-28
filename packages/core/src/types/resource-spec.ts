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
  kind: 'table';
  columns: Column[];
  rows?: Record<string, Cell>[];
  /**
   * Field used to build row links and update/delete URLs. When omitted the
   * client falls back to the `{param}` of the find/update/delete url, then to
   * "id". Set it (and carry the field in `rows`) only for tables that actually
   * navigate or mutate; read-only tables can leave it undefined.
   */
  idField?: string;
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
  kind: 'form';
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
  kind: 'markdown';
  entityEndpoint: EndpointDirective;
  field: string;
  /** Entity id substituted into entityEndpoint.url when using the standalone renderer. */
  entityId?: string;
  metadata?: { title?: string };
}

/** Returned by GET /api/ui/{resource}/tree — drives the tree view. */
export interface TreeSpec {
  kind: 'tree';
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
  kind: 'timeline';
  events: TimelineEvent[];
  metadata?: { title?: string };
}

/** A single KPI/statistic card. Value is computed server-side and embedded in the spec. */
export interface Stat {
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percent' | 'bytes';
  currency?: string;
  description?: string;
}

/** Returned by GET /api/ui/{resource}/stats — drives the stat/KPI grid view. */
export interface StatSpec {
  kind: 'stat';
  stats: Stat[];
  metadata?: { title?: string };
}

/** A single calendar event, fully populated server-side. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  allDay?: boolean;
}

/** Returned by GET /api/ui/{resource}/calendar — drives the calendar view. */
export interface CalendarSpec {
  kind: 'calendar';
  events: CalendarEvent[];
  defaultView?: 'month' | 'week' | 'day' | 'list';
  editable?: boolean;
  endpoints?: {
    find?: EndpointDirective;
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
