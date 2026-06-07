import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/posts';
const NEW_URL = '/#/posts/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Blog posts table view', () => {
  test('renders table with heading, column headers, seed data, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();

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
    await expect(page.getByText('Why Server-Driven UI Matters')).toBeVisible();

    await expect(page.locator('sl-button[variant="primary"]')).toBeVisible();
  });

  test('table header has deep purple background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(112, 26, 117)'); // #701a75 fuchsia-900
  });

  test('table rows are clickable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/posts\/\d+/);
  });
});

test.describe('Create new post', () => {
  test('navigates to new form and shows Shoelace fields', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForForm(page);

    await expect(page.getByRole('heading', { name: 'New Post' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Title *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Slug *' })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('submit button is a Shoelace primary button', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await expect(
      page.locator('sl-button[variant="primary"][type="submit"]'),
    ).toBeVisible();
  });

  test('shows validation error when required fields are empty', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page.locator('sl-button[type="submit"]').click();

    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('creates a new post and returns to the table', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Title *' }).fill('E2E Test Post');
    await page.getByRole('textbox', { name: 'Slug *' }).fill('e2e-test-post');
    await page
      .getByRole('textbox', { name: 'Body *' })
      .fill('Written by Playwright.');

    await page.locator('sl-select').click();
    await page.locator('sl-option[value="draft"]').click();

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('E2E Test Post')).toBeVisible();
  });
});

test.describe('Edit existing post', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/posts\/\d+/);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Post' }),
    ).toBeVisible();

    const titleInput = page.getByRole('textbox', { name: 'Title *' });
    await expect(titleInput).toBeVisible();
    const titleVal = await titleInput.inputValue();
    expect(titleVal.length).toBeGreaterThan(0);

    await expect(
      page.locator('sl-button[variant="primary"][type="submit"]'),
    ).toBeVisible();
    await expect(page.locator('sl-button[variant="danger"]')).toBeVisible();
  });

  test('submits an edit and navigates back to the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/posts\/\d+/);
    await waitForForm(page);

    await page
      .getByRole('textbox', { name: 'Title *' })
      .fill('Updated via E2E');

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});

test.describe('Delete post', () => {
  test('deletes a post via the Delete button and returns to the table', async ({
    page,
  }) => {
    await page.goto('/#/posts/2');
    await waitForForm(page);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('sl-button[variant="danger"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(
      page.getByRole('cell', { name: 'Why Server-Driven UI Matters' }),
    ).toHaveCount(0);
  });
});
