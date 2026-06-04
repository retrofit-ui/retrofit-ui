import { expect, test } from '@playwright/test';

// The hash-router resource name matches the API path segment: /api/ui/posts
const TABLE_URL = '/retrofit-ui/#/posts';
const NEW_URL = '/retrofit-ui/#/posts/new';

// Seed data titles (may not all be present if a previous test run deleted some)
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

    // Title rendered from withTitle('Posts')
    await expect(page.locator('h1')).toHaveText('Posts');

    // New button
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();

    // Table rendered
    const tableEl = page.locator('table');
    await expect(tableEl).toBeVisible();

    // Column headers — derived from PostSchema field names
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Status' }),
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Author' }),
    ).toBeVisible();

    // At least one data row is present
    const rows = page.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('status column shows status values in seed data', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    // At least one of the expected status values is visible in the table
    const statusCell = page
      .locator('td')
      .filter({ hasText: /^(published|draft|archived)$/ });
    await expect(statusCell.first()).toBeVisible();
  });

  test('at least one seed post is visible in the table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    // At least one seed title should be visible (in case some were deleted by prior runs)
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

    // title — text input
    await expect(page.locator('input[name="title"]')).toBeVisible();

    // slug — text input
    await expect(page.locator('input[name="slug"]')).toBeVisible();

    // body — textarea (overridden via withFieldOverrides)
    await expect(page.locator('textarea[name="body"]')).toBeVisible();

    // status — select with draft/published/archived options
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

    // Click submit without filling any writable fields
    await page.getByRole('button', { name: 'Submit' }).click();

    // Validation error messages should appear for required writable fields
    const alerts = page.locator('[role="alert"]');
    await expect(alerts.first()).toBeVisible();
  });

  test('fills form and creates new post — navigates back to table with new row', async ({
    page,
  }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    // Use a unique title with timestamp to avoid conflicts across runs
    const uniqueTitle = `E2E Test Post ${Date.now()}`;
    const uniqueSlug = `e2e-test-post-${Date.now()}`;

    await page.locator('input[name="title"]').fill(uniqueTitle);
    await page.locator('input[name="slug"]').fill(uniqueSlug);
    await page
      .locator('textarea[name="body"]')
      .fill('This post was created by Playwright.');
    await page.locator('select[name="status"]').selectOption('published');

    await page.getByRole('button', { name: 'Submit' }).click();

    // After successful create, SolidJS router navigates back to table (hash-based routing)
    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });

    // New row with our unique title is visible
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

    // Find a clickable row from seed data (pick first one that exists)
    let clickedTitle: string | null = null;
    for (const title of SEED_TITLES) {
      const cell = page.locator('td').filter({ hasText: title });
      if ((await cell.count()) > 0) {
        await cell.click();
        clickedTitle = title;
        break;
      }
    }

    // If no seed posts are left, skip — this can happen if delete tests ran first
    test.skip(!clickedTitle, 'No seed posts available to click');

    await page.waitForURL(/\/posts\/\d+/);

    // Form title
    await expect(page.locator('h1')).toHaveText('Edit Post');

    // Title field pre-populated with the clicked title
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveValue(clickedTitle ?? '');

    // Body is a textarea with content
    const bodyTextarea = page.locator('textarea[name="body"]');
    await expect(bodyTextarea).toBeVisible();
    await expect(bodyTextarea).not.toHaveValue('');

    // Status select shows a valid status value
    const statusSelect = page.locator('select[name="status"]');
    const statusValue = await statusSelect.inputValue();
    expect(['draft', 'published', 'archived']).toContain(statusValue);

    // Delete button is present for edit forms
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('Back button navigates to table', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');

    // Click first available row
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
  // Create a fresh post in this test, then delete it — avoids dependency on seed data order
  test('Delete button removes a post and returns to table', async ({
    page,
  }) => {
    // First, create a post to delete
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

    // Wait for table
    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });

    // Click the newly created post row
    await page.locator('td').filter({ hasText: deleteTitle }).click();

    await page.waitForURL(/\/posts\/\d+/);
    await expect(page.locator('h1')).toHaveText('Edit Post');

    // Accept the confirm dialog before clicking Delete
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    // Navigates back to table after deletion (hash-based routing)
    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });

    // Deleted row no longer visible
    await expect(
      page.locator('td').filter({ hasText: deleteTitle }),
    ).toHaveCount(0);
  });
});

test.describe('Blog Posts — Status Lifecycle', () => {
  test('newly created post with draft status shows draft in table', async ({
    page,
  }) => {
    // Create a post with 'draft' status
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

    // The row for the new post shows 'draft' status
    const newRow = page.locator('tr').filter({ hasText: draftTitle });
    await expect(
      newRow.locator('td').filter({ hasText: 'draft' }).first(),
    ).toBeVisible();
  });

  test('can change post status from draft to published via edit form', async ({
    page,
  }) => {
    // Create a draft post
    await page.goto(NEW_URL);
    await page.waitForSelector('form');

    const lifecycleTitle = `Lifecycle Post ${Date.now()}`;
    await page.locator('input[name="title"]').fill(lifecycleTitle);
    await page.locator('input[name="slug"]').fill(`lifecycle-${Date.now()}`);
    await page.locator('textarea[name="body"]').fill('Lifecycle test body.');
    await page.locator('select[name="status"]').selectOption('draft');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });

    // Open the edit form for this post
    await page.locator('td').filter({ hasText: lifecycleTitle }).click();
    await page.waitForURL(/\/posts\/\d+/);

    // Change status to published
    await page.locator('select[name="status"]').selectOption('published');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Back on table, status column shows 'published'
    await expect(page.locator('h1')).toHaveText('Posts', { timeout: 10_000 });
    const updatedRow = page.locator('tr').filter({ hasText: lifecycleTitle });
    await expect(
      updatedRow.locator('td').filter({ hasText: 'published' }),
    ).toBeVisible();
  });
});
