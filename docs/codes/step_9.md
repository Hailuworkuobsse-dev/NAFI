# 🚀 NAFI Frontend — Step 9 of 10

## Testing, Accessibility, Performance & Observability

**Step Goal:** Harden the entire platform with the complete quality layer: unit tests, component tests, integration tests with MSW, E2E tests across all 12 roles, accessibility audits, Lighthouse performance budgets, error monitoring, and privacy-first analytics.

**Duration Estimate:** 8–12 days
**Deliverable:** Every commit is validated by CI; every role has at least one E2E happy path; every page meets a11y and performance thresholds; every uncaught error lands in Sentry.

---

## 9.1 Testing Strategy Overview

| Level | Tool | Coverage Target | Scope |
| :--- | :--- | :--- | :--- |
| **Unit** | Vitest | 85% | Utils, hooks, RBAC, formatters, validators |
| **Component** | Testing Library | 70% | All `@nafi/ui-react` primitives + composites |
| **Integration** | Testing Library + MSW | 60% | Page-level flows, RBAC guards, form submissions |
| **E2E** | Playwright | Critical paths | Login → role home → primary flow for each of 12 roles |
| **Accessibility** | axe-core + Playwright | All pages | Automated per-PR + weekly deep scan |
| **Visual** | Playwright snapshots | All pages | Detects layout regressions |
| **Performance** | Lighthouse CI | Budgets enforced | Landing + 5 heaviest dashboards |
| **Bundle** | size-limit | 150KB gz | Every PR fails if exceeded |

---

## 9.2 Root Test Setup

### `package.json` (root) — add scripts

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:watch": "turbo run test:watch --parallel",
    "test:coverage": "turbo run test:coverage",
    "test:e2e": "pnpm --filter @nafi/e2e test",
    "test:e2e:ui": "pnpm --filter @nafi/e2e test:ui",
    "test:a11y": "pnpm --filter @nafi/e2e test:a11y",
    "lighthouse": "pnpm --filter @nafi/lighthouse run",
    "size": "size-limit"
  },
  "devDependencies": {
    "@size-limit/preset-app": "^11.1.4",
    "size-limit": "^11.1.4"
  }
}
```

### `turbo.json` — add test pipeline

```json
{
  "tasks": {
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:watch": { "cache": false, "persistent": true },
    "test:coverage": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "e2e": { "dependsOn": ["^build"], "cache": false }
  }
}
```

### `size-limit.config.js` (root)

```js
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
  {
    name: 'Farmer PWA (gzipped)',
    path: 'apps/web/dist/assets/farmer-*.js',
    limit: '200 KB',
  },
];
```

---

## 9.3 Unit Tests — Shared Packages

### `packages/formatters/src/__tests__/currency.test.ts`

```ts
import { describe, expect, it } from 'vitest';

import { formatCompactMoney, formatMoney } from '../currency';

describe('formatMoney', () => {
  it('formats ETB with symbol', () => {
    const result = formatMoney(1234.5, 'ETB');
    expect(result).toContain('1,234.50');
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
```

### `packages/validators/src/__tests__/contract.test.ts`

```ts
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

  it('rejects invalid UUID', () => {
    expect(() =>
      contractCreateSchema.parse({ ...valid, commercialFarmerId: 'not-a-uuid' }),
    ).toThrow();
  });
});
```

### `packages/rbac-core/src/__tests__/rolePermissions.test.ts`

```ts
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

  it('COMMERCIAL_FARMER cannot execute settlements', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_FARMER).not.toContain(PERMISSIONS.SETTLEMENT_EXECUTE);
  });

  it('COMMERCIAL_BANK can release escrow', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_BANK).toContain(PERMISSIONS.ESCROW_RELEASE);
  });

  it('DIASPORA_INVESTOR cannot approve contracts', () => {
    expect(ROLE_PERMISSIONS.DIASPORA_INVESTOR).not.toContain(PERMISSIONS.CONTRACT_APPROVE);
  });
});
```

### `apps/web/src/hooks/__tests__/useTableState.test.ts`

```ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTableState } from '../useTableState';

