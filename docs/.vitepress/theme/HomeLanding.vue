<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Scroll-reveal for sections below the fold. Guarded for SSR and
// prefers-reduced-motion so the page is fully visible without JS / motion.
const root = ref<HTMLElement>();
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (typeof window === 'undefined' || !root.value) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = root.value.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) return; // stay visible
  // Opt into the hidden-then-reveal animation only now that JS can undo it.
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
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => observer!.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div class="rf" ref="root">
    <!-- ── HERO ─────────────────────────────────────────────────────── -->
    <section class="rf-hero">
      <div class="rf-grid" aria-hidden="true" />
      <div class="rf-glow" aria-hidden="true" />

      <div class="rf-hero__inner">
        <p class="rf-eyebrow rf-load" style="--d: 0ms">
          <span class="rf-tick" />Open source · Declarative UI · JS&nbsp;+&nbsp;Java
        </p>

        <h1 class="rf-title">
          <span class="rf-load" style="--d: 60ms">Your server</span>{{ ' ' }}<span class="rf-load" style="--d: 140ms">describes</span>{{ ' ' }}<span class="rf-load rf-title__accent" style="--d: 220ms">the UI.</span>
        </h1>

        <p class="rf-lede rf-load" style="--d: 320ms">
          A framework for declarative, server-driven components. Return a JSON
          spec from your backend &mdash; tables, forms, timelines, and more
          &mdash; and the browser renders it. No frontend code to write, no
          frontend to deploy.
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

    <!-- ── LIVE DEMO ───────────────────────────────────────────────── -->
    <section class="rf-section rf-proof" data-reveal>
      <header class="rf-head">
        <span class="rf-kicker">// the proof</span>
        <h2>See it actually run</h2>
        <p>
          The table below is the real renderer driving a JSON spec against mock
          data in your browser. Edit a row, add a todo, delete one &mdash; every
          interaction is wired by the spec, not hand-written.
        </p>
      </header>

      <div class="rf-screen">
        <div class="rf-screen__bar" aria-hidden="true">
          <span /><span /><span />
          <em>rendered output</em>
        </div>
        <div class="rf-screen__body">
          <TodosDemo />
        </div>
      </div>

      <p class="rf-proof__foot">
        This is the <a href="/examples/todos">todos example</a> verbatim &mdash;
        see it built end to end, or browse
        <a href="/examples/contacts">contacts</a> and
        <a href="/examples/blog">blog</a>.
      </p>
    </section>

    <!-- ── HOW IT WORKS ────────────────────────────────────────────── -->
    <section class="rf-section rf-how" data-reveal>
      <header class="rf-head">
        <span class="rf-kicker">// three moves</span>
        <h2>The whole loop</h2>
      </header>

      <ol class="rf-steps">
        <li>
          <span class="rf-steps__n">01</span>
          <h3>Describe it once</h3>
          <p>
            Define the shape in Zod or Java. retrofit-ui derives columns,
            fields, validation, and enum options &mdash; no duplication.
          </p>
        </li>
        <li>
          <span class="rf-steps__n">02</span>
          <h3>Serve a spec</h3>
          <p>
            Your endpoint returns plain JSON. Any language that can emit the
            contract gets the full UI &mdash; JS, Java, Go, Python.
          </p>
        </li>
        <li>
          <span class="rf-steps__n">03</span>
          <h3>Render anywhere</h3>
          <p>
            Host the SPA, mount a component, or hydrate an island. Change the
            schema and the UI follows on the next request &mdash; no redeploy.
          </p>
        </li>
      </ol>
    </section>

    <!-- ── FEATURES (spec sheet) ───────────────────────────────────── -->
    <section class="rf-section rf-spec" data-reveal>
      <header class="rf-head">
        <span class="rf-kicker">// spec sheet</span>
        <h2>What you get</h2>
      </header>

      <dl class="rf-specgrid">
        <div class="rf-specgrid__item">
          <dt>Schema-driven</dt>
          <dd>One source of truth in Zod or Java. Columns, fields, and validation are derived, never duplicated.</dd>
        </div>
        <div class="rf-specgrid__item">
          <dt>Server-owned</dt>
          <dd>The server returns specs describing the UI. Change the schema, the UI changes on the next request.</dd>
        </div>
        <div class="rf-specgrid__item">
          <dt>Polyglot</dt>
          <dd>The SPA is language-agnostic. Any server emitting the contract gets the full UI &mdash; JS, Java, anything.</dd>
        </div>
        <div class="rf-specgrid__item">
          <dt>Seven view types</dt>
          <dd>Table, form, stat, timeline, tree, calendar, and markdown &mdash; alone or as a workflow bundle.</dd>
        </div>
        <div class="rf-specgrid__item">
          <dt>Themeable</dt>
          <dd>Built on Shoelace web components. Override CSS custom properties &mdash; no framework conflicts.</dd>
        </div>
        <div class="rf-specgrid__item">
          <dt>Incremental</dt>
          <dd>Adopt as a hosted SPA, script islands, or SolidJS components. Take as much or as little as you need.</dd>
        </div>
      </dl>
    </section>

    <!-- ── CTA ─────────────────────────────────────────────────────── -->
    <section class="rf-section rf-final" data-reveal>
      <div class="rf-grid rf-grid--soft" aria-hidden="true" />
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
/* ── palette: a self-contained dark blueprint, independent of site theme ── */
.rf {
  --ink: #080b16;
  --ink-1: #0b1020;
  --ink-2: #10182e;
  --edge: rgba(126, 166, 255, 0.14);
  --edge-2: rgba(126, 166, 255, 0.28);
  --cool: #8fb4ff;
  --cool-bright: #c4d8ff;
  --warm: #ff9e6b;
  --warm-bright: #ffbf9b;
  --text: #e3e9f7;
  --muted: #8e9bbd;
  --mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --sans: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  --display: 'Fraunces', 'IBM Plex Sans', Georgia, serif;

  background: var(--ink);
  color: var(--text);
  font-family: var(--sans);
  overflow: clip;
}

