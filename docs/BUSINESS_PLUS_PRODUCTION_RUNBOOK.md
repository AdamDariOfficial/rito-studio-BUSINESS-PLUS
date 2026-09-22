# RITO Studio BUSINESS PLUS — Production Readiness and Cutover Runbook

**Status:** source/tooling gate prepared; real-data activation requires configured legal inputs
**Version:** 1.0
**Date:** 23 September 2026
**Scope:** RITO Studio BUSINESS PLUS production preparation and cutover

## 1. Canonical source

Production work starts only from the current canonical `main` after the post-merge staging and
security closeout. Do not use source `wrangler.jsonc` directly for deployment.

The product remains intentionally **not frozen**. No freeze tag or immutable family baseline is
created by this runbook. A later approved refinement may change the product and must receive its
own validation/deployment cycle.

## 2. Production target

The approved default technical names are:

```text
Worker:      rito-studio-business-plus-production
D1:          rito-studio-business-plus-production
Public host: rito-studio-business-plus.tretnix.com
Admin host:  admin.rito-studio-business-plus.tretnix.com
```

The production D1 must be created with EU jurisdiction from the beginning. Staging and production
must never share a writable D1 database, secrets or rate-limit namespace IDs.

Workers Rate Limiting namespace IDs are account-local positive integers defined by Tretnix. Use
two distinct IDs that are not intentionally shared with another Worker.

## 3. Mandatory real-data inputs

Before a production live build, define:

```text
VITE_SITE_URL
VITE_PRIVACY_CONTROLLER_NAME
VITE_PRIVACY_CONTROLLER_CONTACT
VITE_PRIVACY_LAWFUL_BASIS
VITE_PRIVACY_RECIPIENTS
VITE_PRIVACY_RETENTION_DAYS
VITE_PRIVACY_LAST_UPDATED
CONSULTATION_PRIVACY_VERSION
production admin email/password
```

The exact retention duration and legal/controller wording are client/legal decisions. They are
not invented by the repository. The production live build fails closed when required build-time
privacy inputs are missing.

RITO Studio is currently a fictional Tretnix portfolio concept. If no real client/controller
inputs exist, keep public portfolio operation in demo mode and do not enable real-data production
collection.

## 4. Source build

Export the approved `VITE_*` values and run:

```powershell
node .\tools\cloudflare\build-production.mjs
```

The script forces:

```text
VITE_CONSULTATION_PROFILE=live
VITE_CONSULTATION_HANDOFF=inbox
```

and creates `.output/server/rito-production-build.json`. It performs no remote mutation.

## 5. D1 provisioning

Create the isolated production database only once:

```powershell
npx wrangler@4.114.0 d1 create rito-studio-business-plus-production --jurisdiction eu
```

Record the returned UUID. EU jurisdiction is creation-time state and must be preserved as
provisioning evidence.

## 6. Generated production config

After the stamped production build:

```powershell
node .\tools\cloudflare\prepare-production-config.mjs `
  --database-id "<PRODUCTION_D1_UUID>" `
  --privacy-version "<APPROVED_PRIVACY_VERSION>" `
  --retention-days "<APPROVED_RETENTION_DAYS>" `
  --submit-rate-namespace-id "<UNIQUE_POSITIVE_INTEGER>" `
  --login-rate-namespace-id "<DIFFERENT_UNIQUE_POSITIVE_INTEGER>"
```

Expected output:

```text
.output/server/wrangler.production.json
```

The generated config disables `workers.dev` and Preview URLs, uses both custom domains, binds the
isolated D1 and Durable Object, requires both AdminAuth secrets, configures distinct submit/login
rate-limit bindings, and sets `LIVE_BACKEND_ENV=production`.

## 7. Pre-mutation validation

Required before any production mutation:

```text
working tree clean and canonical main exact
frozen install
targeted formatting/lint
typecheck
native AdminAuth regression
security regression
hero contract
production readiness contract
production live build
generated production config exact
no staging identifier in production target
```

A local validation PASS does not prove a production deployment.

## 8. Migration order

Apply the immutable migrations to the production D1 in repository order:

```text
0001_consultation_requests.sql
0002_native_admin_auth.sql
0003_hero_management.sql
```

Use the production database name and `.output/server/wrangler.production.json`. Verify
`d1_migrations`, table schemas and the three seeded hero rows immediately after application.

These migrations are additive for a fresh production D1. No reverse migration is defined.
Recovery uses a fresh isolated database before go-live or D1 Time Travel after real data exists.

## 9. Secrets and native AdminAuth

Production requires independent values for:

```text
ADMIN_AUTH_PEPPER
ADMIN_AUTH_CSRF_SECRET
```

Do not reuse staging secrets. Do not print or commit secret values.

Generate the production admin password record with `tools/admin/generate-admin-user-sql.ts` and
write only the derived record to D1. The production admin identity must be an explicitly chosen
operational address, not the staging/demo default.

Temporary secret material must remain outside the repository and be deleted after verification.

## 10. Retention and hard delete

The production config carries `CONSULTATION_RETENTION_DAYS`. The deterministic operator tool is:

```powershell
node .\tools\production\purge-consultations.mjs `
  --config .\.output\server\wrangler.production.json `
  --mode dry-run
```

Destructive execution requires the exact confirmation token:

```text
PURGE:rito-studio-business-plus-production:<retention-days>
```

The tool prints only counts/cutoff metadata, never consultation PII, and verifies that no expired
row remains after execution. UI hard delete remains authenticated and CSRF-protected.

## 11. Deployment

Only the generated production config may be deployed:

```powershell
npx wrangler@4.114.0 deploy `
  --config .\.output\server\wrangler.production.json `
  --secrets-file "<TEMP_PRODUCTION_SECRETS_FILE>"
```

Never deploy source `wrangler.jsonc`.

## 12. Production acceptance

After deployment, verify in one consolidated pass:

```text
HTTP -> HTTPS 308
public/admin hosts distinct
security headers on public/admin
home/hero rendering and responsive art direction
/admin/login direct native RITO login, no Access interception
login success/failure/non-enumeration/rate limiting
session cookie + CSRF + logout/revocation
hero list/create/update/delete/order limits and image allowlist
public consultation submit -> D1
privacy_version + consent_at persisted
idempotent replay
Inbox receive/update/edit/delete
Durable Object realtime + reconnect/catch-up
malformed/oversized public input rejection
production retention dry-run
no production PII in logs/evidence
```

Use synthetic test data only during acceptance and delete the synthetic request when complete.

## 13. Recovery

Before accepting real data:

- record D1 production identity and EU jurisdiction;
- record how to retrieve a D1 Time Travel bookmark;
- preserve staging/non-production recovery evidence;
- define who can authorize a destructive restore;
- keep restore manual and separately controlled.

## 14. Tretnix portfolio boundary

Tretnix Portfolio V1 currently keeps BUSINESS PLUS unpublished/draft. Production infrastructure
or a direct demo hostname does not authorize publishing the BUSINESS PLUS variant in the Tretnix
case study. That remains tied to the later approved case-study workstream.

## 15. Closeout and later refinement

Production can be called accepted only after direct runtime evidence. This runbook does not create
a freeze/tag. Intended lifecycle:

```text
production readiness
-> production cutover
-> production acceptance/security closeout
-> later Forno Lume alignment + Tretnix case-study completion
-> approved small RITO refinement
-> revalidation/redeploy
-> freeze only when explicitly requested later
```
