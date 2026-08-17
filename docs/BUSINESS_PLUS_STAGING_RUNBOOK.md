# RITO Studio BUSINESS PLUS — Live Backend Staging Runbook

**Status:** Staging acceptance closed; ready for human final review/freeze; production unauthorized
**Version:** 2.0
**Date:** 17 August 2026
**Scope:** Cloudflare staging only; production is not authorized

## 1. Purpose

This runbook defines the single controlled staging gate for the BUSINESS PLUS native
`AdminAuth` migration and the live Consultation Inbox end-to-end verification.

It does not authorize production, commit, push, merge or any automatic remote action from
the Controlled Change Package. Apply/Validate remain local. Remote migration, secret changes,
admin provisioning and deploy are explicit operator actions after diff review.

Staging uses test data only.

## 2. Current staging baseline

Direct evidence formalized on 16–17 August 2026 closes the required staging gate:

```text
isolated Worker/custom hosts + EU D1:                     COMPLETE
native AdminAuth scheme/work factor:                     scrypt v2 / 655360
fail-closed admin reprovision + staging deploy:           PASS
login/session/refresh/logout/revocation/non-enumeration:  PASS
cookie, CSRF and WebSocket authorization gates:          PASS
public submit -> D1 + privacy + idempotency:              PASS
realtime/reconnect/one-shot D1 catch-up/no polling:       PASS
admin status/note/edit/delete/concurrency:                PASS
responsive/reduced-motion/physical multi-device:         PASS
submit and login limiter acceptance:                     PASS
candidate verdict:                                       READY FOR HUMAN FINAL REVIEW / FREEZE
human final review/freeze:                                NOT YET GRANTED
production readiness:                                    NOT CERTIFIED
production authorization:                                NOT GRANTED
```

The repository record does not expose secret values. Sections 14–15 preserve the direct closure
evidence. The next task is a separate read-only Final Human Freeze Audit; no further staging or
production action is authorized by this runbook.

### Historical — superseded staging candidates and PBKDF2 investigation

The following is preserved as audit trail only. It describes previous staging states and failed
PBKDF2 candidates; it is not the current baseline and its pending actions were completed or
superseded by scrypt v2 and the closure evidence above.

Previous operator-reported state on 11 August 2026:

```text
Worker: rito-studio-business-plus-staging
public host: rito-studio-business-plus-staging.tretnix.com
admin host: admin.rito-studio-business-plus-staging.tretnix.com
D1 EU: rito-studio-business-plus-staging
migration 0001: applied / schema previously reported PASS
Durable Object binding: present
previous Worker staging deploy: completed
previous Cloudflare Access policy: identity allowed / authentication log Access granted
public /consulenza submit: currently reports failure
end-to-end submit -> D1 -> realtime -> admin: not yet certified
```

The repository snapshot itself cannot independently attest Cloudflare remote state. Every
item above must therefore be rechecked during this gate after the new deploy.

Operator-reported runtime evidence on 13 August 2026 after Worker version
`f4ec4a05-e579-4704-a817-4dea622fa578`:

```text
valid staging credential reached diagnostic boundary
userFound=true / userActive=true
schemeSupported=true
iterationsRuntimeType=number / iterationsSupported=true
encodedSaltLength=22 / encodedHashLength=43
verificationOutcome=crypto_error
cryptoErrorName=NotSupportedError
```

This confirms D1 lookup, status, scheme, iteration and encoded record-shape checks. It locates the
failure inside the WebCrypto verification path, but does not phase-identify the exact primitive.
Credential rotation, D1 repair and a lower PBKDF2 work factor are not accepted responses. The
local candidate replaces HMAC verify with explicit HMAC sign plus equal-length
`crypto.subtle.timingSafeEqual` for password and CSRF verification. A new staging deploy is still
pending.

Operator-reported runtime evidence after the next compatibility attempt, Worker version
`3e52fb80-895b-43a3-8ff5-1b226961eab2`:

```text
userFound=true / userActive=true
schemeSupported=true
iterationsRuntimeType=number / iterationsSupported=true
encodedSaltLength=22 / encodedHashLength=43
verificationOutcome=crypto_error
cryptoErrorName=NotSupportedError
```