/* full-bleed, since the host page container is width-constrained */
.rf section {
  position: relative;
  padding-inline: 24px;
}

/* ── shared bits ──────────────────────────────────────────────────────── */
.rf-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--edge) 1px, transparent 1px),
    linear-gradient(90deg, var(--edge) 1px, transparent 1px);
  background-size: 34px 34px;
  background-position: center;
  -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
  mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
  pointer-events: none;
}
.rf-grid--soft {
  -webkit-mask-image: radial-gradient(90% 120% at 50% 50%, #000 10%, transparent 70%);
  mask-image: radial-gradient(90% 120% at 50% 50%, #000 10%, transparent 70%);
  opacity: 0.7;
}
.rf-glow {
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 620px;
  background:
    radial-gradient(46% 60% at 24% 28%, rgba(120, 162, 255, 0.22), transparent 70%),
    radial-gradient(40% 55% at 82% 16%, rgba(255, 158, 107, 0.16), transparent 72%);
  filter: blur(6px);
  pointer-events: none;
}

.rf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 14.5px;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
  white-space: nowrap;
}
.rf-btn svg { transition: transform 0.18s ease; }
.rf-btn--warm {
  background: linear-gradient(180deg, var(--warm-bright), var(--warm));
  color: #2a160c;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35) inset, 0 10px 26px -12px rgba(255, 158, 107, 0.7);
}
.rf-btn--warm:hover { transform: translateY(-2px); }
.rf-btn--warm:hover svg { transform: translateX(3px); }
.rf-btn--ghost {
  background: rgba(143, 180, 255, 0.06);
  color: var(--cool-bright);
  border: 1px solid var(--edge-2);
}
.rf-btn--ghost:hover {
  background: rgba(143, 180, 255, 0.12);
  border-color: var(--cool);
  transform: translateY(-2px);
}

.rf-kicker {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cool);
}

/* ── hero ─────────────────────────────────────────────────────────────── */
.rf-hero {
  padding-top: calc(var(--vp-nav-height, 64px) + 86px);
  padding-bottom: 92px;
  border-bottom: 1px solid var(--edge);
}
.rf-hero__inner {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
}
.rf-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--mono);
  font-size: 12.5px;
  letter-spacing: 0.04em;
  color: var(--muted);
  padding: 6px 13px 6px 11px;
  border: 1px solid var(--edge);
  border-radius: 999px;
  background: rgba(143, 180, 255, 0.04);
}
.rf-tick {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warm);
  box-shadow: 0 0 0 4px rgba(255, 158, 107, 0.18);
}
.rf-title {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(2.9rem, 7.2vw, 5.6rem);
  line-height: 0.98;
  letter-spacing: -0.025em;
  margin: 26px 0 0;
  max-width: 16ch;
}
.rf-title span { display: inline; }
.rf-title__accent {
  font-style: italic;
  color: transparent;
  background: linear-gradient(96deg, var(--warm-bright), var(--warm));
  -webkit-background-clip: text;
  background-clip: text;
}
.rf-lede {
  margin: 28px 0 0;
  max-width: 60ch;
  font-size: clamp(1.05rem, 1.6vw, 1.28rem);
  line-height: 1.6;
  color: var(--muted);
}
.rf-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

