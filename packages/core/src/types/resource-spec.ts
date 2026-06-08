import type { Field } from './form';
import type { Column } from './table';

export interface EndpointDirective {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
}

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
