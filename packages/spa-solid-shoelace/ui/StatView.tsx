import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { Stat, StatSpec } from '@retrofit-ui/core';
import { useParams } from '@solidjs/router';
import { createResource, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

function formatValue(value: number | string, stat: Stat): string {
  if (typeof value === 'string') return value;

  switch (stat.format) {
    case 'currency':
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: stat.currency ?? 'USD',
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat(undefined, {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(value);
    case 'bytes':
      return formatBytes(value);
    default:
      return new Intl.NumberFormat().format(value);
  }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / 1024 ** i;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(val)} ${units[i]}`;
}

async function fetchStatView(
  resource: string,
  apiBase: string,
): Promise<StatSpec> {
  const res = await fetch(`${apiBase}/${resource}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats spec for ${resource}`);
  return res.json() as Promise<StatSpec>;
}

function StatCard(props: { stat: Stat }) {
  const displayValue = () => formatValue(props.stat.value, props.stat);

  return (
    <div class="retrofit-stat-card">
      <div class="retrofit-stat-value">{displayValue()}</div>
      <div class="retrofit-stat-label">{props.stat.label}</div>
      <Show when={props.stat.description}>
        <div class="retrofit-stat-description">{props.stat.description}</div>
      </Show>
    </div>
  );
}

export function StatView() {
  const params = useParams<{ resource: string }>();
  const apiBase = useContext(ApiBaseContext);

  const [view] = createResource(
    () => params.resource,
    (resource) => fetchStatView(resource, apiBase),
  );

  return (
    <div class="retrofit-view">
      <Show when={view.loading}>
        <div class="retrofit-stat-grid">
          <For each={Array(4).fill(null)}>
            {() => (
              <div class="retrofit-stat-card">
                <sl-skeleton
                  effect="sheen"
                  style={{ height: '2.5rem', 'margin-bottom': '0.5rem' }}
                />
                <sl-skeleton effect="sheen" style={{ width: '60%' }} />
              </div>
            )}
          </For>
        </div>
      </Show>
      <Show when={view.error}>
        <p class="retrofit-error-message">Error: {String(view.error)}</p>
      </Show>
      <Show when={view()}>
        {(spec) => (
          <>
            <Show when={spec().metadata?.title}>
              <h1 class="retrofit-page-title">{spec().metadata?.title}</h1>
            </Show>
            <div class="retrofit-stat-grid">
              <For each={spec().stats}>
                {(stat) => <StatCard stat={stat} />}
              </For>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
