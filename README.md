# RITO Studio BUSINESS PLUS

RITO Studio BUSINESS PLUS is the guided-conversion evolution of the frozen RITO Studio
BUSINESS product.

## Canonical derivation

```text
frozen START:
34c13cd78255b7ac009533790329cada74ae9d8a

frozen BUSINESS:
b95a63c6127d2bc1dd396d74b2dd25f87b952226

BUSINESS PLUS repository:
AdamDariOfficial/rito-studio-BUSINESS-PLUS

verified remix/bootstrap base:
eba1a2a91fd3a531b4a4667d038b631758d0a664
```

The PLUS remix is 0 behind / 2 ahead of frozen BUSINESS and its net remix delta is
limited to `package.json` and `bun.lock` for the Lovable tooling update. Application
source is inherited from frozen BUSINESS at the bootstrap base.

## Product promise

BUSINESS PLUS does not become a generic salon management system.

It adds a reusable, premium conversion layer:

```text
treatment discovery
→ short guided consultation
→ concise complementary recommendations
→ qualified request
→ minimal consultation inbox
```

## New baseline route

```text
/consulenza
```

There is no standalone `/percorsi` baseline route. The “percorso” is generated inside
the consultation as:

```text
1 selected/main service
+ at most 2 curated complementary suggestions
+ optional manual additions, bounded to 6 selected services total
```

## Consultation Inbox

A minimal `/admin` may be delivered with BUSINESS PLUS, but only for consultation
requests:

```text
list
detail
new / contacted / booked / archived
short internal notes
basic filters
```

It is not a CMS, CRM, agenda or generic admin panel.

## Demo vs real client

Portfolio/demo mode uses local browser state so the demo can be reset safely and sends
no personal data.

A real client admin cannot receive requests from visitor devices using local storage
alone. A live Consultation Inbox therefore requires the standardized minimal shared
request store and admin access. That backend remains narrowly scoped and reusable.

## Conversion handoff

Approved baseline handoffs:

```text
inbox
tel
whatsapp
external
```

## CUSTOM boundary

Anything beyond guided conversion + Consultation Inbox is CUSTOM when it introduces
substantial operational logic: CMS, CRM, live agenda, payments, packages/fidelity
ledger, multi-role admin, staff/resources, inventory, multi-location, bespoke
integrations or reporting.

## Current implementation state

The approved scope and the complete reusable application baseline are delivered together
by the controlled branch:

```text
feat/rito-business-plus-complete
```

The current candidate state is:

```text
BUSINESS_PLUS_AUTHORIZED
REMIX_VERIFIED
LOCAL_CLONE_VERIFIED
DEFINITIVE_SCOPE_APPROVED
COMPLETE_IMPLEMENTATION_CANDIDATE_APPLIED
STAGING_IMPLEMENTATION_COMPLETE
STAGING_DEPLOYMENT_COMPLETE
STAGING_E2E_COMPLETE
REQUIRED_STAGING_SECURITY_GATES_COMPLETE
READY FOR HUMAN FINAL REVIEW / FREEZE
HUMAN_FINAL_REVIEW_FREEZE_NOT_YET_GRANTED
PRODUCTION_NOT_CERTIFIED
PRODUCTION_NOT_AUTHORIZED
```

The application and staging validation are complete. The candidate is not a frozen baseline
until a separate read-only Final Human Freeze Audit grants that gate. Staging evidence does not
certify production readiness or authorize production.

See:

- `docs/BUSINESS_PLUS_CONTRACT.md`
- `docs/BUSINESS_PLUS_IMPLEMENTATION_SPEC.md`
- `docs/BUSINESS_PLUS_LIVE_STORE.md`
- `docs/PRODUCT.md`
- `docs/ROUTES.md`
- `docs/DECISIONS.md`
- `AGENTS.md`

## Current post-QA interaction refinements

The controlled BUSINESS PLUS candidate additionally uses a viewport-bounded scrollable service picker, top-of-flow step reset, compact inline success status, reduced-motion-safe admin drill-in, mobile-stacked original answers/note actions, a two-column desktop demo-tools workspace and no redundant `Chiama per prenotare` footer entry.

These refinements do not change the four-step consultation, max-two curated recommendations, max-six selected-service bound, live admin authorization contract or CUSTOM boundary.

## Approved live architecture — 11 August 2026

The real-client Consultation Inbox is now implemented as a staging candidate behind the
approved architecture:

```text
TanStack Start / Cloudflare Worker
  ├── D1 direct binding → canonical Consultation Inbox
  └── Durable Object + Hibernation WebSocket → realtime admin synchronization

Native RITO AdminAuth → /admin/login + D1 users/sessions + authorized server functions/WebSocket
```

D1 is source of truth and `/admin` has no periodic polling. Every admin operation validates
a native server-side RITO session; state-changing operations also require a session-bound
CSRF token. Public consultation submission uses `POST /api/consultations` with server
validation, idempotency and Workers Rate Limiting. Realtime publish is a post-commit
best-effort notification, so a D1 success is never reported as failed solely because the
Durable Object notification path is temporarily unavailable.

Reuse remains single-tenant per client deployment by default. Cloudflare-specific APIs remain
behind repository/auth/realtime/rate-limit adapters.

The current Lovable/Nitro build adapter is preserved. Its generated Wrangler/DO export merge
has passed validation; local Windows D1/DO emulation remained inconclusive outside RITO as
well. The completed isolated Cloudflare staging gate subsequently validated the adapter and live
runtime path, so no speculative build-tool migration is authorized.

See:

- `docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md` v1.5
- `docs/BUSINESS_PLUS_LIVE_STORE.md` v2.3
- `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v2.0

## Current gate — final human freeze audit

The isolated Cloudflare staging implementation, native AdminAuth scrypt v2 reprovision/deploy
and required functional, security, responsive and multi-device acceptance are complete. D1 is
the canonical store; Durable Object/WebSocket realtime remains a best-effort notification layer
with reconnect and one-shot D1 catch-up.

The next step is a fresh **read-only Final Human Freeze Audit**. The source `wrangler.jsonc`
remains unprovisioned and must not be deployed directly. No secret value belongs in the
repository. Production remains not certified and not authorized.