/* ── pipeline ─────────────────────────────────────────────────────────── */
.rf-pipe {
  margin-top: 68px;
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
  background: linear-gradient(180deg, var(--ink-2), var(--ink-1));
  border: 1px solid var(--edge-2);
  border-radius: 14px;
  padding: 16px;
  position: relative;
}
/* corner ticks — blueprint detail */
.rf-stage::before,
.rf-stage::after {
  content: '';
  position: absolute;
  width: 9px;
  height: 9px;
  border: 1.5px solid var(--cool);
  opacity: 0.5;
}
.rf-stage::before { top: 7px; left: 7px; border-right: 0; border-bottom: 0; }
.rf-stage::after { bottom: 7px; right: 7px; border-left: 0; border-top: 0; }
.rf-stage__cap {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cool);
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.rf-stage__cap i {
  font-style: normal;
  color: var(--muted);
  font-size: 11px;
}
.rf-stage__body {
  flex: 1;
  border-radius: 9px;
  background: rgba(4, 7, 16, 0.6);
  border: 1px solid var(--edge);
  display: flex;
  align-items: center;
}
.rf-stage__body--code { align-items: stretch; }
.rf-stage__body pre {
  margin: 0;
  padding: 13px 14px;
  overflow: auto;
  width: 100%;
}
.rf-stage__body code {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--cool-bright);
  white-space: pre;
}
.rf-stage__body .t-key { color: var(--warm); }
.rf-stage__body .t-str { color: #9be6c0; }
.rf-stage__note {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.rf-stage__note--warm { color: var(--warm); }
.rf-stage--ui { border-color: rgba(255, 158, 107, 0.42); }
.rf-stage--ui::before,
.rf-stage--ui::after { border-color: var(--warm); opacity: 0.7; }
.rf-stage--ui .rf-stage__body {
  box-shadow: 0 0 50px -18px rgba(255, 158, 107, 0.6) inset;
}

/* mini rendered table */
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
  height: 8px;
  border-radius: 3px;
  background: rgba(196, 216, 255, 0.18);
}
.rf-mini__row--head b { background: var(--warm); opacity: 0.85; height: 7px; }
.rf-mini__row b:nth-child(3) {
  background: rgba(255, 158, 107, 0.4);
  border-radius: 999px;
}

/* flow connector */
.rf-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 84px;
  padding: 0 6px;
}
.rf-flow__line {
  position: relative;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--edge-2), var(--cool), var(--edge-2));
  border-radius: 2px;
  overflow: hidden;
}
.rf-flow__pulse {
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--warm-bright), transparent);
  animation: rf-pulse 2.6s linear infinite;
}
.rf-flow__verb {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--warm);
  letter-spacing: 0.02em;
}
@keyframes rf-pulse {
  to { left: 120%; }
}

/* ── generic section ──────────────────────────────────────────────────── */
.rf-section { padding-top: 92px; padding-bottom: 92px; }
.rf-head { max-width: 1080px; margin: 0 auto 40px; }
.rf-head h2 {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.03;
  letter-spacing: -0.02em;
  margin: 12px 0 0;
}
.rf-head p {
  margin: 16px 0 0;
  max-width: 56ch;
  color: var(--muted);
  font-size: 1.08rem;
  line-height: 1.6;
}

