import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/reviews';
const NEW_URL = '/#/reviews/new';

test.beforeEach(async ({ request }) => {
  await request.post('/test/reset-reviews');
});

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

async function getRatingValue(
  page: import('@playwright/test').Page,
): Promise<number> {
  return page
    .locator('sl-rating')
    .evaluate((el) => (el as HTMLElement & { value: number }).value);
}

async function setRatingValue(
  page: import('@playwright/test').Page,
  value: number,
): Promise<void> {
  await page.locator('sl-rating').evaluate((el, v) => {
    const rating = el as HTMLElement & { value: number };
    rating.value = v;
    el.dispatchEvent(
      new CustomEvent('sl-change', { bubbles: true, composed: true }),
    );
  }, value);
}

test.describe('Reviews table view', () => {
  test('renders empty reviews table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Rating' }),
    ).toBeVisible();
  });

  test('clicking New navigates to new review form', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForForm(page);
  });
});

test.describe('Reviews rating field', () => {
  test('new review form renders sl-rating with default max of 5', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);
    const rating = page.locator('sl-rating');
    await expect(rating).toBeVisible();
    const max = await rating.evaluate((el) => el.getAttribute('max'));
    expect(max).toBe('5');
  });

  test('can create a review with a star rating', async ({ page, request }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Title *' }).fill('Great Product');
    await page
      .getByRole('textbox', { name: 'Body *' })
      .fill('Really enjoyed using this.');
    await setRatingValue(page, 3);

    await page.locator('sl-button[type="submit"]').click();
    await expect(
      page.locator('sl-alert').filter({ hasText: 'Created successfully' }),
    ).toBeVisible();
    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('Great Product')).toBeVisible();

    // Verify the stored rating is a number, not a string
    const reviewsRes = await request.get('/reviews');
    const reviewsData = (await reviewsRes.json()) as {
      id: number;
      title: string;
      rating: unknown;
    }[];
    const created = reviewsData.find((r) => r.title === 'Great Product');
    expect(typeof created?.rating).toBe('number');
    expect(created?.rating).toBe(3);
  });

  test('rating value is pre-filled when editing a review', async ({
    page,
    request,
  }) => {
    // Create a review directly via API
    await request.post('/reviews', {
      data: { title: 'Test Review', body: 'Some body.', rating: 4 },
    });

    const reviewsRes = await request.get('/reviews');
    const reviewsData = (await reviewsRes.json()) as { id: number }[];
    const reviewId = reviewsData[0]?.id;

    await page.goto(`/#/reviews/${String(reviewId)}`);
    await waitForForm(page);

    const value = await getRatingValue(page);
    expect(value).toBe(4);
  });

  test('can update a review rating and it persists', async ({
    page,
    request,
  }) => {
    // Create a review directly via API
    await request.post('/reviews', {
      data: { title: 'Editable Review', body: 'Body text.', rating: 2 },
    });

    const reviewsRes = await request.get('/reviews');
    const reviewsData = (await reviewsRes.json()) as { id: number }[];
    const reviewId = reviewsData[0]?.id;

    await page.goto(`/#/reviews/${String(reviewId)}`);
    await waitForForm(page);

    // Update rating to 5
    await setRatingValue(page, 5);
    await page.locator('sl-button[type="submit"]').click();
    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();

    // Re-open and verify the updated rating persists
    await page.goto(`/#/reviews/${String(reviewId)}`);
    await waitForForm(page);
    const updated = await getRatingValue(page);
    expect(updated).toBe(5);
  });
});
