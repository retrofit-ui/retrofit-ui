import { type JSX, useContext } from 'solid-js';
import { ActionHandlers } from './actions';
import { builtinKinds } from './builtins';
import { ApiBaseContext } from './context';
import {
  type KindComponent,
  type Kit,
  type Registry,
  RegistryContext,
  RenderSpec,
  type SpecNode,
  UnsupportedKind,
} from './kinds';

export interface RendererOptions {
  /** Kits are applied in order; a later kit's kind replaces an earlier one. */
  kits?: Kit[];
  /** Handlers that override every kit's, for this renderer. */
  actions?: ActionHandlers;
  /** Drawn for a node whose kind is missing or not registered. */
  fallback?: KindComponent;
}

export interface RootProps {
  /** Prefix for spec fetches. Inherited from an outer renderer when omitted. */
  apiBase?: string;
  /** Handlers for this subtree only; they win over the renderer's own. */
  actions?: ActionHandlers;
  children: JSX.Element;
}

export interface Renderer {
  /** Provides the registry and actions; render `<RenderSpec>` inside it. */
  Root: (props: RootProps) => JSX.Element;
  /** `Root` around a single spec. */
  SpecRenderer: (
    props: Omit<RootProps, 'children'> & { spec: SpecNode },
  ) => JSX.Element;
  registry: Registry;
}

/**
 * The per-subtree part of a renderer: an apiBase and extra action handlers,
 * under whatever registry is already in scope.
 */
export function Scope(props: RootProps) {
  const outerApiBase = useContext(ApiBaseContext);
  return (
    <ApiBaseContext.Provider value={props.apiBase ?? outerApiBase}>
      <ActionHandlers handlers={props.actions ?? {}}>
        {props.children}
      </ActionHandlers>
    </ApiBaseContext.Provider>
  );
}

export function createRenderer(options: RendererOptions = {}): Renderer {
  const kits = options.kits ?? [];
  const kinds: Record<string, KindComponent> = { ...builtinKinds };
  for (const kit of kits) {
    for (const def of kit.kinds ?? []) kinds[def.kind] = def.component;
  }
  const registry: Registry = {
    kinds,
    fallback: options.fallback ?? UnsupportedKind,
  };
  // Outermost first: each kit, then the renderer's own overrides.
  const levels = [
    ...kits.map((kit) => kit.actions ?? {}),
    options.actions ?? {},
  ];

  function Root(props: RootProps) {
    const withKitActions = (i: number): JSX.Element =>
      i === levels.length ? (
        <Scope apiBase={props.apiBase} actions={props.actions}>
          {props.children}
        </Scope>
      ) : (
        <ActionHandlers handlers={levels[i] ?? {}}>
          {withKitActions(i + 1)}
        </ActionHandlers>
      );
    return (
      <RegistryContext.Provider value={registry}>
        {withKitActions(0)}
      </RegistryContext.Provider>
    );
  }

  function SpecRenderer(
    props: Omit<RootProps, 'children'> & { spec: SpecNode },
  ) {
    return (
      <Root apiBase={props.apiBase} actions={props.actions}>
        <RenderSpec spec={props.spec} />
      </Root>
    );
  }

  return { Root, SpecRenderer, registry };
}
