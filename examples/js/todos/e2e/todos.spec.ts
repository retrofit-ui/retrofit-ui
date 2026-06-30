import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/todos';
const EDIT_TODO_URL = '/#/todos/1';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

test.describe('Todos inline-edit table', () => {
  test('renders column headers and seed data', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Done' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Priority' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Actions' }),
    ).toBeVisible();

    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(page.getByText('Write tests')).toBeVisible();
  });

  test('table header has deep purple background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(76, 29, 149)'); // #4c1d95 violet-900
  });

  test('each row has Edit and Delete buttons', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const firstRow = page.locator('tbody tr').first();
    await expect(
      firstRow.locator('sl-button').filter({ hasText: 'Edit' }),
    ).toBeVisible();
    await expect(
      firstRow.locator('sl-button').filter({ hasText: 'Delete' }),
    ).toBeVisible();
  });

  test('clicking Edit makes row cells editable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('sl-button').filter({ hasText: 'Edit' }).click();

    // Save and Cancel buttons appear
    await expect(
      firstRow.locator('sl-button').filter({ hasText: 'Save' }),
    ).toBeVisible();
    await expect(
      firstRow.locator('sl-button').filter({ hasText: 'Cancel' }),
    ).toBeVisible();

    // Title cell becomes a text input
    await expect(firstRow.locator('sl-input').first()).toBeVisible();
  });

  test('Cancel restores original values without saving', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('sl-button').filter({ hasText: 'Edit' }).click();

    const input = firstRow.getByRole('textbox').first();
    await input.fill('CANCELLED EDIT');
    await firstRow.locator('sl-button').filter({ hasText: 'Cancel' }).click();

    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('CANCELLED EDIT')).toHaveCount(0);
  });

  test('Save persists changes without page navigation', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('sl-button').filter({ hasText: 'Edit' }).click();

    const input = firstRow.getByRole('textbox').first();
    await input.fill('Updated via inline edit');
    await firstRow.locator('sl-button').filter({ hasText: 'Save' }).click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();

    // Should stay on same URL
    await expect(page).toHaveURL(/\/#\/todos/);
    await waitForTable(page);
    await expect(page.getByText('Updated via inline edit')).toBeVisible();
  });

  test('new row form is visible at the bottom of the table', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    // Last row has Add button
    const lastRow = page.locator('tbody tr').last();
    await expect(
      lastRow.locator('sl-button').filter({ hasText: 'Add' }),
    ).toBeVisible();
  });

  test('can add a new todo via the new row form', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const lastRow = page.locator('tbody tr').last();
    const titleInput = lastRow.locator('sl-input').first();

    await titleInput.evaluate(
      (el: HTMLElement & { value: string }) => (el.value = ''),
    );
    await titleInput.getByRole('textbox').fill('New inline todo');

    await lastRow.locator('sl-button').filter({ hasText: 'Add' }).click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Created successfully' }),
    ).toBeVisible();

    await waitForTable(page);
    await expect(page.getByText('New inline todo')).toBeVisible();
  });

  test('Delete button removes a row', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const secondRow = page.locator('tbody tr').nth(1);
    await secondRow.locator('sl-button').filter({ hasText: 'Delete' }).click();
    await page
      .locator('sl-dialog[open] sl-button[slot="footer"][variant="danger"]')
      .click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Deleted successfully' }),
    ).toBeVisible();

    await waitForTable(page);
    await expect(page.getByText('Walk the dog')).toHaveCount(0);
  });
});

test.describe('Field tooltip', () => {
  test('sl-tooltip element is present in the DOM', async ({ page }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');
    await expect(page.locator('sl-tooltip').first()).toBeAttached();
  });

  test('sl-icon-button with question-circle is visible next to the label', async ({
    page,
  }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');
    await expect(
      page.locator('sl-icon-button[name="question-circle"]').first(),
    ).toBeVisible();
  });

  test('tooltip content attribute matches configured string', async ({
    page,
  }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');
    const tooltip = page.locator(
      'sl-tooltip[content="Enter a short description of the task"]',
    );
    await expect(tooltip).toBeAttached();
  });

  test('field with tooltip and helpText renders both', async ({ page }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');
    const tooltip = page.locator(
      'sl-tooltip[content="Enter a short description of the task"]',
    );
    await expect(tooltip).toBeAttached();
    const titleInput = page
      .locator('sl-input')
      .filter({ has: page.locator('sl-tooltip') });
    const helpText = await titleInput.evaluate(
      (el: HTMLElement & { helpText?: string }) => el.helpText,
    );
    expect(helpText).toBe('Keep it brief');
  });

  test('done field (switch, no tooltip) has no sibling sl-icon-button', async ({
    page,
  }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');
    const switchWrapper = page.locator('sl-switch').locator('..');
    await expect(switchWrapper.locator('sl-icon-button')).toHaveCount(0);
  });
});

test.describe('Todo form view with sl-switch for done field', () => {
  test('edit form renders sl-switch for the done field', async ({ page }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');

    await expect(page.locator('sl-switch')).toBeVisible();
  });

  test('sl-switch label contains the field label', async ({ page }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');

    await expect(page.locator('sl-switch')).toContainText('Done');
  });

  test('toggling sl-switch and saving persists the change', async ({
    page,
  }) => {
    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');

    const sw = page.locator('sl-switch');
    const initialChecked = await sw.evaluate(
      (el: HTMLElement & { checked: boolean }) => el.checked,
    );

    await sw.click();

    await page.locator('sl-button[type="submit"]').click();

    await expect(
      page.locator('sl-alert').filter({ hasText: 'Saved successfully' }),
    ).toBeVisible();

    await page.goto(EDIT_TODO_URL);
    await page.waitForSelector('form');

    const updatedChecked = await page
      .locator('sl-switch')
      .evaluate((el: HTMLElement & { checked: boolean }) => el.checked);
    expect(updatedChecked).toBe(!initialChecked);
  });
});
