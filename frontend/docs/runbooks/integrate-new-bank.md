# Integrate New Bank runbook

- Add adapter to `services/api/src/integrations/bank-adapters/`
- Implement `BankAdapter` interface
- Register in `services/api/src/integrations/bank-adapters/index.ts`
- Add credentials to Fly.io secrets
- Test in staging with a real escrow account
- Update `docs/INTEGRATIONS.md`
