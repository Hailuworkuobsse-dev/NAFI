# NAFI Frontend

**National Agri-Finance Infrastructure** — Ethiopia's agricultural finance platform connecting farmers, banks, investors, and government stakeholders.

## Overview

This is a **partial frontend implementation** of the NAFI platform, built as a monorepo with:
- **2 applications**: Web App (dashboard) + Landing Page
- **8 shared packages**: UI components, i18n, RBAC, API client, validators, formatters, design tokens, config
- **Multi-tenant RBAC**: 12 user roles with permission-based access control
- **4-language support**: English, Amharic, Afaan Oromoo, Tigrinya

## 📦 Project Structure

```
frontend/
├── apps/                      # Deployable applications
│   ├── web/                   # Main dashboard app (port 3000)
│   │   └── src/
│   │       ├── api/           # API layer
│   │       ├── app/           # App providers, router, query client
│   │       ├── auth/          # Authentication context & hooks
│   │       ├── components/    # Error boundaries, toast provider
│   │       ├── features/      # Feature modules (auth pages)
│   │       ├── hooks/         # React Query hooks (queries/mutations)
│   │       ├── i18n/          # App-level i18n configuration
│   │       ├── layouts/       # Dashboard & auth layouts
│   │       ├── lib/           # Utilities (queryKeys)
│   │       └── pages/         # Route page stubs by role
│   └── landing/               # Public landing page (port 3001)
│       └── src/
│           ├── components/    # Landing page components
│           ├── hooks/         # Custom hooks
│           ├── i18n/          # i18n for landing
│           ├── layouts/       # Public layout
│           ├── pages/         # Landing pages
│           └── sections/      # Landing sections
│
├── packages/                  # Shared workspace packages
│   ├── api-client/            # Axios-based API client
│   ├── config/                # ESLint & Tailwind configs
│   ├── design-tokens/         # Colors, typography, spacing, shadows
│   ├── formatters/            # Currency, date, number formatters
│   ├── i18n/                  # i18n configuration & locales
│   ├── rbac-core/             # Role-based access control logic
│   ├── ui-react/              # Component library (primitives, composites, patterns)
│   └── validators/            # Zod schemas for validation
│
├── .github/                   # GitHub workflows
├── package.json               # Root package with Turbo scripts
├── pnpm-workspace.yaml        # PNPM workspace config
├── turbo.json                 # Turborepo pipeline config
└── tsconfig.base.json         # Base TypeScript config
```

## 🏗️ Architecture

### Monorepo Stack
| Tool | Purpose |
|------|---------|
| **PNPM** | Package manager with workspaces |
| **Turborepo** | Build system & task orchestration |
| **TypeScript** | Type-safe development (v5.6.3) |
| **Vite** | Fast build tool & dev server |
| **React 18** | UI framework |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management |
| **Zustand** | Client state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **i18next** | Internationalization |
| **Tailwind CSS** | Styling |
| **Radix UI** | Accessible primitives |
| **Recharts** | Data visualization |
| **Lucide React** | Icons |

### Applications

#### 1. Web App (`@nafi/web`)
- **Port**: 3000
- **Purpose**: Multi-tenant dashboard for all stakeholder roles
- **Features**:
  - Role-based protected routes
  - Authentication (login, register, password reset)
  - TanStack Query for data fetching
  - Toast notifications
  - Error boundaries
  - Permission guards

#### 2. Landing Page (`@nafi/landing`)
- **Port**: 3001
- **Purpose**: Public marketing & information site
- **Features**:
  - Responsive design
  - Multi-language support
  - Information sections for different stakeholder groups

### Shared Packages

