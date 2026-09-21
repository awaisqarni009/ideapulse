import { test, expect } from '@playwright/test';

test.describe('Leaderboard & Semantic Ranking (Phase 4 Batch 2)', () => {
  test('renders /leaderboard with cycle standings and top ranked ideas [T-4.9, T-4.10]', async ({
    page,
  }) => {
    await page.goto('/leaderboard');

    // Verify page heading and cycle badge
    await expect(page.getByRole('heading', { level: 1, name: /leaderboard/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/standings/i)).toBeVisible();

    // Verify semantic <ol role="list">
    const ol = page.locator('ol[role="list"]');
    await expect(ol).toBeVisible({ timeout: 10000 });

    const rows = ol.locator('li');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(20);

    // Verify first row has rank "01" per DESIGN.md §7.6
    const firstRow = rows.first();
    await expect(firstRow).toContainText('01');

    // Verify title and author are present
    await expect(firstRow.locator('h3')).toBeVisible();

    // Verify verified vote count badge with pulse
    await expect(firstRow.locator('div[title*="verified community votes"]')).toBeVisible();
  });

  test('clicking leaderboard row navigates to idea detail page [T-4.10]', async ({ page }) => {
    await page.goto('/leaderboard');

    const firstRow = page.locator('ol[role="list"] li').first();
    const link = firstRow.locator('a');
    await expect(link).toBeVisible({ timeout: 10000 });

    const href = await link.getAttribute('href');
    expect(href).toMatch(/\/idea\/.+/);

    await link.click();
    await expect(page).toHaveURL(new RegExp(href!), { timeout: 10000 });
  });
});
