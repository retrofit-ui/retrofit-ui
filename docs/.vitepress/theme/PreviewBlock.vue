<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="retrofit-preview">
    <div class="retrofit-preview__header">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-opacity="0.5"/>
        <rect x="2" y="2" width="8" height="2" rx="0.5" fill="currentColor" fill-opacity="0.4"/>
        <rect x="2" y="5.5" width="5" height="1" rx="0.5" fill="currentColor" fill-opacity="0.3"/>
        <rect x="2" y="7.5" width="7" height="1" rx="0.5" fill="currentColor" fill-opacity="0.3"/>
      </svg>
      {{ title ?? 'Preview' }}
    </div>
    <div class="retrofit-preview__body">
      <slot />
    </div>
  </div>
</template>