describe('useTableState', () => {
  it('initializes with defaults', () => {
    const { result } = renderHook(() => useTableState());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.q).toBe('');
    expect(result.current.sortDir).toBe('asc');
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

  it('resets page to 1 when page size changes', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(4));
    act(() => result.current.setPageSize(50));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(50);
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
```

---

## 9.4 Component Tests — UI Package

All `@nafi/ui-react` components already have basic tests from Step 2. Add accessibility and interaction tests.

### `packages/ui-react/src/components/CurrencyInput/CurrencyInput.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CurrencyInput } from './CurrencyInput';

describe('CurrencyInput', () => {
  it('renders with currency label', () => {
    render(<CurrencyInput currency="ETB" label="Amount" />);
    expect(screen.getByText('ETB')).toBeInTheDocument();
    expect(screen.getByText('Br')).toBeInTheDocument();
  });

  it('accepts decimal input', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '1234.56');
    expect(onChange).toHaveBeenLastCalledWith('1234.56');
  });

  it('rejects more than 2 decimal places', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '12.345');
    // The '5' should be rejected
    expect(onChange).toHaveBeenLastCalledWith('12.34');
  });

  it('rejects letters', async () => {
    const onChange = vi.fn();
    render(<CurrencyInput currency="ETB" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows error with role=alert', () => {
    render(<CurrencyInput currency="ETB" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
```

### `packages/ui-react/src/components/Modal/Modal.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Modal } from './Modal';

function Wrapper() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onOpenChange={setOpen} title="Test modal">
        <p>Content</p>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('opens on trigger click', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Test modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Test modal')).not.toBeInTheDocument();
  });

  it('traps focus inside dialog', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByText('Open'));
    // Focus should be within the dialog
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });
});
```

---

## 9.5 MSW-Based Integration Tests

### `apps/web/src/test/msw/handlers.ts`

```ts
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
```

### `apps/web/src/test/msw/server.ts`

```ts
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### `apps/web/src/test/setup.ts`

```ts
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

// Stub matchMedia for Radix components
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

// Stub IntersectionObserver
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
} as unknown as typeof IntersectionObserver;
```

### `apps/web/src/features/farmer/pages/__tests__/ContractsPage.test.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '@/auth/AuthProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { server } from '@/test/msw/server';
import { errorHandlers } from '@/test/msw/handlers';

import { FarmContractsPage } from '../ContractsPage';

function renderPage(user: { role: string } | null) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider
        value={{
          user: user
            ? {
                id: 'user-1',
                nafiId: 'NAFI-ABC12345',
                email: 'farmer@nafi.et',
                fullName: 'Abebe Bekele',
                role: user.role as never,
                permissions: ['contract:read:own'],
                locale: 'en',
                mfaEnabled: false,
              }
            : null,
          isLoading: false,
          isAuthenticated: Boolean(user),
        }}
      >
        <ToastProvider>
          <MemoryRouter>
            <FarmContractsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('FarmContractsPage', () => {
  it('renders list of contracts', async () => {
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByText('Sesame')).toBeInTheDocument();
    });
    expect(screen.getByText('Amhara')).toBeInTheDocument();
  });

  it('shows empty state when no contracts', async () => {
    server.use(
      (await import('msw')).http.get('/api/v1/contracts', () =>
        (await import('msw')).HttpResponse.json({
          success: true,
          data: { items: [], page: 1, pageSize: 20, total: 0 },
        }),
      ),
    );
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByText(/no contracts yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on 500', async () => {
    server.use(...errorHandlers.serverError);
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
```

---

## 9.6 E2E Test Suite — Playwright

### `e2e/package.json`

```json
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
```

### `e2e/playwright.config.ts`

```ts
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
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
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
```

### `e2e/tests/helpers/auth.ts`

```ts
import type { Page } from '@playwright/test';

/**
 * Signs in via the dev-only bypass endpoint.
 * In CI, the API is stubbed with seeded users.
 */
export async function signInAs(page: Page, role: string) {
  await page.goto('/login');

  const roleToEmail: Record<string, string> = {
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

  await page.getByLabel(/email/i).fill(roleToEmail[role]!);
  await page.getByLabel(/password/i).fill('Password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 });
}
```

### `e2e/tests/auth.spec.ts`

```ts
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

  test('login as farmer lands on farm home', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('farmer@nafi.et');
    await page.getByLabel(/password/i).fill('Password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/farm\/contracts/);
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
```

### `e2e/tests/farmer-flow.spec.ts`

```ts
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

  test('opens a contract and views details', async ({ page }) => {
    await page.goto('/farm/contracts');
    const firstCard = page.getByRole('link').filter({ hasText: /sesame/i }).first();
    await firstCard.click();
    await expect(page.getByRole('heading', { name: /sesame/i })).toBeVisible();
    await expect(page.getByText(/timeline/i)).toBeVisible();
  });

  test('verifies an input delivery', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 9.03, longitude: 38.74 });

    await page.goto('/farm/inputs');

    const verifyButton = page.getByRole('button', { name: /verify delivery/i }).first();
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
      await page.getByText(/tap to capture/i).click();

      // Simulate file upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'delivery.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      await page.getByRole('button', { name: /capture gps/i }).click();
      await expect(page.getByText(/\d+\.\d+, \d+\.\d+/)).toBeVisible();

      await page.getByRole('button', { name: /confirm receipt/i }).click();
      await expect(page.getByText(/delivery verified/i)).toBeVisible({ timeout: 10_000 });
    }
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
```

### `e2e/tests/investor-flow.spec.ts`

```ts
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

  test('browses opportunities and starts invest flow', async ({ page }) => {
    await page.goto('/opportunities');
    const firstOpp = page.getByRole('link', { name: /invest/i }).first();
    await firstOpp.click();

    await expect(page).toHaveURL(/\/invest$/);
    await expect(page.getByText(/investment terms/i)).toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/^amount$/i)).toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/confirm/i)).toBeVisible();
  });
});
```

### `e2e/tests/bank-flow.spec.ts`

```ts
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
```

### `e2e/tests/government-flow.spec.ts`

```ts
import { expect, test } from '@playwright/test';