/* ── proof / live demo ────────────────────────────────────────────────── */
.rf-proof { background: linear-gradient(180deg, var(--ink), var(--ink-1)); border-block: 1px solid var(--edge); }
.rf-screen {
  max-width: 1080px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--edge-2);
  box-shadow: 0 40px 90px -50px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.02);
}
.rf-screen__bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 16px;
  background: #0a1122;
  border-bottom: 1px solid var(--edge-2);
}
.rf-screen__bar span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(196, 216, 255, 0.2);
}
.rf-screen__bar span:first-child { background: var(--warm); opacity: 0.9; }
.rf-screen__bar em {
  margin-left: 10px;
  font-family: var(--mono);
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
/* the rendered UI is a light "output window", regardless of site theme.
   custom props inherit into the globally-registered TodosDemo. */
.rf-screen__body {
  --vp-c-bg: #ffffff;
  --vp-c-bg-soft: #f5f6fb;
  --vp-c-bg-alt: #f0f2f9;
  --vp-c-divider: #e3e6f0;
  --vp-c-text-1: #1b2236;
  --vp-c-text-2: #4a5571;
  --vp-c-text-3: #7b85a0;
  background: #fff;
  padding: 8px;
}
.rf-screen__body :deep(.live-demo-container) {
  border: 0;
  border-radius: 10px;
  margin: 0;
}
.rf-proof__foot {
  max-width: 1080px;
  margin: 26px auto 0;
  font-size: 14.5px;
  color: var(--muted);
}

/* ── steps ────────────────────────────────────────────────────────────── */
.rf-steps {
  max-width: 1080px;
  margin: 0 auto;
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--edge);
  border: 1px solid var(--edge);
  border-radius: 16px;
  overflow: hidden;
}
.rf-steps li {
  background: var(--ink-1);
  padding: 30px 26px 34px;
}
.rf-steps__n {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--warm);
  letter-spacing: 0.08em;
}
.rf-steps h3 {
  font-family: var(--display);
  font-weight: 500;
  font-size: 1.45rem;
  margin: 14px 0 10px;
  letter-spacing: -0.01em;
}
.rf-steps p { margin: 0; color: var(--muted); line-height: 1.6; }

/* ── spec sheet ───────────────────────────────────────────────────────── */
.rf-specgrid {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--edge);
  border: 1px solid var(--edge);
  border-radius: 16px;
  overflow: hidden;
}
.rf-specgrid__item {
  background: var(--ink-1);
  padding: 24px;
  transition: background 0.2s ease;
}
.rf-specgrid__item:hover { background: var(--ink-2); }
.rf-specgrid dt {
  font-family: var(--mono);
  font-size: 12.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cool-bright);
  padding-left: 14px;
  border-left: 2px solid var(--warm);
}
.rf-specgrid dd {
  margin: 12px 0 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.97rem;
}

/* ── final cta ────────────────────────────────────────────────────────── */
.rf-final {
  text-align: center;
  border-top: 1px solid var(--edge);
  background: linear-gradient(180deg, var(--ink-1), var(--ink));
}
.rf-final__inner { position: relative; max-width: 760px; margin: 0 auto; }
.rf-final h2 {
  font-family: var(--display);
  font-weight: 450;
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  line-height: 1.04;
  letter-spacing: -0.025em;
  margin: 0 0 30px;
}
.rf-final .rf-cta { justify-content: center; }
.rf-final__alt { margin-top: 26px; color: var(--muted); font-size: 14.5px; }

.rf a:not(.rf-btn) { color: var(--cool-bright); text-decoration: none; border-bottom: 1px solid var(--edge-2); transition: border-color 0.15s ease; }
.rf a:not(.rf-btn):hover { border-color: var(--cool); }

/* ── motion ───────────────────────────────────────────────────────────── */
.rf-load { opacity: 0; transform: translateY(14px); animation: rf-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards; animation-delay: var(--d, 0ms); }
/* progressive enhancement: content is visible by default; the hidden start
   state is applied only once JS adds .rf--anim, so no-JS users see everything. */
.rf--anim [data-reveal] { opacity: 0; transform: translateY(26px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1); }
.rf--anim [data-reveal].is-in { opacity: 1; transform: none; }
@keyframes rf-rise { to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .rf-load, [data-reveal] { animation: none !important; opacity: 1 !important; transform: none !important; transition: none !important; }
  .rf-flow__pulse { display: none; }
}

/* ── responsive ───────────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .rf-pipe { grid-template-columns: 1fr; }
  .rf-flow { flex-direction: row; min-width: 0; padding: 8px 0; gap: 12px; }
  .rf-flow__line { width: 60%; }
  .rf-steps, .rf-specgrid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .rf section { padding-inline: 18px; }
  .rf-section { padding-top: 64px; padding-bottom: 64px; }
  .rf-hero { padding-top: calc(var(--vp-nav-height, 64px) + 48px); }
}
</style>
