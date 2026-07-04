<!--
  Three parallel vertical timelines telling the retrofit-ui story for each of
  the three main patterns it solves. Used on /guide/what-is-retrofit-ui.
  Colours come from the .rf-diagram CSS custom properties in theme/style.css.
-->
<template>
  <figure class="rf-diagram rf-scenarios">
    <div class="rf-scenarios-grid">
      <article
        v-for="scenario in scenarios"
        :key="scenario.title"
        class="rf-scenario"
        :style="{ '--rf-accent': `var(${scenario.accent})` }"
      >
        <header class="rf-scenario-head">
          <span class="rf-scenario-kicker">{{ scenario.kicker }}</span>
          <h4 class="rf-scenario-title">{{ scenario.title }}</h4>
        </header>
        <ol class="rf-scenario-steps">
          <li
            v-for="(step, i) in scenario.steps"
            :key="i"
            class="rf-scenario-step"
            :class="`rf-scenario-step--${step.tone}`"
          >
            <span class="rf-step-label">{{ step.label }}</span>
            <p class="rf-step-body" v-html="step.body" />
          </li>
        </ol>
      </article>
    </div>
    <figcaption class="rf-diagram__caption">
      Three shapes of the same underlying problem — the client and the server owning duplicated knowledge of the UI. Each column reads top-to-bottom as a small story.
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
interface Step {
  label: string;
  tone: 'setup' | 'pain' | 'fix' | 'bonus';
  body: string;
}
interface Scenario {
  kicker: string;
  title: string;
  accent: string;
  steps: Step[];
}

const scenarios: Scenario[] = [
  {
    kicker: 'Pattern 1',
    title: 'CRUD API',
    accent: '--rf-blue',
    steps: [
      {
        label: 'The setup',
        tone: 'setup',
        body: 'You have an entity table — products, users, invoices. Every field added to the schema needs to propagate to the backend model, the API response, and the frontend that displays it.',
      },
      {
        label: 'Where it snags',
        tone: 'pain',
        body: 'When the UI lives in a separate codebase, the frontend step lags or gets skipped. Three places to update for every field.',
      },
      {
        label: 'The retrofit-ui move',
        tone: 'fix',
        body: 'The spec is derived from your schema. Add a field once; it appears in the table automatically on the next load.',
      },
      {
        label: 'What survives',
        tone: 'bonus',
        body: 'Your existing REST endpoints stay untouched. The spec lives on a separate endpoint you define (<code>/api/ui/*</code> is the default convention, but you pick the URL) — no code generation, no scaffolding, nothing to maintain.',
      },
    ],
  },
  {
    kicker: 'Pattern 2',
    title: 'Project page with admin tools',
    accent: '--rf-orange',
    steps: [
      {
        label: 'The setup',
        tone: 'setup',
        body: 'An internal page mixing prose or documentation with interactive components — forms, approval buttons, admin actions — that call real endpoints owned by the same service.',
      },
      {
        label: 'Where it snags',
        tone: 'pain',
        body: 'The interactive pieces require frontend code tightly coupled to the backend API — two codebases to keep in sync for what should be a single feature.',
      },
      {
        label: 'The retrofit-ui move',
        tone: 'fix',
        body: 'Drop a <code>data-retrofit-src</code> element into your page. The renderer fetches the spec and mounts the component wherever you place it — no framework, no build step.',
      },
      {
        label: 'What survives',
        tone: 'bonus',
        body: 'The backend stays in builder code — types and method chains that backend engineers already know. Complexity is opt-in; you never touch the frontend unless you choose to.',
      },
    ],
  },
  {
    kicker: 'Pattern 3',
    title: 'AI-generated content blocks',
    accent: '--rf-purple',
    steps: [
      {
        label: 'The setup',
        tone: 'setup',
        body: 'Structured output — a calendar, a summary grid, a timeline — that automation or a language model generates and needs to display without a custom frontend.',
      },
      {
        label: 'Where it snags',
        tone: 'pain',
        body: 'There is no rendering layer. The machine produces structured data, but something has to turn it into UI — which means a frontend someone has to build and maintain.',
      },
      {
        label: 'The retrofit-ui move',
        tone: 'fix',
        body: 'The model emits spec JSON. The renderer consumes it directly. The output is also the render instruction — no template layer, no component code between them.',
      },
      {
        label: 'What survives',
        tone: 'bonus',
        body: 'The same renderer that handles hand-authored specs handles machine-generated ones. No special mode, no integration layer.',
      },
    ],
  },
];
</script>
