#!/usr/bin/env bash
# ============================================================
# NAFI Backend — Standalone Scaffolding Script
# Node.js + Express + Prisma + MySQL
# Fully self-contained — no workspace dependency on frontend.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Backend scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

mkdir -p src/config
mkdir -p src/middleware
mkdir -p src/utils
mkdir -p src/modules/auth
mkdir -p src/modules/contracts
mkdir -p src/modules/escrows
mkdir -p src/modules/investments
mkdir -p src/modules/opportunities
mkdir -p src/modules/inputs
mkdir -p src/modules/settlements
mkdir -p src/modules/collateral
mkdir -p src/modules/disputes
mkdir -p src/modules/reports
mkdir -p src/modules/users
mkdir -p src/modules/notifications
mkdir -p src/modules/audit
mkdir -p src/modules/public
mkdir -p src/modules/health
mkdir -p src/scripts
mkdir -p prisma

# ============================================================
# PACKAGE.JSON
# ============================================================

mkfile "package.json" <<'EOF'
{
  "name": "nafi-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/server.js",
  "engines": {
    "node": ">=20.11.0"
  },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -b",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "echo 'no lint configured'",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed": "tsx prisma/seed.ts",
    "seed:test": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.5.0",
    "pino-http": "^10.3.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.7.5",
    "pino-pretty": "^13.0.0",
    "prisma": "^5.22.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
EOF

mkfile "tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false,
    "sourceMap": true,
    "noEmit": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

mkfile ".env.example" <<'EOF'
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=mysql://nafi:nafi@localhost:3306/nafi

# JWT (generate with: openssl rand -base64 48)
JWT_SECRET=replace-with-64-char-random-string
JWT_REFRESH_SECRET=replace-with-another-64-char-random-string
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Cookies
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Push (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
EOF

mkfile ".gitignore" <<'EOF'
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
prisma/migrations/dev.db*
EOF

mkfile "README.md" <<'EOF'
# NAFI Backend

Standalone Node.js + Express + Prisma + MySQL backend for the NAFI platform.

## Setup

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev