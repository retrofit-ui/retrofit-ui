<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const root = ref<HTMLElement>();
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (typeof window === 'undefined' || !root.value) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = root.value.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) return;
  root.value.classList.add('rf--anim');
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          observer?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
  );
  for (const el of targets) observer?.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div class="rf" ref="root">
    <!-- ── HERO ─────────────────────────────────────────────────────── -->
    <section class="rf-hero">
      <div class="rf-hero__inner">
        <p class="rf-eyebrow rf-load" style="--d: 0ms">
          <span class="rf-tick" />Open source · Declarative UI · JS&nbsp;+&nbsp;Java
        </p>

        <h1 class="rf-title">
          <span class="rf-load" style="--d: 60ms">Your server</span>{{ ' ' }}<span
            class="rf-load"
            style="--d: 140ms"
            >describes</span
          >{{ ' ' }}<span class="rf-load rf-title__accent" style="--d: 220ms">the UI.</span>
        </h1>

        <p class="rf-lede rf-load" style="--d: 320ms">
          A framework for declarative, server-driven components. Return a JSON
          spec from your backend&thinsp;&mdash;&thinsp;tables, forms, timelines,
          and more&thinsp;&mdash;&thinsp;and the browser renders it. No frontend
          code to write, no frontend to deploy.
        </p>

        <div class="rf-cta rf-load" style="--d: 400ms">
          <a class="rf-btn rf-btn--warm" href="/examples/todos">
            See it in action
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <a class="rf-btn rf-btn--ghost" href="/guide/js-quickstart">JS Quickstart</a>
          <a class="rf-btn rf-btn--ghost" href="/guide/java-quickstart">Java Quickstart</a>
        </div>

        <!-- pipeline: schema → spec → ui -->
        <div class="rf-pipe rf-load" style="--d: 520ms">
          <figure class="rf-stage">
            <figcaption class="rf-stage__cap"><i>01</i> Schema</figcaption>
            <div class="rf-stage__body rf-stage__body--code">
              <pre><code><span class="t-key">z</span>.object({
  title: <span class="t-key">z</span>.string(),
  done:  <span class="t-key">z</span>.boolean(),
})</code></pre>
            </div>
            <span class="rf-stage__note">you write</span>
          </figure>

          <div class="rf-flow" aria-hidden="true">
            <span class="rf-flow__line"><span class="rf-flow__pulse" /></span>
            <span class="rf-flow__verb">build()</span>
          </div>

          <figure class="rf-stage">
            <figcaption class="rf-stage__cap"><i>02</i> Spec</figcaption>
            <div class="rf-stage__body rf-stage__body--code">
              <pre><code>{
  <span class="t-str">"kind"</span>: <span class="t-str">"table"</span>,
  <span class="t-str">"columns"</span>: [ &hellip; ],
  <span class="t-str">"endpoints"</span>: { &hellip; }
}</code></pre>
            </div>
            <span class="rf-stage__note">server emits</span>
          </figure>

          <div class="rf-flow" aria-hidden="true">
            <span class="rf-flow__line"><span class="rf-flow__pulse" style="animation-delay: .9s" /></span>
            <span class="rf-flow__verb">mount()</span>
          </div>

          <figure class="rf-stage rf-stage--ui">
            <figcaption class="rf-stage__cap"><i>03</i> UI</figcaption>
            <div class="rf-stage__body">
              <div class="rf-mini">
                <span class="rf-mini__row rf-mini__row--head"><b /><b /><b /></span>
                <span class="rf-mini__row"><b /><b /><b /></span>
                <span class="rf-mini__row"><b /><b /><b /></span>
                <span class="rf-mini__row"><b /><b /><b /></span>
              </div>
            </div>
            <span class="rf-stage__note rf-stage__note--warm">browser renders</span>
          </figure>
        </div>
      </div>
    </section>

    <!-- ── SPEC-RENDERED SHOWCASE ────────────────────────────────── -->
    <section class="rf-showcase" data-reveal>
      <header class="rf-head">
        <span class="rf-kicker">// the system renders this page</span>
        <h2>Dogfooding the spec</h2>
        <p>
          Everything below — the stat cards, feature grid, tabbed demos, and
          FAQ — is driven by a single <code>page</code> spec mounted via
          <code>controller.mount()</code>. No hand-written HTML.
        </p>
      </header>
      <div class="rf-showcase__body">
        <LandingDemo />
      </div>
    </section>

    <!-- ── CTA ─────────────────────────────────────────────────────── -->
    <section class="rf-final" data-reveal>
      <div class="rf-final__inner">
        <h2>Wire up your first view<br />in five minutes.</h2>
        <div class="rf-cta">
          <a class="rf-btn rf-btn--warm" href="/guide/js-quickstart">JS Quickstart</a>
          <a class="rf-btn rf-btn--ghost" href="/guide/java-quickstart">Java Quickstart</a>
        </div>
        <p class="rf-final__alt">
          Prefer to read first? Start with
          <a href="/guide/what-is-retrofit-ui">What is retrofit-ui?</a>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── palette ──────────────────────────────────────────────────────────── */
