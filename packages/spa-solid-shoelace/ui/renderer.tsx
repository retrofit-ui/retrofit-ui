import type { Spec } from '@retrofit-ui/core';
import type { JSX } from 'solid-js';
import { ActionHandlers } from './actions';
import { builtinKinds } from './builtins';
import {
  type FallbackComponent,
  type KindComponents,
  type Kit,
  type Registry,
  RegistryContext,
  RenderSpec,
  UnsupportedKind,
} from './kinds';

export interface RendererOptions {
  /** Kits are applied in order; a later kit's kind replaces an earlier one. */
  kits?: Kit[];
  /** Handlers that override every kit's, for this renderer. */
  actions?: ActionHandlers;
  /** Drawn for a node whose kind is missing or not registered. */
  fallback?: FallbackComponent;
}

export interface RootProps {
  /** Handlers for this subtree only; they win over the renderer's own. */
  actions?: ActionHandlers;
  children: JSX.Element;
}

export interface Renderer {
  /** Provides the registry and actions; render `<RenderSpec>` inside it. */
  Root: (props: RootProps) => JSX.Element;
  /** `Root` around a single spec. */
  SpecRenderer: (
    props: Omit<RootProps, 'children'> & { spec: Spec },
  ) => JSX.Element;
  registry: Registry;
}

/** Extra action handlers for a subtree, under whatever registry is in scope. */
export function Scope(props: RootProps) {
  return (
    <ActionHandlers handlers={props.actions ?? {}}>
      {props.children}
    </ActionHandlers>
  );
}

export function createRenderer(options: RendererOptions = {}): Renderer {
  const kits = options.kits ?? [];
  const kinds: KindComponents = { ...builtinKinds };
  for (const kit of kits) {
    for (const def of kit.kinds ?? []) {
      // `def` pairs a kind with its component; TS can't express that
      // through an index, so it is widened for the assignment.
      (kinds as Record<string, unknown>)[def.kind] = def.component;
    }
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
        <Scope actions={props.actions}>{props.children}</Scope>
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

  function SpecRenderer(props: Omit<RootProps, 'children'> & { spec: Spec }) {
    return (
      <Root actions={props.actions}>
        <RenderSpec spec={props.spec} />
      </Root>
    );
  }

  return { Root, SpecRenderer, registry };
}
