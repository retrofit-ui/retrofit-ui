import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { TimelineSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './context';

async function fetchTimelineSpec(specUrl: string): Promise<TimelineSpec> {
  const res = await fetch(specUrl);
  if (!res.ok) throw new Error('Failed to fetch timeline spec');
  return (await res.json()) as TimelineSpec;
}

export function TimelineViewComponent(props: { spec: TimelineSpec }) {
  return (
    <div class="retrofit-view">
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

export function TimelineView() {
  const params = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const specUrl = () =>
    params.id
      ? `${apiBase}/${params.resource}/${params.id}/timeline`
      : `${apiBase}/${params.resource}/timeline`;

  const [spec] = createResource(specUrl, fetchTimelineSpec);

  const backPath = () =>
    params.id ? `/${params.resource}/${params.id}` : `/${params.resource}`;

  return (
    <div class="retrofit-view">
      <Show when={spec.loading}>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'column',
            gap: 'var(--sl-spacing-medium)',
          }}
        >
          <sl-skeleton effect="sheen" style={{ width: '55%' }} />
          <sl-skeleton effect="sheen" />
          <sl-skeleton effect="sheen" style={{ width: '80%' }} />
          <sl-skeleton effect="sheen" />
          <sl-skeleton effect="sheen" style={{ width: '40%' }} />
        </div>
      </Show>
      <Show when={spec.error}>
        <p class="retrofit-error-message">Error: {String(spec.error)}</p>
      </Show>
      <Show when={spec()}>
        {(s) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(backPath())}
              class="retrofit-back-btn"
            >
              &larr; Back
            </button>
            <TimelineViewComponent spec={s()} />
          </div>
        )}
      </Show>
    </div>
  );
}
