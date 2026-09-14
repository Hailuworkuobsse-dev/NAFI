#!/usr/bin/env bash
# ============================================================
# NAFI Frontend — Step 10 Scaffolding Script (FINAL)
# Deployment, security hardening, monitoring configs, runbooks
# and complete handover documentation.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Step 10 scaffolding (FINAL) → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

mkdir -p docs/runbooks
mkdir -p services/api/scripts
mkdir -p infra/dev

# ============================================================
# VERCEL CONFIGS
# ============================================================

mkfile "apps/landing/vercel.json" <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm --filter @nafi/landing build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.nafi.et https://plausible.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
EOF

mkfile "apps/web/vercel.json" <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm --filter @nafi/web build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/manifest.webmanifest",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" },
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Permissions-Policy",
          "value": "camera=(self), microphone=(), geolocation=(self)"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://plausible.io https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.nafi.et https://plausible.io https://*.sentry.io wss://api.nafi.et; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
EOF

# ============================================================
# BACKEND DOCKER
# ============================================================

mkfile "services/api/Dockerfile" <<'EOF'
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/api/package.json services/api/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

COPY services/api ./services/api
COPY tsconfig.base.json ./

RUN pnpm --filter @nafi/api build
RUN pnpm --filter @nafi/api prisma:generate

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini curl
RUN corepack enable
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/services/api/package.json ./
COPY --from=builder /app/services/api/prisma ./prisma

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fs http://localhost:4000/api/v1/health || exit 1

USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
EOF

mkfile "infra/dev/docker-compose.yml" <<'EOF'
version: '3.9'

services:
  api:
    build:
      context: ../..
      dockerfile: services/api/Dockerfile
    restart: unless-stopped
    ports: ['4000:4000']
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://nafi:${MYSQL_PASSWORD:-nafi}@db:3306/nafi
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_started }

  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: nafi
      MYSQL_USER: nafi
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-nafi}
    volumes: [nafi_db:/var/lib/mysql]
    ports: ['3306:3306']
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    restart: unless-stopped
    command: ['redis-server', '--appendonly', 'yes']
    volumes: [nafi_cache:/data]

volumes:
  nafi_db:
  nafi_cache:
EOF

mkfile "services/api/fly.toml" <<'EOF'
app = "nafi-api"
primary_region = "jnb"

[build]
  dockerfile = "services/api/Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "4000"

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = "suspend"
  auto_start_machines = true
  min_machines_running = 2

[[http_service.checks]]
  interval = "30s"
  timeout = "5s"
  grace_period = "20s"
  method = "GET"
  path = "/api/v1/health"

[[vm]]
  size = "shared-cpu-2x"
  memory = "1gb"

[deploy]
  strategy = "rolling"
EOF

mkfile "services/api/scripts/migrate.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-}"
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "Usage: $0 <staging|production>"
  exit 1
fi

echo "▶ Migration target: $ENV"

case "$ENV" in
  staging) export DATABASE_URL="$STAGING_DATABASE_URL" ;;
  production) export DATABASE_URL="$PRODUCTION_DATABASE_URL" ;;
esac

echo "▶ Checking connectivity…"
npx prisma db execute --stdin <<< "SELECT 1;"

echo "▶ Snapshotting DB…"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_FILE="nafi-${ENV}-${TIMESTAMP}.sql.gz"

if [[ -n "${S3_BACKUP_BUCKET:-}" ]]; then
  mysqldump --single-transaction --quick --routines --triggers "$DATABASE_URL" \
    | gzip | aws s3 cp - "s3://${S3_BACKUP_BUCKET}/${SNAPSHOT_FILE}"
  echo "  → Snapshot uploaded: s3://${S3_BACKUP_BUCKET}/${SNAPSHOT_FILE}"
else
  mysqldump --single-transaction --quick --routines --triggers "$DATABASE_URL" \
    | gzip > "/tmp/${SNAPSHOT_FILE}"
  echo "  → Local snapshot: /tmp/${SNAPSHOT_FILE}"
fi

echo "▶ Running migrations…"
if ! npx prisma migrate deploy; then
  echo "✖ Migration failed."
  echo "  Rollback: restore from ${SNAPSHOT_FILE}"
  exit 1
fi

echo "▶ Verifying schema version…"
npx prisma migrate status

echo "✓ Migration complete."
EOF
chmod +x "services/api/scripts/migrate.sh"

# ============================================================
# DEPLOY WORKFLOW
# ============================================================

mkfile ".github/workflows/deploy.yml" <<'EOF'
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: Target environment
        required: true
        default: staging
        type: choice
        options: [staging, production]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  deploy-staging:
    name: Deploy to staging
    if: |
      github.event_name == 'push' ||
      (github.event_name == 'workflow_dispatch' && inputs.environment == 'staging')
    runs-on: ubuntu-latest
    timeout-minutes: 25
    environment:
      name: staging
      url: https://staging.nafi.et
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Deploy frontends to Vercel
        run: |
          pnpm dlx vercel@latest deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes --cwd apps/landing
          pnpm dlx vercel@latest deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes --cwd apps/web

  deploy-production:
    name: Deploy to production
    if: github.event_name == 'workflow_dispatch' && inputs.environment == 'production'
    runs-on: ubuntu-latest
    timeout-minutes: 30
    environment:
      name: production
      url: https://app.nafi.et
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Run migrations (production)
        run: ./services/api/scripts/migrate.sh production
        env:
          PRODUCTION_DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
          S3_BACKUP_BUCKET: ${{ secrets.S3_BACKUP_BUCKET }}
      - name: Deploy frontends to Vercel
        run: |
          pnpm dlx vercel@latest deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes --cwd apps/landing
          pnpm dlx vercel@latest deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes --cwd apps/web
      - name: Smoke test production
        run: |
          set -e
          curl -fs https://nafi.et | grep -q "NAFI"
          curl -fs https://app.nafi.et | grep -q "NAFI"
EOF

# ============================================================
# DOCUMENTATION
# ============================================================

mkfile "docs/README.md" <<'EOF'
# NAFI Documentation

## Getting started
- [Development](./DEVELOPMENT.md) — run the stack locally
- [Architecture](./ARCHITECTURE.md) — system design
- [Contributing](./CONTRIBUTING.md) — coding standards and PR process

## Operations
- [Deployment](./DEPLOYMENT.md) — deploy to staging and production
- [Incident Response](./INCIDENT_RESPONSE.md) — what to do when things break
- [Monitoring](./MONITORING.md) — dashboards, alerts, on-call
- [Runbooks](./runbooks/) — task-specific procedures

## Engineering
- [RBAC](./RBAC.md) — roles, permissions, scope model
- [Security](./SECURITY.md) — security policy
- [Data Protection](./DATA_PROTECTION.md) — retention, residency, PII

## Compliance
- [Audit](./AUDIT.md) — immutable audit log structure and access
EOF

mkfile "docs/DEVELOPMENT.md" <<'EOF'
# Local Development

## Prerequisites
- Node.js 20.11+
- pnpm 9.12+
- Docker (for MySQL + Redis)
- Git

## Bootstrap

