<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  buildChatSpec,
  chatTheme,
} from '../../../examples/js/interactive-chat/src/spec';
import { getController } from './useRetrofitController';

const root = ref<HTMLElement>();
const spec = buildChatSpec();

let _styleEl: HTMLStyleElement | null = null;

onMounted(async () => {
  if (typeof window === 'undefined') return;
  await nextTick(); // wait for <ClientOnly> to render its slot
  if (!root.value) return;

  // Apply indigo theme to the island container (Shoelace inherits via cascade)
  for (const [key, value] of Object.entries(chatTheme.cssVariables)) {
    root.value.style.setProperty(key, value);
  }
  if (!_styleEl) {
    _styleEl = document.createElement('style');
    _styleEl.textContent = chatTheme.extraCss;
    document.head.appendChild(_styleEl);
  }

  const controller = await getController();
  controller.mount(spec, root.value);
});

onBeforeUnmount(() => {
  const el = root.value;
  if (el) {
    getController().then((ctrl) => ctrl.unmount(el));
  }
  _styleEl?.remove();
  _styleEl = null;
});
</script>

<template>
  <ClientOnly>
    <div class="live-demo-container">
      <div class="live-demo-header">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="4" r="3" fill="currentColor" fill-opacity="0.4" />
          <circle cx="4" cy="4" r="1.5" />
        </svg>
        Live Demo
      </div>
      <div class="live-demo-body" ref="root" />
    </div>
    <template #fallback>
      <div class="live-demo-container">
        <div class="live-demo-loading">Initialising demo…</div>
      </div>
    </template>
  </ClientOnly>
</template>
