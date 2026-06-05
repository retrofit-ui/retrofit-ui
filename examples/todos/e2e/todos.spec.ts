import { expect, test } from '@playwright/test';

const TABLE_URL = '/retrofit-ui/#/todos';
const NEW_URL = '/retrofit-ui/#/todos/new';

async function waitForContent(page: import('@playwright/test').Page) {
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

    await expect(page.getByRole('heading', { name: 'New Todo' })).toBeVisible();
    await expect(page.locator('input#title')).toBeVisible();
    await expect(page.locator('input#done[type="checkbox"]')).toBeVisible();
    await expect(page.locator('select#priority')).toBeVisible();
    await expect(page.locator('label[for="title"]')).toContainText(' *');
  });

  test('shows validation error when required fields are empty', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await waitForContent(page);
    await page.waitForSelector('form');

    await page.locator('input#title').fill('');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

test.describe('Edit existing todo', () => {
  test('opens edit form with pre-populated values when clicking a row', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await waitForContent(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
    await waitForContent(page);

    await expect(
      page.getByRole('heading', { name: 'Edit Todo' }),
    ).toBeVisible();
    await expect(page.locator('input#id')).toBeDisabled();

    const titleVal = await page.locator('input#title').inputValue();
    expect(titleVal.length).toBeGreaterThan(0);

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('submits an edit and navigates back to the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await waitForContent(page);

    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/todos\/\d+/);
    await waitForContent(page);

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
    await page.goto('/retrofit-ui/#/todos/2');
    await waitForContent(page);
    await page.waitForSelector('form');

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForURL(`**${TABLE_URL}`);
    await waitForContent(page);

    await expect(page.getByRole('cell', { name: 'Walk the dog' })).toHaveCount(
      0,
    );
  });
});
