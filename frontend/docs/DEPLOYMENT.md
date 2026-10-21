# Deployment

## Environments

| Environment | Frontend            | Backend             | Database                      |
| ----------- | ------------------- | ------------------- | ----------------------------- |
| Local       | localhost:3000/3001 | localhost:4000      | Docker MySQL                  |
| Staging     | staging-app.nafi.et | staging-api.nafi.et | staging DB (RDS)              |
| Production  | app.nafi.et         | api.nafi.et         | production DB (RDS, multi-AZ) |

## Deploying to staging

Automatic on every push to `main`. No approval required.

## Deploying to production

1. Merge PR to `main` (staging deploys automatically)
2. Verify staging is healthy (24h soak)
3. Trigger `Deploy` workflow with `environment=production`
4. Two senior engineers approve the deployment in GitHub
5. Wait 5 minutes (timer)
6. Deployment proceeds: migrate → backend → frontend → smoke test

## Rollback

**Frontend:** promote previous Vercel deployment — under 60s
**Backend:** `flyctl releases rollback <version>` — under 2 min
**Database:** restore from snapshot — last resort, ~15 min

See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for details.

## Migrations

Never deploy a destructive migration in the same release as a code change.

**Expand-contract pattern:**

1. Release 1: Add new column (nullable)
2. Release 2: Backfill data
3. Release 3: Update code to use new column
4. Release 4: Drop old column

Run migrations: `./services/api/scripts/migrate.sh production`

## Secrets

- Frontend: Vercel environment variables
- Backend: `flyctl secrets set KEY=value`
- Rotate quarterly
- Never commit secrets — Husky blocks `.env*` (except `.env.example`)
