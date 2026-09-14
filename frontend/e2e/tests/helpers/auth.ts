import type { Page } from '@playwright/test';

const ROLE_EMAILS: Record<string, string> = {
  DIASPORA_INVESTOR: 'investor@nafi.et',
  COMMERCIAL_FARMER: 'farmer@nafi.et',
  COMMERCIAL_BANK: 'bank@nafi.et',
  DBE_OFFICER: 'dbe@nafi.et',
  NAFA_OFFICER: 'nafa@nafi.et',
  INPUT_SUPPLIER: 'supplier@nafi.et',
  OFF_TAKER: 'buyer@nafi.et',
  GOVERNMENT_REGULATOR: 'gov@nafi.et',
  DONOR: 'donor@nafi.et',
  NAFI_ADMIN: 'admin@nafi.et',
  COMPLIANCE_OFFICER: 'compliance@nafi.et',
  ARBITRATOR: 'arbitrator@nafi.et',
};

export async function signInAs(page: Page, role: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ROLE_EMAILS[role]!);
  await page.getByLabel(/password/i).fill('Password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
}
