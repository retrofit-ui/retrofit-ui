import { For, Show } from 'solid-js';
import type { RatingItem, RatingSpec } from '../src/spec';
import './rating-view.css';

/**
 * Custom view for `kind: 'rating'`. Two theming contracts hold here:
 *   1. Reuse retrofit-ui's shared layout classes (`retrofit-view`,
 *      `retrofit-page-title`) so the outer padding/typography matches the
 *      built-in views.
 *   2. Namespace anything specific to this component under `custom-rating-*`
 *      so we can never collide with a future built-in class name. All colours
 *      resolve through Shoelace CSS tokens (`--sl-color-primary-*`,
 *      `--sl-color-neutral-*`) — the same tokens the built-in views consume,
 *      so a single theme in /retrofit.json flows through both surfaces.
 */

function Stars(props: { score: number }) {
  const full = Math.floor(props.score);
  const half = props.score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span
      class="custom-rating-stars"
      aria-label={`${props.score} out of 5`}
    >
      <For each={Array(full).fill(null)}>
        {() => <span class="custom-rating-star custom-rating-star--filled">★</span>}
      </For>
      <Show when={half}>
        <span class="custom-rating-star custom-rating-star--filled">½</span>
      </Show>
      <For each={Array(empty).fill(null)}>
        {() => <span class="custom-rating-star custom-rating-star--empty">☆</span>}
      </For>
    </span>
  );
}

function RatingRow(props: { item: RatingItem }) {
  return (
    <li class="custom-rating-row">
      <strong class="custom-rating-label">{props.item.label}</strong>
      <Stars score={props.item.score} />
      <Show when={props.item.note}>
        <span class="custom-rating-note">{props.item.note}</span>
      </Show>
    </li>
  );
}

export function RatingView(props: { spec: RatingSpec }) {
  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <ul class="custom-rating-list">
        <For each={props.spec.items}>
          {(item) => <RatingRow item={item} />}
        </For>
      </ul>
    </div>
  );
}