| Package | Description | Key Dependencies |
|---------|-------------|------------------|
| `@nafi/api-client` | Axios HTTP client with types | axios |
| `@nafi/config` | Shared ESLint & Tailwind configs | tailwindcss, @tailwindcss/* |
| `@nafi/design-tokens` | Design system tokens (colors, spacing, typography) | - |
| `@nafi/formatters` | Currency, date, number formatting utilities | - |
| `@nafi/i18n` | i18n setup with 4 locales (en, am, om, ti) | i18next |
| `@nafi/rbac-core` | Role & permission definitions, RBAC logic | - |
| `@nafi/ui-react` | Component library with Storybook | Radix UI, react-hook-form, recharts |
| `@nafi/validators` | Zod validation schemas | zod |

## 🔐 RBAC System

### User Roles (12 total)
1. **DIASPORA_INVESTOR** - Diaspora bond investors
2. **COMMERCIAL_BANK** - Bank officers managing escrows & loans
3. **DBE_OFFICER** - Development Bank of Ethiopia officers
4. **NAFA_OFFICER** - NAFA guarantee & risk-sharing officers
5. **INPUT_SUPPLIER** - Agricultural input suppliers
6. **COMMERCIAL_FARMER** - Large-scale farmers
7. **OFF_TAKER** - Agricultural product buyers
8. **GOVERNMENT_REGULATOR** - Ministry/regulatory agency officials
9. **DONOR** - International development partners
10. **NAFI_ADMIN** - Platform administrators
11. **COMPLIANCE_OFFICER** - KYC/AML compliance officers
12. **ARBITRATOR** - Dispute resolution arbitrators

### Government Agencies
- MOA (Ministry of Agriculture)
- NBE (National Bank of Ethiopia)
- EIC (Ethiopian Investment Commission)
- MOR (Ministry of Revenue)
- SEZ (Special Economic Zone)
- PMO (Prime Minister's Office)

### Permissions
The RBAC system defines granular permissions like:
- `CONTRACT_READ_OWN`, `CONTRACT_READ_ALL`, `CONTRACT_CREATE`, `CONTRACT_APPROVE`
- `ESCROW_READ_OWN`, `ESCROW_MANAGE`
- `INVESTMENT_READ_OWN`, `INVESTMENT_CREATE`
- `REPORT_READ_OWN`, `REPORT_EXPORT`
- `SYSTEM_CONFIGURE`, `USER_MANAGE`
- `DISPUTE_ARBITRATE`, `COMPLIANCE_REVIEW`

## 🌍 Internationalization (i18n)

Supported locales:
- **en** - English
- **am** - አማርኛ (Amharic)
- **om** - Afaan Oromoo
- **ti** - ትግርኛ (Tigrinya)

Namespaces: `common`, `auth`, `nav`, `landing`

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.11.0
- PNPM >= 9.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test
```

### Development

```bash
# Start all apps in parallel (web:3000, landing:3001)
pnpm dev

# Start only web app
pnpm --filter @nafi/web dev

# Start only landing page
pnpm --filter @nafi/landing dev

# Start Storybook for UI components
pnpm storybook
```

### Build

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @nafi/web build
pnpm --filter @nafi/landing build
```

### Other Commands

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Run E2E tests
pnpm test:e2e

# Clean all builds
pnpm clean
```

## 📁 Code Organization

### Web App Routes

Routes are protected by role and permission guards:

```typescript
// Example route structure
{
  path: '/portfolio',
  element: <ProtectedRoute 
    permission={PERMISSIONS.INVESTMENT_READ_OWN}
    roles={['DIASPORA_INVESTOR']}
  />,
  children: [...]
}
```

**Route Groups by Role:**
- `/portfolio/*` - Diaspora Investor
- `/bank/*` - Commercial Bank
- `/dbe/*` - DBE Officer
- `/nafa/*` - NAFA Officer
- `/supplier/*` - Input Supplier
- `/farm/*` - Commercial Farmer
- `/buyer/*` - Off-Taker
- `/gov/*` - Government Regulator
- `/donor/*` - Donor
- `/admin/*` - NAFI Admin
- `/compliance/*` - Compliance Officer
- `/arbitration/*` - Arbitrator

### Hooks

**Query Hooks** (TanStack Query):
- `useEscrows`, `useContracts`, `useInvestments`
- `useCollateral`, `useSettlements`, `useDisputes`
- `useUsers`, `useInputs`, `useOpportunities`
- `useReports`, `useAuditLog`, `useNotifications`

**Mutation Hooks**:
- `useEscrowMutations`, `useContractMutations`
- `useInvestmentMutations`, `useCollateralMutations`
- `useSettlementMutations`, `useDisputeMutations`
- `useUserMutations`, `useInputMutations`

**Utility Hooks**:
- `usePermissionGuard` - Check permissions
- `useTableState` - Table pagination/sorting/filtering
- `useDebounce` - Debounce values
- `useTenantScope` - Multi-tenant scoping

### UI Components (`@nafi/ui-react`)

**Primitives**: Avatar, Badge, Button, Checkbox, Input, Select, Skeleton, Spinner, Switch, Tooltip

**Composites**: ContractCard, ContractStatusBadge, EscrowBalanceCard, InvestmentCard, InvestmentPoolProgress, SettlementWaterfallChart, WarehouseReceiptCard

**Components**: Alert, Card, CurrencyInput, DataList, EmptyState, ErrorState, Modal, Pagination, ProgressBar, StatCard, Tabs, Timeline

**Patterns**: [Domain-specific patterns]

**RBAC**: ProtectedRoute, PermissionGuard components

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @nafi/ui-react test
pnpm --filter @nafi/validators test
pnpm --filter @nafi/formatters test

# Run E2E tests
pnpm test:e2e
```

Test frameworks:
- **Vitest** - Unit & integration tests
- **Testing Library** - React component testing
- **Playwright** - E2E tests (in `e2e/` package)

## 📖 Documentation

- Component documentation available in Storybook (`pnpm storybook`)
- See inline JSDoc comments in source files
- RBAC definitions in `packages/rbac-core/src/`

## 🤝 Contributing

### Commit Convention
This project uses conventional commits via commitlint:

```
feat: add new investment card component
fix: resolve currency formatting issue
docs: update README installation steps
style: format button styles
refactor: extract hook from component
test: add unit tests for validator
chore: update dependencies
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with conventional commits
3. Ensure `pnpm typecheck`, `pnpm lint`, `pnpm test` pass
4. Submit PR with clear description

## 🏭 Production Build

### Web App
```bash
pnpm --filter @nafi/web build
# Output: apps/web/dist/
```

### Landing Page
```bash
pnpm --filter @nafi/landing build
# Output: apps/landing/dist/
```

### Environment Variables
Create `.env` files in app directories:

```env
# apps/web/.env
VITE_API_BASE_URL=https://api.nafi.et
VITE_ENABLE_QUERY_DEVTOOLS=false
```

## 📝 Current Status

**Implemented:**
- ✅ Monorepo structure with Turborepo
- ✅ 8 shared packages
- ✅ Web app with role-based routing
- ✅ Landing page
- ✅ Authentication flows (UI stubs)
- ✅ RBAC system with 12 roles
- ✅ i18n setup for 4 languages
- ✅ TanStack Query integration
- ✅ React Hook Form integration
- ✅ UI component library with Storybook
- ✅ Query & mutation hooks scaffolded

**Pending Implementation:**
- ⏳ Full page implementations (currently stubs)
- ⏳ Complete API integration
- ⏳ Full i18n translations for all 4 languages
- ⏳ Complete form validations
- ⏳ E2E tests
- ⏳ Backend services integration

## 📄 License

[Add license information]
