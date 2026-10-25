/**
 * An action is plain data in a spec that says *what* should happen when the
 * user does something. *How* it happens is decided on the client by the
 * handler registered for its `type`. Descriptors are never templated: a
 * component passes the runtime values (the clicked row, the form values) to
 * the handler as a separate input.
 *
 * Types without a namespace (`http`, `navigate`, `refresh`) are built in.
 * App- or kit-defined types should be namespaced, e.g. `tenju.add-to-cart`.
 */
export interface ActionDescriptor {
  type: string;
}

/**
 * Issues an HTTP request. `type` is optional so every existing
 * `EndpointDirective` (`{ method, url }`) is already an http action.
 */
export interface HttpAction {
  type?: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
}

/** Moves the client to a route, e.g. `#/properties`. */
export interface NavigateAction {
  type: 'navigate';
  to: string;
}

/** Asks whoever owns the current spec to fetch it again. */
export interface RefreshAction {
  type: 'refresh';
}

export type BuiltinAction = HttpAction | NavigateAction | RefreshAction;

/** Any action a spec can carry: a built-in one or a namespaced custom one. */
export type AnyAction =
  | BuiltinAction
  | (ActionDescriptor & Record<string, unknown>);
