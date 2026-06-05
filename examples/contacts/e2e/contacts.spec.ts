import { expect, type Page, test } from '@playwright/test';

async function gotoContacts(page: Page) {
  await page.goto('/retrofit-ui/#/contacts');
  await page.waitForSelector('h1, table, p');
}

test.describe('Contacts – table view', () => {
  test('shows page heading, column headers, seed rows, and New button', async ({
    page,
  }) => {
    await gotoContacts(page);

    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();

    const headers = page.locator('th');
    await expect(headers).not.toHaveCount(0);

    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);

    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });

  test('seed rows contain known contacts', async ({ page }) => {
    await gotoContacts(page);

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
    await expect(page.getByText('Carol White')).toBeVisible();
  });
});

test.describe('Contacts – create new contact', () => {
  test('form renders with expected fields and special input types', async ({
    page,
  }) => {
    await gotoContacts(page);
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForSelector('h1, form');

    await expect(
      page.getByRole('heading', { name: 'New Contact' }),
    ).toBeVisible();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Phone')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
    await expect(page.locator('select[name="type"]')).toBeVisible();
  });

  test('submitting empty form shows validation errors', async ({ page }) => {
    await gotoContacts(page);
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForSelector('form');

    await page.getByRole('button', { name: /submit/i }).click();

    const alerts = page.locator('[role="alert"]');
    await expect(alerts).not.toHaveCount(0);
  });

  test('fills in form and creates a new contact', async ({ page }) => {
    await gotoContacts(page);
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForSelector('form');

    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('testuser@example.com');
    await page.locator('select[name="type"]').selectOption('work');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Test User')).toBeVisible();
  });
});

test.describe('Contacts – edit existing contact', () => {
  test('clicking a row loads edit form with pre-populated values', async ({
    page,
  }) => {
    await gotoContacts(page);

    await page.getByText('Alice Johnson').click();
    await page.waitForSelector('form');

    await expect(
      page.getByRole('heading', { name: 'Edit Contact' }),
    ).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue(
      'Alice Johnson',
    );
    await expect(page.locator('input[name="email"]')).toHaveValue(
      'alice@example.com',
    );
  });

  test('edit form has a Delete button', async ({ page }) => {
    await gotoContacts(page);
    await page.getByText('Alice Johnson').click();
    await page.waitForSelector('form');

    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('submitting edits navigates back to table', async ({ page }) => {
    await gotoContacts(page);
    await page.getByText('Bob Smith').click();
    await page.waitForSelector('form');

    await page.locator('textarea[name="notes"]').fill('Updated by e2e test');
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe('Contacts – delete contact', () => {
  test('deleting a contact from edit form navigates back to table', async ({
    page,
  }) => {
    await gotoContacts(page);
    await page.getByText('Carol White').click();
    await page.waitForSelector('form');

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Carol White')).not.toBeVisible();
  });
});
