import type { RouteSpec } from '@retrofit-ui/core';

/**
 * One route. `spec` defaults to the path with each `:name` as `{name}`, so
 * `route('/posts/:id')` fetches `<apiBase>/posts/{id}`.
 */
export function route(path: string, spec?: string): RouteSpec {
  return { path, spec: spec ?? path.replace(/:(\w+)/g, '{$1}') };
}

/**
 * The usual three screens for a resource: its list, a create form and an
 * edit form, e.g. `crudRoutes('posts')` →
 * `/posts`, `/posts/new` and `/posts/:id`, each served from the same path
 * under apiBase. (`/new` comes before `/:id`, so "new" is never read as an id.)
 */
export function crudRoutes(resource: string): RouteSpec[] {
  const base = `/${resource.replace(/^\/+|\/+$/g, '')}`;
  return [route(base), route(`${base}/new`), route(`${base}/:id`)];
}
