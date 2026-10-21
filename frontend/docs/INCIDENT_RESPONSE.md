# NAFI Incident Response Runbook

## Severity Levels

| Level    | Definition                                 | Response Time     | Comms                  |
| -------- | ------------------------------------------ | ----------------- | ---------------------- |
| **SEV1** | Platform down, data loss, security breach  | 5 min             | All-hands, status page |
| **SEV2** | Major feature broken for >50% of users     | 15 min            | Slack #nafi-incidents  |
| **SEV3** | Degraded performance or minor feature down | 1 hour            | Slack #nafi-alerts     |
| **SEV4** | Cosmetic bug or edge case                  | Next business day | Issue tracker          |

## On-call rotation

- Primary: on-call engineer (weekly)
- Secondary: backup engineer
- Escalation: CTO after 30 minutes unacknowledged

## First 15 minutes

1. **Acknowledge** in `#nafi-incidents`
2. **Assess scope** — what's broken? How many users?
3. **Check dashboards** — Sentry, BetterStack, Grafana
4. **Declare severity** — use the table above
5. **Start a war room** — Zoom link pinned to channel
6. **Assign roles** — Incident Commander, Comms Lead, Technical Lead

## Diagnosis playbook

### API is down

- Check BetterStack uptime
- `flyctl status --app nafi-api`
- `flyctl logs --app nafi-api`
- Recent deploys: `flyctl releases --app nafi-api`

### Database is slow

- Check Grafana: `db_query_duration_seconds`
- Slow query log in MySQL
- Check connection pool utilization
- Consider read replica promotion if primary overloaded

### Frontend broken

- Check Sentry for error spike
- Check Vercel deployment logs
- Verify CSP hasn't blocked a new dependency
- Roll back via Vercel

### Settlement failure

- **IMMEDIATE ESCALATION to CTO and CFO**
- Freeze all settlement mutations via feature flag
- Reconcile escrow balances manually
- Root cause analysis before resuming

### Security incident

- **IMMEDIATE ESCALATION to CTO and CEO**
- Rotate all secrets (JWT, DB, S3, VAPID)
- Force logout all sessions (bump JWT version)
- Preserve logs (do not delete)
- Follow Ethiopian data protection breach notification requirements (72 hours)

## Post-mortem

Every SEV1 and SEV2 requires a written post-mortem within 5 business days:

- Timeline (UTC) of events
- Root cause (5 whys)
- What went well
- What went poorly
- Action items with owners and due dates
- Blameless — focus on systems, not people
