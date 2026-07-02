import { expect, test } from '@playwright/test';

test.describe('Built-in stat view (delegated through ExtendedRenderer)', () => {
  test('is selected by default and renders stats from the API', async ({
    page,
  }) => {
    await page.goto('/');

    // Title from the spec's metadata renders using the built-in class.
    await expect(
      page.locator('.retrofit-page-title', { hasText: 'Built-in stat view' }),
    ).toBeVisible();

    // Both stat cards render with formatted values + labels.
    await expect(page.getByText('Reviews')).toBeVisible();
    await expect(page.getByText('Average score')).toBeVisible();
    await expect(page.locator('.retrofit-stat-value', { hasText: '128' })).toBeVisible();
    await expect(page.locator('.retrofit-stat-value', { hasText: '4.35' })).toBeVisible();

    // Custom kind hasn't rendered yet.
    await expect(page.getByText('Product ratings')).toHaveCount(0);
  });
});

test.describe('Custom rating view (handled by ExtendedRenderer)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Custom: rating view' }).click();
  });

  test('renders the title from spec.metadata', async ({ page }) => {
    await expect(
      page.locator('.retrofit-page-title', { hasText: 'Product ratings' }),
    ).toBeVisible();
  });

  test('renders one row per item', async ({ page }) => {
    const rows = page.locator('.retrofit-view li');
    await expect(rows).toHaveCount(4);
  });

  test('renders labels, notes, and star glyphs from the spec', async ({
    page,
  }) => {
    const aeropress = page.locator('.retrofit-view li', {
      hasText: 'Aeropress',
    });
    await expect(aeropress).toContainText('Reliable, easy to clean.');
    // 4.5 stars → 4 full + half glyph
    await expect(aeropress).toContainText('★★★★½');

    const french = page.locator('.retrofit-view li', {
      hasText: 'French press',
    });
    await expect(french).toContainText('Silty.');
    // 3 stars → 3 full + 2 empty
    await expect(french).toContainText('★★★☆☆');
  });

  test('exposes accessible score label for screen readers', async ({
    page,
  }) => {
    const aeropressStars = page
      .locator('.retrofit-view li', { hasText: 'Aeropress' })
      .locator('[aria-label]');
    await expect(aeropressStars).toHaveAttribute(
      'aria-label',
      '4.5 out of 5',
    );
  });

  test('items without a note render only label + stars', async ({ page }) => {
    const moka = page.locator('.retrofit-view li', { hasText: 'Moka pot' });
    await expect(moka).toContainText('★★★½');
    // No stray dash / note text
    await expect(moka).not.toContainText('Silty');
  });
});

test.describe('Renderer composition', () => {
  test('switching between built-in and custom kinds reuses the same host', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.locator('.retrofit-page-title', { hasText: 'Built-in stat view' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Custom: rating view' }).click();
    await expect(
      page.locator('.retrofit-page-title', { hasText: 'Product ratings' }),
    ).toBeVisible();
    await expect(page.getByText('Built-in stat view')).toHaveCount(0);

    await page.getByRole('button', { name: 'Built-in: stat view' }).click();
    await expect(
      page.locator('.retrofit-page-title', { hasText: 'Built-in stat view' }),
    ).toBeVisible();
    await expect(page.getByText('Product ratings')).toHaveCount(0);
  });

  test('server returns kind: "rating" for the custom endpoint', async ({
    request,
  }) => {
    const res = await request.get('/api/product-ratings');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.kind).toBe('rating');
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(4);
  });
});

// ── Theming: one theme, both surfaces ────────────────────────────────────────
// The theme lives in /retrofit.json (see src/server.ts). At boot the client
// writes cssVariables to :root and appends extraCss as a <style>. These tests
// prove that a single theme reaches both the built-in stat view AND the
// custom rating view — without the two conflicting.

const PRIMARY_600 = 'rgb(124, 58, 237)'; // #7c3aed — violet-600
const PRIMARY_700 = 'rgb(109, 40, 217)'; // #6d28d9 — violet-700

test.describe('Theming', () => {
  test('theme CSS variables are applied at :root', async ({ page }) => {
    await page.goto('/');

    const primary700 = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sl-color-primary-700')
        .trim(),
    );
    expect(primary700).toBe('#6d28d9');
  });

  test('theme extraCss is injected as a <style> tag', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('style[data-retrofit-theme]')).toBeAttached();
  });

  test('retrofit renderer.css is loaded (built-in classes have real styles)', async ({
    page,
  }) => {
    await page.goto('/');

    // A retrofit-* class with no author styles would fall back to defaults.
    // The stat card has a token-driven padding — assert it's non-zero.
    const padding = await page
      .locator('.retrofit-stat-card')
      .first()
      .evaluate((el) => getComputedStyle(el).padding);
    expect(padding).not.toBe('0px');
  });

  test('built-in stat view picks up the theme (title + value both violet-700)', async ({
    page,
  }) => {
    await page.goto('/');

    const titleColor = await page
      .locator('.retrofit-page-title')
      .evaluate((el) => getComputedStyle(el).color);
    expect(titleColor).toBe(PRIMARY_700);

    const valueColor = await page
      .locator('.retrofit-stat-value')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(valueColor).toBe(PRIMARY_700);
  });

  test('custom rating view picks up the SAME theme', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Custom: rating view' }).click();

    // Wait for the rating title to render — createResource swaps the spec
    // asynchronously, so the previous view's title can still be on-screen for
    // a tick after the click.
    const title = page.locator('.retrofit-page-title', {
      hasText: 'Product ratings',
    });
    await expect(title).toBeVisible();

    // Same class the built-in views use, same computed colour. This is the
    // proof that the theme flows through both surfaces without conflict.
    const titleColor = await title.evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(titleColor).toBe(PRIMARY_700);

    // Custom-namespaced class, still driven by the primary token.
    const filledStarColor = await page
      .locator('.custom-rating-star--filled')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(filledStarColor).toBe(PRIMARY_600);
  });

  test('custom classes are namespaced away from retrofit-* (no collision)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Custom: rating view' }).click();

    // The custom view uses its own `custom-rating-*` prefix. Assert that
    // nothing on the page is styled as both — a hypothetical `.retrofit-rating-*`
    // class should not exist.
    const overlap = await page.evaluate(() => {
      const els = document.querySelectorAll('[class]');
      let hits = 0;
      els.forEach((el) => {
        const classes = el.className.toString();
        if (/\bretrofit-rating-/.test(classes)) hits++;
      });
      return hits;
    });
    expect(overlap).toBe(0);

    // And the reverse: our custom-rating-* classes never end up on a built-in
    // retrofit-view container (would signal a copy-paste theming mistake).
    const wrongStars = await page
      .locator('.retrofit-stat-card .custom-rating-star--filled')
      .count();
    expect(wrongStars).toBe(0);
  });

  test('empty stars use a neutral token, not the primary colour', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Custom: rating view' }).click();

    // French press has 3 filled + 2 empty. Assert the empty one is NOT primary.
    const emptyColor = await page
      .locator('.custom-rating-star--empty')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(emptyColor).not.toBe(PRIMARY_600);
    expect(emptyColor).not.toBe(PRIMARY_700);
  });
});
