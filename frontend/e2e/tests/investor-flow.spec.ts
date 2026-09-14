import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

test.describe('Investor flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'DIASPORA_INVESTOR');
  });

  test('views portfolio', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible();
  });

  test('browses opportunities', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.getByRole('heading', { name: /opportunities/i })).toBeVisible();
  });
});
