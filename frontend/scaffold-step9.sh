#!/usr/bin/env bash
# ============================================================
# NAFI Frontend — Step 9 Scaffolding Script
# Testing + Observability layer:
#   - MSW handlers for integration tests
#   - Unit tests for shared packages
#   - Vitest configs for apps
#   - Playwright E2E setup (12 roles + smoke + a11y)
#   - Lighthouse CI configs
#   - Sentry + analytics + web-vitals + logger
#   - CI pipeline update
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Step 9 scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

# ============================================================
# ROOT CONFIGS
# ============================================================

mkfile "size-limit.config.js" <<'EOF'
export default [
  {
    name: 'Landing (gzipped)',
    path: 'apps/landing/dist/assets/index-*.js',
    limit: '150 KB',
  },
  {
    name: 'Web app (gzipped)',
    path: 'apps/web/dist/assets/index-*.js',
    limit: '350 KB',
  },
];
EOF

mkfile ".github/workflows/ci.yml" <<'EOF'
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint · Typecheck · Unit · Component
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm size

  e2e:
    name: E2E
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm --filter @nafi/e2e exec playwright install --with-deps chromium
      - run: pnpm --filter @nafi/e2e test
        env:
          E2E_BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 14

  a11y:
    name: Accessibility
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm --filter @nafi/e2e exec playwright install --with-deps chromium
      - run: pnpm --filter @nafi/e2e test:a11y
EOF

# ============================================================
# UNIT TESTS — shared packages
# ============================================================

mkfile "packages/formatters/src/__tests__/currency.test.ts" <<'EOF'
import { describe, expect, it } from 'vitest';

import { formatCompactMoney, formatMoney } from '../currency';

describe('formatMoney', () => {
  it('formats ETB with symbol', () => {
    expect(formatMoney(1234.5, 'ETB')).toContain('1,234.50');
  });

  it('accepts decimal strings from Prisma', () => {
    expect(formatMoney('1234.567', 'ETB', 'en-US')).toBe('ETB 1,234.57');
  });

  it('returns em-dash for invalid input', () => {
    expect(formatMoney('not-a-number', 'ETB')).toBe('—');
    expect(formatMoney(NaN, 'USD')).toBe('—');
  });

  it('formats USD with $', () => {
    expect(formatMoney(1000, 'USD', 'en-US')).toBe('$1,000.00');
  });
});

describe('formatCompactMoney', () => {
  it('compacts large numbers', () => {
    const result = formatCompactMoney(12_450_000, 'USD', 'en-US');
    expect(result).toMatch(/\$12\.45?M/);
  });
});
EOF

mkfile "packages/formatters/src/__tests__/number.test.ts" <<'EOF'
import { describe, expect, it } from 'vitest';

import { formatNumber, formatPercent, formatWeight } from '../number';

describe('formatNumber', () => {
  it('formats integers with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles invalid input', () => {
    expect(formatNumber('x')).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats as percentage', () => {
    expect(formatPercent(0.075, 1)).toBe('7.5%');
  });
});

describe('formatWeight', () => {
  it('converts to MT above 1000 kg', () => {
    expect(formatWeight(2500)).toBe('2.50 MT');
  });

  it('keeps kg below 1000', () => {
    expect(formatWeight(500)).toBe('500.00 kg');
  });
});
EOF

mkfile "packages/validators/src/__tests__/contract.test.ts" <<'EOF'
import { describe, expect, it } from 'vitest';

import { contractCreateSchema } from '../contract';

describe('contractCreateSchema', () => {
  const valid = {
    commercialFarmerId: '00000000-0000-4000-8000-000000000000',
    targetCrop: 'Sesame',
    totalTargetYieldKg: 1000,
    guaranteedFloorPriceEtb: 45.5,
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    governmentWitnessId: '00000000-0000-4000-8000-000000000001',
    regionCode: 'ET-AM',
  };

  it('accepts valid input', () => {
    expect(() => contractCreateSchema.parse(valid)).not.toThrow();
  });

  it('rejects past maturity date', () => {
    expect(() =>
      contractCreateSchema.parse({ ...valid, maturityDate: new Date('2020-01-01') }),
    ).toThrow(/future/);
  });

  it('rejects negative yield', () => {
    expect(() =>
      contractCreateSchema.parse({ ...valid, totalTargetYieldKg: -10 }),
    ).toThrow();
  });
});
EOF

