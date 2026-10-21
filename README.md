# NAFI — National Agri-Finance Infrastructure

**NAFI** is a role-based digital platform concept for coordinating agricultural finance and contract-farming workflows in Ethiopia. The web application brings farmers, input suppliers, off-takers, financial institutions, investors, public institutions, donors, and platform administrators into a shared interface for managing agricultural contracts, funding, inputs, deliveries, payments, settlements, and oversight.

> **Project status:** This repository contains the NAFI web frontend and shared frontend packages. The repository configuration proxies `/api` requests to a service at `http://localhost:3143`; this README does not assume that the API service is included or production-ready. Some institutional routes are currently represented by placeholder/stub pages. Verify each workflow and its backend integration before using the platform operationally.

## Contents

- [Objectives](#objectives)
- [User groups and workspaces](#user-groups-and-workspaces)
- [Current frontend capabilities](#current-frontend-capabilities)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment and API configuration](#environment-and-api-configuration)
- [Available scripts](#available-scripts)
- [Quality checks](#quality-checks)
- [Security considerations](#security-considerations)
- [Known limitations and next steps](#known-limitations-and-next-steps)
- [Contributing](#contributing)
- [License](#license)

## Objectives

NAFI aims to support a more connected agricultural-finance ecosystem by helping participants coordinate:

- Contract-farming relationships and contract lifecycle information.
- Agricultural input orders, delivery tracking, and supplier payments.
- Farmer harvest progress, collateral records, and payments.
- Investment opportunities, investor portfolios, bonds, returns, and statements.
- Bank-facing escrow, loan, collateral, settlement, and portfolio information.
- Development-finance tracking, guarantees, risk-sharing, refinancing, and reporting.
- Government oversight, donor reporting, compliance workflows, and dispute handling.
- Platform administration, audit visibility, and system health monitoring.

These are product goals and frontend areas represented in the application; actual financial transactions, integrations, and regulatory controls depend on verified backend implementations.

## User groups and workspaces

The frontend defines route groups for the following roles:

| User group | Example workspace areas |
|---|---|
| Commercial farmer | Contracts, contract details, inputs, escrow, harvest, collateral, payments |
| Input supplier | Orders, order details, deliveries, payments, supplier profile |
| Off-taker / buyer | Purchases and settlements |
| Diaspora investor | Investment opportunities, portfolio, bonds, returns, statements |
| Commercial bank | Overview, escrows, loans, collateral, settlements, non-performing loans |
| Development Bank of Ethiopia (DBE) officer | Portfolio, co-financing, on-lending, technical-assistance tracking, reports |
| NAFA officer | Guarantees, claims, risk-sharing, refinancing, reports |
| Government regulator | Dashboard, contracts, foreign-exchange, credit, inputs, tax, incentives, audit, reports |
| Donor | Grants, disbursements, impact, reports, audit |
| Compliance officer | Review queue, KYC, AML, suspicious-activity reporting |
| Arbitrator | Arbitration cases |
| NAFI administrator | User and contract management, escrow, settlements, disputes, configuration, audit, health, USSD simulator |

Routes are guarded in the frontend using role and permission checks. Frontend route guards improve navigation and user experience, but **must not replace authorization checks in the API**.

## Current frontend capabilities

The repository currently includes:

- Public landing routes for the platform, audiences, impact, security, about, and contact.
- Authentication screens for login, registration, forgot password, and password reset.
- Role-aware dashboard routing and permission-based protected routes.
- Farmer, supplier, investor, bank, DBE, NAFA, buyer, government, donor, compliance, arbitration, and admin route groups.
- Shared UI, design-token, validation, formatting, API-client, localization, and role/permission packages.
- React Query for server-state management and Axios-based API communication.
- Internationalization infrastructure using i18next and React integration.
- Progressive Web App (PWA) configuration, including install metadata and service-worker caching rules.
- Offline-related application infrastructure.
- Error boundaries, toast notifications, and optional React Query developer tools.
- Frontend test tooling using Vitest and Testing Library.

The presence of a screen or route does not by itself mean its business process, API, payment, escrow, or external-system integration is complete.

## Technology stack

- **UI:** React 18, TypeScript, Vite
- **Routing:** React Router
- **Server-state management:** TanStack Query
- **HTTP client:** Axios
- **Forms and validation:** React Hook Form, Zod, resolver integrations
- **Localization:** i18next, react-i18next, browser language detection
- **Charts:** Recharts
- **Styling:** Tailwind CSS, PostCSS, shared design tokens
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa and Workbox
- **Testing:** Vitest, Testing Library, jsdom, MSW
- **Observability:** Sentry integration and Web Vitals instrumentation
- **Monorepo:** npm workspaces

## Architecture

The project is organized as an npm-workspaces monorepo:

```text
NAFI/
├── package.json
└── frontend/
    ├── apps/
    │   ├── web/                 # Main React/Vite web application
    │   │   └── src/
    │   │       ├── app/         # Router, providers, query client
    │   │       ├── components/  # Shared application components
    │   │       ├── features/    # Auth and role-specific features
    │   │       ├── layouts/     # Dashboard layout
    │   │       ├── offline/     # Offline support
    │   │       └── observability/
    │   └── e2e/                 # End-to-end workspace (if configured)
    └── packages/
        ├── api-client/          # API communication
        ├── design-tokens/       # Shared design values
        ├── formatters/          # Shared formatting utilities
        ├── i18n/                # Localization resources
        ├── rbac-core/           # Roles, permissions, access-control primitives
        ├── ui-react/            # Shared React UI components
        └── validators/          # Shared validation schemas
```

The root workspace configuration includes `frontend/packages/*`, `frontend/apps/*`, and `frontend/e2e`. Some package names and directories may evolve as development continues.

## Requirements

Install the following before starting:

- Node.js compatible with the project's Vite 5 and TypeScript toolchain (Node.js 20 LTS is a suitable starting point).
- npm, included with Node.js.
- Access to the API service if you need to test data-backed workflows.

Check the installed Node.js and npm versions:

```bash
node --version
npm --version
```

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Hailuworkuobsse-dev/NAFI.git
cd NAFI
```

### 2. Install dependencies

Run this from the repository root so npm can install and link all configured workspaces:

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite is configured to serve the web app on **http://localhost:3144**.

### 4. Connect the API service

The Vite development server forwards requests beginning with `/api` to `http://localhost:3143`. Start the corresponding API service separately if it is available in your development environment. If your API runs at a different address, update the proxy configuration in `frontend/apps/web/vite.config.ts` and any API-client configuration that applies.

The frontend can be started without an available API, but data-backed screens may fail to load or may display error/empty states.

## Environment and API configuration

The checked-in Vite configuration currently sets the web development and preview port to `3144` and the development API proxy target to `http://localhost:3143`.

Before deploying:

1. Inspect the API client and observability configuration for all required environment variables.
2. Keep secrets, credentials, signing keys, and private service URLs out of committed source files.
3. Use environment-specific configuration for local development, staging, and production.
4. Configure production API origins, CORS, cookies/tokens, and security headers deliberately.
5. Confirm that monitoring and analytics are configured for the intended environment.

Do not put real credentials or production secrets in this README or in source control.

## Available scripts

Run commands from the repository root unless noted otherwise.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the web development server |
| `npm run build` | Build the web application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the web app's ESLint checks |

The web workspace also defines these scripts:

```bash
npm run typecheck --workspace=@nafi/web
npm run test --workspace=@nafi/web
npm run test:watch --workspace=@nafi/web
npm run test:coverage --workspace=@nafi/web
```

Shared packages may define their own `typecheck`, `test`, and `lint` scripts. Check each package's `package.json` before running package-specific commands.

## Quality checks

Before opening a pull request, run the checks relevant to your change:

```bash
npm run lint
npm run build
npm run typecheck --workspace=@nafi/web
npm run test --workspace=@nafi/web
```

A successful frontend build does not prove that API integration, access control, financial calculations, or end-to-end workflows are correct. Test those separately against a controlled development environment.

## Security considerations

NAFI touches workflows that may involve personal information and financial records. Treat security as a release requirement:

- Enforce authentication, authorization, and tenant/data ownership on the server for every protected operation.
- Validate all incoming API data on the server; frontend validation is not a security boundary.
- Protect sensitive data in transit and at rest, and avoid exposing personal or financial data in logs.
- Use secure session/token handling, rate limiting, CSRF protections where applicable, and safe password-reset flows.
- Keep audit records for sensitive actions, administrative changes, approvals, and financial state transitions.
- Use synthetic data for development and automated tests.
- Verify KYC/AML, escrow, payment, settlement, and dispute workflows with qualified domain, legal, and security reviewers before production use.
- Review PWA caching carefully so sensitive API responses are not inadvertently persisted on shared devices.
- Never treat a frontend-only status indicator as proof that a financial transaction has settled.

## Known limitations and next steps

This README describes the code and configuration inspected in the repository; it is not a certification of production readiness. Before a release, the project team should:

1. Document and verify the API service, endpoints, schemas, and local startup instructions.
2. Mark implemented workflows separately from placeholders and demo-only screens.
3. Add integration and end-to-end tests for each role's core journeys.
4. Verify that every route's role and permission rules match server-side authorization.
5. Confirm offline behavior and ensure sensitive data is not cached unsafely.
6. Document deployment, database migrations, backup/recovery, monitoring, and incident response once the corresponding services are established.
7. Replace this section with a release-specific status checklist as the project matures.

## Contributing

1. Create a focused branch for your change.
2. Keep shared behavior in the appropriate package instead of duplicating it across role-specific pages.
3. Add or update tests for changed behavior.
4. Run lint, type-check, tests, and build checks relevant to the change.
5. Open a pull request describing the purpose, affected roles, test results, and any API or configuration changes.

## License

No license terms were verified while preparing this README. Until a license is added to the repository, do not assume that the source code is open source or that redistribution and reuse are permitted. Add the intended license and ownership notice before publicly distributing the project.