import { signInAs } from './helpers/auth';

test.describe('Government flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, 'GOVERNMENT_REGULATOR');
  });

  test('renders national dashboard with charts', async ({ page }) => {
    await page.goto('/gov/dashboard');
    await expect(page.getByRole('heading', { name: /national dashboard/i })).toBeVisible();
    await expect(page.getByText(/contract value by region/i)).toBeVisible();
    await expect(page.getByText(/contract distribution by crop/i)).toBeVisible();
    // Recharts renders SVG
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible();
  });

  test('views contract registry', async ({ page }) => {
    await page.goto('/gov/contracts');
    await expect(page.getByRole('heading', { name: /contract registry/i })).toBeVisible();
  });
});
```

### `e2e/tests/all-roles-smoke.spec.ts`

```ts
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
```

---

## 9.7 Accessibility Tests

### `e2e/tests/a11y.spec.ts`

```ts
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

  test('landing page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3001');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## 9.8 Lighthouse CI

### `apps/web/lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm --filter @nafi/web preview",
      "startServerReadyPattern": "Local:",
      "url": [
        "http://localhost:3000/login",
        "http://localhost:3000/farm/contracts"
      ],
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--no-sandbox --headless"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }],
        "interactive": ["warn", { "maxNumericValue": 3500 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### `apps/landing/lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm --filter @nafi/landing preview",
      "startServerReadyPattern": "Local:",
      "url": ["http://localhost:3001/"],
      "settings": {
        "preset": "desktop"
      }
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
```

### Add to root scripts

```json
{
  "scripts": {
    "lighthouse:web": "lhci autorun --config=apps/web/lighthouserc.json",
    "lighthouse:landing": "lhci autorun --config=apps/landing/lighthouserc.json"
  },
  "devDependencies": {
    "@lhci/cli": "^0.14.0"
  }
}
```

---

## 9.9 GitHub Actions CI Pipeline

### `.github/workflows/ci.yml`

```yaml
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
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm size

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: '**/coverage/'
          retention-days: 7

  e2e:
    name: E2E
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: quality

    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: nafi_test
        ports: ['3306:3306']
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Install Playwright browsers
        run: pnpm --filter @nafi/e2e exec playwright install --with-deps chromium

      - name: Start backend
        run: pnpm --filter @nafi/api start &
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/nafi_test
          JWT_SECRET: test-secret

      - name: Wait for backend
        run: npx wait-on http://localhost:4000/api/v1/health --timeout 60000

      - name: Seed database
        run: pnpm --filter @nafi/api seed:test

      - name: Run E2E
        run: pnpm --filter @nafi/e2e test
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

  lighthouse:
    name: Lighthouse
    runs-on: ubuntu-latest
    timeout-minutes: 25
    needs: quality

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm lighthouse:web
      - run: pnpm lighthouse:landing
```

---

## 9.10 Error Monitoring — Sentry

### Install

```bash
pnpm --filter @nafi/web add @sentry/react
pnpm --filter @nafi/landing add @sentry/react
```

### `apps/web/src/observability/sentry.ts`

```ts
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    release: import.meta.env.VITE_APP_VERSION,

    // Only trace a fraction of transactions in prod
    tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,

    // Ignore common noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Failed to fetch/,
      /NetworkError/,
    ],

    // Never send PII by default
    beforeSend(event) {
      // Strip access tokens that might slip into URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(
          /([?&])token=[^&]*/g,
          '$1token=[redacted]',
        );
      }
      // Scrub auth headers
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
      }
      return event;
    },

    // Scope tags per user
    initialScope: {
      tags: {
        app: 'web',
      },
    },

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Privacy-first replay
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.5,
  });
}

