import { expect, test } from '@playwright/test';

const TABLE_URL = '/#/todos';
const NEW_URL = '/#/todos/new';

async function waitForTable(page: import('@playwright/test').Page) {
  await page.waitForSelector('table');
}

async function waitForForm(page: import('@playwright/test').Page) {
  await page.waitForSelector('form');
}

test.describe('Todos table view', () => {
  test('renders table with title, column headers, seed data, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();

    await expect(page.locator('th').filter({ hasText: 'Id' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Done' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Priority' }),
    ).toBeVisible();

    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(page.getByText('Write tests')).toBeVisible();

    await expect(page.locator('sl-button[variant="primary"]')).toBeVisible();
  });

  test('New button is a Shoelace primary button', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const newButton = page.locator('sl-button[variant="primary"]');
    await expect(newButton).toBeVisible();
    await expect(newButton).toContainText('New');
  });

  test('table header has deep purple background', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    const bgColor = await page
      .locator('thead')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(76, 29, 149)'); // #4c1d95 violet-900
  });

  test('table rows are clickable', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
  });
});

test.describe('Create new todo', () => {
  test('navigates to new form and shows Shoelace form fields', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForForm(page);

    await expect(page.getByRole('heading', { name: 'New Todo' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Title *' })).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
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

  test('creates a new todo and returns to the table', async ({ page }) => {
    await page.goto(NEW_URL);
    await waitForForm(page);

    await page.getByRole('textbox', { name: 'Title *' }).fill('Test new todo');

    // sl-select: click to open, then pick the option
    await page.locator('sl-select').click();
    await page.locator('sl-option[value="high"]').click();

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Test new todo')).toBeVisible();
  });
});

test.describe('Edit existing todo', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForTable(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
    await waitForForm(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Todo' }),
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
    await page.waitForURL(/\/todos\/\d+/);
    await waitForForm(page);

    const titleInput = page.getByRole('textbox', { name: 'Title *' });
    await titleInput.fill('Updated via E2E');

    await page.locator('sl-button[type="submit"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});

test.describe('Delete todo', () => {
  test('deletes a todo via the Delete button and returns to the table', async ({
    page,
  }) => {
    await page.goto('/#/todos/2');
    await waitForForm(page);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('sl-button[variant="danger"]').click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForTable(page);

    await expect(page.getByRole('cell', { name: 'Walk the dog' })).toHaveCount(
      0,
    );
  });
});
