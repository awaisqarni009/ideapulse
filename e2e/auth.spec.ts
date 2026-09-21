import { test, expect } from '@playwright/test';

test.describe('Authentication & Route Guard Flow (Phase 2)', () => {
  test('unauthenticated user is redirected when accessing protected route /submit', async ({
    page,
  }) => {
    await page.goto('/submit');
    await expect(page).toHaveURL(/\/login\?next=%2Fsubmit/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('unauthenticated user is redirected when accessing protected route /settings', async ({
    page,
  }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('admin routes rewrite to 404 for non-admin requests', async ({ page }) => {
    const response = await page.goto('/admin/dashboard');
    expect(response?.status()).toBe(404);
  });

  test('registration page provides live password strength validation checklist', async ({
    page,
  }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Create your account');

    const passwordInput = page.locator('input[name="password"]');

    // Fill partial password
    await passwordInput.fill('short');
    await expect(page.getByText('At least 10 characters')).toBeVisible();

    // Fill valid password
    await passwordInput.fill('IdeaPulse2026!');
  });

  test('login page shows secure, specific error message on invalid credentials', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'nonexistent.user@ideapulse.dev');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email or password|too many/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test('forgot password flow accepts email and presents anti-enumeration success message', async ({
    page,
  }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText(/reset password/i);

    await page.fill('input[name="email"]', 'recovery.test@ideapulse.dev');
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText('Check your email')).toBeVisible({ timeout: 15000 });
  });
});
