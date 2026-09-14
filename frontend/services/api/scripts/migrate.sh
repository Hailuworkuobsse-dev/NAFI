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