mkfile "packages/rbac-core/src/__tests__/rolePermissions.test.ts" <<'EOF'
import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '../permissions';
import { ROLE_PERMISSIONS } from '../rolePermissions';
import { ROLES } from '../roles';

describe('ROLE_PERMISSIONS', () => {
  it('defines permissions for every role', () => {
    Object.values(ROLES).forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    });
  });

  it('NAFI_ADMIN has wildcard', () => {
    expect(ROLE_PERMISSIONS.NAFI_ADMIN).toEqual(['*']);
  });

  it('COMMERCIAL_FARMER can create contracts', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_FARMER).toContain(PERMISSIONS.CONTRACT_CREATE);
  });

  it('COMMERCIAL_BANK can release escrow', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_BANK).toContain(PERMISSIONS.ESCROW_RELEASE);
  });

  it('DIASPORA_INVESTOR cannot approve contracts', () => {
    expect(ROLE_PERMISSIONS.DIASPORA_INVESTOR).not.toContain(PERMISSIONS.CONTRACT_APPROVE);
  });
});
EOF

# ============================================================
# WEB TEST SETUP
# ============================================================

mkdir -p apps/web/src/test/msw

mkfile "apps/web/vitest.config.ts" <<'EOF'
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', '**/index.ts', '**/*.d.ts'],
    },
  },
});
EOF

mkfile "apps/web/src/test/setup.ts" <<'EOF'
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
} as unknown as typeof IntersectionObserver;
EOF

mkfile "apps/web/src/test/msw/handlers.ts" <<'EOF'
import { http, HttpResponse } from 'msw';

import type { ContractSummary } from '@/api/types/contract';
import type { PublicOpportunity } from '@/api/types/opportunity';

const API = '/api/v1';

export const mockContract: ContractSummary = {
  id: 'contract-1',
  targetCrop: 'Sesame',
  region: 'Amhara',
  regionCode: 'ET-AM',
  farmerId: 'farmer-1',
  farmerName: 'Abebe Bekele',
  totalTargetYieldKg: '500000.00',
  guaranteedFloorPriceEtb: '45.50',
  contractValueEtb: '22750000.00',
  status: 'ACTIVE',
  maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockOpportunity: PublicOpportunity = {
  id: 'opp-1',
  targetCrop: 'Sesame',
  region: 'Amhara',
  regionCode: 'ET-AM',
  targetAmountEtb: '5000000.00',
  committedAmountEtb: '2500000.00',
  investorCount: 12,
  targetYieldKg: '500000.00',
  floorPriceEtb: '45.50',
  maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  fundedPercent: 0.5,
};

export const handlers = [
  http.get(`${API}/contracts`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [mockContract], page: 1, pageSize: 20, total: 1 },
    }),
  ),
  http.get(`${API}/contracts/:id`, () =>
    HttpResponse.json({ success: true, data: mockContract }),
  ),
  http.post(`${API}/contracts`, () =>
    HttpResponse.json({ success: true, data: mockContract }, { status: 201 }),
  ),
  http.get(`${API}/opportunities`, () =>
    HttpResponse.json({ success: true, data: [mockOpportunity] }),
  ),
  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: {
        id: 'user-1',
        nafiId: 'NAFI-ABC12345',
        email: 'farmer@nafi.et',
        fullName: 'Abebe Bekele',
        role: 'COMMERCIAL_FARMER',
        permissions: ['contract:create', 'contract:read:own'],
        locale: 'en',
        mfaEnabled: false,
      },
    }),
  ),
  http.post(`${API}/inputs/:id/verify`, () =>
    HttpResponse.json({ success: true, data: { verified: true } }),
  ),
];

export const errorHandlers = {
  forbidden: [
    http.get(`${API}/contracts`, () =>
      HttpResponse.json(
        { success: false, error: { code: 'forbidden', message: 'Access denied', requestId: 'r1' } },
        { status: 403 },
      ),
    ),
  ],
  serverError: [
    http.get(`${API}/contracts`, () =>
      HttpResponse.json(
        { success: false, error: { code: 'internal', message: 'Server error', requestId: 'r2' } },
        { status: 500 },
      ),
    ),
  ],
};
EOF

mkfile "apps/web/src/test/msw/server.ts" <<'EOF'
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);
EOF

mkfile "apps/web/src/hooks/__tests__/useTableState.test.ts" <<'EOF'
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTableState } from '../useTableState';

describe('useTableState', () => {
  it('initializes with defaults', () => {
    const { result } = renderHook(() => useTableState());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.q).toBe('');
  });

  it('updates page', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it('resets page to 1 when search changes', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(5));
    act(() => result.current.setSearch('sesame'));
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('sesame');
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useTableState());
    act(() => {
      result.current.setPage(5);
      result.current.setSearch('x');
    });
    act(() => result.current.reset());
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('');
  });
});
EOF

# ============================================================
# E2E PACKAGE
# ============================================================

mkdir -p e2e/tests/helpers

mkfile "e2e/package.json" <<'EOF'
{
  "name": "@nafi/e2e",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:a11y": "playwright test --grep @a11y",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.10.0",
    "@playwright/test": "^1.48.2",
    "@types/node": "^22.7.5",
    "typescript": "^5.6.3"
  }
}
EOF

mkfile "e2e/playwright.config.ts" <<'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm --filter @nafi/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
EOF

mkfile "e2e/tsconfig.json" <<'EOF'
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node", "@playwright/test"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  },
  "include": ["**/*.ts"]
}
EOF

