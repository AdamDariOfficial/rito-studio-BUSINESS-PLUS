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
SECURITY_CLOSEOUT_PASS
SECURITY_CANDIDATE_1ecc97a410b40e10b90c28a577894b5bc3dfb0b96bc52d8e8b5b874d49f7856b
SECURITY_MANIFEST_8894af05cc3a66169fa2bc11a685c239332d2a28e67c1b91d4403fbe549fcb2e
RUNTIME_BUILD_150_OF_150_EXACT
FINAL_FREEZE_GIT_INTEGRATION_PENDING
PRODUCTION_NOT_CERTIFIED
PRODUCTION_NOT_AUTHORIZED
```

The application, staging validation and final security closeout are complete. The candidate is
not a frozen baseline until exact Git integration, canonical-main attestation and the annotated
freeze tag complete their explicit gates. Security and staging evidence do not certify
production readiness or authorize production.

See:

- `docs/BUSINESS_PLUS_CONTRACT.md`
- `docs/BUSINESS_PLUS_IMPLEMENTATION_SPEC.md`
- `docs/BUSINESS_PLUS_LIVE_STORE.md`
- `docs/PRODUCT.md`
- `docs/ROUTES.md`
- `docs/DECISIONS.md`
- `AGENTS.md`

## Current post-QA interaction refinements

The current BUSINESS PLUS baseline additionally uses a viewport-bounded scrollable service picker, top-of-flow step reset, compact inline success status, reduced-motion-safe admin drill-in, mobile-stacked original answers/note actions and no redundant `Chiama per prenotare` footer entry. The public `/_demo/tools` surface is removed while demo persistence remains internal to the portfolio profile. The home uses a manual, no-autoplay full-slide RITO hero inspired functionally by the Forno Lume BUSINESS PLUS slider. Each screen supports a required desktop image plus an optional approved mobile art-direction image, and `/admin` + `/admin/hero` share one navigation shell while the hero manager remains bounded to five screens.

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

## Current gate — Final Freeze integration

The isolated Cloudflare staging implementation, native AdminAuth scrypt v2 reprovision/deploy
and required functional, security, responsive and multi-device acceptance are complete. D1 is
the canonical store; Durable Object/WebSocket realtime remains a best-effort notification layer
with reconnect and one-shot D1 catch-up.

The final security closeout passed for the exact 150-file runtime/build candidate
`1ecc97a410b40e10b90c28a577894b5bc3dfb0b96bc52d8e8b5b874d49f7856b`; its canonical
manifest SHA-256 is `8894af05cc3a66169fa2bc11a685c239332d2a28e67c1b91d4403fbe549fcb2e`.
Open CRITICAL, HIGH and MEDIUM findings are zero. `RITO-SEC-007` remains accepted LOW
toolchain-only debt for `esbuild@0.27.7` / `GHSA-g7r4-m6w7-qqqr`; `RITO-SEC-008` remains a
closed INFO legacy-compatibility residual and `RITO-SEC-009` is `CLOSED_VERIFIED`.

The current gate integrates those exact runtime/build bytes plus permanent tests, canonical
documentation and sanitized closeout evidence. Stage, commit, push, pull request, merge and
annotated tag remain separate explicit approvals. Manual browser review is not run in this
freeze because the user excluded it from scope. The source `wrangler.jsonc` remains
unprovisioned and must not be deployed directly. No secret value belongs in the repository.
Production remains not certified and not authorized.

The 10 September 2026 pre-stage OSV refresh found
`baseline-browser-mapping@2.10.44` / `GHSA-w5vr-8v7q-w6rv` / `CVE-2026-45819` (upstream
MODERATE) and `js-yaml@4.3.1` / `GHSA-2883-xcg3-v3hh` / `CVE-2026-84375` (upstream HIGH).
The approved Final Freeze continuation removed both with compatible transitive-only lockfile
resolutions to `2.11.0` and `4.3.2`. No direct dependency, framework version or application
source changed. The new 150-file Final Freeze candidate is
`7af8501bd6eb6740832071a11ae70e24deeca61eb08f042304a29919d2422760` with manifest SHA-256
`2c60fac63d398bf86e8e368fa9177d2fbdd048e5c010068683e9e036a3e1034c`; the historical security
predecessor remains unchanged. Live assets are byte-identical and the regenerated Worker is
semantically identical after normalizing Nitro-only asset ordering/mtime metadata, so
`SECURITY_RUNTIME_EVIDENCE_PRESERVED` applies. The refreshed OSV scan reports only the already
accepted `RITO-SEC-007` LOW debt. Git stage remains subject to its explicit human gate.
