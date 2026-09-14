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
