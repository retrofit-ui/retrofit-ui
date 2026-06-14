import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { TimelineSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

interface TimelineData {
  spec: TimelineSpec;
  events: Record<string, unknown>[];
}

async function fetchTimelineView(
  specUrl: string,
  id: string | undefined,
): Promise<TimelineData> {
  const specRes = await fetch(specUrl);
  if (!specRes.ok) throw new Error('Failed to fetch timeline spec');
  const spec = (await specRes.json()) as TimelineSpec;

  const eventsUrl = id
    ? spec.endpoint.url.replace('{id}', id)
    : spec.endpoint.url;
  const eventsRes = await fetch(eventsUrl);
  if (!eventsRes.ok) throw new Error('Failed to fetch timeline events');
  const events = (await eventsRes.json()) as Record<string, unknown>[];
  return { spec, events };
}

export function TimelineView() {
  const params = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const specUrl = () =>
    params.id
      ? `${apiBase}/${params.resource}/${params.id}/timeline`
      : `${apiBase}/${params.resource}/timeline`;

  const [data] = createResource(
    () => ({ url: specUrl(), id: params.id }),
    ({ url, id }) => fetchTimelineView(url, id),
  );

  const backPath = () =>
    params.id ? `/${params.resource}/${params.id}` : `/${params.resource}`;

  return (
    <div class="retrofit-view">
      <Show when={data.loading}>
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
      <Show when={data.error}>
        <p class="retrofit-error-message">Error: {String(data.error)}</p>
      </Show>
      <Show when={data()}>
        {(d) => {
          const { spec, events } = d();
          return (
            <div>
              <button
                type="button"
                onClick={() => navigate(backPath())}
                class="retrofit-back-btn"
              >
                &larr; Back
              </button>
              <Show when={spec.metadata?.title}>
                <h1 class="retrofit-page-title">{spec.metadata?.title}</h1>
              </Show>
              <Show
                when={events.length > 0}
                fallback={<p class="retrofit-empty">No events.</p>}
              >
                <ul class="retrofit-timeline">
                  <For each={events}>
                    {(event) => {
                      const variant = spec.fields.variant
                        ? String(event[spec.fields.variant] ?? '')
                        : undefined;
                      const icon = spec.fields.icon
                        ? String(event[spec.fields.icon] ?? '')
                        : undefined;
                      const timestamp = String(
                        event[spec.fields.timestamp] ?? '',
                      );
                      const title = String(event[spec.fields.title] ?? '');
                      const description = spec.fields.description
                        ? String(event[spec.fields.description] ?? '')
                        : undefined;

                      const eventClass = variant
                        ? `retrofit-timeline-event retrofit-timeline-event--${variant}`
                        : 'retrofit-timeline-event';

                      return (
                        <li class={eventClass}>
                          <div class="retrofit-timeline-header">
                            <Show when={icon && icon.length > 0}>
                              <sl-icon name={icon} />
                            </Show>
                            <span class="retrofit-timeline-title">{title}</span>
                            <Show when={variant && variant.length > 0}>
                              <sl-badge
                                variant={
                                  variant as
                                    | 'primary'
                                    | 'success'
                                    | 'neutral'
                                    | 'warning'
                                    | 'danger'
                                }
                              >
                                {variant}
                              </sl-badge>
                            </Show>
                            <Show when={timestamp.length > 0}>
                              <sl-relative-time
                                class="retrofit-timeline-time"
                                date={timestamp}
                              />
                            </Show>
                          </div>
                          <Show when={description && description.length > 0}>
                            <p class="retrofit-timeline-description">
                              {description}
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
        }}
      </Show>
    </div>
  );
}
