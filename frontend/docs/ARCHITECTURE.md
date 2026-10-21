# Architecture

## Monorepo structure

\`\`\`
nafi-frontend/
├── apps/
│ ├── landing/ # Public marketing site
│ ├── web/ # Authenticated web app (all roles)
│ └── web/ # Farmer PWA (same build, different deploy)
├── packages/
│ ├── design-tokens/ # Brand colors, spacing, typography
│ ├── config/ # Shared ESLint, Tailwind, TS presets
│ ├── rbac-core/ # Roles, permissions, can()
│ ├── formatters/ # Currency, dates, weights, text
│ ├── validators/ # Zod schemas (shared with backend)
│ ├── i18n/ # Translations (en, am, om, ti)
│ ├── api-client/ # Axios wrapper + query keys
│ └── ui-react/ # Component library (4 layers)
├── services/
│ └── api/ # Node.js + Express + Prisma + MySQL
├── e2e/ # Playwright tests
└── docs/ # This documentation
\`\`\`

## Data flow

1. User authenticates → JWT access token in memory, refresh token in httpOnly cookie
2. Frontend calls API via `@nafi/api-client` → typed, error-normalized
3. API validates, applies RBAC, hits Prisma → MySQL
4. Response flows back through error normalization → TanStack Query cache
5. Feature page reads from `useContracts()` etc. → renders

## Role-based access control (RBAC)

Three levels of enforcement:

1. **Route level** — `<ProtectedRoute permission=... roles=... />` in the router
2. **Component level** — `<Can I={PERMISSION}>...</Can>` hides UI elements
3. **Server level** — API checks `req.user.permissions` before every action

See [RBAC.md](./RBAC.md) for the full permission matrix.

## Offline-first farmer PWA

- Service worker caches static assets and API GETs
- IndexedDB stores contracts, inputs, escrows for offline reads
- `useOfflineMutation` queues writes when offline
- Background Sync wakes the tab when connectivity returns
- Exponential backoff with 10-attempt cap
- See [FRONTEND.md](./FRONTEND.md#offline-first) for details
