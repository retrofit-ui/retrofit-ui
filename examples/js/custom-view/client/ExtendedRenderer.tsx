import {
  createRenderer,
  defineKind,
  defineKit,
} from '@retrofit-ui/spa-solid-shoelace/components';
import type { AppSpec } from '../src/spec';
import { RatingView } from './RatingView';

/**
 * The app's kinds, as a kit. A kit's kinds join the built-in ones in the
 * renderer's registry, so built-in containers render them as children too.
 */
export const ratingKit = defineKit({
  name: 'rating',
  kinds: [defineKind({ kind: 'rating', component: RatingView })],
});

const renderer = createRenderer({ kits: [ratingKit] });

/** Renders any built-in kind plus `rating`. */
export function ExtendedRenderer(props: { spec: AppSpec }) {
  return <renderer.SpecRenderer spec={props.spec} />;
}
