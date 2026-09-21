import { test, expect } from '@playwright/test';

test.describe('Idea Lifecycle, Draft Autosave & Withdrawal (T-3.6 – T-3.8)', () => {
  test('draft is autosaved to localStorage and restored upon return [T-3.6]', async ({ page }) => {
    // 1. Sign in as qarnia788
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/submit/, { timeout: 15000 });

    // 2. Type draft content
    const testTitle = 'Quantum Key Distribution Simulator for Edge IoT';
    await page.fill('#idea-title', testTitle);
    await page.fill(
      '#idea-summary',
      'A hardware-accelerated quantum simulation library for microcontrollers and edge gateways.',
    );

    // Wait 600ms for debounced autosave
    await page.waitForTimeout(600);

    // 3. Reload page to simulate leaving and returning
    await page.reload();

    // 4. Verify draft restored notice and values
    await expect(page.getByText(/Restored from unsaved draft/i)).toBeVisible();
    await expect(page.locator('#idea-title')).toHaveValue(testTitle);

    // 5. Test discard draft
    await page.getByRole('button', { name: /discard draft/i }).click();
    await expect(page.locator('#idea-title')).toHaveValue('');
    await expect(page.getByText(/Restored from unsaved draft/i)).not.toBeVisible();
  });

  test('idea detail page displays full content and withdrawal modal copy [T-3.7, T-3.8]', async ({
    page,
  }) => {
    // 1. Sign in as Maya Chen who authored seed ideas
    await page.goto('/login?next=%2Fidea%2Foffline-first-sync-field-research-teams-a1b2c3');
    await page.fill('#email', 'maya@ideapulse.dev');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Wait for landing on idea detail page
    await expect(page).toHaveURL(/\/idea\/offline-first-sync-field-research-teams-a1b2c3/, {
      timeout: 15000,
    });

    // 3. Verify idea presentation
    await expect(
      page.getByRole('heading', { name: /Offline-first sync for remote field research teams/i }),
    ).toBeVisible();
    await expect(page.getByText(/verified votes to qualify/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Proposal Details/i })).toBeVisible();

    // 4. Test withdrawal button and modal copy per RULES.md BR-023 [T-3.8]
    const withdrawBtn = page.getByRole('button', { name: /withdraw idea/i });
    if (await withdrawBtn.isVisible()) {
      await withdrawBtn.click();

      // Verify modal dialog opened
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal.getByRole('heading', { name: /Withdraw Idea/i })).toBeVisible();

      // Verify exact BR-023 copy
      await expect(
        modal.getByText(/Withdraw this idea\? It leaves the leaderboard, keeps its/i),
      ).toBeVisible();
      await expect(
        modal.getByText(/doesn't give back this week's submission slot\. This can't be undone\./i),
      ).toBeVisible();

      // Test cancel keeps idea active
      await modal.getByRole('button', { name: /keep idea active/i }).click();
      await expect(modal).not.toBeVisible();
    }
  });
});
