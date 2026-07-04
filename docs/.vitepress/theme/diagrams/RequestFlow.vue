<!--
  Request-flow sequence diagram used on /guide/what-is-retrofit-ui.
  Three round-trips (bundle, spec, rows) between Browser and Server.
  Colours come from the .rf-diagram CSS custom properties defined in
  theme/style.css — do not hard-code hex here.
-->
<template>
  <figure class="rf-diagram">
    <svg viewBox="0 0 820 420" role="img" aria-labelledby="rf-flow-title rf-flow-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="rf-flow-title">Request flow between browser and server</title>
      <desc id="rf-flow-desc">Three sequential round-trips: the browser fetches the SPA bundle once, then repeatedly fetches spec JSON and row data from the server.</desc>
      <defs>
        <marker id="rf-arrow-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
        <marker id="rf-arrow-l" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M10,0 L0,5 L10,10 z" fill="currentColor" />
        </marker>
      </defs>
      <g font-family="var(--vp-font-family-base, system-ui)" font-size="13" font-weight="600">
        <g transform="translate(80,20)">
          <rect width="180" height="42" rx="8" fill="var(--rf-blue)" opacity="0.15" />
          <rect width="180" height="42" rx="8" fill="none" stroke="var(--rf-blue)" stroke-width="1.5" />
          <text x="90" y="26" text-anchor="middle" fill="var(--rf-ink)">Browser</text>
        </g>
        <g transform="translate(560,20)">
          <rect width="180" height="42" rx="8" fill="var(--rf-teal)" opacity="0.15" />
          <rect width="180" height="42" rx="8" fill="none" stroke="var(--rf-teal)" stroke-width="1.5" />
          <text x="90" y="26" text-anchor="middle" fill="var(--rf-ink)">Server</text>
        </g>
      </g>
      <line x1="170" y1="62" x2="170" y2="410" stroke="var(--rf-ink-3)" stroke-width="1" stroke-dasharray="3 4" />
      <line x1="650" y1="62" x2="650" y2="410" stroke="var(--rf-ink-3)" stroke-width="1" stroke-dasharray="3 4" />
      <g font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="12">
        <text x="30" y="114" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="10" font-weight="700" letter-spacing="0.15em">1 · ONCE</text>
        <line x1="180" y1="110" x2="640" y2="110" stroke="var(--rf-blue)" stroke-width="1.5" marker-end="url(#rf-arrow-r)" color="var(--rf-blue)" />
        <text x="410" y="104" text-anchor="middle" fill="var(--rf-blue)" font-weight="600">GET /retrofit-ui</text>
        <line x1="640" y1="130" x2="180" y2="130" stroke="var(--rf-ink-2)" stroke-width="1.5" marker-end="url(#rf-arrow-l)" color="var(--rf-ink-2)" />
        <text x="410" y="146" text-anchor="middle" fill="var(--rf-ink-2)">SPA static bundle</text>
      </g>
      <g font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="12">
        <text x="30" y="216" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="10" font-weight="700" letter-spacing="0.15em">2 · PER ROUTE</text>
        <line x1="180" y1="212" x2="640" y2="212" stroke="var(--rf-orange)" stroke-width="1.5" marker-end="url(#rf-arrow-r)" color="var(--rf-orange)" />
        <text x="410" y="206" text-anchor="middle" fill="var(--rf-orange)" font-weight="600">GET /api/ui/todos</text>
        <line x1="640" y1="232" x2="180" y2="232" stroke="var(--rf-ink-2)" stroke-width="1.5" marker-end="url(#rf-arrow-l)" color="var(--rf-ink-2)" />
        <text x="410" y="248" text-anchor="middle" fill="var(--rf-ink-2)">
          <tspan font-weight="600" fill="var(--rf-ink)">TableSpec</tspan> · { columns, endpoints }
        </text>
        <text x="410" y="264" text-anchor="middle" fill="var(--rf-ink-3)" font-size="11" font-family="var(--vp-font-family-base, system-ui)">SPA renders the table shell</text>
      </g>
      <g font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="12">
        <text x="30" y="338" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="10" font-weight="700" letter-spacing="0.15em">3 · PER LOAD</text>
        <line x1="180" y1="334" x2="640" y2="334" stroke="var(--rf-purple)" stroke-width="1.5" marker-end="url(#rf-arrow-r)" color="var(--rf-purple)" />
        <text x="410" y="328" text-anchor="middle" fill="var(--rf-purple)" font-weight="600">GET /todos</text>
        <line x1="640" y1="354" x2="180" y2="354" stroke="var(--rf-ink-2)" stroke-width="1.5" marker-end="url(#rf-arrow-l)" color="var(--rf-ink-2)" />
        <text x="410" y="370" text-anchor="middle" fill="var(--rf-ink-2)">[ { id, title, done, … }, … ]</text>
        <text x="410" y="386" text-anchor="middle" fill="var(--rf-ink-3)" font-size="11" font-family="var(--vp-font-family-base, system-ui)">SPA fills the rows</text>
      </g>
    </svg>
    <figcaption class="rf-diagram__caption">
      The SPA bundle is fetched <strong>once</strong>. Only the spec + row payloads change over time — no frontend redeploy when your schema grows.
    </figcaption>
  </figure>
</template>