Operator-reported runtime evidence from the latest staging Worker
`cef1e128-2564-4372-b212-58a4e64600be` proved that `node:crypto` `pbkdf2Sync` at 600000 returns
the same `crypto_error / NotSupportedError` after every record check passes. Current workerd
source confirms that the Node `CryptoImpl::getPbkdf()` path also calls `checkPbkdfLimits()` and
is subject to the same default 100000-iteration cap. PBKDF2 v1 is therefore incompatible with
the target runtime at its approved strength and is replaced before freeze; it must not be
silently reduced to 100000.

The local replacement is `scrypt-n16384-r8-p5-hmac-sha256-pepper-v2`: N=16384, r=8, p=5,
32 MiB `maxmem`, 16-byte salt, 32-byte derived value and a 32-byte HMAC-SHA-256 pepper tag.
`password_iterations` remains the legacy SQL column name but stores the versioned total cost
655360. Staging still contains the PBKDF2 v1 record, so one coherent password/pepper
reprovision plus candidate deploy and real login remains pending.

## 3. Target staging architecture

```text
visitor browser
  -> POST /api/consultations
  -> Cloudflare Worker
  -> validation + submit rate limiter
  -> D1 EU (canonical commit)
  -> best-effort non-PII Durable Object notification

admin browser
  -> /admin/login branded RITO
  -> native AdminAuth login server function
  -> admin_users + admin_sessions in D1
  -> __Host- HttpOnly/Secure/SameSite session cookie
  -> CSRF-bound admin mutations
  -> D1 EU
  <-> authenticated Hibernation WebSocket
```

Cloudflare Access is **not** the RITO client/admin login boundary. If Tretnix retains an
Access-protected technical surface, it must use a separate internal hostname/path that does
not intercept the RITO `/admin/login` experience or provide application identity.

## 4. Required staging inputs

```text
STAGING_HOSTNAME=rito-studio-business-plus-staging.tretnix.com
ADMIN_STAGING_HOSTNAME=admin.rito-studio-business-plus-staging.tretnix.com
STAGING_D1_NAME=rito-studio-business-plus-staging
STAGING_D1_ID=<existing D1 UUID>
PRIVACY_VERSION=<approved test policy version>
SUBMIT_RATE_NAMESPACE_ID=<existing positive integer>
LOGIN_RATE_NAMESPACE_ID=<different positive integer>
STAGING_WORKER_NAME=rito-studio-business-plus-staging
ADMIN_AUTH_PEPPER=<strong independent Worker secret, >= 32 chars>
ADMIN_AUTH_CSRF_SECRET=<strong independent Worker secret, >= 32 chars>
```

`ADMIN_AUTH_PEPPER` and `ADMIN_AUTH_CSRF_SECRET` are server secrets. Never place them in
`VITE_*`, committed files, generated SQL or browser storage.

The native staging account may use `admin@gmail.com`; that address is an application/demo
credential and is not a Cloudflare/Tretnix infrastructure identity.

## 5. Cloudflare Access transition gate

Before browser QA, ensure the client-facing admin hostname is no longer intercepted by the
old Access application. Opening:

```text
https://admin.rito-studio-business-plus-staging.tretnix.com/admin/login
```

must render the RITO login page directly.

Do not weaken native `AdminAuth` because of Access configuration. If Access remains for
Tretnix operations, move it to a separate technical surface and test it independently.

## 6. Build and generated staging config

After the Controlled Change Package validates locally:

```powershell
$env:VITE_CONSULTATION_PROFILE = "live"
$env:VITE_CONSULTATION_HANDOFF = "inbox"
bun run build
```

Then generate the staging-only Wrangler config:

```powershell
node .\tools\cloudflare\prepare-staging-config.mjs `
  --database-id "<STAGING_D1_ID>" `
  --privacy-version "<PRIVACY_VERSION>" `
  --submit-rate-namespace-id "<SUBMIT_RATE_NAMESPACE_ID>" `
  --login-rate-namespace-id "<LOGIN_RATE_NAMESPACE_ID>" `
  --hostname "rito-studio-business-plus-staging.tretnix.com" `
  --admin-hostname "admin.rito-studio-business-plus-staging.tretnix.com" `
  --worker-name "rito-studio-business-plus-staging"
