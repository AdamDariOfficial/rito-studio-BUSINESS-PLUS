# RITO Studio BUSINESS PLUS — Live Architecture Specification

**Status:** approved architecture — staging implementation/acceptance complete; awaiting human final review/freeze
**Version:** 1.5
**Date:** 16 August 2026
**Scope:** real shared Consultation Inbox, authenticated admin and realtime synchronization only

## 1. Objective

Turn the existing BUSINESS PLUS `client-live` boundary into a real, reusable full-stack
implementation without expanding the product into a CRM, agenda or generic management
system.

The live architecture must support this real workflow:

```text
visitor phone
→ submit consultation
→ shared persistent store
→ authenticated admin on PC/tablet
→ request appears in realtime
→ admin edits/status/note/delete
→ every connected admin converges on the same state
```

The current `portfolio-demo` profile remains local-only and resettable.

This specification freezes architecture and the staging implementation boundary. The current
candidate includes server code, migration source and staging-config tooling; isolated staging
resources, migrations, deployment and required acceptance have been completed under separate
operator gates. None of that authorizes production data collection or production deployment.

## 2. Sources and evidence used

### Repository truth

Verified candidate baseline:

```text
repository: AdamDariOfficial/rito-studio-BUSINESS-PLUS
branch:     feat/rito-business-plus-complete
HEAD:       eba1a2a91fd3a531b4a4667d038b631758d0a664
parent:     post-QA refinement v1.0.2 state
```

Relevant current files:

```text
AGENTS.md
docs/BUSINESS_PLUS_CONTRACT.md
docs/BUSINESS_PLUS_IMPLEMENTATION_SPEC.md
docs/BUSINESS_PLUS_LIVE_STORE.md
docs/DECISIONS.md
docs/TESTING.md
package.json
vite.config.ts
src/server.ts
src/start.ts
src/features/consultation/consultation.functions.ts
src/features/consultation/schemas.ts
```

### External platform verification — 11 August 2026

Only official primary documentation was used to freeze platform assumptions:

- TanStack Start hosting: https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- Cloudflare Workers bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/
- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Workers Rate Limiting: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Cloudflare D1 data location: https://developers.cloudflare.com/d1/configuration/data-location/
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare D1 Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Durable Objects WebSockets: https://developers.cloudflare.com/durable-objects/best-practices/websockets/
- Durable Objects rules: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Durable Object class lifecycle: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/
- Cloudflare Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP WebSocket Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html

Platform capabilities can change. Re-check these sources before the implementation or
provisioning gate if material time has elapsed.

## 3. Confirmed architecture baseline

```text
Application framework
└── TanStack Start

Runtime target
└── Cloudflare Workers

Persistence
└── Cloudflare D1
    └── separate database per client deployment
    └── EU jurisdiction for staging/production Italian clients

Realtime
└── Cloudflare Durable Objects
    └── one coordination object per client/workspace
    └── Hibernation WebSocket API

Admin authentication
└── native RITO AdminAuth
    ├── D1 admin_users
    ├── D1 hashed server-side sessions
    └── HttpOnly __Host- session cookie

Validation
└── Zod at client and server boundaries

Abuse protection
└── Workers Rate Limiting adapter

Secrets/configuration
└── Workers bindings/secrets

Cloudflare binding access inside TanStack Start server functions uses the runtime-native
`cloudflare:workers` `env` binding. The previous custom `AsyncLocalStorage` propagation bridge
is removed from the staging correction candidate because RPC/server-function execution is a
framework async boundary and Cloudflare documents direct `env` access as the canonical pattern.
The explicit `env` argument is still passed to the TanStack server entry for framework
compatibility; application repositories and auth code read bindings from `cloudflare:workers`.

Database lifecycle
└── Wrangler D1 migrations

Environments
├── local
├── staging
└── production
```

No ORM is approved for v1. D1 prepared statements must remain behind a repository
adapter. Add an ORM later only if schema/query complexity provides a concrete benefit.

## 4. Reuse model

The default Tretnix reuse model is **single-tenant deployment isolation**, not a
premature multi-tenant SaaS.

```text
Client A
├── Worker deployment A
├── D1 database A
└── realtime workspace A

Client B
├── Worker deployment B
├── D1 database B
└── realtime workspace B
```

All deployments reuse the same product/domain code and differ through configuration,
content, assets, bindings and environment provisioning.

Do not introduce client-name conditionals such as:

```text
if client === "rito" ...
if client === "other-client" ...
```