.rf {
  --bg:      #ffffff;
  --bg-dim:  #f8f7f4;
  --ink:     #111110;
  --ink-2:   #1e1e1c;
  --muted:   #69695e;
  --warm:    #c85c24;
  --warm-2:  #e8763e;
  --cool:    #1c3a6b;
  --edge:    rgba(17, 17, 16, 0.1);
  --edge-2:  rgba(17, 17, 16, 0.18);
  --mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --sans: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  --display: 'Fraunces', 'IBM Plex Sans', Georgia, serif;

  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
}

.rf section {
  position: relative;
  padding-inline: 24px;
}

/* ── buttons ──────────────────────────────────────────────────────────── */
.rf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
  white-space: nowrap;
  border: none;
}
.rf-btn svg { transition: transform 0.16s ease; }
.rf-btn--warm {
  background: var(--warm);
  color: #fff;
  box-shadow: 0 1px 3px rgba(200, 92, 36, 0.35), 0 4px 16px -4px rgba(200, 92, 36, 0.4);
}
.rf-btn--warm:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(200, 92, 36, 0.4), 0 8px 24px -4px rgba(200, 92, 36, 0.35); }
.rf-btn--warm:hover svg { transform: translateX(3px); }
.rf-btn--ghost {
  background: transparent;
  color: var(--ink-2);
  border: 1.5px solid var(--edge-2);
}
.rf-btn--ghost:hover {
  background: var(--bg-dim);
  border-color: var(--ink);
  transform: translateY(-1px);
}

/* ── hero ─────────────────────────────────────────────────────────────── */
.rf-hero {
  padding-top: calc(var(--vp-nav-height, 64px) + 80px);
  padding-bottom: 88px;
  border-bottom: 1px solid var(--edge);
}
.rf-hero__inner {
  max-width: 1080px;
  margin: 0 auto;
}

.rf-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--muted);
  padding: 5px 12px 5px 10px;
  border: 1px solid var(--edge-2);
  border-radius: 999px;
}
.rf-tick {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warm);
  flex-shrink: 0;
}

.rf-title {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(3rem, 7.4vw, 5.8rem);
  line-height: 0.97;
  letter-spacing: -0.028em;
  margin: 24px 0 0;
  max-width: 16ch;
  color: var(--ink);
}
.rf-title span { display: inline; }
.rf-title__accent {
  font-style: italic;
  color: transparent;
  background: linear-gradient(110deg, var(--warm-2), var(--warm));
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap;
}

.rf-lede {
  margin: 26px 0 0;
  max-width: 58ch;
  font-size: clamp(1.05rem, 1.5vw, 1.22rem);
  line-height: 1.65;
  color: var(--muted);
}

.rf-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 32px;
}

/* ── pipeline diagram ─────────────────────────────────────────────────── */
.rf-pipe {
  margin-top: 64px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: stretch;
  gap: 4px;
}

.rf-stage {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--edge-2);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  box-shadow: 0 1px 4px rgba(17, 17, 16, 0.06);
}

.rf-stage__cap {
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cool);
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.rf-stage__cap i {
  font-style: normal;
  color: var(--muted);
  font-size: 10.5px;
}

