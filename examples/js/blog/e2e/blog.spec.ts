import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/posts';
const NEW_URL = '/#/posts/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Blog table view', () => {
  test('renders table with post data and Preview buttons', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Status' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Author' }),
    ).toBeVisible();

    await expect(
      page.getByText('Getting Started with Retrofit UI'),
    ).toBeVisible();

    const firstRow = page.locator('tbody tr').first();
    await expect(
      firstRow.locator('sl-button').filter({ hasText: 'Preview' }),
    ).toBeVisible();
  });

  test('table header has deep fuchsia background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(112, 26, 117)');
  });

  test('clicking New navigates to new post form', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForForm(page);
  });

  test('clicking a row navigates to edit form', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/posts\/\d+/);
    await waitForForm(page);
  });
});

test.describe('Blog edit form', () => {
  test('has a large markdown textarea for the body field', async ({ page }) => {
    await page.goto('/#/posts/1');
    await waitForForm(page);
    await expect(
      page.getByRole('heading', { name: 'Edit Post' }),
    ).toBeVisible();
    const bodyTextarea = page
      .locator('sl-textarea')
      .filter({ hasText: 'Body' });
    await expect(bodyTextarea).toBeVisible();
  });

  test('can create a new post', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);
    await page.getByRole('textbox', { name: 'Title *' }).fill('E2E Test Post');
    await page.getByRole('textbox', { name: 'Slug *' }).fill('e2e-test-post');
    await page
      .getByRole('textbox', { name: 'Body *' })
      .fill('# Hello\n\nTest.');
    await page.locator('sl-select').click();
    await page.locator('sl-option[value="draft"]').click();
    await page.locator('sl-button[type="submit"]').click();
    await expect(
      page.locator('sl-alert').filter({ hasText: 'Created successfully' }),
    ).toBeVisible();
    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('E2E Test Post')).toBeVisible();
  });

  test('can edit a post and save', async ({ page }) => {
    await page.goto('/#/posts/1');
    await waitForForm(page);
    await page
      .getByRole('textbox', { name: 'Title *' })
      .fill('Updated Post Title');
    await page.locator('sl-button[type="submit"]').click();
    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();
    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('Updated Post Title')).toBeVisible();
  });

  test('Delete button removes the post', async ({ page }) => {
    await page.goto('/#/posts/3');
    await waitForForm(page);
    await page.locator('sl-button[variant="danger"]').click();
    await page.locator('sl-button[slot="footer"][variant="danger"]').click();
    await expect(
      page.locator('sl-alert').filter({ hasText: 'Deleted successfully' }),
    ).toBeVisible();
    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('Building Forms with Zod')).toHaveCount(0);
  });
});

test.describe('Blog markdown render view', () => {
  test('Preview button navigates to render view', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('sl-button').filter({ hasText: 'Preview' }).click();
    await page.waitForURL(/\/posts\/\d+\/render/);
  });

  test('render view shows formatted markdown content', async ({ page }) => {
    await page.goto('/#/posts/1/render');
    await page.waitForSelector('.retrofit-markdown');
    const markdown = page.locator('.retrofit-markdown');
    await expect(markdown).toBeVisible();
    const hasParagraph = await markdown.locator('p').count();
    expect(hasParagraph).toBeGreaterThan(0);
  });

  test('render view has a Back button that returns to the edit form', async ({
    page,
  }) => {
    await page.goto('/#/posts/1/render');
    await page.waitForSelector('.retrofit-markdown');
    await page.locator('.retrofit-back-btn').click();
    await page.waitForURL(/\/posts\/1$/);
    await waitForForm(page);
  });
});
