import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/contacts';
const NEW_URL = '/#/contacts/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Contacts table view', () => {
  test('renders table with heading, column headers, seed data, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();

    await expect(page.locator('th').filter({ hasText: 'Name' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Email' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Type' })).toBeVisible();

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();

    await expect(page.locator('sl-button[variant="primary"]')).toBeVisible();
  });

  test('table header has deep green background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(20, 83, 45)'); // #14532d green-900
  });

  test('table rows are clickable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/contacts\/\d+/);
  });
});

test.describe('Create new contact', () => {
  test('navigates to new form and shows Shoelace fields', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'New Contact' }),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible();
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

  test('creates a new contact and returns to the table', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Name *' }).fill('Test Contact');
    await page
      .getByRole('textbox', { name: 'Email *' })
      .fill('test@example.com');

    await page.locator('sl-select').click();
    await page.locator('sl-option[value="work"]').click();

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Test Contact')).toBeVisible();
  });
});

test.describe('Edit existing contact', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/contacts\/\d+/);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Contact' }),
    ).toBeVisible();

    const nameInput = page.getByRole('textbox', { name: 'Name *' });
    await expect(nameInput).toBeVisible();
    const nameVal = await nameInput.inputValue();
    expect(nameVal.length).toBeGreaterThan(0);

    await expect(
      page.locator('sl-button[variant="primary"][type="submit"]'),
    ).toBeVisible();
    await expect(page.locator('sl-button[variant="danger"]')).toBeVisible();
  });

  test('submits an edit and navigates back to the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/contacts\/\d+/);
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Name *' }).fill('Updated via E2E');

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});

test.describe('Delete contact', () => {
  test('deletes a contact via the Delete button and returns to the table', async ({
    page,
  }) => {
    await page.goto('/#/contacts/3');
    await waitForForm(page);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('sl-button[variant="danger"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByRole('cell', { name: 'Carol White' })).toHaveCount(
      0,
    );
  });
});