A future SaaS/control-plane architecture is a separate architecture review, not a
requirement for the current BUSINESS PLUS baseline.

## 5. Application boundaries

Cloudflare-specific APIs must not leak through the product domain.

Target structure:

```text
src/domain/consultation/
    entities.ts
    services.ts
    events.ts

src/server/contracts/
    consultation-repository.ts
    consultation-realtime.ts
    admin-auth.ts
    rate-limiter.ts

src/server/cloudflare/
    d1-consultation-repository.ts
    durable-object-realtime.ts
    native-admin-auth.ts
    workers-rate-limiter.ts
```

Conceptual ports:

```ts
interface ConsultationRepository {
  create(input: CreateConsultationInput): Promise<ConsultationRequest>;
  list(input: ListConsultationsInput): Promise<ConsultationRequest[]>;
  get(id: string): Promise<ConsultationRequest | null>;
  update(input: UpdateConsultationInput): Promise<ConsultationRequest>;
  delete(id: string): Promise<void>;
}

interface ConsultationRealtime {
  publish(event: ConsultationRealtimeEvent): Promise<void>;
}

interface AdminAuth {
  requireAdmin(request: Request): Promise<AdminIdentity>;
}
```

Existing UI/domain schemas may be reused; do not create duplicate request models unless
server persistence genuinely requires a separate representation.

## 6. D1 persistence contract

D1 is the canonical durable source of truth. Durable Objects are not the primary request
database.

Initial schema should remain deliberately small. One primary table is preferred unless
implementation evidence shows normalization is needed:

```text
consultation_requests
────────────────────────────────────────
id                     TEXT PRIMARY KEY
submission_key         TEXT UNIQUE NOT NULL
created_at             TEXT NOT NULL
updated_at             TEXT NOT NULL
version                INTEGER NOT NULL
status                 TEXT NOT NULL
service_slug           TEXT NOT NULL
answers_json           TEXT NOT NULL
recommended_slugs_json TEXT NOT NULL
selected_slugs_json    TEXT NOT NULL
name                   TEXT NOT NULL
phone                  TEXT NOT NULL
email                  TEXT
preferred_contact      TEXT NOT NULL
preferred_date         TEXT
preferred_window       TEXT NOT NULL
consent_at             TEXT NOT NULL
privacy_version        TEXT NOT NULL
note                   TEXT NOT NULL
```

Required initial indexes:

```text
created_at
status + created_at
```

### Idempotency

Public submission must carry a stable per-attempt `submission_key`. The database enforces
uniqueness so a retry caused by network uncertainty cannot create a duplicate request.

### Concurrency

`version` is used for optimistic concurrency. Admin updates must reject stale writes
instead of silently overwriting changes from another connected admin.

### Selected-service rules

Persist and revalidate the current product constraints server-side:

```text
main service immutable
curated recommendations <= 2
selected services <= 6 total
no duplicate service slugs
```

## 7. Environment and data location

### Local

The portfolio/demo profile continues to run locally without requiring Cloudflare resources.
Local Wrangler D1/Durable-Object emulation is useful when it works, but it is no longer a
release gate for the live backend: the 11 August 2026 Windows diagnostic proved a bare
Worker could start while component bindings failed inside the local `workerd` runtime.
That result is recorded as environment-specific and does not justify a build-adapter change.

### Staging

Staging is the authoritative compatibility environment for the live backend. Use an isolated
Worker, EU-jurisdiction D1, Durable Object namespace, rate-limit bindings and native RITO
AdminAuth. Cloudflare Access is not the application identity provider. Do not reuse production
D1 data, and use test data only until the privacy/security production gate is complete.

### Production

Use isolated production Worker, D1 and Durable Object resources.

For Italian client deployments, D1 staging/production databases are created with EU
jurisdiction from the beginning. Jurisdiction is a creation-time decision and must be
recorded in provisioning evidence.

No local/staging/production environment may share a writable D1 database.

## 8. Realtime contract — no polling

Periodic polling is explicitly rejected for the Consultation Inbox.

The admin maintains an authenticated long-lived WebSocket through a tenant/workspace
Durable Object using the Hibernation WebSocket API.

D1 remains source of truth; realtime is a convergence/notification channel.

### Event envelope

Realtime events must not contain customer PII.

Example:

```json
{
  "type": "consultation.updated",
  "requestId": "req_...",
  "version": 7,
  "occurredAt": "2026-08-11T00:00:00.000Z"
}
```

Approved event types:

```text
consultation.created
consultation.updated
consultation.deleted
```

Status and note changes use `consultation.updated`; do not proliferate event types unless
there is an actual consumer need.

### Initial connection and catch-up

To avoid a race between snapshot loading and realtime connection:

```text
1. authenticate
2. open WebSocket
3. receive ready
4. begin queueing realtime events locally
5. fetch current D1-backed inbox snapshot
6. install snapshot
7. replay queued events by request/version
8. enter normal realtime mode
```

### Reconnection

A long-lived connection is not assumed to be literally immortal. Network changes,
sleep, browser suspension or platform maintenance can close it.

Required behavior:

```text
disconnected
→ visible non-alarming reconnecting state
→ exponential backoff + jitter
→ reconnect
→ one catch-up snapshot
→ replay queued events
→ connected
```

There is **no fallback interval polling**.

A manual refresh/resync action may exist for diagnostics/recovery.

### Mutation ordering

For mutations:

```text
validate/authorize
→ write D1
→ confirm successful persistence
→ attempt non-PII realtime event as best-effort side effect
```

Never broadcast an uncommitted state. A notification failure after a successful D1 commit is
logged without PII and must not convert the durable operation into a false client failure.
Realtime delivery is not the durability guarantee. If a notification is missed, the next
reconnect/catch-up snapshot restores canonical state from D1.

## 9. Durable Object sharding

Do not use one global singleton across unrelated Tretnix clients.

The coordination atom is the client/workspace:

```text
RealtimeHub(client-or-workspace-id)
```

For the default one-deployment-per-client model, one stable workspace such as `main` is
sufficient inside that deployment.

This preserves horizontal scaling if Tretnix later provisions many clients, while each
single client normally has only a handful of connected admin devices.

## 10. Admin authentication and authorization

### Native RITO boundary

The visible staging/production admin login is native RITO. Cloudflare Access no longer
provides application identity and must not intercept the client-facing `/admin/login` UX.
An optional Tretnix-only Access perimeter may exist on a separate technical surface.

`AdminAuth` is server-side and backed by D1. The live boundary uses:

```text
admin_users
admin_sessions
scrypt N=16384 / r=8 / p=5 / maxmem=33554432
versioned work factor 655360
unique 16-byte salt
post-hash HMAC pepper stored as Worker secret
32-byte CSPRNG opaque session token
SHA-256 session-token hash stored in D1
__Host- HttpOnly Secure SameSite=Strict cookie
```

The login endpoint rate-limits both IP-derived and account-derived keys before password
verification, performs dummy password work for missing users and uses non-enumerating
credential errors. Successful login rotates the previous browser session. Logout revokes the
server-side session and clears the cookie.

Password verification has one production implementation and a typed internal outcome:

```text
match | mismatch | invalid_record | crypto_error
```

The boundary validates the exact
`scrypt-n16384-r8-p5-hmac-sha256-pepper-v2` scheme/work factor, canonical base64url, a
16-byte decoded salt and a 32-byte decoded HMAC tag before password work. The password is
handled as exact opaque UTF-8 bytes; no trim, Unicode normalization or case conversion is
permitted. Legacy PBKDF2 records are rejected as `invalid_record` and are never weakened to a
100000-iteration fallback. These outcomes are operational only:
the browser receives the same generic credential error for missing/disabled users, unsupported or
malformed records, mismatches and crypto runtime failures. Staging/development may emit the safe
structured event `rito.admin_auth.verification`; it contains only record shape/type flags, the
outcome, an optional generic crypto error class and the first 16 lowercase hex characters of the
SHA-256 pepper fingerprint. It never contains credential material, identifiers or D1 rows.

### Application authorization remains mandatory

Every admin data server function independently validates the native session. GET/read
operations require a valid session; state-changing admin operations additionally require a
session-bound HMAC CSRF token. TanStack Start same-origin CSRF middleware remains enabled as
defense in depth.

The realtime upgrade endpoint validates exact same-origin `Origin` and the same native
server-side session before the Durable Object accepts a socket. Session validity is forwarded
through an internal Worker→DO header and stored in the socket attachment so an expired socket
is closed before later events are sent.

### Demo profile

The portfolio/demo profile remains browser-local and does not pretend that a client-side
password is real security. `/admin/login` may expose `admin@gmail.com` as the demo credential
label and open the local demo directly. The live password is never embedded in source or the
client bundle.

## 11. Public submission protection

The public consultation submission is intentionally unauthenticated and separate from the
admin server-function transport. It uses the explicit same-origin endpoint:

```text
POST /api/consultations
```

It remains unauthenticated, but must have:

```text
JSON POST only
server-side Zod + consultation semantic validation
stable UUID submission key / D1 idempotency
Workers Rate Limiting
Origin + Fetch-Metadata same-origin checks for browser calls
no-store response handling
sanitized public error responses
```

Current rate-limit identity uses a SHA-256-derived key from the normalized required phone
field; raw phone values are not placed in the rate-limit key. Do not use IP address as the
only key.

Turnstile or another challenge is not baseline. Add it only if observed abuse justifies
the UX cost.

## 12. Secrets and bindings

D1 and Durable Objects are accessed through Cloudflare bindings, not embedded database
credentials.

Sensitive values must use Workers secrets or equivalent environment-scoped secret
storage. Never commit `.env`, `.dev.vars`, Access secrets, API tokens or credentials.

Prefer declaring required secret names in deployment configuration so missing production
secrets fail before deploy.

## 13. Database migrations

D1 schema changes use versioned SQL migrations tracked in the repository.

Rules:

- migration files are immutable after they have been applied outside local disposable environments;
- staging migrations are tested before production;
- production migration commands are never executed automatically by a Controlled Change Package;
- use the database name rather than a mutable binding alias when running a production migration command where practical;
- take/record a Time Travel bookmark before destructive or high-risk production migrations;
- rollback/recovery instructions are part of every migration-bearing change.

The implementation includes `migrations/0001_consultation_requests.sql` and
`migrations/0002_native_admin_auth.sql`. Their staging application was completed under an
explicit manual gate; applying migrations to any other remote D1 database remains separately
controlled and is not authorized by this document.

## 14. Durable Object lifecycle

For a new Durable Object namespace, prefer the current declarative Wrangler `exports`
model with SQLite-backed Durable Objects rather than starting a new implementation on
the legacy migrations array.

Provisioning a Durable Object class is a deployment/control-plane change and is not
performed by this specification package.

## 15. Adapter compatibility evidence and staging decision

### Confirmed build evidence

The repository still uses:

```text
@lovable.dev/vite-tanstack-config 2.9.1
Nitro cloudflare-module
```

The controlled compatibility spike proved that the current Nitro build detects
`exports.cloudflare.ts`, preserves the generated Worker entry/assets and merges the Durable
Object declaration into the generated Wrangler configuration. Frozen install, production
build, route tree, typecheck, lint and generated-Wrangler checks passed on Windows.

### Local runtime diagnostic

The follow-up Windows Wrangler diagnostic isolated this matrix:

```text
bare Worker / workerd bootstrap: PASS
D1 local binding/read-write:     FAIL inside local runtime
Durable Object local runtime:    FAIL before readiness
Hibernation WebSocket probe:     not independently proven because DO failed
Generated Nitro Worker runtime:  FAIL before readiness
```

Because minimal D1/DO cases outside RITO/Nitro also failed, the result does **not** establish
an adapter-specific defect. Repeated local-runtime debugging is no longer a blocker.

### Completed staging proof

A real, isolated Cloudflare **staging** deployment validated the current Lovable/Nitro adapter,
D1, Durable Object/WebSocket and native AdminAuth runtime path. Preserve the adapter absent new
adapter-specific failure evidence. Migration to `@cloudflare/vite-plugin` remains a separate
controlled change and is not authorized merely because local `workerd` was inconclusive.

See `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md`.

## 16. Privacy and data lifecycle

Going live changes the project from a no-transmission demo into software that stores real
personal data.

Before production authorization, define and validate per client:

```text
privacy notice/version
lawful basis and consent wording where applicable
retention period
hard-delete behavior
admin access list
incident/recovery procedure
processor/controller responsibilities
```

Persist `consent_at` and `privacy_version`; do not persist unnecessary medical or
sensitive profiling.

The implementation must include a deterministic retention/purge mechanism before real
production data is accepted. The exact retention duration is a client/legal decision and
is intentionally not invented by this architecture document.

## 17. Recovery and backup

D1 Time Travel is part of the recovery strategy, not a substitute for operational
procedure.

Before production:

- confirm the D1 database is on the production storage backend;
- record how to retrieve a Time Travel bookmark;
- test recovery in staging/non-production;
- document destructive restore approval and verification steps;
- define whether longer-term export is required by the client.

No automated production restore is permitted.

## 18. Observability

Baseline live observability must record operational events without logging unnecessary
PII:

