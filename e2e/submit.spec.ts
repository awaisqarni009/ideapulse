import { test, expect } from '@playwright/test';

test.describe('Idea Submission & Cooldown Flow (Phase 3 Batch 1)', () => {
  test('unauthenticated visitor is redirected to login with next=/submit', async ({ page }) => {
    await page.goto('/submit');
    await expect(page).toHaveURL(/\/login\?next=%2Fsubmit/);
  });

  test('user on cooldown sees CooldownPanel with countdown and UTC timestamp [T-3.1, T-3.4]', async ({
    page,
  }) => {
    // 1. Sign in as Maya Chen who has an active idea submitted within 7 days
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('input[name="email"]', 'maya@ideapulse.dev');
    await page.fill('input[name="password"]', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Wait for redirection to /submit
    await expect(page).toHaveURL(/\/submit/, { timeout: 15000 });

    // 3. Verify CooldownPanel renders accurately
    await expect(page.getByText(/Submission Cooldown Active/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /used this week's submission/i })).toBeVisible();
    await expect(page.getByText(/Your next submission slot opens/i)).toBeVisible();
    await expect(page.getByText(/UTC/i)).toBeVisible();

    // 4. Verify countdown blocks are rendered
    await expect(page.getByText('Days', { exact: true })).toBeVisible();
    await expect(page.getByText('Hours', { exact: true })).toBeVisible();
    await expect(page.getByText('Minutes', { exact: true })).toBeVisible();
    await expect(page.getByText('Seconds', { exact: true })).toBeVisible();
  });

  test('eligible user sees IdeaForm with live character counters, tags, and markdown tabs [T-3.2, T-3.5]', async ({
    browser,
  }) => {
    // Use an isolated context for the second user
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Sign in as qarnia788 who has 0 submissions in the rolling 7-day window
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('input[name="email"]', 'qarnia788@gmail.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Wait for landing on /submit
    await expect(page).toHaveURL(/\/submit/, { timeout: 15000 });

    // 3. Verify IdeaForm components
    await expect(page.getByRole('heading', { name: /Submit a New Proposal/i })).toBeVisible();
    await expect(page.locator('#idea-title')).toBeVisible();
    await expect(page.locator('#idea-category')).toBeVisible();
    await expect(page.locator('#idea-summary')).toBeVisible();
    await expect(page.locator('#idea-body')).toBeVisible();

    // 4. Test character counters
    const titleInput = page.locator('#idea-title');
    await titleInput.fill('High-Performance WebAssembly Vector Search Engine');
    await expect(page.locator('#title-counter')).toContainText('/120');

    // 5. Test Tag input and chip addition
    const tagInput = page.locator('#idea-tag-input');
    await tagInput.fill('wasm');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('#wasm')).toBeVisible();

    // 6. Test Markdown Preview tab [T-3.5]
    const bodyInput = page.locator('#idea-body');
    await bodyInput.fill('## Core Overview\nThis project provides **ultra-fast** `vector` search.');

    // Click Preview tab
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.locator('strong')).toContainText('ultra-fast');
    await expect(page.locator('code')).toContainText('vector');

    // Switch back to Write tab
    await page.getByRole('button', { name: /write/i }).click();
    await expect(page.locator('#idea-body')).toBeVisible();

    await context.close();
  });
});
