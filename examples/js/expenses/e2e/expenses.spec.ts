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

test.describe('Expenses stacked layout (form + table)', () => {
  test('shows "New Expense" heading above the table', async ({ page }) => {
    await page.goto('/#/expenses-stacked');
    await waitForForm(page);
    await waitForTable(page);
    await expect(
      page.getByRole('heading', { name: 'New Expense' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Description' }),
    ).toBeVisible();
  });

  test('submitting the form adds a row to the table without navigation', async ({
    page,
  }) => {
    await page.goto('/#/expenses-stacked');
    await waitForForm(page);
    await waitForTable(page);

    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill('Stacked E2E expense');
    await page.getByRole('spinbutton', { name: 'Amount *' }).fill('15');
    await page.getByRole('textbox', { name: /Date/i }).fill('2026-06-11');
    await page.locator('sl-select').click();
    await page.locator('sl-option[value="other"]').click();
    await page.locator('sl-button[type="submit"]').click();

    await page.waitForTimeout(1500);
    // Still on the same URL — no redirect
    await expect(page).toHaveURL(/expenses-stacked/);
    await expect(page.getByText('Stacked E2E expense')).toBeVisible();
  });
});

test.describe('Expenses auto-submit filter layout', () => {
  test('has no submit button — filter selects update the table immediately', async ({
    page,
  }) => {
    await page.goto('/#/expenses-filtered');
    await waitForForm(page);
    await waitForTable(page);

    await expect(page.locator('sl-button[type="submit"]')).toHaveCount(0);
    await expect(page.locator('sl-select')).toHaveCount(2);

    // Filter fields should be laid out horizontally (flex row)
    const flexDir = await page
      .locator('form')
      .evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('row');

    const initialCount = await page.locator('tbody tr').count();
    expect(initialCount).toBeGreaterThan(0);

    await page.locator('sl-select').first().click();
    await page.locator('sl-option[value="travel"]').click();
    await page.waitForTimeout(500);

    const filteredCount = await page.locator('tbody tr').count();
    expect(filteredCount).toBeLessThan(initialCount);
  });
});

test.describe('Expenses dashboard layout (row — form beside table)', () => {
  test('renders form and table side by side', async ({ page }) => {
    await page.goto('/#/expenses-dashboard');
    await waitForForm(page);
    await waitForTable(page);

    await expect(
      page.getByRole('heading', { name: 'New Expense' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Description' }),
    ).toBeVisible();

    const panes = page.locator('.retrofit-pane');
    const formBox = await panes.first().boundingBox();
    const tableBox = await panes.last().boundingBox();
    // Side by side: both panes start at the same vertical position
    expect(Math.abs((formBox?.y ?? 0) - (tableBox?.y ?? 0))).toBeLessThan(30);
  });

  test('submitting dashboard form adds a row to the adjacent table', async ({
    page,
  }) => {
    await page.goto('/#/expenses-dashboard');
    await waitForForm(page);
    await waitForTable(page);

    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill('Dashboard E2E');
    await page.getByRole('spinbutton', { name: 'Amount *' }).fill('99');
    await page.getByRole('textbox', { name: /Date/i }).fill('2026-06-11');
    await page.locator('sl-select').click();
    await page.locator('sl-option[value="meals"]').click();
    await page.locator('sl-button[type="submit"]').click();

    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/expenses-dashboard/);
    await expect(page.getByText('Dashboard E2E')).toBeVisible();
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
