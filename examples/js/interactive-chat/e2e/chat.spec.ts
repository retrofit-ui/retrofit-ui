import { expect, test } from '@playwright/test';

const CHAT_URL = '/#/chat';

test.describe('Chat page structure', () => {
  test('renders the Agenda Assistant page title', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-page-title');
    await expect(
      page
        .locator('h1.retrofit-page-title')
        .filter({ hasText: 'Agenda Assistant' }),
    ).toBeVisible();
  });

  test('renders all three user messages as markdown', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    const blocks = page.locator('.retrofit-markdown');
    await expect(blocks).toHaveCount(3);
  });

  test('first user message contains schedule question', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    const first = page.locator('.retrofit-markdown').first();
    await expect(first).toContainText('schedule');
  });

  test('second user message contains deadlines question', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    const second = page.locator('.retrofit-markdown').nth(1);
    await expect(second).toContainText('deadline');
  });

  test('third user message contains comparison question', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-markdown');
    const third = page.locator('.retrofit-markdown').nth(2);
    await expect(third).toContainText('compare');
  });
});

test.describe("Turn 1 — today's schedule", () => {
  test("renders stat cards for today's overview", async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    await expect(page.getByText('Meetings Today')).toBeVisible();
    await expect(page.getByText('Focus Blocks')).toBeVisible();
    await expect(page.getByText('Hours Scheduled')).toBeVisible();
  });

  test('meeting count is 4', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    const meetingsCard = page
      .locator('.retrofit-stat-card')
      .filter({ hasText: 'Meetings Today' });
    await expect(meetingsCard.locator('.retrofit-stat-value')).toHaveText('4');
  });

  test('renders the schedule timeline', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-timeline');
    await expect(page.locator('.retrofit-timeline')).toBeVisible();
  });

  test('timeline shows Sprint Standup event', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-timeline');
    await expect(page.getByText('Sprint Standup')).toBeVisible();
  });

  test('timeline shows all 6 scheduled events', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-timeline');
    const events = page.locator('.retrofit-timeline-event');
    await expect(events).toHaveCount(6);
  });

  test('timeline events carry variant colour classes', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-timeline');
    const coloured = page.locator(
      '.retrofit-timeline-event--primary, .retrofit-timeline-event--success, .retrofit-timeline-event--warning, .retrofit-timeline-event--neutral',
    );
    const count = await coloured.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Turn 2 — upcoming deadlines', () => {
  test('renders deadline stat cards', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    await expect(page.getByText('Due This Week')).toBeVisible();
    await expect(page.getByText('Due Next Week')).toBeVisible();
  });

  test('renders the deadlines table', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('table');
    await expect(
      page.locator('th').filter({ hasText: 'Project' }),
    ).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Task' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'Priority' }),
    ).toBeVisible();
  });

  test('deadline table shows all 5 rows', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('table');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(5);
  });

  test('deadline table contains expected project names', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('table');
    // Use td selector to avoid matching the timeline description that also mentions "Retrofit UI"
    await expect(
      page
        .locator('td')
        .filter({ hasText: /^Retrofit UI$/ })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('td')
        .filter({ hasText: /^Mobile App$/ })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('td')
        .filter({ hasText: /^Infra$/ })
        .first(),
    ).toBeVisible();
  });
});

test.describe('Turn 3 — week-over-week comparison', () => {
  test('renders three comparison stat cards', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    // Use exact: true — "This Week" is a substring of "Due This Week"
    await expect(page.getByText('This Week', { exact: true })).toBeVisible();
    await expect(page.getByText('Last Week', { exact: true })).toBeVisible();
    await expect(page.getByText('Change', { exact: true })).toBeVisible();
  });

  test('shows this week hours as 14h', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    // Filter by exact label text to avoid matching "Due This Week"
    const thisWeekCard = page.locator('.retrofit-stat-card').filter({
      has: page.locator('.retrofit-stat-label', { hasText: /^This Week$/ }),
    });
    await expect(thisWeekCard.locator('.retrofit-stat-value')).toHaveText(
      '14h',
    );
  });

  test('shows change percentage as +27%', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForSelector('.retrofit-stat-card');
    const changeCard = page
      .locator('.retrofit-stat-card')
      .filter({ hasText: 'Change' });
    await expect(changeCard.locator('.retrofit-stat-value')).toHaveText('+27%');
  });
});
