<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { getController } from './useRetrofitController';

export interface DemoView {
  label: string;
  spec: unknown;
}

const root = ref<HTMLElement>();
const views = ref<DemoView[]>([]);
const activeIndex = ref(0);

async function start(initialViews: DemoView[]) {
  views.value = initialViews;
  activeIndex.value = 0;
  await nextTick(); // wait for <ClientOnly> to render its slot
  if (!root.value) return;
  const controller = await getController();
  controller.mount(initialViews[0].spec, root.value);
}

async function switchView(i: number) {
  if (!root.value || i === activeIndex.value) return;
  activeIndex.value = i;
  const controller = await getController();
  controller.unmount(root.value);
  await nextTick();
  controller.mount(views.value[i].spec, root.value);
}

onBeforeUnmount(() => {
  const el = root.value;
  if (el) {
    getController().then((ctrl) => ctrl.unmount(el));
  }
});

defineExpose({ start });
</script>

<template>
  <ClientOnly>
    <div class="live-demo-container">
      <div class="live-demo-header">
        <span class="live-demo-label">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="4" r="3" fill="currentColor" fill-opacity="0.4" />
            <circle cx="4" cy="4" r="1.5" />
          </svg>
          Live Demo
        </span>
        <div v-if="views.length > 1" class="live-demo-tabs" role="tablist">
          <button
            v-for="(view, i) in views"
            :key="i"
            class="live-demo-tab"
            :class="{ 'live-demo-tab--active': activeIndex === i }"
            role="tab"
            :aria-selected="activeIndex === i"
            @click="switchView(i)"
          >
            {{ view.label }}
          </button>
        </div>
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
