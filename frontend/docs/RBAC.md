# Role-Based Access Control

## Roles

12 roles, defined in `@nafi/rbac-core`:

| Role                 | Description              | Default landing    |
| -------------------- | ------------------------ | ------------------ |
| DIASPORA_INVESTOR    | Diaspora investor        | /portfolio         |
| COMMERCIAL_BANK      | Bank officer             | /bank/overview     |
| DBE_OFFICER          | Development Bank officer | /dbe/portfolio     |
| NAFA_OFFICER         | NAFA officer             | /nafa/guarantees   |
| INPUT_SUPPLIER       | Input supplier           | /supplier/orders   |
| COMMERCIAL_FARMER    | Commercial farmer        | /farm/contracts    |
| OFF_TAKER            | Buyer/exporter           | /buyer/purchases   |
| GOVERNMENT_REGULATOR | MoA/NBE/EIC/MoR          | /gov/dashboard     |
| DONOR                | Donor program officer    | /donor/grants      |
| NAFI_ADMIN           | Platform admin           | /admin/overview    |
| COMPLIANCE_OFFICER   | Compliance reviewer      | /compliance/queue  |
| ARBITRATOR           | Dispute arbitrator       | /arbitration/cases |

## Permission model

Format: `<resource>:<action>[:<scope>]`

- **Resources:** contract, escrow, investment, input, settlement, collateral, dispute, report, user, system, audit, tax
- **Actions:** create, read, update, delete, approve, reject, submit, execute, export, freeze, unfreeze
- **Scopes:** own, institution, region, national, all

See the full matrix in `packages/rbac-core/src/rolePermissions.ts`.

## Enforcement

### Route level

\`\`\`tsx
<ProtectedRoute permission={PERMISSIONS.CONTRACT_READ_OWN} roles={['COMMERCIAL_FARMER']}>
<FarmContractsPage />
</ProtectedRoute>
\`\`\`

### Component level

\`\`\`tsx
<Can I={PERMISSIONS.ESCROW_RELEASE}>
<Button onClick={release}>Release funds</Button>
</Can>
\`\`\`

### Server level

Middleware `authorize('escrow:release')` on every protected route.

## Testing RBAC

Every protected route has tests in `e2e/tests/`:

- Unauthenticated → redirect to login
- Wrong role → redirect to role home
- Missing permission → ForbiddenPage
- Valid → renders
