import type {
  DetailsSpec,
  RootSpec,
  TabsSpec,
  TextSpec,
} from '@retrofit-ui/core';
import { SpecRenderer } from '@retrofit-ui/spa-solid-shoelace/components';
import { Match, Switch } from 'solid-js';
import type { AppSpec, RatingSpec } from '../src/spec';
import { RatingView } from './RatingView';

/**
 * A renderer that understands the built-in kinds plus our custom `rating`.
 * Pattern: handle custom kinds first, then delegate everything else to the
 * stock SpecRenderer. Composition instead of a plugin API — no fork of
 * @retrofit-ui/spa-solid-shoelace required.
 */
export function ExtendedRenderer(props: { spec: AppSpec; apiBase: string }) {
  return (
    <Switch
      fallback={
        // Not a custom kind — hand it to retrofit-ui. SpecRenderer accepts
        // RootSpec plus the standalone ViewSpec kinds (text/tabs/details), so
        // no lie is needed for those built-in leaves.
        <SpecRenderer
          spec={props.spec as RootSpec | TextSpec | TabsSpec | DetailsSpec}
          apiBase={props.apiBase}
        />
      }
    >
      <Match when={props.spec.kind === 'rating'}>
        <RatingView spec={props.spec as RatingSpec} />
      </Match>
    </Switch>
  );
}
