import { test, expect } from '@playwright/test';

test.describe('Voting Core & Animations (T-3.9 – T-3.18)', () => {
  test('header displays QuotaHUD for authenticated user with 5 pips [T-3.16, T-3.17]', async ({
    page,
  }) => {
    // 1. Sign in as qarnia788
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/submit/, { timeout: 15000 });

    // 2. Locate QuotaHUD in the sticky header
    const quotaHud = page.locator('header [role="status"]');
    await expect(quotaHud).toBeVisible({ timeout: 10000 });

    // 3. Verify QuotaHUD contains 5 pips
    const pips = quotaHud.locator('span.rounded-full');
    await expect(pips).toHaveCount(5);

    // 4. Verify quota text contains "left"
    await expect(quotaHud).toContainText(/left/i);
  });

  test('own idea displays disabled lock state per BR-011 and DESIGN.md §7.2 [T-3.11, T-3.25]', async ({
    page,
  }) => {
    // 1. Sign in as Maya Chen (the author of seed idea)
    await page.goto('/login?next=%2Fidea%2Foffline-first-sync-field-research-teams-a1b2c3');
    await page.fill('#email', 'maya@ideapulse.dev');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/idea\/offline-first-sync-field-research-teams-a1b2c3/, {
      timeout: 15000,
    });

    // 2. Locate VoteButton
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();

    // 3. Verify disabled state and tooltip
    await expect(voteBtn).toBeDisabled();
    await expect(voteBtn).toHaveAttribute('title', "You can't vote on your own idea.");
  });

  test('anonymous user clicking vote is directed to login with return path [T-3.11, T-3.19]', async ({
    page,
  }) => {
    // 1. Visit idea detail page logged out
    await page.goto('/idea/offline-first-sync-field-research-teams-a1b2c3');

    // 2. Vote button should have enabled appearance
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();
    await expect(voteBtn).not.toBeDisabled();

    // 3. Click button
    await voteBtn.click();

    // 4. Verify redirected to login with next return path
    await expect(page).toHaveURL(/\/login\?next=/, { timeout: 10000 });
    expect(page.url()).toContain(
      encodeURIComponent('/idea/offline-first-sync-field-research-teams-a1b2c3'),
    );
  });

  test('vote cast and 10-minute retraction flow with BR-014 notice [T-3.9, T-3.14, T-3.18]', async ({
    page,
  }) => {
    // 1. Sign in as qarnia788 and go to unvoted idea
    await page.goto('/login?next=%2Fidea%2Flocally-cached-llm-inference-consumer-gpus-b2c3d4');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/idea\/locally-cached-llm-inference-consumer-gpus-b2c3d4/, {
      timeout: 15000,
    });

    // 2. Locate VoteButton
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();

    // Get initial votes from aria-label
    const initialAria = await voteBtn.getAttribute('aria-label');
    const initialVotes = parseInt(initialAria?.match(/\d+/)?.[0] || '0', 10);

    // 3. Cast vote
    await voteBtn.click();

    // 4. Button enters retractable / voted state within 10m window [T-3.18]
    const retractAffordance = page.getByRole('button', { name: /retract vote/i });
    await expect(retractAffordance).toBeVisible({ timeout: 10000 });

    // Verify count incremented
    await expect(voteBtn).toContainText(String(initialVotes + 1));

    // 5. Retract vote inside 10-minute window
    await retractAffordance.click();

    // 6. Verify toast notification per BR-014
    await expect(page.getByText(/quota slot remains consumed per BR-014/i)).toBeVisible({
      timeout: 10000,
    });

    // 7. Button reverts back to unvoted state and count rolls back
    await expect(retractAffordance).not.toBeVisible();
    await expect(voteBtn).toContainText(String(initialVotes));
  });
});
