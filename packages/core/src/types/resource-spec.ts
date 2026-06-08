import type { Field } from './form';
import type { Column } from './table';

export interface EndpointDirective {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
}

/** Returned by GET /api/ui/{resource} — drives the table view. */
export interface TableSpec {
  columns: Column[];
  endpoints: {
    list?: EndpointDirective;
    find?: EndpointDirective; // enables row clicks; also provides ID field name
    create?: EndpointDirective; // shows "New" button when present
  };
  metadata?: { title?: string };
}

/** Returned by GET /api/ui/{resource}/:id — drives both new and edit form views. */
export interface FormSpec {
  fields: Field[];
  endpoints: {
    find?: EndpointDirective; // SPA fetches entity for edit pre-population
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}

/** Unified spec — legacy single-endpoint pattern from TableView.schema(). */
export interface ResourceSpec {
  columns: Column[];
  fields: Field[];
  endpoints: {
    list?: EndpointDirective;
    find?: EndpointDirective;
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
