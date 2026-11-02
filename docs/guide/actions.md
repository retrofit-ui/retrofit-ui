# Actions

An **action** is plain data in a spec. It says *what* happens when the user does something: send a request, go to another screen, reload. A **handler** on the client decides *how* it happens. The producer writes descriptors; the app that renders them owns the handlers.

```json
{ "label": "New", "action": { "type": "navigate", "to": "#/items/new" } }
```

A descriptor is never a template. It arrives finished: urls and links are resolved by the producer, for example `/items/7`, not `/items/{id}`. When a component has runtime values, such as the values of a submitted form, it gives them to the handler as a separate **input**.

## The built-in actions

| `type` | Descriptor | What the built-in handler does |
|--------|------------|--------------------------------|
| `http` | `{ type?: 'http', method, url }` | `fetch(url, { ...input.init, method })`, and returns the `Response`. `type` is optional, so every endpoint `{ method, url }` in a spec is an `http` action. `EndpointDirective` is the same type as `HttpAction`. |
| `navigate` | `{ type: 'navigate', to }` | A `to` that starts with `#` sets `location.hash` (`#/items/7` → hash `/items/7`). Any other `to` calls `location.assign(to)`. |
| `refresh` | `{ type: 'refresh' }` | Nothing. The handler that does the work belongs to whatever owns the spec; see [refresh](#refresh). |

A type without a namespace is built in. Your own types use a namespace, for example `acme.add-to-cart`; see [Custom action types](#custom-action-types).

### Where actions appear in specs

| Spec field | Action |
|------------|--------|
| `toolbar[].action` (table, tree, calendar) | Any action. The button dispatches it with no input. |
| `form.metadata.onDone` | Any action. Dispatched after a successful submit or delete, and by the Back button of a form outside a page. |
| `markdown.metadata.back`, `timeline.metadata.back` | Any action. Adds a Back button that dispatches it. |
| `endpoints.*`, tree `endpoint` | `http`. |
| Row `_actions.update` / `_actions.delete`, calendar event `actions.update` | `http`, finished per row by the producer. |

Some links are not in an action field, but the view still dispatches `navigate` with them: a table row's `rowLinkField` value, a `rowActions` button's `linkField` value, a tree's `linkField` value ("Edit"), and a calendar event's `link`.

### What the built-in views dispatch

**Every request that a built-in view makes is an `http` action.** That includes reads and writes:

- `/retrofit.json` (`createShell`) and each route's spec (the hosted app)
- each island's `data-retrofit-src` (`init`, `createIslands`)
- table list loads and tree loads
- form submits and deletes, inline row saves, creates and deletes, tree deletes, and calendar drag and resize saves

After a successful write, the view shows a toast and dispatches `refresh`. A form then dispatches its `onDone`, if it has one.

There is no `onSave` or `onDelete` prop. To change what happens, you replace or wrap the handler for an action type.

## Handlers

A handler gets three arguments: the descriptor from the spec, the input from the component, and `next`. Its type, slightly simplified:

```ts
type ActionHandler<T extends ActionType> = (
  action: ActionKinds[T]['action'],
  input: InputOf<T>,
  next: (
    action?: ActionKinds[T]['action'],
    input?: InputOf<T>,
  ) => Promise<ResultOf<T>>,
) => ResultOf<T> | Promise<ResultOf<T>>;
```

`ActionHandlers` is an object of handlers keyed by action type:

```ts
import type { ActionHandlers } from '@retrofit-ui/spa-solid-shoelace/components';

const handlers: ActionHandlers = {
  navigate: (action) => myRouter.go(action.to),
};
```

For `http`, `input` is `{ init?: RequestInit }` (or `undefined`) and the result is a `Response`. For `navigate` and `refresh`, `input` is `undefined` and the result is ignored.

### Where to register handlers

| Entry | Option | Scope |
|-------|--------|-------|
| Hosted app built by you | `createShell({ actions })` | The whole app, including the `/retrofit.json` load. |
| Prebuilt islands (`./renderer`) | `init({ rootElement, actions })` | Every island, including each `data-retrofit-src` load. |
| Islands with kits (`./components`) | `createIslands({ rootElement, kits, actions })` | The same as `init`. |
| Your own SolidJS app | `createRenderer({ actions })` | Everything that renderer draws. |
| A subtree | `<renderer.Root actions={...}>`, `<renderer.SpecRenderer actions={...}>`, `<SpecRenderer actions={...}>`, `<Scope actions={...}>` | Only the specs inside it. |
| A kit | `defineKit({ actions })` | Everything a renderer with that kit draws. |

The prebuilt hosted app (`distPath`) is `createShell()` with no handlers. To add handlers to the hosted app, build your own entry with `createShell`; see [Hosted SPA](/guide/hosted-spa#your-own-client-entry).

### Order: the inner handler wins

Handlers form a chain. For one action type, the innermost handler runs first. A type that a level does not handle goes to the next level out. From outermost to innermost:

1. the built-in handlers
2. each kit's `actions`, in the order of `kits` (a later kit is further in)
3. the `actions` option of `createRenderer`, `createShell`, `createIslands` or `init`
4. the `actions` prop of `Root`, `SpecRenderer` or `Scope`
5. handlers that built-in views add for their own subtree (a `page`, and each screen of the hosted app, handle `refresh`)

If no level handles a type, `dispatch` logs an error and the promise rejects with `No handler for action "<type>"`.

### Wrapping a handler with `next()`

`next()` hands the same action and input to the next handler out. `next(action, input)` hands it the ones you give. A handler can call it to keep the default behavior and add to it:

```ts
const handlers: ActionHandlers = {
  http: async (action, input, next) => {
    const response = await next();
    if (response.status === 401) window.location.assign('/login');
    return response;
  },
};
```

A handler that does not call `next()` replaces everything further out.

`next(action?, input?)` takes an optional replacement action and input, typed for the action type. An argument you omit keeps the original. To change the request, pass the changed input: `next(action, { ...input, init })`.

### Example: auth headers on every request

Because every request goes through `http`, one handler covers the config, route specs, island specs, list loads and writes:

```ts
import { createShell } from '@retrofit-ui/spa-solid-shoelace/components';

void createShell({
  actions: {
    http: (action, input, next) => {
      const headers = new Headers(input?.init?.headers);
      headers.set('Authorization', `Bearer ${getToken()}`);
      return next(action, { ...input, init: { ...input?.init, headers } });
    },
  },
}).mount(document.getElementById('root')!);
```

The same `actions` object works in `init({ rootElement, actions })`, `createIslands` and `createRenderer`.

### Example: navigate with your own router

```tsx
import type { Spec } from '@retrofit-ui/core';
import { useNavigate } from '@solidjs/router';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';

function ItemsScreen(props: { spec: Spec }) {
  const navigate = useNavigate(); // inside your app's <Router>
  return (
    <SpecRenderer
      spec={props.spec}
      actions={{ navigate: (action) => navigate(action.to.replace(/^#/, '')) }}
    />
  );
}
```

## refresh

`refresh` asks whatever owns the current spec to fetch it again. The built-in views dispatch it after each successful write. A table or tree also loads its own rows again before it dispatches `refresh`.

| Owner | What `refresh` does |
|-------|---------------------|
| A screen of the hosted app | Fetches the route's spec again. It does not call `next()`. |
| A `page` | Loads the page's tables again (their list endpoints get the current filters), then calls `next()`. |
| Nothing (an island, or a spec that your app renders) | The built-in handler does nothing. |

When your app fetches a spec itself, handle `refresh` where you render it:

```tsx
import type { Spec } from '@retrofit-ui/core';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import { createResource, Show } from 'solid-js';

function ItemsView() {
  const [spec, { refetch }] = createResource(async () => {
    const res = await fetch('/api/ui/items');
    return (await res.json()) as Spec;
  });
  return (
    <Show when={spec()}>
      {(s) => <SpecRenderer spec={s()} actions={{ refresh: () => void refetch() }} />}
    </Show>
  );
}
```

In the hosted app, each screen handles `refresh` and does not call `next()`. Thus a `refresh` handler in `createShell({ actions })` does not run for actions from inside a screen.

## Dispatching from your own components

A custom kind dispatches actions through the same chain as the built-in views.

- `useActions()` returns `{ dispatch }`. `dispatch(action, input?)` runs the nearest handler for the action's type and returns a promise of its result.
- `useHttp()` returns a `fetch`-like function `(url, init?) => Promise<Response>`. It dispatches an `http` action, so your requests get the app's `http` handlers too (for example, auth headers).

```tsx
import type { HttpAction } from '@retrofit-ui/core';
import { useActions, useHttp } from '@retrofit-ui/spa-solid-shoelace/components';

// Part of a custom kind: `reorder` is a finished http action from its spec.
function ReorderButton(props: { reorder: HttpAction }) {
  const { dispatch } = useActions();
  const send = useHttp();
  const reorder = async () => {
    const res = await send(props.reorder.url, {
      method: props.reorder.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    });
    if (res.ok) void dispatch({ type: 'refresh' });
  };
  return <button type="button" onClick={reorder}>Reorder</button>;
}
```

`dispatch` is typed by `ActionKinds`. An unknown `type`, a descriptor without a required field, or the wrong input is a compile error.

## Custom action types

To add an action type:

1. Declare its descriptor, and register it in `ActionKinds` with its input and result types.
2. Register a handler for it, in a kit or in an `actions` option.
3. Send it from the producer like any other action.

```ts
// src/actions.ts: imported by the producer and the client
import type { ActionDescriptor, ActionEntry } from '@retrofit-ui/core';

export interface AddToCartAction extends ActionDescriptor<'acme.add-to-cart'> {
  productId: string;
}

declare module '@retrofit-ui/core' {
  interface ActionKinds {
    // ActionEntry<descriptor, input, result>
    'acme.add-to-cart': ActionEntry<AddToCartAction, undefined, void>;
  }
}
```

```ts
// client: the handler, in a kit
import { defineKit } from '@retrofit-ui/spa-solid-shoelace/components';

export const cartKit = defineKit({
  name: 'acme.cart',
  actions: {
    'acme.add-to-cart': async (action) => {
      await cart.add(action.productId);
    },
  },
});
```

Any field that takes an action can carry it, for example a toolbar button:

```json
{ "label": "Add to cart", "action": { "type": "acme.add-to-cart", "productId": "p-7" } }
```

The registration makes the custom type part of `Action`, so a TypeScript producer gets a compile error for a wrong field. Give the type a namespace, so that it cannot collide with a built-in type now or later.

The client must have a handler for the type. The prebuilt hosted app and the prebuilt islands do not know your types: dispatch rejects. Register the handler with `createShell({ kits })`, `createIslands({ kits })` or `createRenderer({ kits })`, or with their `actions` option. See [Negotiating a new kind](/guide/extending).

`@retrofit-ui/core/schema.json` covers the built-in actions only. A producer in another language that sends a custom action needs the schema fragment for it from the team that owns the type; see [The spec contract](/guide/contract).