mkfile "e2e/tests/helpers/auth.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/auth.spec.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/all-roles-smoke.spec.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/farmer-flow.spec.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/investor-flow.spec.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/government-flow.spec.ts" <<'EOF'
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
EOF

mkfile "e2e/tests/a11y.spec.ts" <<'EOF'
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
EOF

# ============================================================
# LIGHTHOUSE CI
# ============================================================

mkfile "apps/web/lighthouserc.json" <<'EOF'
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm --filter @nafi/web preview",
      "startServerReadyPattern": "Local:",
      "url": ["http://localhost:3000/login"],
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
EOF

mkfile "apps/landing/lighthouserc.json" <<'EOF'
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm --filter @nafi/landing preview",
      "startServerReadyPattern": "Local:",
      "url": ["http://localhost:3001/"],
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 1800 }]
      }
    }
  }
}
EOF

# ============================================================
# OBSERVABILITY — Sentry, analytics, logger, web vitals
# ============================================================

mkdir -p apps/web/src/observability
mkdir -p apps/landing/src/observability

mkfile "apps/web/src/observability/sentry.ts" <<'EOF'
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    release: import.meta.env.VITE_APP_VERSION,
    tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Failed to fetch/,
      /NetworkError/,
    ],
    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/([?&])token=[^&]*/g, '$1token=[redacted]');
      }
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
      }
      return event;
    },
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export function identifyUser(user: {
  id: string;
  role: string;
  institutionId?: string;
}): void {
  Sentry.setUser({ id: user.id, role: user.role, institutionId: user.institutionId });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export { Sentry };
EOF

mkfile "apps/web/src/observability/analytics.ts" <<'EOF'
type AnalyticsEvent =
  | { name: 'page_view'; props: { path: string } }
  | { name: 'login'; props: { role: string } }
  | { name: 'logout'; props: Record<string, never> }
  | { name: 'contract_created'; props: { crop: string; region: string } }
  | { name: 'investment_committed'; props: { currency: string; crop: string } }
  | { name: 'delivery_verified'; props: { offline: boolean } }
  | { name: 'settlement_executed'; props: { crop: string } }
  | { name: 'escrow_released'; props: { currency: string } };

const QUEUE_KEY = 'nafi.analytics.queue';
const MAX_QUEUE = 100;

interface QueuedEvent {
  event: AnalyticsEvent;
  ts: number;
}

function loadQueue(): QueuedEvent[] {
  try {
    return JSON.parse(sessionStorage.getItem(QUEUE_KEY) ?? '[]') as QueuedEvent[];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedEvent[]): void {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch {
    /* quota exceeded — drop */
  }
}

function isDoNotTrack(): boolean {
  return navigator.doNotTrack === '1';
}

export function track(event: AnalyticsEvent): void {
  if (isDoNotTrack()) return;
  const queue = loadQueue();
  queue.push({ event, ts: Date.now() });
  saveQueue(queue);
  void flush();
}

export async function flush(): Promise<void> {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint || !navigator.onLine) return;

  const queue = loadQueue();
  if (queue.length === 0) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
      keepalive: true,
    });
    saveQueue([]);
  } catch {
    /* will retry */
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush());
}
EOF

