# Three-Tier Spec Model Documentation — Issue #110

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `## Decision: three-tier spec model` section to `docs/guide/design-philosophy.md` that names and explains the three tiers (Components, Layouts, Higher-order components) and clarifies that tiers are a backend authoring concept only.

**Architecture:** Append a single new `##` section after the four existing Decision sections in `docs/guide/design-philosophy.md`. No code changes; no new files beyond the plan itself.

**Tech Stack:** Markdown, VitePress (`vitepress build` for verification)

## Global Constraints

- Section heading must be: `## Decision: three-tier spec model` (exact casing and punctuation, matching the four existing `## Decision:` headings)
- Three tiers in order: Components → Layouts → Higher-order components
- Layouts subsection must name `flex` and `grid` as examples and show the nesting example `flex > grid > flex`
- Higher-order components subsection must name `PageSpec` and `TableFormWorkflowBundle` with their specific roles
- Closing note must state: the renderer dispatches on `kind` identically for all three tiers; tiers are a backend authoring concept, not a runtime concern
- Do not modify any existing section; append only

---

## Files to change

### `docs/guide/design-philosophy.md`

**What this file currently does:**
- States the design goal (decoupled backend/frontend via a compact contract)
- Decision 1: The spec is the contract (`@retrofit-ui/core` as the shared JSON shape)
- Decision 2: Two implementations, one contract (builder vs renderer)
- Decision 3: What stays on the frontend (events, style, element selection)
- Decision 4: Fully populated server responses
- Decision 5: Server-side display formatting
- Decision 6: The spec renderer as a generalization of server-driven rendering

**Change:** Append one new `## Decision:` section at the end of the file.

**What must remain true after the change:**
- All six existing sections are unchanged (content, heading, callouts, code blocks, image placeholders)
- The new section follows the file's rhetorical conventions: prose rationale, short examples or lists, an explanatory closing note
- The docs site builds without error

---

## Task 1: Add `## Decision: three-tier spec model` to design-philosophy.md

**Files:**
- Modify: `docs/guide/design-philosophy.md` (append after line 137 — the current end of file)

**Interfaces:**
- Consumes: nothing (standalone doc append)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Confirm current end of file**

Read `docs/guide/design-philosophy.md` and verify the last line is the closing `>` of the open-problem callout inside the "spec renderer as a generalization" section. The section ends with:

```markdown
> *The function and event-handler action bindings are a work in progress. Today all actions are `EndpointDirective` (HTTP). The generalization described here is the intended direction.*
```

- [ ] **Step 2: Append the new section**

Append the following block to the end of `docs/guide/design-philosophy.md` (after a blank line following the existing content):

```markdown
## Decision: three-tier spec model

Specs fall into three tiers based on how much they coordinate with other specs. The tiers are a backend authoring concept — a way to reason about what you are declaring — not a runtime distinction.

### Components

A component spec is the atomic unit: one spec, one route, one rendered view. `TableSpec`, `FormSpec`, `TimelineSpec`, `StatSpec` are all components. The backend declares it; the renderer mounts it. Nothing else is involved.

### Layouts

Layouts (`flex`, `grid`) are composable containers that carry only positional intent. They have no data, no endpoints, and no `kind` of their own that maps to a business-domain view. Their only job is to arrange what is placed inside them.

Layouts are arbitrarily nestable: `flex > grid > flex` is valid. The renderer does not need to know what is inside a layout to render it — it just allocates space and recurses.

### Higher-order components

Higher-order components are orchestrators: named specs that compose layouts and component specs into a larger, reusable unit.

- **`PageSpec`** composes layouts and component specs into a named page. A single `PageSpec` can place a stat bar, a table, and a filter form in a grid — the backend declares the arrangement once; the renderer mounts the whole page from one spec.
- **`TableFormWorkflowBundle`** pairs a `TableSpec` and a `FormSpec` for a CRUD route pair. The bundle coordinates the two specs so that selecting a table row populates the form, and submitting the form refreshes the table — behavior that would otherwise require repetitive boilerplate wiring.

### The runtime view

The renderer dispatches on `kind` identically for all three tiers. A `TableSpec` component and a `PageSpec` higher-order component are both just specs with a `kind` field; the renderer does not consult a tier label. Tiers are a vocabulary for backend authors, not a runtime concern.
```

- [ ] **Step 3: Verify the file ends correctly**

Read the last 30 lines of `docs/guide/design-philosophy.md` and confirm:
- The new `## Decision: three-tier spec model` heading is present
- All three subsections (`### Components`, `### Layouts`, `### Higher-order components`) are present
- The closing "The runtime view" subsection is present and mentions `kind` dispatch
- The six existing Decision sections are untouched (spot-check the heading of each)

- [ ] **Step 4: Build the docs to verify no VitePress errors**

Run from the repo root:

```bash
pnpm --filter @retrofit-ui/docs build
```

Expected: build completes with no errors. VitePress will warn on broken internal links — confirm no new warnings related to `design-philosophy.md`.

- [ ] **Step 5: Commit**

```bash
git add docs/guide/design-philosophy.md
git commit -m "docs: add three-tier spec model design decision to design-philosophy.md"
```

---

## Edge cases

| Edge case | How to handle |
|-----------|---------------|
| `flex` and `grid` may not yet be fully implemented as layout kinds | The doc describes design intent, consistent with the existing open-problem callouts in the file. No implementation hedge needed beyond what the section already implies. |
| `TableFormWorkflowBundle` naming may evolve | Use the name exactly as stated in the issue spec. If it changes, that is a follow-up doc edit. |
| VitePress link checker warns on `#decision-three-tier-spec-model` if someone links to it | No internal links to this section exist yet; no action needed. |
| File ends without a trailing newline | Ensure the appended content ends with a single newline to keep the file clean for diffs. |

---

## Tests to write

This is a pure documentation change. There is no application logic to unit-test or integration-test.

**Verification instead of tests:**

- [ ] `pnpm --filter @retrofit-ui/docs build` passes without errors (Step 4 above)
- [ ] Manual spot-read of the rendered section in the VitePress dev server confirms the three tiers render with correct heading hierarchy (`##` → `###`) and no broken formatting

No new test files are required.
