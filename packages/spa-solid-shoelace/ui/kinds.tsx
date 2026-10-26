import type { RootSpec, ViewSpec } from '@retrofit-ui/core';
import { type Component, createContext, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { ActionHandlers } from './actions';

/** The least a spec node has: a `kind` to dispatch on. */
export interface SpecNode {
  kind: string;
}

/**
 * What a renderer accepts. Listing the built-in shapes lets an object literal
 * be checked against them; any other kind passes as a `SpecNode`.
 */
export type AnySpec = RootSpec | ViewSpec | SpecNode;

/**
 * A component that draws one spec kind. The default `never` is the widest
 * storable form: any `KindComponent<FooSpec>` is assignable to it.
 */
export type KindComponent<S = never> = Component<{ spec: S }>;

export interface KindDefinition<S extends SpecNode = SpecNode> {
  kind: S['kind'];
  component: KindComponent<S>;
}

/**
 * A kit is the unit an app or library contributes: its spec kinds, plus
 * handlers for the action types those kinds dispatch. A kit kind registered
 * under a built-in name (`form`, `card`, ...) replaces the built-in.
 */
export interface Kit {
  name: string;
  kinds?: { kind: string; component: KindComponent }[];
  actions?: ActionHandlers;
}

export function defineKind<S extends SpecNode>(
  definition: KindDefinition<S>,
): KindDefinition<S> {
  return definition;
}

export function defineKit(kit: Kit): Kit {
  return kit;
}

export interface Registry {
  kinds: Readonly<Record<string, KindComponent>>;
  /** Drawn for a node whose kind is missing or not registered. */
  fallback: KindComponent;
}

export const RegistryContext = createContext<Registry>();

/**
 * Renders one spec node with whatever component the surrounding renderer has
 * registered for its kind. Containers, built-in or not, render their children
 * through this, which is what lets any kind nest inside any other.
 */
export function RenderSpec(props: { spec: AnySpec }) {
  const registry = useContext(RegistryContext);
  if (!registry) {
    throw new Error(
      '[retrofit-ui] <RenderSpec> must be rendered inside a renderer (SpecRenderer or createRenderer().Root)',
    );
  }
  const component = () =>
    (typeof props.spec?.kind === 'string' &&
      Object.hasOwn(registry.kinds, props.spec.kind) &&
      registry.kinds[props.spec.kind]) ||
    registry.fallback;
  return <Dynamic component={component()} spec={props.spec as never} />;
}

export function UnsupportedKind(props: { spec: { kind?: unknown } }) {
  return (
    <p class="retrofit-error-message">
      Unsupported spec kind: "
      {typeof props.spec?.kind === 'string' ? props.spec.kind : 'unknown'}"
    </p>
  );
}
