# NAFI
## National Agri-Finance Infrastructure (NAFI)

The digital backbone of Ethiopia's agricultural transformation — a comprehensive platform connecting farmers, financial institutions, and stakeholders through modern web applications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Available Packages](#available-packages)
- [Applications](#applications)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

NAFI (National Agri-Finance Infrastructure) is a full-stack platform designed to modernize Ethiopia's agricultural finance ecosystem. It provides:

- **Web Application** - Dashboard for financial institutions, administrators, and stakeholders
- **Landing Page** - Public-facing marketing and information portal
- **Farmer PWA** - Progressive Web App for farmers (planned)
- **Shared Component Library** - Reusable UI components with Storybook documentation
- **Multi-language Support** - English, Amharic, Afaan Oromoo, and Tigrinya

---

## Project Structure

```
nafi/
├── frontend/                 # Frontend monorepo
│   ├── apps/                 # Deployable applications
│   │   ├── landing/          # Landing page (Vite + React)
│   │   └── web/              # Main web application (Vite + React)
│   ├── packages/             # Shared workspace packages
│   │   ├── api-client/       # API client with Axios
│   │   ├── config/           # Shared configuration
│   │   ├── design-tokens/    # Colors, typography, spacing, shadows
│   │   ├── formatters/       # Utility formatters
│   │   ├── i18n/             # Internationalization (en, am, om, ti)
│   │   ├── rbac-core/        # Role-Based Access Control core
│   │   ├── ui-react/         # React component library (Radix UI + Tailwind)
│   │   └── validators/       # Zod validators
│   ├── services/             # Backend services (Node.js + Prisma + MySQL)
│   ├── e2e/                  # Playwright end-to-end tests
│   └── docs/                 # Frontend documentation
├── docs/                     # Root documentation
│   └── codes/                # Step-by-step implementation guides
└── README.md                 # This file
```

---

## Architecture

### Monorepo Setup
- **Package Manager**: pnpm v9.12.0 with workspaces
- **Build System**: Turborepo for pipeline orchestration
- **TypeScript**: Shared base configuration across all packages

### Frontend Architecture
- **Framework**: React 18.3 with Vite 5.4
- **Routing**: React Router v6
- **State Management**: Zustand for global state, TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI primitives + custom components
- **Charts**: Recharts
- **Icons**: Lucide React

### Internationalization
- **Library**: i18next with react-i18next
- **Supported Languages**: 
  - English (en)
  - Amharic (አማርኛ)
  - Afaan Oromoo (om)
  - Tigrinya (ትግርኛ)

### Authentication & Authorization
- **RBAC**: Custom role-based access control system
- **API Client**: Axios-based typed API client

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript 5.6 |
| **Runtime** | Node.js >=20.11.0 |
| **Package Manager** | pnpm 9.12.0 |
| **Build Tool** | Vite 5.4 |
| **Monorepo Tool** | Turborepo 2.2 |
| **UI Framework** | React 18.3 |
| **Styling** | Tailwind CSS 3.4 |
| **Component Library** | Radix UI |
| **Forms** | React Hook Form 7.53 |
| **Validation** | Zod 3.23 |
| **HTTP Client** | Axios 1.7 |
| **Server State** | TanStack Query 5.59 |
| **Client State** | Zustand 5.0 |
| **Routing** | React Router 6.27 |
| **i18n** | i18next 23.16 |
| **Testing** | Vitest 2.1, Playwright |
| **Linting** | ESLint 9 |
| **Formatting** | Prettier 3.3 |
| **Commit Hooks** | Husky 9, lint-staged |
| **Commit Convention** | commitlint |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 20.11.0
- **pnpm** >= 9.0.0

```bash
# Check Node.js version
node --version

# Install pnpm if not already installed
npm install -g pnpm@9.12.0
```

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
pnpm install
```

### Environment Setup

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

---

## Development

### Start Development Servers

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @nafi/web dev
pnpm --filter @nafi/landing dev
```

### Build

```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter @nafi/ui-react build
```

### Type Checking

```bash
# Run TypeScript type checking across all packages
pnpm typecheck
```

### Linting

```bash
# Run ESLint across all packages
pnpm lint

# Run lint on specific package
pnpm --filter @nafi/web lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run end-to-end tests
pnpm test:e2e

# Run tests for specific package
pnpm --filter @nafi/api-client test
```

### Code Formatting

```bash
# Format all files
pnpm format

# Check formatting without making changes
pnpm format:check
```

### Storybook

```bash
# Start Storybook for UI component development
pnpm storybook
```

---

## Available Packages

### `@nafi/api-client`
Typed API client built on Axios for communicating with backend services.

### `@nafi/config`
Shared configuration files and settings across packages.

### `@nafi/design-tokens`
Design system tokens including:
- Colors
- Typography
- Spacing
- Shadows

### `@nafi/formatters`
Utility functions for formatting dates, numbers, currencies, and other values.

### `@nafi/i18n`
Internationalization package with support for:
- English (en)
- Amharic (am)
- Afaan Oromoo (om)
- Tigrinya (ti)

### `@nafi/rbac-core`
Role-Based Access Control core logic for permissions and authorization.

### `@nafi/ui-react`
Comprehensive React component library featuring:
- Forms (inputs, selects, checkboxes, radio groups)
- Data display (tables, cards, avatars)
- Navigation (tabs, menus)
- Overlays (dialogs, popovers, tooltips, toasts)
- Charts (powered by Recharts)
- File uploads (react-dropzone)
- Date pickers (react-day-picker)
- QR codes (qrcode.react)

### `@nafi/validators`
Shared Zod validators for form validation and data sanitization.

---

## Applications

### `@nafi/web`
Main web application for financial institutions and administrators.

**Port**: 3000  
**Features**:
- Dashboard and analytics
- Escrow management
- Investment tracking
- Contract management
- Dispute resolution
- User management
- Reports and settlements

### `@nafi/landing`
Public-facing landing page and marketing site.

**Port**: 3001  
**Features**:
- Hero sections
- Feature showcases
- Testimonials
- Call-to-action sections
- Responsive design

---

## Scripts

From the `frontend/` directory:

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages and applications |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests with Playwright |
| `pnpm format` | Format all code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm clean` | Clean all build artifacts and node_modules |
| `pnpm storybook` | Start Storybook for UI development |

---

## Documentation

### Step-by-Step Guides
Detailed implementation documentation is available in `docs/codes/`:

- **Step 1**: Foundation - Monorepo setup, design tokens, shared packages
- **Step 2**: [Implementation details]
- **Step 3**: [Implementation details]
- ...
- **Step 10**: Production deployment, infrastructure, security hardening

### Frontend Documentation
See `frontend/docs/` for frontend-specific documentation.

### Development Guide
After completing Step 10, refer to `docs/DEVELOPMENT.md` for comprehensive development guidelines.

---

## Contributing

### Commit Convention
This project uses Conventional Commits. Install commit hooks:

```bash
pnpm install
```

Commits are validated using commitlint with the conventional config.

### Pre-commit Hooks
Husky and lint-staged automatically:
- Fix ESLint issues on staged `.ts` and `.tsx` files
- Format staged files with Prettier

### Pull Requests
1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass (`pnpm typecheck`, `pnpm lint`, `pnpm test`)
4. Submit a pull request

---

## Deployment

### Production Architecture

```
                    ┌─────────────────────────────────┐
                    │         Cloudflare (WAF +       │
                    │         CDN + DDoS shield)      │
                    └────────────┬────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌────────────────┐      ┌────────────────┐
│ nafi.et       │      │ app.nafi.et    │      │ farmer.nafi.et │
│ (Landing)     │      │ (Web app)      │      │ (Farmer PWA)   │
│ Vercel Edge   │      │ Vercel Edge    │      │ Vercel Edge    │
└───────────────┘      └────────────────┘      └────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────────┐
                    │  api.nafi.et (Backend)         │
                    │  Node.js + Express + Prisma    │
                    │  Fly.io / AWS ECS / VPS        │
                    └────────────┬───────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────┐      ┌────────────────┐      ┌────────────────┐
│  MySQL 8     │      │  Redis         │      │  S3-compatible │
│  (RDS / DO)  │      │  (sessions)    │      │  (uploads)     │
└──────────────┘      └────────────────┘      └────────────────┘
```

### Deployment Platforms
- **Frontends**: Vercel (edge CDN, instant rollbacks, preview deploys)
- **Backend**: Fly.io or equivalent (multi-region support)
- **Database**: Managed MySQL (RDS or DigitalOcean)
- **CDN/WAF**: Cloudflare

---

## License

[License information to be added]

---

## Contact & Support

For questions or support, please refer to the documentation or contact the development team.

---

*Last updated: September 2024*

