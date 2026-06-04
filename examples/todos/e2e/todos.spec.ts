import { expect, test } from '@playwright/test';

const TABLE_URL = '/retrofit-ui/#/todos';
const NEW_URL = '/retrofit-ui/#/todos/new';

// Wait for the SPA to finish loading data from the API
async function waitForContent(page: import('@playwright/test').Page) {
  // The SPA renders <p>Loading...</p> then replaces it with real content
  await page.waitForFunction(() => {
    const p = document.querySelector('p');
    return p?.textContent !== 'Loading...';
  });
}

test.describe('Todos table view', () => {
  test('renders table with title, column headers, seed data, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForContent(page);

    // Title
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();

    // Column headers derived from TodoSchema: id, title, done, priority
    await expect(page.locator('th').filter({ hasText: 'Id' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Done' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Priority' }),
    ).toBeVisible();

    // Seed data rows
    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(page.getByText('Write tests')).toBeVisible();

    // New button
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });
});

test.describe('Create new todo', () => {
  test('navigates to new form and shows correct fields', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('button:text("New")');

    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForURL(`**${NEW_URL}`);
    await waitForContent(page);

    // Form title
    await expect(page.getByRole('heading', { name: 'New Todo' })).toBeVisible();

    // title is a text input
    await expect(page.locator('input#title')).toBeVisible();

    // done is a checkbox
    await expect(page.locator('input#done[type="checkbox"]')).toBeVisible();

    // priority is a select
    await expect(page.locator('select#priority')).toBeVisible();

    // Required fields show ' *' indicator
    await expect(page.locator('label[for="title"]')).toContainText(' *');
    await expect(page.locator('label[for="done"]')).toContainText(' *');
  });

  test('shows validation error when required fields are empty', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await waitForContent(page);
    await page.waitForSelector('form');

    // Clear title (leave empty) and submit
    await page.locator('input#title').fill('');
    await page.getByRole('button', { name: 'Submit' }).click();

    // At least one validation error alert should appear
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

test.describe('Edit existing todo', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForContent(page);

    // Click on the first data row (Buy milk, id=1)
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
    await waitForContent(page);

    // Edit form title
    await expect(
      page.getByRole('heading', { name: 'Edit Todo' }),
    ).toBeVisible();

    // id field is read-only on edit (updateSchema = CreateTodoSchema, which lacks id)
    await expect(page.locator('input#id')).toBeDisabled();

    // title is pre-populated (non-empty)
    const titleVal = await page.locator('input#title').inputValue();
    expect(titleVal.length).toBeGreaterThan(0);

    // priority is a select with a value
    const priorityVal = await page.locator('select#priority').inputValue();
    expect(priorityVal.length).toBeGreaterThan(0);

    // Submit and Delete buttons present
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('submits an edit and navigates back to the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForContent(page);

    // Click first row to open edit form
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
    await waitForContent(page);

    // Change the title
    await page.locator('input#title').fill('Updated via E2E');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForContent(page);

    await expect(page.getByText('Updated via E2E')).toBeVisible();
  });
});

test.describe('Delete todo', () => {
  test('deletes a todo via the Delete button and returns to the table', async ({
    page,
  }) => {
    // Navigate directly to the second todo (id=2, Walk the dog)
    await page.goto('/retrofit-ui/#/todos/2');
    await waitForContent(page);
    await page.waitForSelector('form');

    // Accept the confirm dialog triggered by the Delete button
    page.on('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForContent(page);

    // The deleted row should no longer appear in the table
    const walkDogRows = page.getByRole('cell', { name: 'Walk the dog' });
    await expect(walkDogRows).toHaveCount(0);
  });
});
