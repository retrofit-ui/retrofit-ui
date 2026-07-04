<!--
  Contract diagram used on /guide/design-philosophy.
  Two producers (left) feed a central spec JSON; one renderer (right)
  consumes it. Foundation bar underneath is @retrofit-ui/core, the shared
  type contract. Producers and renderer never talk directly.
-->
<template>
  <figure class="rf-diagram">
    <svg viewBox="0 0 820 380" role="img" aria-labelledby="rf-contract-title rf-contract-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="rf-contract-title">The spec is the contract</title>
      <desc id="rf-contract-desc">Producers on the left (builder-zod and builder-java) and a renderer on the right (spa-solid-shoelace) both meet at a central spec JSON, which sits on top of the @retrofit-ui/core foundation. Producers never talk directly to the renderer.</desc>
      <defs>
        <marker id="rf-arrow-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      <g font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="13">
        <g transform="translate(40,50)">
          <rect width="200" height="60" rx="10" fill="var(--rf-teal)" opacity="0.15" />
          <rect width="200" height="60" rx="10" fill="none" stroke="var(--rf-teal)" stroke-width="1.5" />
          <text x="100" y="30" text-anchor="middle" fill="var(--rf-ink)" font-weight="600">@retrofit-ui/builder-zod</text>
          <text x="100" y="48" text-anchor="middle" fill="var(--rf-ink-3)" font-size="11" font-family="var(--vp-font-family-base, system-ui)">TypeScript / Node</text>
        </g>
        <g transform="translate(40,150)">
          <rect width="200" height="60" rx="10" fill="var(--rf-teal)" opacity="0.15" />
          <rect width="200" height="60" rx="10" fill="none" stroke="var(--rf-teal)" stroke-width="1.5" />
          <text x="100" y="30" text-anchor="middle" fill="var(--rf-ink)" font-weight="600">builder-java</text>
          <text x="100" y="48" text-anchor="middle" fill="var(--rf-ink-3)" font-size="11" font-family="var(--vp-font-family-base, system-ui)">Spring Boot</text>
        </g>
      </g>
      <g font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="13">
        <g transform="translate(580,100)">
          <rect width="200" height="60" rx="10" fill="var(--rf-purple)" opacity="0.15" />
          <rect width="200" height="60" rx="10" fill="none" stroke="var(--rf-purple)" stroke-width="1.5" />
          <text x="100" y="30" text-anchor="middle" fill="var(--rf-ink)" font-weight="600">spa-solid-shoelace</text>
          <text x="100" y="48" text-anchor="middle" fill="var(--rf-ink-3)" font-size="11" font-family="var(--vp-font-family-base, system-ui)">browser SPA</text>
        </g>
      </g>
      <g transform="translate(340,90)">
        <rect width="140" height="70" rx="35" fill="var(--rf-orange)" opacity="0.18" />
        <rect width="140" height="70" rx="35" fill="none" stroke="var(--rf-orange)" stroke-width="2" />
        <text x="70" y="34" text-anchor="middle" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="16" font-weight="700">spec</text>
        <text x="70" y="54" text-anchor="middle" fill="var(--rf-ink-2)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="12">JSON</text>
      </g>
      <g>
        <line x1="240" y1="80" x2="336" y2="112" stroke="var(--rf-teal)" stroke-width="2" marker-end="url(#rf-arrow-c)" color="var(--rf-teal)" />
        <line x1="240" y1="180" x2="336" y2="140" stroke="var(--rf-teal)" stroke-width="2" marker-end="url(#rf-arrow-c)" color="var(--rf-teal)" />
        <text x="288" y="86" text-anchor="middle" fill="var(--rf-teal)" font-size="11" font-family="var(--vp-font-family-base, system-ui)" font-weight="600">produce</text>
        <text x="288" y="172" text-anchor="middle" fill="var(--rf-teal)" font-size="11" font-family="var(--vp-font-family-base, system-ui)" font-weight="600">produce</text>
      </g>
      <g>
        <line x1="484" y1="125" x2="576" y2="128" stroke="var(--rf-purple)" stroke-width="2" marker-end="url(#rf-arrow-c)" color="var(--rf-purple)" />
        <text x="530" y="118" text-anchor="middle" fill="var(--rf-purple)" font-size="11" font-family="var(--vp-font-family-base, system-ui)" font-weight="600">reconcile → DOM</text>
      </g>
      <g transform="translate(40,260)">
        <rect width="740" height="56" rx="10" fill="var(--rf-blue)" opacity="0.12" />
        <rect width="740" height="56" rx="10" fill="none" stroke="var(--rf-blue)" stroke-width="1.5" />
        <text x="370" y="28" text-anchor="middle" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="14" font-weight="700">@retrofit-ui/core</text>
        <text x="370" y="46" text-anchor="middle" fill="var(--rf-ink-2)" font-family="var(--vp-font-family-base, system-ui)" font-size="11">the contract — spec types and validators every side agrees on</text>
      </g>
      <line x1="410" y1="160" x2="410" y2="260" stroke="var(--rf-blue)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7" />
      <text x="410" y="345" text-anchor="middle" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="12" font-style="italic">Producers and renderer never talk directly — only through the spec.</text>
    </svg>
    <figcaption class="rf-diagram__caption">
      A Python or Go builder would slot into the left-hand side and get the same UI — as long as it emits <code>@retrofit-ui/core</code>-shaped specs.
    </figcaption>
  </figure>
</template>