```text
submission accepted/rejected
rate-limit rejection
admin authorization rejection
D1 operation failure
realtime connect/disconnect/error
reconnect/catch-up failure
AdminAuth password verification outcome in staging/development only
```

Do not log full request bodies, phone numbers, emails or consultation answers by default.
The pepper fingerprint is diagnostic evidence only; it is not persisted, accepted as a
credential or used as an authentication/signing key.

## 19. Scalability assessment

The architecture is intentionally sized for local businesses while remaining reusable:

- D1 supports many isolated databases per paid account and a 10 GB per-database limit at the verified platform state;
- Durable Objects scale horizontally by using many objects rather than one global object;
- each client/workspace gets its own realtime coordination atom;
- Hibernation keeps idle WebSocket connections open without requiring a continuously active JavaScript instance;
- application/domain adapters keep a future migration to PostgreSQL or another provider bounded.

These are platform capabilities, not a promise that every future SaaS-scale workload fits
this architecture unchanged. A multi-tenant SaaS or substantially heavier operational
system requires a fresh architecture review.

## 20. BUSINESS PLUS boundary remains unchanged

Live backend enablement does **not** authorize:

```text
CRM/client profiles
appointment calendar/resources
payments/deposits
packages/fidelity/gift cards
staff/roles beyond minimal admin identity
inventory
multi-location operations
business analytics dashboards
bespoke third-party integrations
```

Those remain CUSTOM unless separately approved.

## 21. Implementation phases

### Phase A — architecture + adapter evidence

```text
architecture specification: complete
Nitro generated-config/DO export merge: proven
local workerd component runtime: inconclusive, non-blocking
```

### Phase B — staging implementation

```text
direct D1 repository adapter
D1 migration v1 source
public /api/consultations submit
native D1 AdminAuth + password/session/CSRF boundary
admin server functions with server authorization
optimistic concurrency
Durable Object Hibernation WebSocket hub
no-polling admin realtime client
rate-limit adapter
staging config preparation tool
```

This phase is complete. Its earlier local-only preparation state is historical; remote staging
actions occurred later under the separate Phase C operator gate.

### Phase C — explicit staging provisioning/deploy

```text
dedicated custom staging hostname
isolated EU D1 staging
client-facing RITO `/admin/login` without Access interception
staging D1 migrations including native AdminAuth tables
Worker secrets for password pepper + CSRF signing
admin user provisioning with generated salted/peppered hash
Durable Object provisioning/binding by deploy
submit + login rate-limit bindings
multi-device/security/backend QA
```

This phase is complete: the remote create/migration/deploy and required acceptance actions were
performed under explicit operator approval with test data only. No further remote mutation is
implied or authorized.

### Phase D — production gate

Only after staging evidence and separate explicit approval:

```text
retention + purge approval/test
production EU D1 creation
production native AdminAuth provisioning/policy
production config/secrets
production migration
production deployment
post-deploy verification
```

No phase implies the next one.

## 22. Architecture acceptance criteria

This specification is considered implementable only if the implementation can satisfy:

- no periodic polling in `/admin`;
- same request state visible across phone/tablet/PC;
- D1 canonical persistence;
- authenticated and independently authorized admin operations;
- Hibernation WebSocket realtime with reconnect/catch-up;
- no PII inside realtime event payloads;
- idempotent public submission;
- optimistic concurrency for multi-admin edits;
- isolated local/staging/production data;
- EU jurisdiction recorded for Italian staging/production databases;
- demo profile remains local-only and sends no PII;
- no CUSTOM-scope expansion;
- generated adapter merge evidence + local diagnostic reviewed before any build-tool migration;
- no production migration/deploy without a separate explicit gate.

## 23. Implementation authorization state

At version 1.5 of this document:

```text
architecture choice:              APPROVED
staging implementation code:      COMPLETE
local static/build validation:     COMPLETE
isolated staging resources:        COMPLETE
remote staging D1 migrations:      COMPLETE
staging deploy:                    COMPLETE
staging live/security QA:          COMPLETE
candidate verdict:                 READY FOR HUMAN FINAL REVIEW / FREEZE
human final review/freeze:         NOT YET GRANTED
production readiness:              NOT CERTIFIED
production:                        NOT AUTHORIZED
```

The completed staging evidence is recorded in `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v2.0,
`docs/STATUS.md` and `docs/TESTING.md` v1.9. The next task is a separate read-only Final Human
Freeze Audit. This document alone never authorizes a remote mutation or production action.
