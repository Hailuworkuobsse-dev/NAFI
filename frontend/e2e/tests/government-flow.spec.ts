import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

test.describe('Government flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'GOVERNMENT_REGULATOR');
  });

  test('renders national dashboard with charts', async ({ page }) => {
    await page.goto('/gov/dashboard');
    await expect(page.getByRole('heading', { name: /national dashboard/i })).toBeVisible();
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible();
  });

  test('views contract registry', async ({ page }) => {
    await page.goto('/gov/contracts');
    await expect(page.getByRole('heading', { name: /contract registry/i })).toBeVisible();
  });
});
