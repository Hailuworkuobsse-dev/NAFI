# Db Backup Restore runbook

- Automatic snapshots daily (RDS)
- Manual snapshot: `./services/api/scripts/snapshot.sh`
- Restore: `aws rds restore-db-instance-from-db-snapshot`
- Update `DATABASE_URL` in Fly.io secrets
- Verify with `prisma migrate status`
