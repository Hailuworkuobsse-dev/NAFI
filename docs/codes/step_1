# 🚀 NAFI Frontend — Step 1 of 10

## Foundation: Monorepo, Design Tokens, Shared Packages & Configuration

**Step Goal:** Establish the complete monorepo scaffold with all shared packages (design tokens, RBAC core, formatters, validators, i18n, API client) and root configuration. No UI, no pages yet — this is the load-bearing foundation every later step depends on.

**Duration Estimate:** 3–5 days
**Deliverable:** A fully installable, type-checked, lint-passing monorepo with all shared packages published to the workspace.

---

## 1.1 Root Monorepo Setup

### `package.json` (root)

```json
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
    "test:e2e": "pnpm --filter @nafi/e2e test",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "storybook": "pnpm --filter @nafi/ui-react storybook",
    "prepare": "husky"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.5.0",
    "@commitlint/config-conventional": "^19.5.0",
    "@types/node": "^22.7.5",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "turbo": "^2.2.3",
    "typescript": "^5.6.3"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
  - 'e2e'
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.base.json"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "composite": true
  },
  "exclude": ["node_modules", "dist", "build", ".turbo"]
}
```

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.turbo/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
!.env.example

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp

# Test coverage
coverage/

# Storybook
storybook-static/

# Vercel / Netlify
.vercel
.netlify

# Prisma
services/api/prisma/*.db
services/api/prisma/migrations/dev.db*
```

### `.env.example`

```bash
# ============================================
# NAFI Frontend — Environment Variables
# ============================================

# --- API ---
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0

# --- Public (Landing) ---
VITE_LANDING_URL=http://localhost:3001
VITE_WEB_URL=http://localhost:3000
VITE_FARMER_URL=http://localhost:3002

# --- Feature Flags ---
VITE_ENABLE_MFA=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_USSD_SIMULATOR=true
VITE_ENABLE_TRACEABILITY_WIDGET=true

# --- Observability ---
VITE_SENTRY_DSN=
VITE_LOG_LEVEL=debug

# --- Maps / Geo ---
VITE_MAPBOX_TOKEN=
```

---

## 1.2 Package: `@nafi/design-tokens`

### `packages/design-tokens/package.json`

```json
{
  "name": "@nafi/design-tokens",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./colors": "./src/colors.ts",
    "./typography": "./src/typography.ts",
    "./spacing": "./src/spacing.ts",
    "./shadows": "./src/shadows.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

### `packages/design-tokens/src/colors.ts`

```ts
/**
 * NAFI Brand Palette
 * Primary: Ethiopian earth + growth green
 * Accent:  Harvest gold
 * Semantic colors map to system states.
 */
export const colors = {
  brand: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#16A34A',
    600: '#15803D',
    700: '#166534',
    800: '#14532D',
    900: '#052E16',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#000000',
  },
  success: {
    light: '#DCFCE7',
    DEFAULT: '#16A34A',
    dark: '#15803D',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  danger: {
    light: '#FEE2E2',
    DEFAULT: '#DC2626',
    dark: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#2563EB',
    dark: '#1E40AF',
  },
} as const;

/**
 * Role → accent color mapping.
 * Used consistently across the platform so each role's portal
 * has a recognizable visual identity.
 */
export const roleAccents = {
  DIASPORA_INVESTOR: 'brand',
  COMMERCIAL_BANK: 'info',
  DBE_OFFICER: 'accent',
  NAFA_OFFICER: 'accent',
  INPUT_SUPPLIER: 'neutral',
  COMMERCIAL_FARMER: 'brand',
  OFF_TAKER: 'neutral',
  GOVERNMENT_REGULATOR: 'danger',
  DONOR: 'info',
  NAFI_ADMIN: 'neutral',
  COMPLIANCE_OFFICER: 'danger',
  ARBITRATOR: 'warning',
} as const;

