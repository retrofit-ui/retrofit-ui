// jsdom lacks ResizeObserver / IntersectionObserver, but Shoelace web
// components (sl-tab-group, sl-card, ...) upgrade under jsdom and reach for
// them on connect. Stub them so the components render without throwing; we
// assert on retrofit's own DOM, not Shoelace internals.
class ObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

const g = globalThis as {
  ResizeObserver?: unknown;
  IntersectionObserver?: unknown;
};
if (!('ResizeObserver' in globalThis)) g.ResizeObserver = ObserverStub;
if (!('IntersectionObserver' in globalThis)) g.IntersectionObserver =
  ObserverStub;
