# Monitoring & Alerts

## Tools

| Concern        | Tool            | URL                  |
| -------------- | --------------- | -------------------- |
| Error tracking | Sentry          | sentry.io/nafi       |
| Uptime         | BetterStack     | betterstack.com/nafi |
| Metrics        | Grafana         | grafana.nafi.et      |
| Logs           | Fly.io + Loki   | (via flyctl logs)    |
| Web Vitals     | Custom endpoint | analytics.nafi.et    |
| Analytics      | Plausible       | plausible.io/nafi.et |

## Critical alerts (PagerDuty)

- API health check fails 2× consecutively
- Error rate > 1% for 5 minutes
- Settlement execution fails
- Security incident detected

## Warning alerts (Slack #nafi-alerts)

- API p95 latency > 500ms for 5 min
- DB connection pool > 80% for 10 min
- Queue depth > 1000 for 15 min
- New error type detected
- LCP p75 > 2.5s for 24h

## Dashboards

**Grafana > NAFI Overview**

- Request rate, error rate, latency (RED metrics)
- DB query performance
- Settlement queue depth
- Bank integration health

**Grafana > NAFI Business**

- Contracts created (daily)
- Diaspora capital committed (weekly)
- Settlements executed (weekly)
- Active users by role

## On-call

Weekly rotation. Primary + secondary. Escalation to CTO after 30 min unacknowledged.