export type ColorToken = keyof typeof colors;
export type RoleAccent = (typeof roleAccents)[keyof typeof roleAccents];
```

### `packages/design-tokens/src/typography.ts`

```ts
export const typography = {
  fontFamily: {
    sans: [
      '"Noto Sans Ethiopic"',
      '"Inter"',
      'system-ui',
      '-apple-system',
      'sans-serif',
    ].join(', '),
    mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'].join(', '),
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
```

### `packages/design-tokens/src/spacing.ts`

```ts
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
```

### `packages/design-tokens/src/shadows.ts`

```ts
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  focus: '0 0 0 3px rgb(22 163 74 / 0.35)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;
```

### `packages/design-tokens/src/index.ts`

```ts
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
```

### `packages/design-tokens/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## 1.3 Package: `@nafi/config`

Shared presets so every app and package stays consistent.

### `packages/config/package.json`

```json
{
  "name": "@nafi/config",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./tailwind": "./tailwind.preset.js",
    "./eslint": "./eslint.config.js"
  },
  "dependencies": {
    "@nafi/design-tokens": "workspace:*"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "tailwindcss": "^3.4.14"
  }
}
```

### `packages/config/tailwind.preset.js`

```js
import { colors, typography, spacing, radii, shadows, breakpoints } from '@nafi/design-tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens: breakpoints,
    extend: {
      colors,
      spacing,
      borderRadius: radii,
      boxShadow: shadows,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      ringColor: {
        DEFAULT: colors.brand[500],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### `packages/config/eslint.config.js`

```js
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Project hard rules (from skill)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '@nafi/**', group: 'internal' },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
        },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        },
      },
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/*.config.{js,ts}',
    ],
  },
];
```

---

## 1.4 Package: `@nafi/rbac-core`

The heart of access control — permission strings, role maps, guards.

### `packages/rbac-core/package.json`

```json
{
  "name": "@nafi/rbac-core",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

### `packages/rbac-core/src/roles.ts`

```ts
export const ROLES = {
  DIASPORA_INVESTOR: 'DIASPORA_INVESTOR',
  COMMERCIAL_BANK: 'COMMERCIAL_BANK',
  DBE_OFFICER: 'DBE_OFFICER',
  NAFA_OFFICER: 'NAFA_OFFICER',
  INPUT_SUPPLIER: 'INPUT_SUPPLIER',
  COMMERCIAL_FARMER: 'COMMERCIAL_FARMER',
  OFF_TAKER: 'OFF_TAKER',
  GOVERNMENT_REGULATOR: 'GOVERNMENT_REGULATOR',
  DONOR: 'DONOR',
  NAFI_ADMIN: 'NAFI_ADMIN',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  ARBITRATOR: 'ARBITRATOR',
} as const;

export type Role = keyof typeof ROLES;

export const GOVERNMENT_AGENCIES = {
  MOA: 'MOA',
  NBE: 'NBE',
  EIC: 'EIC',
  MOR: 'MOR',
  SEZ: 'SEZ',
  PMO: 'PMO',
} as const;

export type GovernmentAgency = keyof typeof GOVERNMENT_AGENCIES;
```

### `packages/rbac-core/src/permissions.ts`

```ts
/**
 * Permission string convention:
 *   <resource>:<action>[:<scope>]
 *
 * Resources: contract, escrow, investment, input, settlement,
 *            collateral, dispute, report, user, system, audit, tax
 * Actions:   create, read, update, delete, approve, reject,
 *            submit, execute, export, freeze, unfreeze
 * Scopes:    own, institution, region, national, all
 */