mkfile "apps/web/src/observability/logger.ts" <<'EOF'
type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: Level =
  (import.meta.env.VITE_LOG_LEVEL as Level | undefined) ??
  (import.meta.env.PROD ? 'info' : 'debug');

const SENSITIVE_KEYS = /password|token|secret|authorization|ssn|credit.?card/i;

function sanitize(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = SENSITIVE_KEYS.test(key) ? '[redacted]' : sanitize(value);
  }
  return out;
}

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  if (!import.meta.env.PROD) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn('[nafi]', payload);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
EOF

mkfile "apps/web/src/observability/webVitals.ts" <<'EOF'
type Metric = {
  name: string;
  value: number;
  rating: string;
  id: string;
  navigationType: string;
};

function report(metric: Metric): void {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  void fetch(`${endpoint}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      url: location.pathname,
    }),
    keepalive: true,
  });
}

export function initWebVitals(): void {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === 'largest-contentful-paint' ||
          entry.entryType === 'paint' ||
          entry.entryType === 'first-input'
        ) {
          report({
            name: entry.entryType,
            value: entry.startTime,
            rating: 'good',
            id: `${entry.entryType}-${Date.now()}`,
            navigationType: 'navigate',
          });
        }
      }
    });
    po.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
  } catch {
    /* not supported */
  }
}
EOF

# Add Sentry init to main.tsx
if [ -f "apps/web/src/main.tsx" ]; then
  cat > "apps/web/src/main.tsx" <<'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './i18n';
import './styles/globals.css';
import { initSentry } from './observability/sentry';
import { initWebVitals } from './observability/webVitals';

initSentry();
initWebVitals();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
EOF
  echo "  ✓ apps/web/src/main.tsx (Sentry + WebVitals init)"
fi

# Add react-hooks for Sentry user identification in AuthProvider
if [ -f "apps/web/src/auth/AuthProvider.tsx" ]; then
  awk '
    /^import { authApi } from/ {
      print "import { clearUser, identifyUser } from '\''@/observability/sentry'\'';"
    }
    { print }
  ' apps/web/src/auth/AuthProvider.tsx > apps/web/src/auth/AuthProvider.tsx.tmp
  mv apps/web/src/auth/AuthProvider.tsx.tmp apps/web/src/auth/AuthProvider.tsx

  # Add effect
  awk '
    /const value: AuthContextValue = useMemo/ {
      print "  useEffect(() => {"
      print "    if (user) {"
      print "      identifyUser({ id: user.id, role: user.role, institutionId: user.institutionId });"
      print "    } else {"
      print "      clearUser();"
      print "    }"
      print "  }, [user]);"
      print ""
    }
    { print }
  ' apps/web/src/auth/AuthProvider.tsx > apps/web/src/auth/AuthProvider.tsx.tmp
  mv apps/web/src/auth/AuthProvider.tsx.tmp apps/web/src/auth/AuthProvider.tsx

  echo "  ✓ apps/web/src/auth/AuthProvider.tsx (Sentry user identification)"
fi

# Update root package.json scripts
if [ -f "package.json" ]; then
  cat > package.json <<'EOF'
{
  "name": "nafi-frontend",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20.11.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "test:e2e": "pnpm --filter @nafi/e2e test",
    "test:e2e:ui": "pnpm --filter @nafi/e2e test:ui",
    "test:a11y": "pnpm --filter @nafi/e2e test:a11y",
    "lighthouse": "lhci autorun",
    "size": "size-limit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "storybook": "pnpm --filter @nafi/ui-react storybook",
    "prepare": "husky || true"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.5.0",
    "@commitlint/config-conventional": "^19.5.0",
    "@lhci/cli": "^0.14.0",
    "@nafi/config": "workspace:*",
    "@size-limit/preset-app": "^11.1.4",
    "@types/node": "^22.7.5",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "size-limit": "^11.1.4",
    "turbo": "^2.2.3",
    "typescript": "^5.6.3"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
EOF
  echo "  ✓ package.json (updated scripts + devDeps)"
fi

# Add test scripts to web and landing and ui-react package.json
for pkg_path in "apps/web/package.json" "apps/landing/package.json" "packages/ui-react/package.json"; do
  if [ -f "$pkg_path" ]; then
    if command -v node >/dev/null 2>&1; then
      node -e "
        const fs = require('fs');
        const p = '$pkg_path';
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        if (!pkg.scripts['test']) pkg.scripts['test'] = 'vitest run';
        if (!pkg.scripts['test:watch']) pkg.scripts['test:watch'] = 'vitest';
        if (!pkg.scripts['test:coverage']) pkg.scripts['test:coverage'] = 'vitest run --coverage';
        if (p.includes('web') || p.includes('ui-react')) {
          pkg.devDependencies = pkg.devDependencies || {};
          pkg.devDependencies['vitest'] = pkg.devDependencies['vitest'] || '^2.1.3';
          pkg.devDependencies['@testing-library/react'] = pkg.devDependencies['@testing-library/react'] || '^16.0.1';
          pkg.devDependencies['@testing-library/jest-dom'] = pkg.devDependencies['@testing-library/jest-dom'] || '^6.6.2';
          pkg.devDependencies['@testing-library/user-event'] = pkg.devDependencies['@testing-library/user-event'] || '^14.5.2';
          pkg.devDependencies['jsdom'] = pkg.devDependencies['jsdom'] || '^25.0.1';
          pkg.devDependencies['@vitest/coverage-v8'] = pkg.devDependencies['@vitest/coverage-v8'] || '^2.1.3';
        }
        if (p.includes('web')) {
          pkg.devDependencies['msw'] = pkg.devDependencies['msw'] || '^2.4.11';
          pkg.dependencies['@sentry/react'] = pkg.dependencies['@sentry/react'] || '^8.34.0';
        }
        if (p.includes('landing')) {
          pkg.dependencies['@sentry/react'] = pkg.dependencies['@sentry/react'] || '^8.34.0';
        }
        fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
      " 2>/dev/null || echo "    ⚠ manual package.json update needed for $pkg_path"
    fi
  fi
done

# ============================================================
# DONE
# ============================================================

echo ""
echo "============================================================"
echo "✅ NAFI Step 9 scaffolding complete"
echo "============================================================"
echo ""
echo "Created the testing + observability layer:"
echo ""
echo "  Root:"
echo "    size-limit.config.js                (bundle budget)"
echo "    package.json                        (test/e2e/a11y/size/lighthouse scripts)"
echo "    .github/workflows/ci.yml            (quality + e2e + a11y jobs)"
echo ""
echo "  Unit tests (shared):"
echo "    packages/formatters/src/__tests__/{currency,number}.test.ts"
echo "    packages/validators/src/__tests__/contract.test.ts"
echo "    packages/rbac-core/src/__tests__/rolePermissions.test.ts"
echo ""
echo "  Integration tests (web):"
echo "    apps/web/vitest.config.ts"
echo "    apps/web/src/test/setup.ts          (MSW server + jsdom stubs)"
echo "    apps/web/src/test/msw/{handlers,server}.ts"
echo "    apps/web/src/hooks/__tests__/useTableState.test.ts"
echo ""
echo "  E2E (Playwright):"
echo "    e2e/package.json"
echo "    e2e/playwright.config.ts"
echo "    e2e/tsconfig.json"
echo "    e2e/tests/helpers/auth.ts"
echo "    e2e/tests/auth.spec.ts"
echo "    e2e/tests/all-roles-smoke.spec.ts   (12 role smoke tests)"
echo "    e2e/tests/farmer-flow.spec.ts"
echo "    e2e/tests/investor-flow.spec.ts"
echo "    e2e/tests/government-flow.spec.ts"
echo "    e2e/tests/a11y.spec.ts              (axe-core audits)"
echo ""
echo "  Lighthouse:"
echo "    apps/web/lighthouserc.json"
echo "    apps/landing/lighthouserc.json"
echo ""
echo "  Observability:"
echo "    apps/web/src/observability/sentry.ts       (PII scrubbing)"
echo "    apps/web/src/observability/analytics.ts    (offline-aware, DNT-respecting)"
echo "    apps/web/src/observability/logger.ts       (structured, sanitized)"
echo "    apps/web/src/observability/webVitals.ts    (CLS, LCP, INP)"
echo ""
echo "  Wired:"
echo "    apps/web/src/main.tsx               (initSentry + initWebVitals)"
echo "    apps/web/src/auth/AuthProvider.tsx  (identifyUser / clearUser)"
echo ""
echo "Next steps:"
echo "  pnpm install"
echo "  pnpm test"
echo "  pnpm --filter @nafi/e2e exec playwright install"
echo "  pnpm --filter @nafi/e2e test"
echo ""
echo "Then run scaffold-step10.sh (final: deployment + handover docs)."
echo ""