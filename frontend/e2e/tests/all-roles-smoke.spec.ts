import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

const ROLE_LANDINGS: Record<string, string> = {
  DIASPORA_INVESTOR: '/portfolio',
  COMMERCIAL_FARMER: '/farm/contracts',
  COMMERCIAL_BANK: '/bank/overview',
  DBE_OFFICER: '/dbe/portfolio',
  NAFA_OFFICER: '/nafa/guarantees',
  INPUT_SUPPLIER: '/supplier/orders',
  OFF_TAKER: '/buyer/purchases',
  GOVERNMENT_REGULATOR: '/gov/dashboard',
  DONOR: '/donor/grants',
  NAFI_ADMIN: '/admin/overview',
  COMPLIANCE_OFFICER: '/compliance/queue',
  ARBITRATOR: '/arbitration/cases',
};

test.describe('All roles smoke test', () => {
  for (const [role, path] of Object.entries(ROLE_LANDINGS)) {
    test(`${role} lands on ${path}`, async ({ page }) => {
      await signInAs(page, role);
      await expect(page).toHaveURL(new RegExp(path));
      await expect(page.locator('main')).toBeVisible();
    });
  }
});