export const PERMISSIONS = {
  // Contracts
  CONTRACT_CREATE: 'contract:create',
  CONTRACT_READ_OWN: 'contract:read:own',
  CONTRACT_READ_ALL: 'contract:read:all',
  CONTRACT_UPDATE: 'contract:update',
  CONTRACT_APPROVE: 'contract:approve',
  CONTRACT_FREEZE: 'contract:freeze',

  // Escrow
  ESCROW_READ_OWN: 'escrow:read:own',
  ESCROW_FUND: 'escrow:fund',
  ESCROW_RELEASE: 'escrow:release',
  ESCROW_FREEZE: 'escrow:freeze',

  // Investment
  INVESTMENT_CREATE: 'investment:create',
  INVESTMENT_READ_OWN: 'investment:read:own',
  INVESTMENT_READ_ALL: 'investment:read:all',

  // Input supply
  INPUT_CREATE: 'input:create',
  INPUT_VERIFY: 'input:verify',
  INPUT_DISBURSE: 'input:disburse',

  // Settlement
  SETTLEMENT_SIMULATE: 'settlement:simulate',
  SETTLEMENT_EXECUTE: 'settlement:execute',
  SETTLEMENT_READ: 'settlement:read',

  // Collateral
  COLLATERAL_REGISTER: 'collateral:register',
  COLLATERAL_LIQUIDATE: 'collateral:liquidate',

  // Disputes
  DISPUTE_FLAG: 'dispute:flag',
  DISPUTE_ARBITRATE: 'dispute:arbitrate',

  // Reports
  REPORT_READ_OWN: 'report:read:own',
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',

  // Users
  USER_INVITE: 'user:invite',
  USER_MANAGE_OWN: 'user:manage:own',
  USER_MANAGE_ALL: 'user:manage:all',

  // System
  SYSTEM_CONFIGURE: 'system:configure',

  // Audit
  AUDIT_READ: 'audit:read',

  // Tax
  TAX_READ: 'tax:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];
```

### `packages/rbac-core/src/rolePermissions.ts`

```ts
import { PERMISSIONS, type Permission } from './permissions';
import type { Role } from './roles';

/**
 * Complete permission matrix per role.
 * Mirrors the specification in the NAFI Frontend Skill §5.3.
 * '*' is a super-permission granted only to NAFI_ADMIN.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[] | readonly ['*']> = {
  DIASPORA_INVESTOR: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FUND,
    PERMISSIONS.INVESTMENT_CREATE,
    PERMISSIONS.INVESTMENT_READ_OWN,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
  ],

  COMMERCIAL_BANK: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_APPROVE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FUND,
    PERMISSIONS.ESCROW_RELEASE,
    PERMISSIONS.ESCROW_FREEZE,
    PERMISSIONS.INPUT_DISBURSE,
    PERMISSIONS.SETTLEMENT_SIMULATE,
    PERMISSIONS.SETTLEMENT_EXECUTE,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.COLLATERAL_REGISTER,
    PERMISSIONS.COLLATERAL_LIQUIDATE,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  DBE_OFFICER: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_APPROVE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FUND,
    PERMISSIONS.ESCROW_RELEASE,
    PERMISSIONS.ESCROW_FREEZE,
    PERMISSIONS.INPUT_DISBURSE,
    PERMISSIONS.SETTLEMENT_SIMULATE,
    PERMISSIONS.SETTLEMENT_EXECUTE,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.COLLATERAL_REGISTER,
    PERMISSIONS.COLLATERAL_LIQUIDATE,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  NAFA_OFFICER: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_APPROVE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FUND,
    PERMISSIONS.SETTLEMENT_SIMULATE,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
  ],

  INPUT_SUPPLIER: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.INPUT_CREATE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  COMMERCIAL_FARMER: [
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_UPDATE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.INPUT_VERIFY,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.COLLATERAL_REGISTER,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  OFF_TAKER: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.INPUT_VERIFY,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  GOVERNMENT_REGULATOR: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_APPROVE,
    PERMISSIONS.CONTRACT_FREEZE,
    PERMISSIONS.ESCROW_FREEZE,
    PERMISSIONS.COLLATERAL_LIQUIDATE,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.USER_MANAGE_OWN,
    PERMISSIONS.TAX_READ,
  ],

  DONOR: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.ESCROW_FUND,
    PERMISSIONS.INVESTMENT_READ_ALL,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.USER_MANAGE_OWN,
  ],

  NAFI_ADMIN: ['*'],

  COMPLIANCE_OFFICER: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_APPROVE,
    PERMISSIONS.CONTRACT_FREEZE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FREEZE,
    PERMISSIONS.INVESTMENT_READ_ALL,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.TAX_READ,
  ],

  ARBITRATOR: [
    PERMISSIONS.CONTRACT_READ_OWN,
    PERMISSIONS.CONTRACT_READ_ALL,
    PERMISSIONS.CONTRACT_FREEZE,
    PERMISSIONS.ESCROW_READ_OWN,
    PERMISSIONS.ESCROW_FREEZE,
    PERMISSIONS.SETTLEMENT_READ,
    PERMISSIONS.DISPUTE_FLAG,
    PERMISSIONS.DISPUTE_ARBITRATE,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.AUDIT_READ,
  ],
};

export function getPermissionsForRole(role: Role): readonly Permission[] | readonly ['*'] {
  return ROLE_PERMISSIONS[role];
}
```

### `packages/rbac-core/src/roleHome.ts`

```ts
import type { Role } from './roles';

export const ROLE_HOME: Record<Role, string> = {
  DIASPORA_INVESTOR: '/portfolio',
  COMMERCIAL_BANK: '/bank/overview',
  DBE_OFFICER: '/dbe/portfolio',
  NAFA_OFFICER: '/nafa/guarantees',
  INPUT_SUPPLIER: '/supplier/orders',
  COMMERCIAL_FARMER: '/farm/contracts',
  OFF_TAKER: '/buyer/purchases',
  GOVERNMENT_REGULATOR: '/gov/dashboard',
  DONOR: '/donor/grants',
  NAFI_ADMIN: '/admin/overview',
  COMPLIANCE_OFFICER: '/compliance/queue',
  ARBITRATOR: '/arbitration/cases',
};
```

### `packages/rbac-core/src/can.ts`

```ts
import type { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './rolePermissions';
import type { Role } from './roles';

export interface AuthSubject {
  role: Role;
  permissions?: readonly Permission[];
  scopes?: Record<string, readonly string[]>;
}

/**
 * Pure RBAC check. Framework-agnostic — used by both React and Vue.
 */
export function can(
  subject: AuthSubject | null | undefined,
  permission: Permission,
  scope?: string,
): boolean {
  if (!subject) return false;

  const rolePerms = ROLE_PERMISSIONS[subject.role];
  const hasWildcard = (rolePerms as readonly string[]).includes('*');
  const effectivePerms = hasWildcard
    ? null // wildcard = always allow
    : subject.permissions && subject.permissions.length > 0
      ? subject.permissions
      : rolePerms;

  if (effectivePerms === null) {
    // Wildcard admin — still enforce scope if provided
    if (!scope) return true;
    return subject.scopes?.[permission]?.includes(scope) ?? true;
  }

  if (!effectivePerms.includes(permission)) return false;
  if (!scope) return true;

  return subject.scopes?.[permission]?.includes(scope) ?? false;
}
```

### `packages/rbac-core/src/index.ts`

```ts
export * from './roles';
export * from './permissions';
export * from './rolePermissions';
export * from './roleHome';
export * from './can';
```

### `packages/rbac-core/src/__tests__/can.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { can } from '../can';
import { PERMISSIONS } from '../permissions';
import type { Role } from '../roles';

describe('can()', () => {
  it('denies null subject', () => {
    expect(can(null, PERMISSIONS.CONTRACT_READ_OWN)).toBe(false);
  });

  it('allows NAFI_ADMIN for any permission (wildcard)', () => {
    const admin = { role: 'NAFI_ADMIN' as Role };
    expect(can(admin, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(true);
    expect(can(admin, PERMISSIONS.CONTRACT_CREATE)).toBe(true);
  });

  it('allows farmer to create contract', () => {
    const farmer = { role: 'COMMERCIAL_FARMER' as Role };
    expect(can(farmer, PERMISSIONS.CONTRACT_CREATE)).toBe(true);
  });

  it('denies farmer escrow release', () => {
    const farmer = { role: 'COMMERCIAL_FARMER' as Role };
    expect(can(farmer, PERMISSIONS.ESCROW_RELEASE)).toBe(false);
  });

  it('allows bank to release escrow', () => {
    const bank = { role: 'COMMERCIAL_BANK' as Role };
    expect(can(bank, PERMISSIONS.ESCROW_RELEASE)).toBe(true);
  });

  it('allows diaspora investor to create investment', () => {
    const investor = { role: 'DIASPORA_INVESTOR' as Role };
    expect(can(investor, PERMISSIONS.INVESTMENT_CREATE)).toBe(true);
  });

  it('denies diaspora investor settlement execution', () => {
    const investor = { role: 'DIASPORA_INVESTOR' as Role };
    expect(can(investor, PERMISSIONS.SETTLEMENT_EXECUTE)).toBe(false);
  });

  it('respects scope when provided', () => {
    const bank = {
      role: 'COMMERCIAL_BANK' as Role,
      scopes: { [PERMISSIONS.CONTRACT_READ_ALL]: ['region:addis'] },
    };
    expect(can(bank, PERMISSIONS.CONTRACT_READ_ALL, 'region:addis')).toBe(true);
    expect(can(bank, PERMISSIONS.CONTRACT_READ_ALL, 'region:oromia')).toBe(false);
  });

  it('overrides role permissions when subject.permissions is set', () => {
    const restrictedAdmin = {
      role: 'NAFI_ADMIN' as Role,
      permissions: [PERMISSIONS.CONTRACT_READ_OWN] as const,
    };
    // Even wildcard role, explicit permission list overrides wildcard behavior
    expect(can(restrictedAdmin, PERMISSIONS.CONTRACT_READ_OWN)).toBe(true);
  });
});
```

---

## 1.5 Package: `@nafi/formatters`

### `packages/formatters/package.json`

```json
{
  "name": "@nafi/formatters",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

### `packages/formatters/src/currency.ts`

```ts
export type SupportedCurrency = 'ETB' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'AED';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  ETB: 'Br',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  AED: 'د.إ',
};

/**
 * Format a monetary amount. Accepts number or decimal string.
 * Never does arithmetic on floats — the platform uses Prisma Decimal.
 */
export function formatMoney(
  amount: number | string,
  currency: SupportedCurrency,
  locale = 'en-ET',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactMoney(
  amount: number | string,
  currency: SupportedCurrency,
  locale = 'en-ET',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
```

### `packages/formatters/src/date.ts`

```ts
/**
 * Ethiopian calendar formatting via Intl. The "ethiopic" calendar
 * is natively supported in modern V8 and JSC.
 */
export function formatDate(
  date: Date | string,
  locale = 'en-ET',
  calendar: 'gregory' | 'ethiopic' = 'gregory',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';

  const localeTag = calendar === 'ethiopic' ? `${locale}-u-ca-ethiopic` : locale;

  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string, locale = 'en-ET'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';

  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  return formatDate(d, locale);
}
```

### `packages/formatters/src/number.ts`

```ts
export function formatNumber(value: number | string, locale = 'en-ET'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDecimal(
  value: number | string,
  digits = 2,
  locale = 'en-ET',
): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatPercent(
  value: number | string,
  digits = 1,
  locale = 'en-ET',
): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatWeight(kg: number | string, locale = 'en-ET'): string {
  const n = typeof kg === 'string' ? Number(kg) : kg;
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `${formatDecimal(n / 1000, 2, locale)} MT`;
  return `${formatDecimal(n, 2, locale)} kg`;
}
```

### `packages/formatters/src/text.ts`

```ts
export function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function truncateHash(hash: string, lead = 6, tail = 4): string {
  if (hash.length <= lead + tail) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length === 0 ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join(' ');
}
```

### `packages/formatters/src/index.ts`

```ts
export * from './currency';
export * from './date';
export * from './number';
export * from './text';
```

---

## 1.6 Package: `@nafi/validators`

Shared Zod schemas — **used by both frontend and backend**.

### `packages/validators/package.json`

```json
{
  "name": "@nafi/validators",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

### `packages/validators/src/primitives.ts`

```ts
import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().toLowerCase().trim();
export const phoneEthiopiaSchema = z
  .string()
  .regex(/^(\+251|0)[79]\d{8}$/, 'Must be a valid Ethiopian phone number');
export const nafiIdSchema = z.string().regex(/^NAFI-[A-Z0-9]{8}$/, 'Invalid NAFI ID');

export const decimalSchema = z.union([z.number(), z.string()]).refine(
  (v) => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n >= 0;
  },
  { message: 'Must be a non-negative decimal' },
);

export const positiveDecimalSchema = z.union([z.number(), z.string()]).refine(
  (v) => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n > 0;
  },
  { message: 'Must be a positive decimal' },
);

export const currencySchema = z.enum(['ETB', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED']);
export const roleSchema = z.enum([
  'DIASPORA_INVESTOR',
  'COMMERCIAL_BANK',
  'DBE_OFFICER',
  'NAFA_OFFICER',
  'INPUT_SUPPLIER',
  'COMMERCIAL_FARMER',
  'OFF_TAKER',
  'GOVERNMENT_REGULATOR',
  'DONOR',
  'NAFI_ADMIN',
  'COMPLIANCE_OFFICER',
  'ARBITRATOR',
]);
export const localeSchema = z.enum(['en', 'am', 'om', 'ti']);
```

### `packages/validators/src/auth.ts`

```ts
import { z } from 'zod';
import { emailSchema, localeSchema, roleSchema } from './primitives';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().length(6).optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  role: roleSchema,
  fullName: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().min(9).max(20),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a digit'),
  locale: localeSchema.default('en'),
  acceptTerms: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerSchema>;
```

### `packages/validators/src/contract.ts`

```ts
import { z } from 'zod';
import { uuidSchema, positiveDecimalSchema } from './primitives';

export const contractCreateSchema = z.object({
  commercialFarmerId: uuidSchema,
  targetCrop: z.string().min(2).max(100),
  totalTargetYieldKg: positiveDecimalSchema,
  guaranteedFloorPriceEtb: positiveDecimalSchema,
  maturityDate: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: 'Maturity date must be in the future',
  }),
  governmentWitnessId: uuidSchema,
  regionCode: z.string().min(2).max(10),
});
export type ContractCreateInput = z.infer<typeof contractCreateSchema>;

export const contractUpdateSchema = contractCreateSchema.partial();
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;

export const contractSignSchema = z.object({
  contractId: uuidSchema,
  role: z.enum(['FARMER', 'BANK', 'GOVERNMENT_WITNESS', 'SUPPLIER', 'OFF_TAKER']),
  signatureHash: z.string().min(32),
  signedAt: z.coerce.date().default(() => new Date()),
});
export type ContractSignInput = z.infer<typeof contractSignSchema>;
```

### `packages/validators/src/investment.ts`

```ts
import { z } from 'zod';
import { currencySchema, positiveDecimalSchema, uuidSchema } from './primitives';

export const investmentCreateSchema = z.object({
  contractId: uuidSchema,
  fundingType: z.enum(['DEBT_FIXED_RETURN', 'EQUITY_PROFIT_SHARE']),
  amountForeignCurrency: positiveDecimalSchema,
  currency: currencySchema.refine((c) => c !== 'ETB', {
    message: 'Diaspora investment must be in foreign currency',
  }),
  agreedReturnRate: z.coerce.number().min(0).max(1),
  sourceOfFunds: z.string().min(10).max(500),
});
export type InvestmentCreateInput = z.infer<typeof investmentCreateSchema>;
```

### `packages/validators/src/index.ts`

```ts
export * from './primitives';
export * from './auth';
export * from './contract';
export * from './investment';
```

---

## 1.7 Package: `@nafi/i18n`

### `packages/i18n/package.json`

```json
{
  "name": "@nafi/i18n",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./locales/*": "./src/locales/*"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

### `packages/i18n/src/locales/en/common.json`

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "approve": "Approve",
    "reject": "Reject",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "reset": "Reset",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "retry": "Retry",
    "export": "Export",
    "download": "Download",
    "upload": "Upload",
    "sign": "Sign",
    "verify": "Verify"
  },
  "status": {
    "DRAFT": "Draft",
    "ACTIVE": "Active",
    "FULFILLED": "Fulfilled",
    "DEFAULTED": "Defaulted",
    "DISPUTED": "Disputed",
    "PENDING": "Pending",
    "APPROVED": "Approved",
    "REJECTED": "Rejected"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "invalidPhone": "Please enter a valid phone number",
    "networkError": "Network error. Please try again.",
    "unauthorized": "You do not have permission to perform this action.",
    "unexpected": "Something went wrong. Please try again later.",
    "sessionExpired": "Your session has expired. Please sign in again."
  },
  "states": {
    "loading": "Loading…",
    "empty": "No data to display",
    "offline": "You are offline. Changes will sync when you reconnect."
  }
}
```

### `packages/i18n/src/locales/en/auth.json`

```json
{
  "login": {
    "title": "Sign in to NAFI",
    "subtitle": "Access your agricultural finance workspace",
    "email": "Email",
    "password": "Password",
    "mfaCode": "MFA Code",
    "submit": "Sign In",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "createAccount": "Create account"
  },
  "register": {
    "title": "Create your NAFI account",
    "selectRole": "I am a…",
    "fullName": "Full name",
    "email": "Email",
    "phone": "Phone number",
    "password": "Password",
    "locale": "Preferred language",
    "acceptTerms": "I accept the Terms of Service and Privacy Policy",
    "submit": "Create Account",
    "haveAccount": "Already have an account?",
    "signIn": "Sign in"
  }
}
```

### `packages/i18n/src/locales/en/nav.json`

```json
{
  "portfolio": {
    "title": "Portfolio",
    "overview": "Overview",
    "investments": "Investments",
    "bonds": "Bonds",
    "returns": "Returns",
    "statements": "Statements"
  },
  "opportunities": {
    "title": "Opportunities",
    "browse": "Browse"
  },
  "bank": {
    "title": "Bank",
    "overview": "Overview",
    "escrows": "Escrows",
    "loans": "Loans",
    "collateral": "Collateral",
    "settlements": "Settlements",
    "npl": "NPL Monitor"
  },
  "farm": {
    "title": "Farm",
    "contracts": "Contracts",
    "inputs": "Inputs",
    "escrow": "Escrow",
    "harvest": "Harvest",
    "collateral": "Collateral",
    "payments": "Payments"
  },
  "gov": {
    "title": "Government",
    "dashboard": "Dashboard",
    "contracts": "Contracts",
    "forex": "Forex Flows",
    "credit": "Credit Deployment",
    "inputs": "Input Supply Chain",
    "tax": "Tax Compliance",
    "incentives": "Incentives",
    "audit": "Audit Log",
    "reports": "Reports"
  }
}
```

### `packages/i18n/src/index.ts`

```ts
export const SUPPORTED_LOCALES = ['en', 'am', 'om', 'ti'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  ti: 'ትግርኛ',
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const I18N_NAMESPACES = ['common', 'auth', 'nav', 'landing'] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];
```

---

## 1.8 Package: `@nafi/api-client`

### `packages/api-client/package.json`

```json
{
  "name": "@nafi/api-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "axios": "^1.7.7"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

### `packages/api-client/src/types.ts`

```ts
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    requestId: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
```

### `packages/api-client/src/client.ts`

```ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
  onRefreshToken: () => Promise<string>;
  clientVersion?: string;
  timeoutMs?: number;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs ?? 30_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // ---- Request: attach access token + version ----
  client.interceptors.request.use((req) => {
    const token = config.getAccessToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    if (config.clientVersion) {
      req.headers['X-Client-Version'] = config.clientVersion;
    }
    return req;
  });

  // ---- Response: handle 401 with one refresh attempt ----
  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as RetryableConfig | undefined;
      if (!original) return Promise.reject(error);

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const newToken = await config.onRefreshToken();
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch (refreshErr) {
          config.onUnauthorized();
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}
```

### `packages/api-client/src/queryKeys.ts`

```ts
export interface ContractFilters {
  status?: string;
  crop?: string;
  region?: string;
  farmerId?: string;
  page?: number;
  pageSize?: number;
}

export interface EscrowFilters {
  status?: string;
  bankId?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: (filters: ContractFilters = {}) => ['contracts', 'list', filters] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
    timeline: (id: string) => ['contracts', 'timeline', id] as const,
  },
  escrows: {
    all: ['escrows'] as const,
    list: (filters: EscrowFilters = {}) => ['escrows', 'list', filters] as const,
    detail: (id: string) => ['escrows', 'detail', id] as const,
    ledger: (id: string) => ['escrows', 'ledger', id] as const,
  },
  investments: {
    all: ['investments'] as const,
    mine: ['investments', 'mine'] as const,
    detail: (id: string) => ['investments', 'detail', id] as const,
  },
  inputs: {
    all: ['inputs'] as const,
    list: (contractId: string) => ['inputs', 'list', contractId] as const,
  },
  settlements: {
    all: ['settlements'] as const,
    detail: (id: string) => ['settlements', 'detail', id] as const,
  },
  collateral: {
    all: ['collateral'] as const,
    list: ['collateral', 'list'] as const,
    detail: (id: string) => ['collateral', 'detail', id] as const,
  },
  disputes: {
    all: ['disputes'] as const,
    list: ['disputes', 'list'] as const,
    detail: (id: string) => ['disputes', 'detail', id] as const,
  },
  reports: {
    all: ['reports'] as const,
    list: ['reports', 'list'] as const,
  },
  publicStats: ['public', 'stats'] as const,
} as const;
```

### `packages/api-client/src/index.ts`

```ts
export * from './types';
export * from './client';
export * from './queryKeys';
```

---

## 1.9 Root TypeScript & Lint Configs

### `tsconfig.json` (root, for editor)

```json
{
  "files": [],
  "references": [
    { "path": "./packages/design-tokens" },
    { "path": "./packages/rbac-core" },
    { "path": "./packages/formatters" },
    { "path": "./packages/validators" },
    { "path": "./packages/i18n" },
    { "path": "./packages/api-client" },
    { "path": "./packages/ui-react" },
    { "path": "./apps/web" },
    { "path": "./apps/landing" }
  ]
}
```

### `packages/*/tsconfig.json` (template — every package uses this)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### `eslint.config.js` (root)

```js
import base from '@nafi/config/eslint';

export default [...base];
```

### `commitlint.config.js`

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'contracts',
        'escrow',
        'investments',
        'inputs',
        'settlement',
        'collateral',
        'disputes',
        'reporting',
        'auth',
        'rbac',
        'ui',
        'i18n',
        'api',
        'deps',
        'ci',
        'docs',
      ],
    ],
  },
};
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
pnpm typecheck
```

### `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit "$1"
```

---

## 1.10 GitHub Actions CI

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
    name: Lint, Typecheck, Test
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## 1.11 Verification Checklist

Run these commands after Step 1 to verify the foundation:

```bash
# 1. Install
pnpm install

# 2. Type-check every package
pnpm typecheck

# 3. Lint
pnpm lint

# 4. Test RBAC + validators + formatters
pnpm test

# 5. Format check
pnpm format:check

# 6. Confirm workspace structure
pnpm -r list --depth -1
```

**Expected output at the end of Step 1:**

```
✓ pnpm install succeeds
✓ pnpm typecheck passes across 6 packages
✓ pnpm lint passes with zero errors
✓ RBAC can() unit tests pass (9/9)
✓ Workspace tree:

nafi-frontend/
├── apps/                  (empty — filled in Steps 2–8)
├── packages/
│   ├── api-client         ✓
│   ├── config             ✓
│   ├── design-tokens      ✓
│   ├── formatters         ✓
│   ├── i18n               ✓
│   ├── rbac-core          ✓
│   └── validators         ✓
├── services/              (empty — backend, out of scope for frontend skill)
├── e2e/                   (empty — filled in Step 10)
├── .github/workflows/ci.yml ✓
├── .husky/                ✓
├── eslint.config.js       ✓
├── prettier.config.js     ✓
├── commitlint.config.js   ✓
├── pnpm-workspace.yaml    ✓
├── turbo.json             ✓
├── tsconfig.base.json     ✓
├── tsconfig.json          ✓
└── package.json           ✓
```

---

## 1.12 What Was Built & Why

| Layer | Artifact | Purpose |
| :--- | :--- | :--- |
| **Monorepo** | pnpm workspaces + Turborepo | Single source of truth, parallel builds, cached tasks |
| **Type Safety** | `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Prevents an entire class of runtime bugs |
| **Design System Foundation** | `@nafi/design-tokens` | Every pixel is a token — no arbitrary values anywhere |
| **Tailwind Preset** | `@nafi/config/tailwind.preset.js` | One Tailwind config to rule every app |
| **RBAC Engine** | `@nafi/rbac-core` | Framework-agnostic `can()` — powers React `<Can>` and Vue `v-can` |
| **Formatters** | `@nafi/formatters` | Money, dates (Ethiopian calendar!), weights, hashes |
| **Validators** | `@nafi/validators` | Zod schemas shared between frontend and Node backend |
| **i18n Foundation** | `@nafi/i18n` | 4 locales, namespaced, ready for react-i18next |
| **API Client** | `@nafi/api-client` | Axios wrapper with token refresh + typed query keys |
| **CI Guardrails** | GitHub Actions + Husky + Commitlint | Nothing merges without passing lint, typecheck, tests |
| **Conventional Commits** | Scope-enforced | `feat(contracts):` works; `feat(foo):` rejected |

---

## 1.13 What Is Deliberately Not in Step 1

- ❌ No React apps yet (Step 2)
- ❌ No UI component library (Step 2)
- ❌ No pages or routes (Steps 3–8)
- ❌ No backend (out of frontend scope)
- ❌ No Storybook (Step 2)
- ❌ No E2E tests (Step 10)

**Step 1 is the foundation.** Everything else builds on top of it.

---

# ✅ Step 1 Complete

**Deliverable:** A fully installable, type-checked, lint-passing monorepo with:

- 7 shared packages (`design-tokens`, `config`, `rbac-core`, `formatters`, `validators`, `i18n`, `api-client`)
- Root configs (Turbo, TypeScript, ESLint, Prettier, Commitlint, Husky)
- CI pipeline (GitHub Actions)
- RBAC engine with 9 passing unit tests
- Ethiopian-calendar-aware formatters
- Zod schemas shared with the backend
- Typed API client with automatic token refresh