```

Expected generated file:

```text
.output/server/wrangler.staging.json
```

It must preserve Nitro `main/assets`, `CONSULTATION_REALTIME -> ConsultationRealtimeHub`,
`nodejs_compat`, D1, both custom domains and two distinct rate-limit bindings. It must contain no
`ACCESS_TEAM_DOMAIN` or `ACCESS_AUD`.

## 7. Dry-run gate

Manual, non-deploying verification:

```powershell
npx wrangler@4.114.0 deploy --dry-run --config .\.output\server\wrangler.staging.json
```

A dry-run PASS does not authorize migration or deploy.

## 8. Native AdminAuth migration

Review both migrations first:

```text
migrations/0001_consultation_requests.sql
migrations/0002_native_admin_auth.sql
```

Apply only to the existing staging D1:

```powershell
npx wrangler@4.114.0 d1 migrations apply rito-studio-business-plus-staging `
  --remote `
  --config .\.output\server\wrangler.staging.json
```

Verify at minimum:

```text
admin_users exists
admin_sessions exists
admin_users.email_normalized UNIQUE
admin_sessions.token_hash UNIQUE
consultation_requests still exists with its existing schema/data
```

Never run this gate against production.

The existing staging schema already has `password_iterations INTEGER NOT NULL` with
`CHECK(password_iterations >= 100000)`. Scrypt v2 stores 655360 in that legacy column, so the
completed reprovision did not require or authorize a new migration.

## 9. Historical execution procedure — completed scrypt v2 reprovision and deploy

This section preserves the fail-closed procedure used to reach the current baseline. References
to a current PBKDF2 row or a future deploy below describe the pre-execution state, not an open
gate.

The first authorized invocation created and retained one valid `prepared` material set, then
stopped before mutation when its initial `ReadD1` command returned exit code 1. A manual Wrangler
4.114.0 `--command` query from the same PS5.1 console subsequently confirmed the exact staging D1
is reachable and still contains the active legacy PBKDF2 v1 / 600000 row with
`last_login_at = null`. No reprovision write, session revocation, secret change or deploy occurred.

The cause was the script's use of remote D1 `--file` ingestion for a read-only SELECT. Wrangler
routes remote `--file` through the bulk-import boundary, whereas the successful console oracle
uses `--command` and the query boundary that returns the selected row. ReadD1 and post-write D1
verification now use the exact allowlisted SELECT through `--command`; only the intentional admin
upsert/session revocation continues to use `--file` with `--yes`.

All Wrangler operations now share one PS5.1 native wrapper based on
`& $Executable @CommandArguments`, an explicit repository working directory, controlled
stdout/stderr capture and immediate `$LASTEXITCODE`. The generated config is passed with the same
repository-relative path proven manually. Deploy still passes only the secret-file path; no raw
secret is placed in command-line arguments, and `ADMIN_AUTH_CSRF_SECRET` remains unchanged.

The current PBKDF2 v1 D1 row and pepper must be replaced together. The operator may enter the
same demo password again: the procedure treats it as exact opaque input, does not trim or log it,
and still creates a new salt, scrypt v2 record and pepper. Before remote authorization, run the
non-interactive compatibility/preparation gate with Windows PowerShell 5.1:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\admin\reprovision-staging-admin.ps1 `
  -LocalValidation
```

This mode checks the canonical repo/origin/branch/HEAD, zero staged paths, exact generated staging
config/UUID/routes/rate namespaces, PS5.1 CSPRNG path, generator, SQL contract, anti-leak,
UTF-8 no-BOM material, resume manifest integrity and rejection of a production target. It uses
synthetic in-memory credentials, deletes their temporary material, and returns before every
Wrangler invocation. It performs no D1 read/write, secret operation or deploy.

After the local gate passes and the operator explicitly authorizes the single remote staging
gate, run only:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\admin\reprovision-staging-admin.ps1
```

The remote procedure repeats the immutable preflight, requires the exact confirmation phrase and
prompts twice for the password with `Read-Host -AsSecureString`; it never prints the password. It
generates a new 32-byte CSPRNG
pepper, creates the scrypt v2 record in memory with the same pepper, exposes only its 16-hex
SHA-256 fingerprint, rejects SQL containing password/pepper, and writes temporary SQL/secrets as
UTF-8 without BOM outside the repository. It then performs this one ordered operation:

```text
read-only classify the current admin record as the expected legacy row or exact resumable row
->
upsert only admin@gmail.com with scrypt v2 / work factor 655360
-> revoke that user's existing admin_sessions
-> read-only verify exact scheme/work factor/active status
-> deploy the same new pepper with the validated candidate through --secrets-file
-> delete temporary material only after D1 + verification + deploy all succeed
```

