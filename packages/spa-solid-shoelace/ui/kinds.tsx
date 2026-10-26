import type { Spec, SpecKind, SpecOf } from '@retrofit-ui/core';
import { type Component, createContext, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { ActionHandlers } from './actions';

/** A component that draws one kind; `props.spec` is that kind's spec. */
export type KindComponent<K extends SpecKind> = Component<{ spec: SpecOf<K> }>;

export interface KindDefinition<K extends SpecKind> {
  kind: K;
  component: KindComponent<K>;
}

/** A `KindDefinition` for any one registered kind. */
export type AnyKindDefinition = {
  [K in SpecKind]: KindDefinition<K>;
}[SpecKind];

/** Components by kind. A renderer has one for every built-in kind. */
export type KindComponents = { [K in SpecKind]?: KindComponent<K> };

/**
 * Drawn for a node the registry has no component for: an unregistered kind,
 * or a node whose `kind` is missing (e.g. a spec still streaming in).
 */
export type FallbackComponent = Component<{ spec: { kind?: unknown } }>;

/**
 * A kit is the unit an app or library contributes: its spec kinds, plus
 * handlers for the action types those kinds dispatch. A kit kind registered
 * under a built-in name (`form`, `card`, ...) replaces the built-in.
 *
 * Its kinds and action types must also be added to `SpecKinds` and
 * `ActionKinds` (see `@retrofit-ui/core`), so specs and handlers are checked.
 */
export interface Kit {
  name: string;
  kinds?: AnyKindDefinition[];
  actions?: ActionHandlers;
}

export function defineKind<K extends SpecKind>(
  definition: KindDefinition<K>,
): KindDefinition<K> {
  return definition;
}

export function defineKit(kit: Kit): Kit {
  return kit;
}

export interface Registry {
  kinds: Readonly<KindComponents>;
  fallback: FallbackComponent;
}

export const RegistryContext = createContext<Registry>();

/**
 * Renders one spec node with whatever component the surrounding renderer has
 * registered for its kind. Containers, built-in or not, render their children
 * through this, which is what lets any kind nest inside any other.
 */
export function RenderSpec(props: { spec: Spec }) {
  const registry = useContext(RegistryContext);
  if (!registry) {
    throw new Error(
      '[retrofit-ui] <RenderSpec> must be rendered inside a renderer (SpecRenderer or createRenderer().Root)',
    );
  }
  // The registry is keyed by kind, so the component found for `spec.kind` is
  // the one for that spec; TypeScript can't relate the two through a lookup.
  const component = (): Component<{ spec: Spec }> => {
    const kind: unknown = props.spec?.kind;
    const found =
      typeof kind === 'string' && Object.hasOwn(registry.kinds, kind)
        ? registry.kinds[kind as SpecKind]
        : undefined;
    return (found ?? registry.fallback) as Component<{ spec: Spec }>;
  };
  return <Dynamic component={component()} spec={props.spec} />;
}

export function UnsupportedKind(props: { spec: { kind?: unknown } }) {
  return (
    <p class="retrofit-error-message">
      Unsupported spec kind: "
      {typeof props.spec?.kind === 'string' ? props.spec.kind : 'unknown'}"
    </p>
  );
}
