import type { Action } from '@retrofit-ui/core';
import { Show } from 'solid-js';
import { useActions } from './actions';

/** "← Back", dispatching `action`; renders nothing without one. */
export function BackButton(props: { action: Action | undefined }) {
  const { dispatch } = useActions();
  return (
    <Show when={props.action}>
      {(action) => (
        <button
          type="button"
          class="retrofit-back-btn"
          onClick={() => void dispatch(action())}
        >
          &larr; Back
        </button>
      )}
    </Show>
  );
}
