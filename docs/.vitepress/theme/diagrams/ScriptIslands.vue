<!--
  Script-islands illustration used on /guide/script-islands.
  Left: a mock host HTML page with its own header/sidebar/footer and one
  data-retrofit-src div highlighted. Right: a callout listing the three
  init() steps (scan, fetch, mount).
-->
<template>
  <figure class="rf-diagram">
    <svg viewBox="0 0 820 440" role="img" aria-labelledby="rf-islands-title rf-islands-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="rf-islands-title">Script islands — the renderer mounts into annotated div elements</title>
      <desc id="rf-islands-desc">A host HTML page owns its own header, sidebar, and footer. Only the middle content region has a data-retrofit-src attribute; the renderer scans, fetches that spec, and mounts a retrofit-ui view inside just that div. Everything else on the page stays as the host wrote it.</desc>
      <defs>
        <marker id="rf-i-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      <g transform="translate(40,40)">
        <rect width="480" height="360" rx="10" fill="var(--vp-c-bg)" stroke="var(--rf-panel-border)" stroke-width="1.5" />
        <g transform="translate(14,14)">
          <circle cx="0" cy="0" r="4" fill="var(--rf-red)" opacity="0.6" />
          <circle cx="14" cy="0" r="4" fill="var(--rf-orange)" opacity="0.6" />
          <circle cx="28" cy="0" r="4" fill="var(--rf-teal)" opacity="0.6" />
        </g>
        <text x="240" y="18" text-anchor="middle" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="11">yourapp.com/dashboard</text>
        <line x1="0" y1="34" x2="480" y2="34" stroke="var(--rf-panel-border)" stroke-width="1" />
        <g transform="translate(20,50)">
          <rect width="440" height="42" rx="6" fill="var(--rf-ink-3)" opacity="0.08" />
          <text x="14" y="26" fill="var(--rf-ink-2)" font-family="var(--vp-font-family-base, system-ui)" font-size="12" font-weight="600">Your app · nav / login / etc.</text>
        </g>
        <g transform="translate(20,108)">
          <rect width="100" height="200" rx="6" fill="var(--rf-ink-3)" opacity="0.08" />
          <text x="50" y="24" text-anchor="middle" fill="var(--rf-ink-2)" font-family="var(--vp-font-family-base, system-ui)" font-size="11" font-weight="600">Sidebar</text>
          <text x="50" y="44" text-anchor="middle" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="10">Your links</text>
        </g>
        <g transform="translate(136,108)">
          <rect width="324" height="200" rx="8" fill="var(--rf-orange)" opacity="0.10" />
          <rect width="324" height="200" rx="8" fill="none" stroke="var(--rf-orange)" stroke-width="2" stroke-dasharray="6 4" />
          <text x="12" y="22" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="11">
            &lt;div data-retrofit-src=<tspan fill="var(--rf-orange)" font-weight="600">"/api/ui/todos"</tspan>&gt;
          </text>
          <g transform="translate(20,42)" font-family="var(--vp-font-family-base, system-ui)">
            <rect width="284" height="142" rx="4" fill="var(--vp-c-bg)" stroke="var(--rf-panel-border)" />
            <rect x="0" y="0" width="284" height="24" rx="4" fill="var(--rf-orange)" opacity="0.15" />
            <text x="14" y="16" fill="var(--rf-ink)" font-size="10" font-weight="600">Title</text>
            <text x="130" y="16" fill="var(--rf-ink)" font-size="10" font-weight="600">Priority</text>
            <text x="210" y="16" fill="var(--rf-ink)" font-size="10" font-weight="600">Done</text>
            <g fill="var(--rf-ink-2)" font-size="10">
              <line x1="0" y1="24" x2="284" y2="24" stroke="var(--rf-panel-border)" />
              <text x="14" y="42">Buy groceries</text>
              <text x="130" y="42">high</text>
              <text x="210" y="42">—</text>
              <line x1="0" y1="52" x2="284" y2="52" stroke="var(--rf-panel-border)" opacity="0.4" />
              <text x="14" y="70">Walk the dog</text>
              <text x="130" y="70">low</text>
              <text x="210" y="70">✓</text>
              <line x1="0" y1="80" x2="284" y2="80" stroke="var(--rf-panel-border)" opacity="0.4" />
              <text x="14" y="98">Read a book</text>
              <text x="130" y="98">medium</text>
              <text x="210" y="98">—</text>
              <line x1="0" y1="108" x2="284" y2="108" stroke="var(--rf-panel-border)" opacity="0.4" />
              <text x="14" y="126">…</text>
            </g>
          </g>
          <text x="12" y="194" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="11">&lt;/div&gt;</text>
        </g>
        <g transform="translate(20,324)">
          <rect width="440" height="24" rx="4" fill="var(--rf-ink-3)" opacity="0.08" />
          <text x="14" y="16" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="10">Your footer</text>
        </g>
      </g>
      <g transform="translate(580,90)">
        <rect width="200" height="260" rx="10" fill="var(--rf-purple)" opacity="0.12" />
        <rect width="200" height="260" rx="10" fill="none" stroke="var(--rf-purple)" stroke-width="1.5" />
        <text x="100" y="30" text-anchor="middle" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="13" font-weight="700">init()</text>
        <text x="100" y="48" text-anchor="middle" fill="var(--rf-ink-3)" font-family="var(--vp-font-family-base, system-ui)" font-size="11">the renderer</text>
        <line x1="20" y1="66" x2="180" y2="66" stroke="var(--rf-purple)" stroke-width="1" opacity="0.4" />
        <g font-family="var(--vp-font-family-base, system-ui)" font-size="11" fill="var(--rf-ink-2)">
          <text x="14" y="90">
            <tspan fill="var(--rf-purple)" font-weight="700">1.</tspan> Scan the DOM for
          </text>
          <text x="14" y="108" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="10">   data-retrofit-src</text>
          <text x="14" y="140">
            <tspan fill="var(--rf-purple)" font-weight="700">2.</tspan> Fetch the spec
          </text>
          <text x="14" y="158" fill="var(--rf-ink)" font-family="var(--vp-font-family-mono, ui-monospace, monospace)" font-size="10">   from that URL</text>
          <text x="14" y="190">
            <tspan fill="var(--rf-purple)" font-weight="700">3.</tspan> Mount the view
          </text>
          <text x="14" y="208" fill="var(--rf-ink)" font-family="var(--vp-font-family-base, system-ui)" font-size="10">   inside the &lt;div&gt;</text>
          <text x="14" y="240" fill="var(--rf-ink-3)" font-style="italic">Nothing else on your</text>
          <text x="14" y="256" fill="var(--rf-ink-3)" font-style="italic">page is touched.</text>
        </g>
      </g>
      <path d="M 580 200 Q 540 190 490 200" fill="none" stroke="var(--rf-purple)" stroke-width="2" marker-end="url(#rf-i-arrow)" color="var(--rf-purple)" />
      <text x="530" y="188" text-anchor="middle" fill="var(--rf-purple)" font-family="var(--vp-font-family-base, system-ui)" font-size="11" font-weight="600">mounts here</text>
    </svg>
    <figcaption class="rf-diagram__caption">
      You own the header, sidebar, and footer. retrofit-ui takes over one specific <code>&lt;div&gt;</code> — as many as you want on a page, each independently.
    </figcaption>
  </figure>
</template>
