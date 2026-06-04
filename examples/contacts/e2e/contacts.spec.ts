import { expect, type Page, test } from '@playwright/test';

// Navigate to the contacts table and wait for it to be ready
async function gotoContacts(page: Page) {
  await page.goto('/retrofit-ui/#/contacts');
  await page.waitForSelector('h1, table, p');
}

test.describe('Contacts – table view', () => {
  test('shows page heading, column headers, seed rows, and New button', async ({
    page,
  }) => {
    await gotoContacts(page);

    // Heading
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();

    // Column headers rendered
    const headers = page.locator('th');
    await expect(headers).not.toHaveCount(0);

    // Seed data: at least one data row
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);

    // New button
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

    // Form heading
    await expect(
      page.getByRole('heading', { name: 'New Contact' }),
    ).toBeVisible();

    // Field labels
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Phone')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
    await expect(page.getByText('Type')).toBeVisible();

    // Notes is a textarea
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();

    // Type is a select (z.enum)
    await expect(page.locator('select[name="type"]')).toBeVisible();
  });

  test('submitting empty form shows validation errors for required fields', async ({
    page,
  }) => {
    await gotoContacts(page);
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForSelector('form');

    await page.getByRole('button', { name: /submit/i }).click();

    // Client-side validation shows required error messages
    const alerts = page.locator('[role="alert"]');
    await expect(alerts).not.toHaveCount(0);
  });

  test('fills in form and creates a new contact', async ({ page }) => {
    await gotoContacts(page);
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForSelector('form');

    // Fill required fields — use triple-click to select all then type, or fill + blur
    // SolidJS onChange maps to native 'change' event; trigger it by pressing Tab after fill
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="name"]').press('Tab');
    await page.locator('input[name="email"]').fill('testuser@example.com');
    await page.locator('input[name="email"]').press('Tab');
    await page.locator('select[name="type"]').selectOption('work');

    // Optional fields
    await page.locator('input[name="phone"]').fill('+1 555 000 0099');
    await page.locator('input[name="phone"]').press('Tab');
    await page.locator('textarea[name="notes"]').fill('Created by e2e test');
    await page.locator('textarea[name="notes"]').press('Tab');

    await page.getByRole('button', { name: /submit/i }).click();

    // After successful submit, navigates back to table
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible({
      timeout: 10_000,
    });

    // New contact row is visible
    await expect(page.getByText('Test User')).toBeVisible();
  });
});

test.describe('Contacts – edit existing contact', () => {
  test('clicking a row loads edit form with pre-populated values', async ({
    page,
  }) => {
    await gotoContacts(page);

    // Click first seed row (Alice Johnson)
    await page.getByText('Alice Johnson').click();
    await page.waitForSelector('form');

    // Edit form heading
    await expect(
      page.getByRole('heading', { name: 'Edit Contact' }),
    ).toBeVisible();

    // Fields pre-populated
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

    // Update the notes field — press Tab to trigger SolidJS onChange
    await page.locator('textarea[name="notes"]').fill('Updated by e2e test');
    await page.locator('textarea[name="notes"]').press('Tab');

    await page.getByRole('button', { name: /submit/i }).click();

    // Navigates back to table
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

    // Accept the confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: 'Delete' }).click();

    // Navigates back to table
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible({
      timeout: 10_000,
    });

    // Deleted contact no longer in table
    await expect(page.getByText('Carol White')).not.toBeVisible();
  });
});