export function identifyUser(user: {
  id: string;
  role: string;
  institutionId?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    role: user.role,
    institutionId: user.institutionId,
  });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export { Sentry };
```

### Wire into `main.tsx`

```ts
import { initSentry } from './observability/sentry';

initSentry();

// ... rest unchanged
```

### Wire user identification in `AuthProvider`

```ts
// apps/web/src/auth/AuthProvider.tsx
import { identifyUser, clearUser } from '@/observability/sentry';

// In the effect that watches user:
useEffect(() => {
  if (user) identifyUser({ id: user.id, role: user.role, institutionId: user.institutionId });
  else clearUser();
}, [user]);
```

### Add the global error boundary to send errors

Update `apps/web/src/components/ErrorBoundary.tsx`:

```ts
import { Sentry } from '@/observability/sentry';

componentDidCatch(error: Error, info: ErrorInfo) {
  Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
  this.props.onError?.(error, info);
}
```

---

## 9.11 Privacy-First Analytics

Use **Plausible** (self-hosted or cloud) — no cookies, GDPR/CCPA compliant, works with the offline queue.

### `apps/web/src/observability/analytics.ts`

```ts
/**
 * Privacy-first analytics. No PII, no cookies, no fingerprinting.
 * Events are queued offline and flushed when online.
 */

type AnalyticsEvent =
  | { name: 'page_view'; props: { path: string } }
  | { name: 'login'; props: { role: string } }
  | { name: 'logout'; props: Record<string, never> }
  | { name: 'contract_created'; props: { crop: string; region: string } }
  | { name: 'contract_signed'; props: { role: string } }
  | { name: 'investment_committed'; props: { currency: string; crop: string } }
  | { name: 'delivery_verified'; props: { offline: boolean } }
  | { name: 'settlement_executed'; props: { crop: string } }
  | { name: 'escrow_released'; props: { currency: string; amount_range: string } }
  | { name: 'report_generated'; props: { type: string } };

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
    // sessionStorage full or unavailable — drop
  }
}

function isDoNotTrack(): boolean {
  return (
    navigator.doNotTrack === '1' ||
    // @ts-expect-error — legacy
    window.doNotTrack === '1' ||
    // @ts-expect-error — legacy
    navigator.msDoNotTrack === '1'
  );
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
    // Keep queue; will retry on next track() or flush()
  }
}

// Flush on network recovery
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush());
}
```

### Wire into router

```tsx
// apps/web/src/app/router.tsx
import { track } from '@/observability/analytics';

