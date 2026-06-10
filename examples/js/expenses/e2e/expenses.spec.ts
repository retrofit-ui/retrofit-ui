import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/expenses';
const NEW_URL = '/#/expenses/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Expenses narrow table', () => {
  test('renders only description, amount, date columns (not status/notes/id)', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(
      page.locator('th').filter({ hasText: 'Description' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Amount' }),
    ).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Date' })).toBeVisible();

    // These columns should NOT be visible
    await expect(page.locator('th').filter({ hasText: 'Status' })).toHaveCount(
      0,
    );
    await expect(page.locator('th').filter({ hasText: 'Notes' })).toHaveCount(
      0,
    );
    await expect(page.locator('th').filter({ hasText: 'Id' })).toHaveCount(0);

    await expect(page.getByText('Flight to conference')).toBeVisible();
    await expect(page.locator('sl-button[variant="primary"]')).toBeVisible();
  });

  test('table header has deep orange background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(124, 45, 18)');
  });

  test('table rows are clickable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/expenses\/\d+/);
  });
});

test.describe('Expenses simple form', () => {
  test('create form shows all fields', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'New Expense' }),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Description *' }),
    ).toBeVisible();
    await expect(
      page.getByRole('spinbutton', { name: 'Amount *' }),
    ).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('creates a new expense and returns to the table', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill('Office supplies');
    await page.getByRole('spinbutton', { name: 'Amount *' }).fill('42');
    await page.getByRole('textbox', { name: /Date/i }).fill('2026-06-08');
    await page.locator('sl-select').click();
    await page.locator('sl-option[value="other"]').click();
    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('Office supplies')).toBeVisible();
  });

  test('edit form pre-populates and saves', async ({ page }) => {
    await page.goto('/#/expenses/1');
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Expense' }),
    ).toBeVisible();
    const desc = page.getByRole('textbox', { name: 'Description *' });
    await expect(desc).toBeVisible();
    expect((await desc.inputValue()).length).toBeGreaterThan(0);

    await desc.fill('Updated via E2E');
    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });

  test('Delete button removes an expense', async ({ page }) => {
    await page.goto('/#/expenses/2');
    await waitForForm(page);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('sl-button[variant="danger"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);
    await expect(page.getByRole('cell', { name: 'Team lunch' })).toHaveCount(0);
  });
});
