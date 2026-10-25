import type {
  ActionDescriptor,
  HttpAction,
  NavigateAction,
} from '@retrofit-ui/core';
import { createContext, type JSX, useContext } from 'solid-js';

/** Anything a component can dispatch: a typed action, or an untyped http one. */
export type Dispatchable = ActionDescriptor | HttpAction;

/**
 * Handles one action type. `input` carries the runtime values the dispatching
 * component supplies (the clicked row, the form values); the action itself is
 * the spec's fixed descriptor. `next` hands the action to the handler further
 * out, so an override can wrap the default rather than replace it.
 */
export type ActionHandler<
  A extends Dispatchable = Dispatchable,
  I = unknown,
> = (action: A, input: I, next: () => Promise<unknown>) => unknown;

/**
 * Handlers keyed by action type. Each handler narrows its own action and
 * input; `never` parameters make every such handler storable here.
 */
export type ActionHandlers = Record<
  string,
  (action: never, input: never, next: () => Promise<unknown>) => unknown
>;

export type Dispatch = (
  action: Dispatchable,
  input?: unknown,
) => Promise<unknown>;

/** What an http handler receives as input: the RequestInit to send. */
export interface HttpInput {
  init?: RequestInit;
}

export function actionType(action: Dispatchable): string {
  return action.type ?? 'http';
}

function unhandled(action: Dispatchable): Promise<never> {
  const type = actionType(action);
  console.error(
    `[retrofit-ui] no handler registered for action "${type}"`,
    action,
  );
  return Promise.reject(new Error(`No handler for action "${type}"`));
}

export const builtinActions: ActionHandlers = {
  http: (action: HttpAction, input: HttpInput | undefined) =>
    fetch(action.url, { ...input?.init, method: action.method }),
  navigate: (action: NavigateAction) => {
    if (action.to.startsWith('#')) window.location.hash = action.to.slice(1);
    else window.location.assign(action.to);
  },
  refresh: (action) => {
    console.warn(
      '[retrofit-ui] "refresh" dispatched but nothing above it owns a spec to refresh',
      action,
    );
  },
};

function chain(handlers: ActionHandlers, parent: Dispatch): Dispatch {
  return (action, input) => {
    const type = actionType(action);
    const handler = Object.hasOwn(handlers, type) ? handlers[type] : undefined;
    if (!handler) return parent(action, input);
    try {
      return Promise.resolve(
        handler(action as never, input as never, () => parent(action, input)),
      );
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

const ActionsContext = createContext<Dispatch>(
  chain(builtinActions, unhandled),
);

/**
 * Registers handlers for everything rendered inside it. Inner handlers win;
 * a type it does not handle falls through to the handlers further out.
 */
export function ActionHandlers(props: {
  handlers: ActionHandlers;
  children: JSX.Element;
}) {
  const parent = useContext(ActionsContext);
  return (
    <ActionsContext.Provider value={chain(props.handlers, parent)}>
      {props.children}
    </ActionsContext.Provider>
  );
}

export function useActions(): { dispatch: Dispatch } {
  return { dispatch: useContext(ActionsContext) };
}

/**
 * `fetch`, routed through the `http` action so integrators can intercept
 * every request a built-in view makes on the user's behalf.
 */
export function useHttp(): (
  url: string,
  init?: RequestInit,
) => Promise<Response> {
  const dispatch = useContext(ActionsContext);
  return (url, init) =>
    dispatch(
      {
        type: 'http',
        method: (init?.method ?? 'GET') as HttpAction['method'],
        url,
      } satisfies HttpAction,
      { init } satisfies HttpInput,
    ) as Promise<Response>;
}
