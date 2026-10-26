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
export interface ActionDescriptor<T extends string = string> {
  type: T;
}

/**
 * Issues an HTTP request. `type` is optional so every `EndpointDirective`
 * (`{ method, url }`) is an http action as-is.
 */
export interface HttpAction {
  type?: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
}

/** Moves the client to a route, e.g. `#/properties`. */
export interface NavigateAction extends ActionDescriptor<'navigate'> {
  to: string;
}

/** Asks whoever owns the current spec to fetch it again. */
export interface RefreshAction extends ActionDescriptor<'refresh'> {}

/**
 * One registered action type: its descriptor (what a spec carries), the input
 * a component dispatches it with, and what its handler resolves to.
 */
export interface ActionEntry<A, Input = undefined, Result = unknown> {
  action: A;
  input: Input;
  result: Result;
}

/**
 * Every action type, keyed by `type`. Apps add their own by augmenting this
 * interface, once:
 *
 * ```ts
 * declare module '@retrofit-ui/core' {
 *   interface ActionKinds {
 *     'acme.add-to-cart': ActionEntry<AddToCartAction, { productId: string }>;
 *   }
 * }
 * ```
 *
 * `http` is registered by the renderer package, which owns its input and
 * result types (a request init and a response).
 */
export interface ActionKinds {
  navigate: ActionEntry<NavigateAction, undefined, void>;
  refresh: ActionEntry<RefreshAction, undefined, void>;
}

export type ActionType = keyof ActionKinds;

/** Any registered action descriptor. */
export type Action = ActionKinds[ActionType]['action'];
