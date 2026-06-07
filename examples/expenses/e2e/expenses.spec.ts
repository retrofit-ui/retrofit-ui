import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/expenses';
const NEW_URL = '/#/expenses/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Expenses table view', () => {
  test('renders table with heading, column headers, seed data, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible();

    await expect(
      page.locator('th').filter({ hasText: 'Description' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Amount' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Category' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Status' }),
    ).toBeVisible();

    await expect(page.getByText('Flight to conference')).toBeVisible();
    await expect(page.getByText('Team lunch')).toBeVisible();
    await expect(page.getByText('Mechanical keyboard')).toBeVisible();

    await expect(page.locator('sl-button[variant="primary"]')).toBeVisible();
  });

  test('table header has deep orange background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(124, 45, 18)'); // #7c2d12 orange-900
  });

  test('table rows are clickable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/expenses\/\d+/);
  });
});

test.describe('Create new expense', () => {
  test('navigates to new form and shows Shoelace fields', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
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

  test('creates a new expense and returns to the table', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill('Office supplies');
    await page.getByRole('spinbutton', { name: 'Amount *' }).fill('42');
    await page.getByRole('textbox', { name: /Date/i }).fill('2026-06-07');

    await page.locator('sl-select').click();
    await page.locator('sl-option[value="other"]').click();

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Office supplies')).toBeVisible();
  });
});

test.describe('Edit existing expense', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/expenses\/\d+/);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Expense' }),
    ).toBeVisible();

    const descInput = page.getByRole('textbox', { name: 'Description *' });
    await expect(descInput).toBeVisible();
    const val = await descInput.inputValue();
    expect(val.length).toBeGreaterThan(0);

    await expect(
      page.locator('sl-button[variant="primary"][type="submit"]'),
    ).toBeVisible();
    await expect(page.locator('sl-button[variant="danger"]')).toBeVisible();
  });

  test('submits an edit and navigates back to the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/expenses\/\d+/);
    await waitForForm(page);

    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill('Updated via E2E');

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});

test.describe('Delete expense', () => {
  test('deletes an expense via the Delete button and returns to the table', async ({
    page,
  }) => {
    await page.goto('/#/expenses/2');
    await waitForForm(page);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('sl-button[variant="danger"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByRole('cell', { name: 'Team lunch' })).toHaveCount(0);
  });
});
