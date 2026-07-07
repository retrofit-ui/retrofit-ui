import type { ViewSpec } from '@retrofit-ui/core';
import { type Component, createContext } from 'solid-js';

/**
 * Any spec object flowing through the recursive dispatcher. Built-in kinds are
 * ViewSpec; custom kinds are userland shapes not in the union. The discriminant
 * is always `kind`, so we accept ViewSpec plus any {kind}-bearing object.
 */
export type AnySpec = ViewSpec | ({ kind: string } & Record<string, unknown>);

/**
 * The recursive dispatcher handed to container renderers so children route
 * back through the merged registry.
 */
export type Dispatch = Component<{ spec: AnySpec }>;

/**
 * A renderer for one kind. Leaf renderers ignore `Dispatch`; container
 * renderers call `<props.Dispatch spec={child} />` for each child.
 */
export type Renderer<S = AnySpec> = Component<{ spec: S; Dispatch: Dispatch }>;

/** kind → renderer. Consumer registry; merged over built-ins by precedence. */
export type ExtensionRegistry = Record<string, Renderer<any>>;

/**
 * The extension registry read by both dispatchers (SpecRenderer + ViewRenderer).
 * Default `{}` means "no extensions" — the zero-config path where every
 * built-in kind renders exactly as before.
 */
export const RendererRegistryContext = createContext<ExtensionRegistry>({});
