import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

test.describe('Bank flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'COMMERCIAL_BANK');
  });

  test('views escrows', async ({ page }) => {
    await page.goto('/bank/escrows');
    await expect(page.getByRole('heading', { name: /escrows/i })).toBeVisible();
  });

  test('opens an escrow and starts release flow', async ({ page }) => {
    await page.goto('/bank/escrows');
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.click();

    const releaseBtn = page.getByRole('button', { name: /release funds/i });
    if (await releaseBtn.isVisible()) {
      await releaseBtn.click();
      await expect(page.getByText(/irreversible action/i)).toBeVisible();
    }
  });
});
