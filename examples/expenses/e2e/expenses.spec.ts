import { expect, test } from '@playwright/test';

// Seed data from store.ts — three expenses exist on a fresh server boot
const SEED_EXPENSES = [
  { description: 'Flight to conference', amount: 450.0, category: 'travel' },
  { description: 'Team lunch', amount: 87.5, category: 'meals' },
  { description: 'Mechanical keyboard', amount: 199.99, category: 'equipment' },
];

test.describe('Expenses table view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/retrofit-ui/#/expenses');
    // Wait for the async data load — h1 only appears once the API response is rendered
    await page.waitForSelector('h1', { timeout: 15_000 });
  });

  test('shows the Expenses heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Expenses');
  });

  test('renders column headers', async ({ page }) => {
    const thead = page.locator('table thead');
    await expect(thead).toBeVisible();
    // Columns come from ExpenseSchema keys: id, description, amount, category, date, status, notes
    await expect(
      thead.locator('th').filter({ hasText: 'Description' }),
    ).toBeVisible();
    await expect(
      thead.locator('th').filter({ hasText: 'Amount' }),
    ).toBeVisible();
    await expect(
      thead.locator('th').filter({ hasText: 'Category' }),
    ).toBeVisible();
    await expect(
      thead.locator('th').filter({ hasText: 'Status' }),
    ).toBeVisible();
  });

  test('renders seed data rows', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(SEED_EXPENSES.length);
    // Verify the first seed row text appears somewhere in the table
    await expect(page.locator('table')).toContainText('Flight to conference');
    await expect(page.locator('table')).toContainText('Team lunch');
    await expect(page.locator('table')).toContainText('Mechanical keyboard');
  });

  test('shows a "New" button', async ({ page }) => {
    await expect(page.locator('button:has-text("New")')).toBeVisible();
  });
});

test.describe('Create new expense', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/retrofit-ui/#/expenses');
    await page.waitForSelector('button:has-text("New")', { timeout: 15_000 });
    await page.click('button:has-text("New")');
    // Wait for form heading to appear after async fetch
    await page.waitForSelector('h1', { timeout: 15_000 });
  });

  test('URL changes to #/expenses/new', async ({ page }) => {
    expect(page.url()).toContain('#/expenses/new');
  });

  test('form renders with Submit Expense heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Submit Expense');
  });

  test('amount field is a number input', async ({ page }) => {
    const amountInput = page.locator('input[name="amount"]');
    await expect(amountInput).toBeVisible();
    await expect(amountInput).toHaveAttribute('type', 'number');
  });

  test('category field renders as a select with options', async ({ page }) => {
    const categorySelect = page.locator('select[name="category"]');
    await expect(categorySelect).toBeVisible();
    // Enum values: travel, meals, equipment, other
    const options = categorySelect.locator('option');
    // 4 enum options + blank placeholder = 5
    await expect(options).toHaveCount(5);
    await expect(categorySelect.locator('option[value="travel"]')).toHaveCount(
      1,
    );
    await expect(categorySelect.locator('option[value="meals"]')).toHaveCount(
      1,
    );
    await expect(
      categorySelect.locator('option[value="equipment"]'),
    ).toHaveCount(1);
    await expect(categorySelect.locator('option[value="other"]')).toHaveCount(
      1,
    );
  });

  test('description field is a text input', async ({ page }) => {
    const descInput = page.locator('input[name="description"]');
    await expect(descInput).toBeVisible();
    await expect(descInput).toHaveAttribute('type', 'text');
  });

  test('date field renders with YYYY-MM-DD placeholder', async ({ page }) => {
    const dateInput = page.locator('input[name="date"]');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute('placeholder', 'YYYY-MM-DD');
  });

  test('notes field renders as a textarea', async ({ page }) => {
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test('submitting empty form shows validation errors', async ({ page }) => {
    await page.click('button[type="submit"]');
    // Required field alerts should appear
    const alerts = page.locator('[role="alert"]');
    await expect(alerts.first()).toBeVisible();
    // Should still be on the new form
    expect(page.url()).toContain('#/expenses/new');
  });

  test('filling valid values and submitting navigates back to table with new row', async ({
    page,
  }) => {
    // SolidJS uses onChange (fires on blur/change), so fill then Tab to trigger
    await page.locator('input[name="description"]').fill('Office supplies');
    await page.locator('input[name="description"]').press('Tab');

    await page.locator('input[name="amount"]').fill('42');
    await page.locator('input[name="amount"]').press('Tab');

    await page.selectOption('select[name="category"]', 'other');

    await page.locator('input[name="date"]').fill('2026-06-04');
    await page.locator('input[name="date"]').press('Tab');

    await page.click('button[type="submit"]');

    // Should navigate back to the table — wait for the table to appear
    await page.waitForSelector('table', { timeout: 15_000 });
    await expect(page.locator('table')).toContainText('Office supplies');
  });
});

test.describe('Edit existing expense', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/retrofit-ui/#/expenses');
    // Wait for data to load then click first row
    await page.waitForSelector('table tbody tr', { timeout: 15_000 });
    await page.locator('table tbody tr').first().click();
    // Wait for the edit form heading to appear
    await page.waitForSelector('h1', { timeout: 15_000 });
  });

  test('URL changes to #/expenses/1', async ({ page }) => {
    expect(page.url()).toContain('#/expenses/1');
  });

  test('edit form shows "Edit Expense" heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Edit Expense');
  });

  test('form pre-populates description with seed value', async ({ page }) => {
    const descInput = page.locator('input[name="description"]');
    await expect(descInput).toHaveValue('Flight to conference');
  });

  test('form pre-populates amount with seed value', async ({ page }) => {
    const amountInput = page.locator('input[name="amount"]');
    await expect(amountInput).toHaveValue('450');
  });

  test('form pre-populates category with seed value', async ({ page }) => {
    const categorySelect = page.locator('select[name="category"]');
    await expect(categorySelect).toHaveValue('travel');
  });

  test('Delete button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });
});

test.describe('Delete expense', () => {
  test('delete navigates back to the table', async ({ page }) => {
    await page.goto('/retrofit-ui/#/expenses');
    await page.waitForSelector('table tbody tr');

    // Count rows before delete
    const rowsBefore = await page.locator('table tbody tr').count();

    // Click first row to open edit form
    await page.locator('table tbody tr').first().click();
    await page.waitForSelector('button:has-text("Delete")');

    // Accept confirm dialog and click delete
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    // Should navigate back to table — wait for the table to re-appear
    await page.waitForSelector('table tbody tr', { timeout: 15_000 });

    // One fewer row
    const rowsAfter = await page.locator('table tbody tr').count();
    expect(rowsAfter).toBe(rowsBefore - 1);
  });
});
