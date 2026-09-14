import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

const PAGES_TO_AUDIT = [
  { role: 'DIASPORA_INVESTOR', path: '/portfolio' },
  { role: 'DIASPORA_INVESTOR', path: '/opportunities' },
  { role: 'COMMERCIAL_FARMER', path: '/farm/contracts' },
  { role: 'COMMERCIAL_FARMER', path: '/farm/inputs' },
  { role: 'COMMERCIAL_BANK', path: '/bank/escrows' },
  { role: 'GOVERNMENT_REGULATOR', path: '/gov/dashboard' },
  { role: 'NAFI_ADMIN', path: '/admin/users' },
] as const;

test.describe('@a11y Accessibility audits', () => {
  for (const { role, path } of PAGES_TO_AUDIT) {
    test(`${role} → ${path}`, async ({ page }) => {
      await signInAs(page, role);
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});
