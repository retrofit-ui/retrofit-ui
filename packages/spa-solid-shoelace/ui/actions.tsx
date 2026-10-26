import type {
  Action,
  ActionEntry,
  ActionKinds,
  ActionType,
  HttpAction,
} from '@retrofit-ui/core';
import { createContext, type JSX, useContext } from 'solid-js';

/** What an http handler receives as input: the RequestInit to send. */
export interface HttpInput {
  init?: RequestInit;
}

// The renderer owns http's input and result types, so it registers the type.
declare module '@retrofit-ui/core' {
  interface ActionKinds {
    http: ActionEntry<HttpAction, HttpInput | undefined, Response>;
  }
}

/** The type an action is handled under. An action without one is http. */
export type TypeOf<A> = A extends { type: infer T extends ActionType }
  ? T
  : 'http';
export type InputOf<T extends ActionType> = ActionKinds[T]['input'];
export type ResultOf<T extends ActionType> = ActionKinds[T]['result'];

/** The input argument, optional when the type's input may be undefined. */
type InputArgs<T extends ActionType> =
  undefined extends InputOf<T> ? [input?: InputOf<T>] : [input: InputOf<T>];

/**
 * Runs an action through the nearest handler for its type. The input is
 * checked against the type's registered input, and the result is typed.
 */
export type Dispatch = <A extends Action>(
  action: A,
  ...input: InputArgs<TypeOf<A>>
) => Promise<ResultOf<TypeOf<A>>>;

/**
 * Handles one action type. `input` carries the runtime values the dispatching
 * component supplies (the clicked row, the form values); the action itself is
 * the spec's fixed descriptor. `next` hands the action to the handler further
 * out, so an override can wrap the default rather than replace it.
 */
export type ActionHandler<T extends ActionType> = (
  action: ActionKinds[T]['action'],
  input: InputOf<T>,
  next: () => Promise<ResultOf<T>>,
) => HandlerReturn<ResultOf<T>>;

/**
 * What a handler may return. For a type whose result is `void`, anything:
 * as with any void callback, the return value is ignored.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: detecting a void result is the point
type HandlerReturn<R> = [R] extends [void] ? unknown : R | Promise<R>;

/** Handlers keyed by action type. */
export type ActionHandlers = { [T in ActionType]?: ActionHandler<T> };

// Handlers are looked up by a runtime string, so the chain itself is untyped;
// `ActionHandlers` and `Dispatch` give callers the per-type types.
type Untyped = (action: { type?: string }, input: unknown) => Promise<unknown>;
type UntypedHandler = (
  action: unknown,
  input: unknown,
  next: () => Promise<unknown>,
) => unknown;

export function actionType(action: { type?: string }): string {
  return action.type ?? 'http';
}

const unhandled: Untyped = (action) => {
  const type = actionType(action);
  console.error(
    `[retrofit-ui] no handler registered for action "${type}"`,
    action,
  );
  return Promise.reject(new Error(`No handler for action "${type}"`));
};

export const builtinActions = {
  http: (action, input) =>
    fetch(action.url, { ...input?.init, method: action.method }),
  navigate: (action) => {
    if (action.to.startsWith('#')) window.location.hash = action.to.slice(1);
    else window.location.assign(action.to);
  },
  refresh: (action) => {
    console.warn(
      '[retrofit-ui] "refresh" dispatched but nothing above it owns a spec to refresh',
      action,
    );
  },
} satisfies ActionHandlers;

function chain(handlers: ActionHandlers, parent: Untyped): Untyped {
  return (action, input) => {
    const type = actionType(action);
    const handler = Object.hasOwn(handlers, type)
      ? (handlers[type as ActionType] as UntypedHandler | undefined)
      : undefined;
    if (!handler) return parent(action, input);
    try {
      return Promise.resolve(
        handler(action, input, () => parent(action, input)),
      );
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

const ActionsContext = createContext<Untyped>(chain(builtinActions, unhandled));

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
  return { dispatch: useContext(ActionsContext) as Dispatch };
}

/**
 * `fetch`, routed through the `http` action so integrators can intercept
 * every request a built-in view makes on the user's behalf.
 */
export function useHttp(): (
  url: string,
  init?: RequestInit,
) => Promise<Response> {
  const { dispatch } = useActions();
  return (url, init) =>
    dispatch(
      {
        type: 'http',
        method: (init?.method ?? 'GET') as HttpAction['method'],
        url,
      },
      { init },
    );
}
