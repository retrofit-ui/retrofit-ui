# Plan: Issue #127 — Inline content support for MarkdownViewSpec

## Problem summary

`MarkdownViewSpec` is architecturally inconsistent with every other spec type in the system. `TimelineSpec` embeds `events: TimelineEvent[]`, `StatSpec` embeds `stats: Stat[]`, `CalendarSpec` embeds `events: CalendarEvent[]` — the server always sends the data with the spec. `MarkdownViewSpec` stores a pointer (`entityEndpoint` + `field`) and forces the client to make a second HTTP round-trip to get the actual markdown string.

This breaks client-side use cases (streaming LLM output, client-generated content) because there is no server to call. It also breaks the server-driven UI philosophy: no other view makes a second fetch; `MarkdownView` makes two.

The reviewer comment supersedes the original proposal: **`entityEndpoint` and `field` should be removed entirely; `content` should be the only data field.**

---

## Success criteria

Before any changes:
- `MarkdownViewSpec` requires `entityEndpoint: EndpointDirective` and `field: string`
- `MarkdownViewComponent` always fires a `fetch()` regardless of available data
- `MarkdownView` (standalone route) does two fetches: spec then entity
- Blog's `/api/ui/posts/:id/render` returns a pointer spec; client fetches again
- Interactive-chat's `userMessage()` creates specs pointing to `/api/chat-messages/{id}`

After all changes:
- `MarkdownViewSpec` requires `kind: 'markdown'` and `content: string`; no fetch fields
- `MarkdownViewComponent` never touches the network; parses `spec.content` directly
- `MarkdownView` route does one fetch (the spec); renders `spec.content` from it
- Blog's render endpoint fetches the post body itself and embeds it as `content`
- Interactive-chat uses inline content; no `/api/chat-messages/:id` endpoint needed
- All existing blog markdown e2e tests pass
- New e2e tests verify inline content rendering in interactive-chat

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**What it does now:** Defines `MarkdownViewSpec` with `entityEndpoint: EndpointDirective`, `field: string`, optional `entityId?: string`, optional `metadata`.

**What to change:**

```ts
// BEFORE
export interface MarkdownViewSpec {
  kind: 'markdown';
  entityEndpoint: EndpointDirective;
  field: string;
  entityId?: string;
  metadata?: { title?: string };
}

// AFTER
export interface MarkdownViewSpec {
  kind: 'markdown';
  content: string;
  metadata?: { title?: string };
}
```

Remove `entityEndpoint`, `field`, and `entityId` entirely. They are no longer part of the spec contract. `content` is now required. `metadata` stays unchanged.

---

### 2. `packages/spa-solid-shoelace/ui/MarkdownView.tsx`

**What it does now:**
- `fetchMarkdownHtml(spec, entityId)` — fetches entity, extracts field, parses markdown
- `fetchMarkdownView(resource, id, apiBase)` — fetches spec, then calls `fetchMarkdownHtml`
- `MarkdownViewComponent` — uses `createResource` + `fetchMarkdownHtml`
- `MarkdownView` — route component that calls `fetchMarkdownView` (two fetches)

**What to change:**

**Remove** `fetchMarkdownHtml` and the entity-fetch half of `fetchMarkdownView`.

**`MarkdownViewComponent`** — eliminate `createResource` and all async fetch logic. The component receives `spec.content` and synchronously passes it through `marked.parse`. Note: `marked.parse` can return `string | Promise<string>`; use the synchronous form (no async renderer configured, so it returns `string` in practice). Keep the loading/error/render structure but without the resource signal — just render directly.

```tsx
export function MarkdownViewComponent(props: { spec: MarkdownViewSpec }) {
  // marked.parse is synchronous when no async renderer is configured
  const html = () => marked.parse(props.spec.content) as string;

  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <div class="retrofit-markdown" innerHTML={html()} />
    </div>
  );
}
```

The `entityId` prop is removed — it was only needed for the fetch. The loading skeleton and error states also go away because there is nothing async happening.

**`MarkdownView`** — route component used at `/#/{resource}/{id}/render`. Currently fetches the spec then the entity. With the new design the server embeds `content` in the spec, so this component just needs to fetch the spec and render:

```tsx
export function MarkdownView() {
  const params = useParams<{ resource: string; id: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [spec] = createResource(
    () => ({ resource: params.resource, id: params.id }),
    async ({ resource, id }) => {
      const res = await fetch(`${apiBase}/${resource}/${id}/render`);
      if (!res.ok) throw new Error(`Failed to fetch render spec for ${resource}`);
      return (await res.json()) as MarkdownViewSpec;
    },
  );

  return (
    <div class="retrofit-view">
      <Show when={spec.loading}>
        {/* skeleton */}
      </Show>
      <Show when={spec.error}>
        <p class="retrofit-error-message">Error: {String(spec.error)}</p>
      </Show>
      <Show when={spec()}>
        {(s) => (
          <div>
            <button type="button" onClick={() => navigate(`/${params.resource}/${params.id}`)} class="retrofit-back-btn">
              &larr; Back
            </button>
            <Show when={s().metadata?.title}>
              <h1 class="retrofit-page-title">{s().metadata?.title}</h1>
            </Show>
            <div class="retrofit-markdown" innerHTML={marked.parse(s().content) as string} />
          </div>
        )}
      </Show>
    </div>
  );
}
```

