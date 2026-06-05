import { expect, test } from '@playwright/test';

const TABLE_URL = '/retrofit-ui/#/posts';
const NEW_URL = '/retrofit-ui/#/posts/new';

const SEED_TITLES = [
  'Getting Started with Retrofit UI',
  'Why Server-Driven UI Matters',
  'Building Forms with Zod',
];

test.describe('Blog Posts — Table View', () => {
  test('shows Posts heading, column headers, at least one row, and New button', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('h1, table, p');

    await expect(page.locator('h1')).toHaveText('Posts');
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Status' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Author' }),
    ).toBeVisible();

    expect(await page.locator('tbody tr').count()).toBeGreaterThan(0);
  });

  test('status column shows status values in seed data', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    const statusCell = page
      .locator('td')
      .filter({ hasText: /^(published|draft|archived)$/ });
    await expect(statusCell.first()).toBeVisible();
  });

  test('at least one seed post is visible in the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    const titleCells = page.locator('td');
    let found = false;
    for (const title of SEED_TITLES) {
      const count = await titleCells.filter({ hasText: title }).count();
      if (count > 0) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});

test.describe('Blog Posts — Create New Post', () => {
  test('New button navigates to create form', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('h1');

    await page.getByRole('button', { name: 'New' }).click();
    await expect(page.locator('h1')).toHaveText('New Post', {
      timeout: 10_000,
    });
  });

  test('form has expected fields including textarea for body and select for status', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('input[name="slug"]')).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toBeVisible();

    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect.locator('option[value="draft"]')).toHaveCount(1);
    await expect(statusSelect.locator('option[value="published"]')).toHaveCount(
      1,
    );
    await expect(statusSelect.locator('option[value="archived"]')).toHaveCount(
      1,
    );
  });

  test('submitting empty writable fields shows validation errors', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('[role="alert"]').first()).toBeVisible();
  });

  test('fills form and creates new post — navigates back to table with new row', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    const uniqueTitle = `E2E Test Post ${Date.now()}`;
    const uniqueSlug = `e2e-test-post-${Date.now()}`;

    await page.locator('input[name="title"]').fill(uniqueTitle);
    await page.locator('input[name="slug"]').fill(uniqueSlug);
    await page
      .locator('textarea[name="body"]')
      .fill('This post was created by Playwright.');
    await page.locator('select[name="status"]').selectOption('published');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    await expect(
      page.locator('td').filter({ hasText: uniqueTitle }),
    ).toBeVisible();
  });
});

test.describe('Blog Posts — Edit Existing Post', () => {
  test('clicking a seed row loads the edit form with pre-populated values', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    let clickedTitle: string | null = null;
    for (const title of SEED_TITLES) {
      const cell = page.locator('td').filter({ hasText: title });
      if ((await cell.count()) > 0) {
        await cell.click();
        clickedTitle = title;
        break;
      }
    }

    test.skip(!clickedTitle, 'No seed posts available to click');

    await page.waitForURL(/\/posts\/\d+/);

    await expect(page.locator('h1')).toHaveText('Edit Post');
    await expect(page.locator('input[name="title"]')).toHaveValue(
      clickedTitle ?? '',
    );
    await expect(page.locator('textarea[name="body"]')).not.toHaveValue('');

    const statusValue = await page
      .locator('select[name="status"]')
      .inputValue();
    expect(['draft', 'published', 'archived']).toContain(statusValue);

    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('Back button navigates to table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    let clicked = false;
    for (const title of SEED_TITLES) {
      const cell = page.locator('td').filter({ hasText: title });
      if ((await cell.count()) > 0) {
        await cell.click();
        clicked = true;
        break;
      }
    }
    test.skip(!clicked, 'No seed posts available to click');

    await page.waitForURL(/\/posts\/\d+/);
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
  });
});

test.describe('Blog Posts — Delete Post', () => {
  test('Delete button removes a post and returns to table', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    const deleteTitle = `Delete-Me ${Date.now()}`;
    await page.locator('input[name="title"]').fill(deleteTitle);
    await page.locator('input[name="slug"]').fill(`delete-me-${Date.now()}`);
    await page
      .locator('textarea[name="body"]')
      .fill('This post will be deleted.');
    await page.locator('select[name="status"]').selectOption('draft');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    await page.locator('td').filter({ hasText: deleteTitle }).click();
    await page.waitForURL(/\/posts\/\d+/);
    await expect(page.locator('h1')).toHaveText('Edit Post');

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    await expect(
      page.locator('td').filter({ hasText: deleteTitle }),
    ).toHaveCount(0);
  });
});

test.describe('Blog Posts — Status Lifecycle', () => {
  test('newly created post with draft status shows draft in table', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    const draftTitle = `Draft Post ${Date.now()}`;
    await page.locator('input[name="title"]').fill(draftTitle);
    await page.locator('input[name="slug"]').fill(`draft-post-${Date.now()}`);
    await page
      .locator('textarea[name="body"]')
      .fill('A draft post for status lifecycle test.');
    await page.locator('select[name="status"]').selectOption('draft');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    const newRow = page.locator('tr').filter({ hasText: draftTitle });
    await expect(
      newRow.locator('td').filter({ hasText: 'draft' }).first(),
    ).toBeVisible();
  });

  test('can change post status from draft to published via edit form', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    const lifecycleTitle = `Lifecycle Post ${Date.now()}`;
    await page.locator('input[name="title"]').fill(lifecycleTitle);
    await page.locator('input[name="slug"]').fill(`lifecycle-${Date.now()}`);
    await page.locator('textarea[name="body"]').fill('Lifecycle test body.');
    await page.locator('select[name="status"]').selectOption('draft');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });

    await page.locator('td').filter({ hasText: lifecycleTitle }).click();
    await page.waitForURL(/\/posts\/\d+/);

    await page.locator('select[name="status"]').selectOption('published');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    const updatedRow = page.locator('tr').filter({ hasText: lifecycleTitle });
    await expect(
      updatedRow.locator('td').filter({ hasText: 'published' }),
    ).toBeVisible();
  });
});