The expected public D1 metadata is:

```text
password_scheme = scrypt-n16384-r8-p5-hmac-sha256-pepper-v2
password_iterations = 655360
status = active
```

The retained manifest uses only the recognized states `prepared`, `d1_updated`, `d1_verified` and
`deployed`, binds them to the exact staging target and records SHA-256 integrity hashes for SQL,
secret and verification material. A `prepared` resume first classifies D1 read-only, so a write
that succeeded immediately before a local manifest-write failure is recognized by the exact
salt/hash identity and is not replaced with new random material.

If D1 succeeds but verification, secret upload or deploy fails, the script stops fail-closed and
retains the SQL/pepper material. Do not generate another pepper. Resume with the exact directory
reported by the script:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\admin\reprovision-staging-admin.ps1 `
  -ResumeMaterialDirectory "<reported-system-temp-directory>"
```

The resume path reuses the same scrypt record and pepper. Never open, copy or commit the retained
secret file. `ADMIN_AUTH_CSRF_SECRET` is not rotated; Wrangler preserves secrets omitted from the
additive deployment secrets file. No production route/domain belongs in this procedure.

## 10. One real Native AdminAuth login gate

After the procedure reports `STAGING REPROVISION/DEPLOY PASS`, start a safe Worker tail filtered
for `rito.admin_auth.verification`, confirm `/admin/login` opens without Access interception, and
make exactly one login attempt with the newly entered staging password.

Record only:

```text
userFound
userActive
schemeSupported
workFactorRuntimeType
workFactorSupported
encodedSaltLength
encodedHashLength
verificationOutcome
cryptoErrorName (only when present)
pepperFingerprint
```

Expected: exact scheme/work-factor support, encoded lengths 22/43 and `match`. The public response
remains non-enumerable. Never copy cookies, password, raw email, salt, hash, pepper, token or
request body into the evidence.

## 11. Complete the staging closure

After a real `match` creates the native session, complete every check in section 12. A local test,
build, dry run or classified `match` log alone does not certify the staging login.

The closure record must explicitly cover: valid login; generic wrong-password and unknown-account
responses; login rate limiting; cookie flags; authenticated refresh; logout/revocation and blocked
token reuse; CSRF; same-origin authenticated WebSocket; reconnect and D1 catch-up; public
`/consulenza` submit; durable D1 row; realtime admin update; idempotent duplicate behavior; and
absence of periodic polling.

## 12. Required real end-to-end acceptance

### A. Native login/security

1. Open `/admin/login` in a private browser: RITO login appears directly, not Cloudflare Access.
2. Wrong email and wrong password return the same generic credential error.
3. Repeated failures eventually hit the login limiter without identifying whether an account exists.
4. Correct staging credentials create a `__Host-rito_admin_session` cookie with `HttpOnly`,
   `Secure`, `SameSite=Strict`, `Path=/` and no `Domain`.
5. Direct admin server functions without a valid session fail.
6. Admin POST mutation without the valid session-bound CSRF token fails.
7. Cross-origin WebSocket handshake fails; same-origin authenticated handshake succeeds.
8. Logout revokes the D1 session and clears the cookie; reuse of the old token fails.
9. Disabled/expired/revoked session cannot read or mutate admin data and an already-open
   WebSocket must be closed before a later event can be delivered.

### B. Real phone -> D1 -> PC/tablet realtime

Use test data and at least one real phone plus PC/tablet admin browser:

```text
phone opens public staging /consulenza
-> completes a new consultation
-> UI reports success
-> exactly one row exists in D1 for submission_key
-> already-open PC admin receives realtime event without refresh
-> PC fetches canonical row from D1 and renders it
-> tablet admin sees the same canonical state
-> PC update/note/status persists to D1 and appears on tablet
-> tablet edit persists and appears on PC
-> delete persists and disappears on both
```

Inspect the WebSocket frames: only event type, request id, version and timestamp may be
present; no name, phone, email, answers or notes.

### C. Submit failure regression

The public operation is successful when the D1 commit succeeds. A Durable Object publish
failure after that commit must be logged without PII but **must not** convert the public
response into a false 503. Reconnect/catch-up must recover from D1.

Exercise:

- a new valid submit;
- replay of the same `submissionKey` -> no duplicate;
- a genuinely invalid request -> 400;
- submit limiter -> 429;
- verify no internal D1/DO/config message is exposed publicly.