Keep the skeletons in `MarkdownView` (it still has a fetch); remove them from `MarkdownViewComponent` (now synchronous).

---

### 3. `packages/spa-solid-shoelace/ui/SpecRenderer.tsx`

**What it does now:** Passes `entityId={(props.spec as MarkdownViewSpec).entityId ?? ''}` to `MarkdownViewComponent`.

**What to change:** Remove the `entityId` prop from the `<MarkdownViewComponent>` call since the prop no longer exists.

```tsx
// BEFORE
<MarkdownViewComponent
  spec={props.spec as MarkdownViewSpec}
  entityId={(props.spec as MarkdownViewSpec).entityId ?? ''}
/>

// AFTER
<MarkdownViewComponent spec={props.spec as MarkdownViewSpec} />
```

---

### 4. `packages/spa-solid-shoelace/ui/PageView.tsx` (line ~788)

Same change as SpecRenderer — `entityId` prop removed from `<MarkdownViewComponent>` call:

```tsx
// BEFORE
<MarkdownViewComponent spec={s.spec} entityId={s.spec.entityId ?? ''} />

// AFTER
<MarkdownViewComponent spec={s.spec} />
```

---

### 5. `examples/js/blog/src/server.ts`

**What it does now:** The `/api/ui/posts/:id/render` handler returns a pointer spec without content. The client fetches the entity separately.

**What to change:** The handler must now look up the post and embed its `body` field as `content` in the spec. This makes the blog consistent with the new contract.

```ts
// BEFORE
app.get('/api/ui/posts/:id/render', (_req, res) => {
  res.json({
    kind: 'markdown',
    entityEndpoint: { method: 'GET', url: '/posts/{id}' },
    field: 'body',
    metadata: { title: 'Preview' },
  } satisfies MarkdownViewSpec);
});

// AFTER
app.get('/api/ui/posts/:id/render', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({
    kind: 'markdown',
    content: String(post.body ?? ''),
    metadata: { title: 'Preview' },
  } satisfies MarkdownViewSpec);
});
```

The import of `MarkdownViewSpec` from `@retrofit-ui/builder-zod` stays; its type shape has changed so `satisfies` will enforce the new contract at compile time.

---

### 6. `examples/js/interactive-chat/src/server.ts`

**What it does now:** `MESSAGES` object holds content; `/api/chat-messages/:id` serves it; `userMessage()` creates a `MarkdownViewSpec` with `entityEndpoint` pointing at that route.

**What to change:** `userMessage()` should embed the string directly as `content`. The `/api/chat-messages/:id` route is no longer needed for the `MarkdownViewSpec` path. Remove it to make the "no network fetch" property testable.

```ts
// BEFORE
function userMessage(id: string): ViewSpec {
  const spec: MarkdownViewSpec = {
    kind: 'markdown',
    entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
    field: 'text',
    entityId: id,
  };
  return new CardViewBuilder()
    .header('You')
    .add({ kind: 'markdown', spec })
    .footer(DOWNLOAD_FOOTER)
    .build();
}

// AFTER
function userMessage(id: string): ViewSpec {
  const text = MESSAGES[id] ?? '';
  const spec: MarkdownViewSpec = {
    kind: 'markdown',
    content: text,
  };
  return new CardViewBuilder()
    .header('You')
    .add({ kind: 'markdown', spec })
    .footer(DOWNLOAD_FOOTER)
    .build();
}
```

Remove the `MESSAGES` object's usage via the API endpoint. Remove the `app.get('/api/chat-messages/:id', ...)` handler entirely (the endpoint served no purpose other than satisfying the old `entityEndpoint` pattern).

---

### 7. `packages/core/src/types/__tests__/resource-spec.test.ts`

Add a new `describe('MarkdownViewSpec', ...)` block:

```ts
describe('MarkdownViewSpec', () => {
  it('minimal spec requires only kind and content', () => {
    const spec: MarkdownViewSpec = { kind: 'markdown', content: '# Hello' };
    expect(spec.content).toBe('# Hello');
  });

  it('metadata.title is optional', () => {
    const spec: MarkdownViewSpec = {
      kind: 'markdown',
      content: 'text',
      metadata: { title: 'My Doc' },
    };
    expect(spec.metadata?.title).toBe('My Doc');
  });

  it('metadata is optional', () => {
    const spec: MarkdownViewSpec = { kind: 'markdown', content: '' };
    expect(spec.metadata).toBeUndefined();
  });
});
```

