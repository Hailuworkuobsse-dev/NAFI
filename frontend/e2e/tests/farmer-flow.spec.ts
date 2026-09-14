import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

test.describe('Farmer flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'COMMERCIAL_FARMER');
  });

  test('views contracts list', async ({ page }) => {
    await page.goto('/farm/contracts');
    await expect(page.getByRole('heading', { name: /my contracts/i })).toBeVisible();
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/farm/contracts');

    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.getByRole('navigation', { name: /sidebar/i })).toBeVisible();

    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(page.getByRole('navigation', { name: /sidebar/i })).not.toBeVisible();
  });
});