If `/consulenza` still fails after the consolidated deploy, inspect Worker logs and D1 before
changing code again. Do not assume the realtime path is still the cause.

### D. Reconnect and concurrency

- force network disconnect/sleep and reconnect;
- verify exponential backoff + one-shot D1 catch-up, with no interval polling;
- keep the admin open beyond the authenticated socket validity window and verify the stale
  socket is closed before later events are delivered, then re-auth/reconnect as applicable;
- open one request on two admins, mutate on A, then issue stale mutation on B;
- B must not overwrite A and must resynchronize from D1.

## 13. Acceptance record

Record exact commands, exit codes and direct evidence for:

```text
CCP Apply
manual diff review
CCP Validate
migration 0002
remote schema
secret provisioning
admin seed
staging deploy
native login
phone submit
D1 row
PC/tablet realtime
reconnect
logout/revocation
rate limit
CSRF
unauthorized server-function and WebSocket rejection
```

Automated PASS is not browser/security/staging PASS. Production remains blocked until a
separate explicit production/privacy gate.

## 14. Runtime closure record — 16 August 2026

Direct staging evidence after the controlled prepared-state resume:

```text
active deployment:              cb314f0e-c1a6-4645-9263-60d815c12f60
active Worker version:          ac4324b7-b5ce-40e8-af55-dfad1c1a8a35 at 100%
Worker version created:         2026-08-16T12:39:01.878Z
native valid login:             PASS (pre-existing direct evidence)
D1 admin scheme/work factor:    scrypt v2 / 655360
session refresh/direct/new tab: PASS
Back/Forward admin navigation:  PASS
generic wrong/unknown account:  PASS
login limiter:                  PASS — temporary limit observed, then expired to generic rejection
logout + D1 revocation:         PASS
revoked session reuse:          REJECTED after refresh/direct admin access
same-origin authenticated WS:   PASS — Live state and cross-tab canonical updates
no-session same-origin WS:      REJECTED 403
wrong-origin WS:                REJECTED 403
reconnect + D1 catch-up:        PASS
public consultation submit:     PASS
D1 commit/privacy version:      PASS
idempotent replay:              PASS — same id/request, one canonical row
status/note/edit/delete:        PASS with D1 persistence and cross-tab realtime
optimistic concurrency:         PASS — stale second admin rejected and resynchronized
production:                     NOT TOUCHED
```

Synthetic canonical request retained for review:

```text
id:          a692d31a-d4dd-43cf-ac58-8b5220caedcb
created_at:  2026-08-16T13:09:12.377Z
status:      booked
version:     5
```

The dedicated delete test request `3f192423-21b2-44d5-b150-c5707e35379a` was permanently
removed through the explicit UI confirmation and is absent from D1.

## 15. Final CSRF and freeze closure record — 17 August 2026

A fresh native session was created after logout/relogin. The control mutation was accepted, the
four negative variants were rejected and the controlled request remained unchanged by every
negative probe.

```text
control mutation:                                  PASS — accepted and restored
missing CSRF + valid auth/origin:                  REJECTED — application validation
plausible invalid CSRF + valid auth/origin:        REJECTED — admin CSRF authorization
valid auth/CSRF + wrong Origin:                    REJECTED — HTTP 403 same-origin middleware
revoked session + previous CSRF/origin:            REJECTED — admin session authorization
controlled request after probes:                   new / version 3
runtime cookie attributes:                         CONFIRMED PASS
already-open revoked WebSocket on later publish:   CONFIRMED PASS
new valid login after logout:                      CONFIRMED PASS
390 px / 768 px responsive QA:                     CONFIRMED PASS
reduced-motion runtime emulation:                   CONFIRMED PASS
physical phone + PC/tablet E2E:                     CONFIRMED PASS
public submit limiter saturation:                  CONFIRMED PASS
```

Non-sensitive D1 baseline from one read-only dashboard query:

```text
admin status:       active
password scheme:    scrypt-n16384-r8-p5-hmac-sha256-pepper-v2
work factor:        655360
last_login_at:      2026-08-17T10:51:11.907Z
active sessions:    3
revoked sessions:   1
```

No secret or raw credential/session/CSRF value was displayed or stored. All mandatory acceptance
items in this runbook and `docs/TESTING.md` are closed. Verdict:
`READY FOR HUMAN FINAL REVIEW / FREEZE`. Production remains unauthorized and is not certified
ready by this staging record.
