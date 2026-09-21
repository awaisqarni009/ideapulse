import { test, expect } from '@playwright/test';

test.describe('Feed Discovery Filters & Empty State (Phase 4 Batch 2)', () => {
  test('category filter pills update URL and filter card results [T-4.6]', async ({ page }) => {
    await page.goto('/feed');

    // Locate category filter pills
    const devToolsBtn = page.getByRole('button', { name: /^Developer Tools$/i });
    await expect(devToolsBtn).toBeVisible({ timeout: 10000 });

    // Click Developer Tools
    await devToolsBtn.click();
    await expect(page).toHaveURL(/category=developer-tools/, { timeout: 5000 });

    // Verify button is aria-pressed
    await expect(devToolsBtn).toHaveAttribute('aria-pressed', 'true');

    // Wait for ideas to filter
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible({ timeout: 10000 });
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tag filter chips update URL with tag parameter [T-4.6]', async ({ page }) => {
    await page.goto('/feed');

    const tagBtn = page.getByRole('button', { name: /#offline-first/i });
    await expect(tagBtn).toBeVisible({ timeout: 10000 });

    await tagBtn.click();
    await expect(page).toHaveURL(/tag=offline-first/, { timeout: 5000 });
    await expect(tagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('displays FeedEmptyState when no ideas match filter and resets cleanly [T-4.7]', async ({
    page,
  }) => {
    // Navigate with a category and tag combination guaranteed to have no matches
    await page.goto('/feed?category=hardware&tag=open-science');

    // Verify empty state container
    const emptyState = page.locator('[role="status"]');
    await expect(emptyState).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { level: 3, name: /no ideas found/i })).toBeVisible();

    // Click reset all filters button
    const resetBtn = page.getByRole('button', { name: /reset all filters/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // URL should return to /feed and cards should reappear
    await expect(page).toHaveURL(/\/feed$/, { timeout: 5000 });
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });
  });
});
