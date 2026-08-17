# RITO Studio BUSINESS PLUS — Live Consultation Store Contract

**Status:** native AdminAuth scrypt v2 staging runtime candidate
**Version:** 2.3
**Date:** 16 August 2026
**Scope:** shared Consultation Inbox only
**Architecture source:** `docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md`

## 1. Purpose

The `portfolio-demo` profile remains local-only and resettable. The `client-live` profile
uses a real shared backend so a consultation submitted from one device can be managed on
another device.

Approved live path:

```text
TanStack Start / Cloudflare Worker
-> direct D1 binding for canonical persistence
-> Durable Object for realtime coordination only
-> native RITO AdminAuth backed by D1 admin users/server-side sessions
```

Cloudflare Access is not the application login or identity provider. An optional Tretnix
technical Access perimeter must remain separate from the RITO admin UX.

## 2. Environment/profile contract

Browser-safe feature switches:

```text
VITE_CONSULTATION_PROFILE=live
VITE_CONSULTATION_HANDOFF=inbox
```

Server/Worker bindings/configuration:

```text
CONSULTATION_DB
CONSULTATION_REALTIME
CONSULTATION_SUBMIT_RATE_LIMITER
ADMIN_LOGIN_RATE_LIMITER
ADMIN_AUTH_PEPPER             # Worker secret
ADMIN_AUTH_CSRF_SECRET        # Worker secret
CONSULTATION_PRIVACY_VERSION
LIVE_BACKEND_ENV
```

None belongs in browser-visible `VITE_*` variables except the explicitly public feature
switches.

## 3. Public submit boundary

Public submission is same-origin:

```http
POST /api/consultations
Content-Type: application/json
```

The server accepts JSON POST only, bounds the body, validates Origin/Fetch Metadata, reruns
Zod + catalogue semantics, uses a stable UUID submission key, rate-limits genuinely new
submissions and persists consent/privacy version.

Public callers never receive internal D1/config/realtime exception detail.

### Durable success rule

D1 is the source of truth. Operation ordering is:

```text
validate
-> D1 write/commit
-> return canonical success state
-> realtime notification is best-effort side effect
```

The implementation may await the notification attempt for observability, but a failed
notification **after a successful D1 commit must be caught and must not turn the operation
into a false failure**. Reconnect + snapshot restores canonical state.

An already-persisted `submissionKey` returns the existing canonical request without consuming
a new submit token and without publishing a second `consultation.created` notification.

## 4. Consultation persistence and concurrency

Migration:

```text
migrations/0001_consultation_requests.sql
```

Canonical table: `consultation_requests`.

Important guarantees:

- `submission_key` unique;
- positive monotonic `version`;
- prepared D1 statements behind `ConsultationRepository`;
- admin update/edit/delete carries `expectedVersion`;
- stale writes do not silently overwrite/delete newer state;
- selected treatment slugs are revalidated server-side.

## 5. Native AdminAuth persistence

Migration:

```text
migrations/0002_native_admin_auth.sql
```

Tables:

```text
admin_users
admin_sessions
```

`admin_users` stores normalized email, password scheme/work factor, unique random salt,
peppered password hash, status and audit timestamps. It never stores plaintext or reversible
password material.

Password format:

```text
scrypt N=16384 / r=8 / p=5
maxmem = 33554432
versioned work factor = 655360
16-byte random per-user salt
32-byte derived key
post-hash HMAC-SHA-256 pepper
pepper kept only as ADMIN_AUTH_PEPPER Worker secret
```

Changing the pepper requires re-hashing user passwords.

The password verifier returns an internal typed outcome (`match`, `mismatch`,
`invalid_record`, `crypto_error`) and explicitly validates the exact
`scrypt-n16384-r8-p5-hmac-sha256-pepper-v2` scheme, work factor 655360, canonical base64url and
decoded salt/tag lengths. N/r/p/maxmem are fixed by the versioned scheme, not read as arbitrary
database parameters. Only `match` may create a session. Every other outcome remains the same
generic public credential rejection. Missing users retain equivalent dummy scrypt v2 work;
legacy PBKDF2 records are invalid and are never reinterpreted at a weaker cost.

For a controlled staging diagnostic, the provisioning utility and runtime log may expose only:

```text
SHA-256(ADMIN_AUTH_PEPPER)[0:16 hex lowercase]
```

This fingerprint is comparison evidence, not secret recovery, storage or authentication material.

`admin_sessions` stores only a SHA-256 hash of a CSPRNG-generated 32-byte opaque session
token plus timestamps/revocation state. The raw token exists only in the browser cookie.

Session cookie:

```text
__Host-rito_admin_session
HttpOnly
Secure
SameSite=Strict
Path=/
no Domain
12h absolute expiry
2h server-side idle validity
```

Successful login rotates/replaces the browser's prior session. Re-provisioning a password
revokes every existing session for that application account. Logout revokes the D1 session
and clears the cookie. Expired, revoked or disabled-user sessions fail server-side.

## 6. Login abuse and enumeration resistance

Login is rate-limited before expensive password verification using both an IP-derived and a
normalized-account-derived opaque key. Missing users execute dummy password work.

Wrong email, wrong password and disabled-account credential failures use the same public
credential message. Rate limiting may return a distinct temporary-throttling message but
never confirms whether the account exists.

## 7. Admin authorization and CSRF

Every admin read validates the server-side session. Every admin mutation validates both the
session and an HMAC token bound to that raw session token.

TanStack Start's same-origin server-function CSRF middleware remains enabled globally as an
additional boundary. Session-bound CSRF is defense in depth for state-changing admin
operations.

Never authorize an admin operation from client state, route visibility, email text or an
infrastructure identity.

## 8. Realtime boundary

Endpoint:

```text
/__tretnix/consultation-realtime
```

Before forwarding to the Durable Object, the Worker requires:

```text
GET WebSocket upgrade
exact same-origin Origin
valid native admin session
```

The Worker forwards an internal session-validity deadline to the Durable Object. The DO
records it in the WebSocket attachment and closes stale sockets before later events are
sent.

Realtime frames contain only:

```text
type
requestId
version
occurredAt
```

No PII is transported in WebSocket events. The client fetches canonical data from D1 after
an event.

No interval polling is permitted. Recovery remains connect -> ready -> snapshot -> replay,
then backoff/jitter + one catch-up snapshot after disconnect.

## 9. Demo integrity

The demo profile remains local. `/admin/login` may display `admin@gmail.com` as the demo
credential label and open the local demo without pretending to provide server security.

The live/staging password is never embedded in the demo, source or client bundle.

## 10. Out of scope

Still excluded unless separately approved:

```text
CRM entities beyond consultation requests
calendar synchronization
payments/deposits
customer accounts
inventory/accounting/staff scheduling
production deployment or production customer data
```
