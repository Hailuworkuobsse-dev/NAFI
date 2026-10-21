# Rotate Secrets runbook

- Generate new secret: `openssl rand -base64 48`
- Update in Vercel and Fly.io
- Deploy backend with new secret
- Redeploy frontends if the secret is client-side
- Monitor Sentry for auth errors
- Verify login flow works
