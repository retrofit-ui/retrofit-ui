import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { Stat, StatSpec } from '@retrofit-ui/core';
import { For, Show } from 'solid-js';

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

export function StatViewComponent(props: { spec: StatSpec }) {
  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <div class="retrofit-stat-grid">
        <For each={props.spec.stats}>{(stat) => <StatCard stat={stat} />}</For>
      </div>
    </div>
  );
}
