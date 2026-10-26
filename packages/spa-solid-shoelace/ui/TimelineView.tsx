import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { TimelineSpec } from '@retrofit-ui/core';
import { For, Show } from 'solid-js';
import { BackButton } from './BackButton';

export function TimelineViewComponent(props: { spec: TimelineSpec }) {
  return (
    <div class="retrofit-view">
      <BackButton action={props.spec.metadata?.back} />
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <Show
        when={props.spec.events.length > 0}
        fallback={<p class="retrofit-empty">No events.</p>}
      >
        <ul class="retrofit-timeline">
          <For each={props.spec.events}>
            {(event) => {
              const eventClass = event.variant
                ? `retrofit-timeline-event retrofit-timeline-event--${event.variant}`
                : 'retrofit-timeline-event';

              return (
                <li class={eventClass}>
                  <div class="retrofit-timeline-header">
                    <Show when={event.icon}>
                      <sl-icon name={event.icon} />
                    </Show>
                    <span class="retrofit-timeline-title">{event.title}</span>
                    <Show when={event.variant}>
                      <sl-badge variant={event.variant}>
                        {event.variant}
                      </sl-badge>
                    </Show>
                    <Show when={event.timestamp}>
                      <sl-relative-time
                        class="retrofit-timeline-time"
                        date={event.timestamp}
                      />
                    </Show>
                  </div>
                  <Show when={event.description}>
                    <p class="retrofit-timeline-description">
                      {event.description}
                    </p>
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </div>
  );
}
