import { expect, test } from '@playwright/test';

const CALENDAR_URL = '/#/events/calendar';
const TABLE_URL = '/#/events';
const EDIT_URL = '/#/events/1';
const NEW_URL = '/#/events/new';

test.describe('Events calendar view', () => {
  test('renders FullCalendar', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.fc');
    await expect(page.locator('.fc')).toBeVisible();
  });

  test('shows the month/year toolbar title', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.fc-toolbar-title');
    const title = await page.locator('.fc-toolbar-title').textContent();
    expect(title).toBeTruthy();
  });

  test('shows seed events on the calendar', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.fc');
    await expect(page.getByText('Sprint Planning')).toBeVisible();
    await expect(page.getByText('Team Lunch')).toBeVisible();
  });

  test('events are rendered with colour (fc-event elements present)', async ({
    page,
  }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.fc-event');
    const count = await page.locator('.fc-event').count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking an event navigates to the form view', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.fc-event');
    await page.locator('.fc-event').first().click();
    await expect(page).toHaveURL(/\/#\/events\/\d+/);
  });
});

test.describe('Events table view', () => {
  test('renders column headers', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Start' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'End' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Category' }),
    ).toBeVisible();
  });

  test('shows seed event titles', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');
    await expect(page.getByText('Sprint Planning')).toBeVisible();
    await expect(page.getByText('Quarterly Review')).toBeVisible();
  });

  test('datetime columns are formatted, not raw ISO strings', async ({
    page,
  }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');
    const tableText = await page.locator('table').textContent();
    // Raw ISO datetimes should not appear verbatim in the rendered table
    expect(tableText).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('clicking a row navigates to the form view', async ({ page }) => {
    await page.goto(TABLE_URL);
    await page.waitForSelector('table');
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/#\/events\/\d+/);
  });
});

test.describe('Events form view — datetime pickers', () => {
  test('renders datetime-local inputs for start and end', async ({ page }) => {
    await page.goto(EDIT_URL);
    await page.waitForSelector('form');
    const datetimeInputs = page.locator('sl-input[type="datetime-local"]');
    await expect(datetimeInputs).toHaveCount(2);
  });

  test('form is pre-populated with the event title', async ({ page }) => {
    await page.goto(EDIT_URL);
    await page.waitForSelector('form');
    const titleInput = page.locator('sl-input[type="text"]').first();
    const value = await titleInput.evaluate(
      (el: HTMLElement & { value: string }) => el.value,
    );
    expect(value).toBe('Sprint Planning');
  });

  test('datetime inputs are pre-populated (not empty)', async ({ page }) => {
    await page.goto(EDIT_URL);
    await page.waitForSelector('form');
    const startInput = page.locator('sl-input[type="datetime-local"]').first();
    const value = await startInput.evaluate(
      (el: HTMLElement & { value: string }) => el.value,
    );
    // Should contain a datetime-local value like '2026-06-01T09:00'
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  test('create form renders at /new', async ({ page }) => {
    await page.goto(NEW_URL);
    await page.waitForSelector('form');
    await expect(page.locator('sl-button[type="submit"]')).toBeVisible();
    // datetime-local inputs present on create form too
    const datetimeInputs = page.locator('sl-input[type="datetime-local"]');
    await expect(datetimeInputs).toHaveCount(2);
  });
});

test.describe('Events by category page', () => {
  test('renders category filter and table', async ({ page }) => {
    await page.goto('/#/events-by-category');
    await page.waitForSelector('table');
    await expect(
      page.locator('sl-select').filter({ hasText: 'Category' }),
    ).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
  });
});
