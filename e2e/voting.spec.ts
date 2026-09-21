import { test, expect } from '@playwright/test';

test.describe('Voting Core (T-3.9 – T-3.13)', () => {
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

  test('eligible non-author user can cast vote with optimistic transition [T-3.9, T-3.11, T-3.12]', async ({
    page,
  }) => {
    // 1. Sign in as qarnia788
    await page.goto('/login?next=%2Fidea%2Foffline-first-sync-field-research-teams-a1b2c3');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/idea\/offline-first-sync-field-research-teams-a1b2c3/, {
      timeout: 15000,
    });

    // 2. Locate VoteButton
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();

    const titleAttr = await voteBtn.getAttribute('title');

    // If not already voted, test voting click and optimistic update
    if (titleAttr !== 'You voted for this.') {
      await expect(voteBtn).not.toBeDisabled();
      await voteBtn.click();

      // Should transition to voted state
      await expect(voteBtn).toHaveAttribute('title', 'You voted for this.', { timeout: 10000 });
      await expect(voteBtn).toBeDisabled();
    } else {
      // Already voted in prior run, verify voted state is preserved
      await expect(voteBtn).toHaveAttribute('title', 'You voted for this.');
    }
  });
});