// In a small effect inside <DashboardLayout> or a top-level hook:
useEffect(() => {
  track({ name: 'page_view', props: { path: location.pathname } });
}, [location.pathname]);
```

### Track key events

In `useAuthActions().login`:
```ts
track({ name: 'login', props: { role: result.user.role } });
```

In `useCreateContract().onSuccess`:
```ts
track({ name: 'contract_created', props: { crop: created.targetCrop, region: created.region } });
```

In `useVerifyDelivery().onSuccess`:
```ts
track({ name: 'delivery_verified', props: { offline: !navigator.onLine } });
```

---

## 9.12 Logging & Observability

### `apps/web/src/observability/logger.ts`

```ts
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

  // Browser console in dev; Sentry breadcrumb in prod
  if (import.meta.env.PROD) {
    // Sentry.addBreadcrumb(...) — imported lazily to avoid overhead
  } else {
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
```

### Use in API client error path

```ts
// apps/web/src/api/errors.ts
import { logger } from '@/observability/logger';

export function normalizeApiError(err: unknown): NormalizedApiError {
  // ... after computing normalized
  if (normalized.kind !== 'validation' && normalized.kind !== 'notFound') {
    logger.warn('API error', { kind: normalized.kind, status: normalized.status, url: err?.config?.url });
  }
  return normalized;
}
```

---

## 9.13 Custom Domain Events & Web Vitals

### `apps/web/src/observability/webVitals.ts`

```ts
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

function report(metric: Metric): void {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  // Send in batches
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
  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}
```

Add `web-vitals` to `apps/web/package.json` and call `initWebVitals()` from `main.tsx`.

---

## 9.14 Test Data Seeding for E2E

### `apps/api/src/scripts/seed-test.ts` (backend, referenced by CI)

```ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const TEST_USERS = [
  { email: 'investor@nafi.et', role: 'DIASPORA_INVESTOR', name: 'Hanna Girma' },
  { email: 'farmer@nafi.et', role: 'COMMERCIAL_FARMER', name: 'Abebe Bekele' },
  { email: 'bank@nafi.et', role: 'COMMERCIAL_BANK', name: 'Dashen Bank Officer' },
  { email: 'dbe@nafi.et', role: 'DBE_OFFICER', name: 'DBE Officer' },
  { email: 'nafa@nafi.et', role: 'NAFA_OFFICER', name: 'NAFA Officer' },
  { email: 'supplier@nafi.et', role: 'INPUT_SUPPLIER', name: 'Seed Supplier' },
  { email: 'buyer@nafi.et', role: 'OFF_TAKER', name: 'Export Buyer' },
  { email: 'gov@nafi.et', role: 'GOVERNMENT_REGULATOR', name: 'MoA Regulator' },
  { email: 'donor@nafi.et', role: 'DONOR', name: 'EIB Program Officer' },
  { email: 'admin@nafi.et', role: 'NAFI_ADMIN', name: 'NAFI Admin' },
  { email: 'compliance@nafi.et', role: 'COMPLIANCE_OFFICER', name: 'Compliance Officer' },
  { email: 'arbitrator@nafi.et', role: 'ARBITRATOR', name: 'Arbitrator' },
] as const;

async function main() {
  const passwordHash = await hash('Password123', 10);

  for (const user of TEST_USERS) {
    await prisma.stakeholder.upsert({
      where: { registeredWallet: `test-${user.email}` },
      update: {},
      create: {
        organizationName: user.name,
        role: user.role,
        registeredWallet: `test-${user.email}`,
        countryCode: 'ET',
      },
    });
  }

  // Seed sample contracts, escrows, inputs for E2E
  // ...

  console.log('✓ Test data seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Add to `apps/api/package.json`:

```json
{
  "scripts": {
    "seed:test": "tsx src/scripts/seed-test.ts"
  }
}
```

---

## 9.15 Pre-commit Hook Update

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
pnpm typecheck
pnpm test --filter='[HEAD^]'
```

Add `lint-staged` config to root `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

---

## 9.16 Verification Checklist

```bash
# Unit + component + integration
pnpm test
pnpm test:coverage

# E2E (needs running backend + seeded DB)
pnpm --filter @nafi/e2e exec playwright install
pnpm test:e2e

# Accessibility
pnpm test:a11y

# Lighthouse
pnpm build
pnpm lighthouse:web
pnpm lighthouse:landing

# Bundle size
pnpm size
```

**Expected results:**

| Check | Threshold |
| :--- | :--- |
| Unit coverage | ≥ 85% |
| Component coverage | ≥ 70% |
| E2E happy paths | 12/12 roles pass |
| Accessibility violations | 0 |
| Lighthouse Performance (landing) | ≥ 95 |
| Lighthouse Performance (web app) | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse LCP | < 2500 ms |
| Lighthouse CLS | < 0.1 |
| Bundle size (landing) | ≤ 150 KB gz |
| Bundle size (web) | ≤ 350 KB gz |
| Bundle size (farmer) | ≤ 200 KB gz |
| Sentry — test exception captured | ✓ in dev |
| Plausible — page view recorded | ✓ when DSN set |
| Web Vitals — CLS/LCP/INP reported | ✓ |

---

## 9.17 What Was Built & Why

| Layer | Artifact | Purpose |
| :--- | :--- | :--- |
| **Unit tests** | Vitest across shared packages + hooks | Catch regressions in pure logic |
| **Component tests** | Testing Library + jsdom | Verify primitives and composites behave correctly |
| **Integration tests** | MSW + Testing Library | Test full pages with mocked API |
| **E2E tests** | Playwright, 12 roles | Validate the full auth → role → primary flow chain |
| **Accessibility** | axe-core via Playwright | Zero WCAG 2.1 AA violations on critical pages |
| **Lighthouse** | LHCI, budgets enforced | Performance and a11y thresholds block PRs |
| **Bundle limits** | size-limit | Prevent JS creep |
| **Error monitoring** | Sentry with PII scrubbing | All uncaught errors, redacted URLs, tagged users |
| **Analytics** | Plausible-style, offline-aware | Funnels without cookies or PII |
| **Web Vitals** | web-vitals → endpoint | Real-user performance monitoring |
| **Logger** | Structured, sanitized | Debug in dev, breadcrumbs in prod |
| **CI** | GitHub Actions | 4 jobs: quality, e2e, a11y, lighthouse |
| **Pre-commit** | Husky + lint-staged | Lint, format, typecheck, affected tests |

**Design decisions made in this step:**
- **Offline-first analytics** — events queued in `sessionStorage`, flushed when online
- **Sentry with `beforeSend`** — PII scrubbed, auth headers deleted
- **Replay with `maskAllText`** — no PII in session replay
- **`axe` at the E2E level** — catches real-page a11y issues, not just isolated components
- **CI matrix runs E2E on Chromium only** — faster; Safari/Firefox added later if needed
- **Test user seeding** — one script produces 12 role users + fixtures
- **`size-limit` per app** — landing has the strictest budget
- **Do-Not-Track respected** — analytics silently disabled

---

## 9.18 What Is Deliberately Not in Step 9

- ❌ No visual regression snapshots — Playwright's `toHaveScreenshot` can be added later
- ❌ No load/soak testing — k6 or Artillery is a separate initiative
- ❌ No contract testing (Pact) — backend and frontend are co-maintained
- ❌ No penetration testing — external audit
- ❌ No chaos engineering — out of scope

**Step 9 makes the platform defensible: every commit is validated, every role is tested, every page is accessible, every bundle is bounded, every error is visible.**

---

# ✅ Step 9 Complete

**Deliverable:** A full quality and observability layer:

- **Unit tests** — Vitest across `@nafi/rbac-core`, `@nafi/formatters`, `@nafi/validators`, shared hooks
- **Component tests** — Testing Library for every UI primitive and composite
- **Integration tests** — MSW-backed page-level tests
- **E2E suite** — Playwright covering all 12 roles with a smoke test + primary flow per role
- **Accessibility audits** — axe-core across 7 critical pages, zero tolerance
- **Lighthouse CI** — performance budgets enforced; landing ≥ 95, web ≥ 90
- **Bundle size gates** — size-limit fails PRs that exceed budgets
- **Sentry** — PII-scrubbed error monitoring with user identification and replay
- **Plausible-style analytics** — offline-queued, Do-Not-Track-respecting, no cookies
- **Web Vitals** — CLS, LCP, INP, FCP, TTFB reported
- **Structured logger** — sanitized, level-filtered
- **CI pipeline** — 4 jobs: quality, e2e, a11y, lighthouse
- **Test data seeding** — 12 role users + fixtures for repeatable E2E

