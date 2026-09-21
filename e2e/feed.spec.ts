import { test, expect } from '@playwright/test';

test.describe('Community Feed & Discovery (Phase 4 Batch 1)', () => {
  test('renders /feed with header, active cycle badge, and sort tabs [T-4.1, T-4.4]', async ({
    page,
  }) => {
    await page.goto('/feed');

    // Verify page title and header
    await expect(page.getByRole('heading', { level: 1, name: /community feed/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/cycle.*proposals/i)).toBeVisible();

    // Verify SortTabs per T-4.4
    const sortTabs = page.locator('[role="tablist"][aria-label="Feed sorting options"]');
    await expect(sortTabs).toBeVisible();

    const trendingTab = page.getByRole('tab', { name: /trending/i });
    const newestTab = page.getByRole('tab', { name: /newest/i });
    const topTab = page.getByRole('tab', { name: /top this cycle/i });

    await expect(trendingTab).toBeVisible();
    await expect(newestTab).toBeVisible();
    await expect(topTab).toBeVisible();

    // Default tab should be trending
    await expect(trendingTab).toHaveAttribute('aria-selected', 'true');
  });

  test('sort tabs switch sort mode and persist in URL [T-4.4]', async ({ page }) => {
    await page.goto('/feed');

    const newestTab = page.getByRole('tab', { name: /newest/i });
    await newestTab.click();

    await expect(page).toHaveURL(/sort=newest/, { timeout: 5000 });
    await expect(newestTab).toHaveAttribute('aria-selected', 'true');

    const topTab = page.getByRole('tab', { name: /top this cycle/i });
    await topTab.click();

    await expect(page).toHaveURL(/sort=top/, { timeout: 5000 });
    await expect(topTab).toHaveAttribute('aria-selected', 'true');
  });

  test('renders ideas as cards in the responsive grid with metadata [T-4.1, T-4.3]', async ({
    page,
  }) => {
    await page.goto('/feed');

    // Wait for at least one card in the grid
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify first card has essential metadata per DESIGN.md §7.3
    const firstCard = cards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('button')).toBeVisible(); // vote button or affordance
  });
});
