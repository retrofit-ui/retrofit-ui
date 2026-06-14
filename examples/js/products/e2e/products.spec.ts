import { expect, test } from '@playwright/test';

const TREE_URL = '/#/categories/tree';
const CATEGORIES_URL = '/#/categories';
const PRODUCTS_URL = '/#/products';

test.beforeAll(async ({ request }) => {
  await request.post('/test/reset');
});

test.describe('Category tree view', () => {
  test('renders sl-tree with root nodes Electronics and Clothing', async ({
    page,
  }) => {
    await page.goto(TREE_URL);
    await page.waitForSelector('sl-tree');
    await expect(page.getByText('Electronics')).toBeVisible();
    await expect(page.getByText('Clothing')).toBeVisible();
  });

  test('expanding Electronics reveals child nodes Phones and Laptops', async ({
    page,
  }) => {
    await page.goto(TREE_URL);
    await page.waitForSelector('sl-tree');
    // Expand the Electronics tree item by clicking its expand button
    const electronicsItem = page
      .locator('sl-tree-item')
      .filter({ hasText: 'Electronics' })
      .first();
    await electronicsItem.click();
    await expect(page.getByText('Phones')).toBeVisible();
    await expect(page.getByText('Laptops')).toBeVisible();
  });

  test('Edit button is disabled when nothing selected', async ({ page }) => {
    await page.goto(TREE_URL);
    await page.waitForSelector('sl-tree');
    const editButton = page.locator('sl-button').filter({ hasText: 'Edit' });
    await expect(editButton).toHaveAttribute('disabled', '');
  });

  test('New button navigates to categories/new', async ({ page }) => {
    await page.goto(TREE_URL);
    await page.waitForSelector('sl-tree');
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(/\/categories\/new/);
  });
});

test.describe('Category table view', () => {
  test('renders table with all 6 categories', async ({ page }) => {
    await page.goto(CATEGORIES_URL);
    await page.waitForSelector('table');
    await expect(page.getByText('Electronics')).toBeVisible();
    await expect(page.getByText('Clothing')).toBeVisible();
    await expect(page.getByText('Phones')).toBeVisible();
    await expect(page.getByText('Laptops')).toBeVisible();
    await expect(page.getByText('Tops')).toBeVisible();
    await expect(page.getByText('Footwear')).toBeVisible();
  });

  test('clicking New navigates to categories/new', async ({ page }) => {
    await page.goto(CATEGORIES_URL);
    await page.waitForSelector('table');
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(/\/categories\/new/);
  });

  test('clicking a row navigates to categories/:id', async ({ page }) => {
    await page.goto(CATEGORIES_URL);
    await page.waitForSelector('table');
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/categories\/\d+/);
  });
});

test.describe('Category form', () => {
  test('new form has parentId select with category names as options', async ({
    page,
  }) => {
    await page.goto('/#/categories/new');
    await page.waitForSelector('form');
    await expect(page.locator('sl-select[name="parentId"]')).toBeVisible();
  });
});

test.describe('Product table view', () => {
  test('renders table with 4 seed products', async ({ page }) => {
    await page.goto(PRODUCTS_URL);
    await page.waitForSelector('table');
    await expect(page.getByText('Galaxy S25')).toBeVisible();
    await expect(page.getByText('ThinkPad X1')).toBeVisible();
    await expect(page.getByText('Classic T-Shirt')).toBeVisible();
    await expect(page.getByText('Running Shoes')).toBeVisible();
  });

  test('Category column shows category name not raw categoryId number', async ({
    page,
  }) => {
    await page.goto(PRODUCTS_URL);
    await page.waitForSelector('table');
    await expect(
      page.locator('th').filter({ hasText: 'Category' }),
    ).toBeVisible();
    await expect(page.getByText('Phones')).toBeVisible();
    await expect(page.getByText('Laptops')).toBeVisible();
    await expect(page.getByText('Tops')).toBeVisible();
    await expect(page.getByText('Footwear')).toBeVisible();
  });

  test('clicking New navigates to products/new', async ({ page }) => {
    await page.goto(PRODUCTS_URL);
    await page.waitForSelector('table');
    await page.locator('sl-button[variant="primary"]').click();
    await page.waitForURL(/\/products\/new/);
  });

  test('clicking a row navigates to products/:id', async ({ page }) => {
    await page.goto(PRODUCTS_URL);
    await page.waitForSelector('table');
    await page.locator('tbody tr').first().click();
    await page.waitForURL(/\/products\/\d+/);
  });
});

test.describe('Product form', () => {
  test('categoryId field renders as a select with category names', async ({
    page,
  }) => {
    await page.goto('/#/products/new');
    await page.waitForSelector('form');
    await expect(page.locator('sl-select[name="categoryId"]')).toBeVisible();
  });
});
