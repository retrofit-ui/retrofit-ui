import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/contacts';
const NEW_URL = '/#/contacts/new';
const LAYOUT_URL = '/#/contacts-by-type';

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

test.describe('Contacts by Type — stacked layout', () => {
  // Read-only filter tests run before state-mutating tests so all seed
  // contacts (Alice/Bob/Carol) are intact. Form-submit tests come last.

  test('renders page heading, filter dropdown, form section, and all seed contacts initially', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await expect(
      page.getByRole('heading', { name: 'Contacts by Type' }),
    ).toBeVisible();
    // Filter dropdown present
    await expect(page.locator('.retrofit-filter-form sl-select')).toBeVisible();
    // Form section present
    await expect(
      page.getByRole('heading', { name: 'Add Contact' }),
    ).toBeVisible();
    await expect(page.locator('sl-button[type="submit"]')).toBeVisible();

    await expect(page.locator('th').filter({ hasText: 'Name' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Email' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Type' })).toBeVisible();

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();
  });

  test('selecting Work shows only work contacts in the table', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Bob Smith' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Carol White' }),
    ).not.toBeVisible();
  });

  test('selecting Personal shows only personal contacts in the table', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page
      .locator('.retrofit-filter-form sl-option[value="personal"]')
      .click();

    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Alice Johnson' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Carol White' }),
    ).not.toBeVisible();
  });

  test('selecting Other shows only other contacts in the table', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page
      .locator('.retrofit-filter-form sl-option[value="other"]')
      .click();

    await expect(page.getByText('Carol White')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Alice Johnson' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Bob Smith' }),
    ).not.toBeVisible();
  });

  test('changing the filter updates the table without a page reload', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();
    await expect(page.getByText('Alice Johnson')).toBeVisible();

    await page.locator('.retrofit-filter-form sl-select').click();
    await page
      .locator('.retrofit-filter-form sl-option[value="personal"]')
      .click();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Alice Johnson' }),
    ).not.toBeVisible();
  });

  test('filter selection is reflected in the URL search params', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();

    await page.waitForURL(/type=work/);
  });

  test('selecting All Types after filtering restores all contacts', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();
    await expect(
      page.getByRole('cell', { name: 'Bob Smith' }),
    ).not.toBeVisible();

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value=""]').click();

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();
  });

  test('selecting Work filter pre-fills the type field in the new contact form', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();
    await page.waitForURL(/type=work/);

    const formTypeValue = await page
      .locator('form sl-select')
      .evaluate((el) => (el as HTMLElement & { value: string }).value);
    expect(formTypeValue).toBe('work');
  });

  test('changing the filter updates the form type field', async ({ page }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();
    await page.waitForURL(/type=work/);

    await page.locator('.retrofit-filter-form sl-select').click();
    await page
      .locator('.retrofit-filter-form sl-option[value="personal"]')
      .click();
    await page.waitForURL(/type=personal/);

    const formTypeValue = await page
      .locator('form sl-select')
      .evaluate((el) => (el as HTMLElement & { value: string }).value);
    expect(formTypeValue).toBe('personal');
  });

  test('submitting the form creates a contact and it appears in the table', async ({
    page,
  }) => {
    await page.goto(LAYOUT_URL);
    await waitForTable(page);

    // Apply Work filter so form defaults type to "work"
    await page.locator('.retrofit-filter-form sl-select').click();
    await page.locator('.retrofit-filter-form sl-option[value="work"]').click();
    await page.waitForURL(/type=work/);

    // Fill required fields — type is already pre-filled as "work"
    await page.getByRole('textbox', { name: 'Name *' }).fill('Eve Test');
    await page
      .getByRole('textbox', { name: 'Email *' })
      .fill('eve@example.com');

    await page.locator('sl-button[type="submit"]').click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Created successfully' }),
    ).toBeVisible();

    // New contact should appear in the filtered table without navigation
    await expect(page.getByText('Eve Test')).toBeVisible();

    // Form fields should reset after submission
    const nameValue = await page
      .getByRole('textbox', { name: 'Name *' })
      .inputValue();
    expect(nameValue).toBe('');
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

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Created successfully' }),
    ).toBeVisible();

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

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();

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

    await page.locator('sl-button[variant="danger"]').click();
    await page.locator('sl-button[slot="footer"][variant="danger"]').click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Deleted successfully' }),
    ).toBeVisible();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByRole('cell', { name: 'Carol White' })).toHaveCount(
      0,
    );
  });
});