---

### 8. `examples/js/interactive-chat/e2e/chat.spec.ts`

Add a new `test.describe` block for inline content behaviour. The interactive-chat example is the right target because after the server change there is no `/api/chat-messages/:id` endpoint — any attempt to fetch would 404. Tests confirming correct render prove the inline path works.

```ts
test.describe('Inline markdown content — no entity fetch', () => {
  test('user messages render without any /api/chat-messages requests', async ({
    page,
  }) => {
    const fetchedMessageUrls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/chat-messages')) {
        fetchedMessageUrls.push(req.url());
      }
    });
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    expect(fetchedMessageUrls).toHaveLength(0);
  });

  test('bold markdown in user message renders as <strong> element', async ({
    page,
  }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    // First message: 'What does my schedule look like for **today**?'
    const first = page.locator('.retrofit-markdown').first();
    await expect(first.locator('strong')).toBeVisible();
  });

  test('inline content renders immediately without loading skeleton', async ({
    page,
  }) => {
    await page.goto(CHAT_URL);
    // MarkdownViewComponent is now synchronous — no skeleton phase
    // Verify markdown is present without needing to wait for a network response
    await page.waitForSelector('.retrofit-markdown');
    // Confirm no skeleton elements are present alongside the markdown
    const skeletons = page.locator('.retrofit-markdown ~ sl-skeleton');
    await expect(skeletons).toHaveCount(0);
  });
});
```

Also update the three existing `'renders all three user messages as markdown'` / `'first user message contains schedule question'` etc. tests — they should still pass unchanged because the rendered output is the same; just verify they still pass after the change.

---

## Key implementation decisions

### Remove rather than deprecate

`entityEndpoint`, `field`, and `entityId` are removed outright. No optional deprecation shim. The type change is breaking but intentional — TypeScript will catch all callsites at compile time, and the set of callsites is small and fully within this monorepo.

### `marked.parse` is synchronous here

`marked.parse(str)` returns `string | Promise<string>`. Without an async renderer configured (this codebase uses default `marked` settings), it always returns `string` synchronously. The cast `as string` is safe. If the project ever adds an async renderer plugin, this will need to revisit `createResource`.

### Loading skeleton stays in `MarkdownView`, not `MarkdownViewComponent`

`MarkdownView` (the standalone route) still fetches a spec over the network, so it keeps skeletons and error states. `MarkdownViewComponent` (used by `SpecRenderer` and `PageView`) is now fully synchronous — no loading state, no error state from fetch. If `content` is an empty string, it renders an empty div (valid).

### Server does the data join, not the client

The blog's render endpoint now joins the spec and the post body before responding. This is consistent with `TimelineSpec` (server joins timeline events) and `StatSpec` (server computes stats). The client is kept dumb.

### `/api/chat-messages/:id` route removal

Removing it is intentional — it proves the inline path works, since a failing test would show if `MarkdownViewComponent` still tried to fetch it. If the route is kept for other purposes (e.g., a download endpoint), the test should still capture zero fetch calls to that path during page load.

---

## Edge cases

| Case | Handling |
|------|----------|
| `content: ''` | `marked.parse('')` returns `''`; renders empty `.retrofit-markdown` div. No crash. |
| `content` with HTML/XSS | `marked` does not sanitize raw HTML by default. Existing behaviour is unchanged here — the component already used `innerHTML`. Not in scope for this issue but worth a follow-up note. |
| `metadata` absent | Already optional; `Show when={props.spec.metadata?.title}` handles undefined cleanly. |
| Very long content strings | No change — already rendered via `innerHTML`. Performance is a browser concern. |
| Blog post with no body | `String(post.body ?? '')` coerces `null`/`undefined` to empty string. |

---

## Order of implementation

1. `packages/core/src/types/resource-spec.ts` — type change first; TypeScript errors surface all downstream callsites immediately
2. `packages/core/src/types/__tests__/resource-spec.test.ts` — add new unit tests
3. `packages/spa-solid-shoelace/ui/MarkdownView.tsx` — fix component and route
4. `packages/spa-solid-shoelace/ui/SpecRenderer.tsx` — remove `entityId` prop
5. `packages/spa-solid-shoelace/ui/PageView.tsx` — remove `entityId` prop
6. `examples/js/blog/src/server.ts` — embed post body in render spec
7. `examples/js/interactive-chat/src/server.ts` — embed message content directly
8. `examples/js/interactive-chat/e2e/chat.spec.ts` — add new inline content tests
9. Run `pnpm typecheck` and `pnpm test` across all packages; run both example e2e suites

The type change in step 1 will cause compile errors in steps 3–7 — this is the desired forcing function to catch every callsite.
