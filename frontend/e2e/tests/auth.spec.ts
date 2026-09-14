import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/login/);
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('farmer navigating to /bank/overview is redirected', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('farmer@nafi.et');
    await page.getByLabel(/password/i).fill('Password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/farm/);

    await page.goto('/bank/overview');
    await expect(page).toHaveURL(/\/farm/);
  });
});
