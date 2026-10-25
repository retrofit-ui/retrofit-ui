import { Show, useContext } from 'solid-js';
import type { ActionHandlers } from './actions';
import { RegistryContext, RenderSpec, type SpecNode } from './kinds';
import { createRenderer, Scope } from './renderer';

const defaultRenderer = createRenderer();

/**
 * Renders a spec of any registered kind. Inside a renderer made with
 * `createRenderer`, it uses that renderer's kinds; anywhere else, the
 * built-in ones.
 */
export function SpecRenderer(props: {
  spec: SpecNode;
  apiBase?: string;
  actions?: ActionHandlers;
}) {
  const inRenderer = useContext(RegistryContext) !== undefined;
  return (
    <Show
      when={inRenderer}
      fallback={
        <defaultRenderer.SpecRenderer
          spec={props.spec}
          apiBase={props.apiBase}
          actions={props.actions}
        />
      }
    >
      <Scope apiBase={props.apiBase} actions={props.actions}>
        <RenderSpec spec={props.spec} />
      </Scope>
    </Show>
  );
}