.rf-stage__body {
  flex: 1;
  border-radius: 8px;
  background: var(--bg-dim);
  border: 1px solid var(--edge);
  display: flex;
  align-items: center;
}
.rf-stage__body--code { align-items: stretch; }
.rf-stage__body pre {
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  width: 100%;
}
.rf-stage__body code {
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.75;
  color: var(--ink-2);
  white-space: pre;
}
.rf-stage__body .t-key { color: var(--warm); font-weight: 500; }
.rf-stage__body .t-str { color: #1e6640; }

.rf-stage__note {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.rf-stage__note--warm { color: var(--warm); }

.rf-stage--ui {
  border-color: rgba(200, 92, 36, 0.3);
}
.rf-stage--ui .rf-stage__body {
  background: #fff8f4;
  border-color: rgba(200, 92, 36, 0.14);
}

/* mini rendered table inside stage 03 */
.rf-mini {
  width: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.rf-mini__row {
  display: grid;
  grid-template-columns: 1fr 1.7fr 0.8fr;
  gap: 9px;
  align-items: center;
}
.rf-mini__row b {
  height: 7px;
  border-radius: 3px;
  background: rgba(17, 17, 16, 0.1);
}
.rf-mini__row--head b {
  background: var(--warm);
  opacity: 0.7;
  height: 6px;
}
.rf-mini__row b:nth-child(3) {
  background: rgba(200, 92, 36, 0.28);
  border-radius: 999px;
}

/* flow connectors */
.rf-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 80px;
  padding: 0 6px;
}
.rf-flow__line {
  position: relative;
  width: 100%;
  height: 1px;
  background: var(--edge-2);
  overflow: hidden;
}
.rf-flow__pulse {
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--warm), transparent);
  animation: rf-pulse 2.6s linear infinite;
}
.rf-flow__verb {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--warm);
  letter-spacing: 0.02em;
}
@keyframes rf-pulse {
  to { left: 120%; }
}

/* ── section / head shared ────────────────────────────────────────────── */
.rf-head {
  max-width: 1080px;
  margin: 0 auto 40px;
}
.rf-head h2 {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.03;
  letter-spacing: -0.022em;
  margin: 10px 0 0;
  color: var(--ink);
}
.rf-head p {
  margin: 14px 0 0;
  max-width: 56ch;
  color: var(--muted);
  font-size: 1.06rem;
  line-height: 1.65;
}
.rf-kicker {
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── showcase ─────────────────────────────────────────────────────────── */
.rf-showcase {
  padding-top: 80px;
  padding-bottom: 80px;
  background: var(--bg-dim);
  border-top: 1px solid var(--edge);
  border-bottom: 1px solid var(--edge);
}
.rf-showcase code {
  font-family: var(--mono);
  font-size: 0.87em;
  background: rgba(17, 17, 16, 0.06);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--cool);
}
.rf-showcase__body {
  max-width: 1080px;
  margin: 0 auto;
}

/* ── final cta ────────────────────────────────────────────────────────── */
.rf-final {
  padding: 92px 24px;
  text-align: center;
  background: var(--bg);
  border-top: 1px solid var(--edge);
}
.rf-final__inner {
  max-width: 680px;
  margin: 0 auto;
}
.rf-final h2 {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: 1.03;
  letter-spacing: -0.026em;
  margin: 0 0 28px;
  color: var(--ink);
}
.rf-final .rf-cta { justify-content: center; }
.rf-final__alt {
  margin-top: 24px;
  color: var(--muted);
  font-size: 14px;
}

/* ── links ────────────────────────────────────────────────────────────── */
.rf a:not(.rf-btn) {
  color: var(--cool);
  text-decoration: none;
  border-bottom: 1px solid rgba(28, 58, 107, 0.25);
  transition: border-color 0.14s ease;
}
.rf a:not(.rf-btn):hover { border-color: var(--cool); }

/* ── motion ───────────────────────────────────────────────────────────── */
.rf-load {
  opacity: 0;
  transform: translateY(12px);
  animation: rf-rise 0.65s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  animation-delay: var(--d, 0ms);
}
.rf--anim [data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.rf--anim [data-reveal].is-in { opacity: 1; transform: none; }
@keyframes rf-rise { to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .rf-load,
  [data-reveal] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .rf-flow__pulse { display: none; }
}

/* ── responsive ───────────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .rf-pipe { grid-template-columns: 1fr; }
  .rf-flow { flex-direction: row; min-width: 0; padding: 8px 0; gap: 12px; }
  .rf-flow__line { width: 60%; }
}
@media (max-width: 640px) {
  .rf section { padding-inline: 18px; }
  .rf-hero { padding-top: calc(var(--vp-nav-height, 64px) + 44px); padding-bottom: 60px; }
  .rf-showcase { padding-top: 60px; padding-bottom: 60px; }
  .rf-final { padding-top: 64px; padding-bottom: 64px; }
}
</style>
