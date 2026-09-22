# RITO Studio BUSINESS PLUS — Project Knowledge

Project: `RITO Studio BUSINESS PLUS`
Family: Tretnix Beauty & Wellness v1.1
Parent BUSINESS: `b95a63c6127d2bc1dd396d74b2dd25f87b952226`
Bootstrap base: `eba1a2a91fd3a531b4a4667d038b631758d0a664`

## Product definition

BUSINESS PLUS = frozen BUSINESS + short guided consultation + minimal Consultation Inbox.

Do not turn PLUS into a generic salon management system.

## Public extension

```text
/consulenza
```

No baseline `/percorsi` route.

The consultation is max four steps:

```text
service
2–4 quick questions
main + max 2 curated complementary recommendations, with optional manual catalogue additions bounded to max 6 selected services total
contact/review/submit
```

Recommendations are deterministic/configuration-driven.

## Minimal admin

```text
/admin       Consultation Inbox
/admin/hero  bounded hero manager
```

`/admin` remains limited to consultation requests: list/detail, status, short note and basic
filters. `/admin/hero` manages at most five full-slide hero screens: required desktop image,
optional mobile art-direction image, copy/CTA, status, schedule and order. Both routes share the
same admin navigation shell, including section navigation, site return and logout.

This is not a generic CMS, gallery editor, CRM, calendar, payments or general dashboard.

## Demo-local profile

Portfolio/demo requests remain browser-local and resettable, but there is no dedicated public
`/_demo/tools` route. The Consultation Inbox continues to demonstrate local request state.

## Storage truth

Local browser state is valid for portfolio/demo only. It cannot deliver visitor requests
to a client admin on another device.

Live client inbox requires the standardized minimal shared request store + minimal admin
access. Do not expand it into CRM.

## Handoffs

```text
inbox
tel
whatsapp
external
```

## Preserve

Keep frozen BUSINESS identity, routes, treatment/gallery interactions, responsive,
accessibility, route/history behavior, reduced motion and Tretnix attribution.

## CUSTOM boundary

CMS, CRM, live agenda, payments, client history, packages/fidelity ledgers, roles,
staff/resources, inventory, multi-location, bespoke workflows/integrations/reporting.

## Current delivery state — 17 August 2026

The definitive application baseline, isolated staging deployment and required staging acceptance
are complete on `feat/rito-business-plus-complete`. The candidate is
`READY FOR HUMAN FINAL REVIEW / FREEZE`; the freeze is not yet granted, and production is not
certified or authorized.

Do not ask Lovable to reimplement this baseline or rerun staging validation. The next task is a
separate read-only Final Human Freeze Audit. Lovable may only become the writer again after an
explicit later gate and synchronization with the canonical repository state.

## Post-QA refinement — 10 August 2026

- `/admin` uses desktop independent-scroll master/detail and mobile list/detail drill-in.
- Admin may edit contact/preferred scheduling fields and added services up to max 6 selected services total, but original main service and consultation answers remain read-only.
- Admin delete is permanent, confirmation-gated and server-authorized in live mode.
- Demo admin keeps browser-local state only; no public demo-tools route or demo banner is exposed.
- Native selects use consistent right-arrow inset.
- Consultation steps animate directionally with reduced-motion fallback.
- Prices and an indicative total remain visible through recommendation, review and confirmation.
- Privacy consent links directly to `/privacy`.

- Success confirmation repeats the saved contact/time preferences, returns viewport/focus to the success heading and uses a restrained non-confetti success mark with reduced-motion fallback.
- Privacy opens in a new tab from the consent copy.
- Admin internal notes use a compact preview + dialog editor; phone/email copy controls are visually icon-only but remain semantic buttons.

## Third post-QA interaction refinement — 10 August 2026

Preserve these approved details:

- additional-service dialog has fixed header/footer and a scrollable internal list constrained to the viewport;
- consultation step changes return to the top of the flow and focus the active panel;
- success check and `Richiesta ricevuta` share one inline status group with restrained label motion;
- footer Info does not include the redundant `Chiama per prenotare` link;
- admin mobile drill-in animates open/close briefly and reduced motion is immediate; desktop detail switches use only a short fade;
- mobile original answers stack question then response, and the note action moves below its preview;
- the public demo-tools route is removed while demo persistence remains internal;
- the home hero is a manual full-slide RITO slider: image, copy and CTA move together;
- the redundant slide metadata rail is omitted; navigation state is conveyed by the carousel controls;
- each screen has a required desktop image and may have one optional mobile art-direction image, both from the approved RITO asset library;
- `/admin/hero` is the bounded max-five-screen manager and offers desktop/mobile preview; it is not a generic CMS;
- `/admin` and `/admin/hero` share one admin navigation shell, including site return and logout;
- demo hero state is browser-local; live hero state reuses D1 + native AdminAuth/CSRF;
- no upload/R2 scope is introduced.

## Approved live architecture — 11 August 2026

Current authoritative sources:

```text
docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md v1.5
docs/BUSINESS_PLUS_LIVE_STORE.md v2.3
docs/BUSINESS_PLUS_STAGING_RUNBOOK.md v2.0
docs/TESTING.md v1.9
BW-DEC-058 through BW-DEC-070
```

Live baseline:

```text
Cloudflare Worker
D1 per client deployment (EU jurisdiction for Italian staging/production)
Durable Objects + Hibernation WebSockets
Native RITO AdminAuth backed by D1 users/sessions; no visible Cloudflare Access login
Workers Rate Limiting
Wrangler D1 migrations
```

Public submission uses `POST /api/consultations`. Native login/logout/session functions form
the authentication boundary; Consultation Inbox reads require a valid server-side session and
mutations additionally require session-bound CSRF. The realtime WebSocket requires exact
same-origin plus the same native admin session before upgrade.

No polling is permitted. Use connect → ready → snapshot → event replay, then reconnect with
backoff/jitter and one catch-up after disconnect.

Cloudflare infrastructure stays behind ports/adapters. The Lovable/Nitro generated Worker
merge passed build validation; local component emulation was inconclusive in minimal D1/DO
cases, and real isolated staging subsequently validated the adapter and live runtime path.
Preserve the adapter absent new adapter-specific evidence.

Source `wrangler.jsonc` is unprovisioned and is never the final staging/production config. The
current staging create/migrate/deploy gate is complete and used test data only. Do not perform
further remote mutations or any production action without a new explicit controlled gate.


## Native AdminAuth decision — 11 August 2026

`BW-DEC-065` supersedes Cloudflare Access as the application/client admin identity boundary.
Use branded `/admin/login`, D1 `admin_users` + `admin_sessions`, salted/peppered password
hashing, opaque hashed server sessions, secure `__Host-` cookie, CSRF on mutations, login
rate limiting and server authorization including WebSocket handshake. D1 determines durable
operation success; realtime publish after commit is best-effort and recovered by catch-up.
Cloudflare Access may exist only on a separate Tretnix technical surface.

`BW-DEC-070` makes `scrypt-n16384-r8-p5-hmac-sha256-pepper-v2` with work factor 655360 the
current password scheme. `pbkdf2-sha256-hmac-pepper-v1` and the PBKDF2 workerd investigation are
historical/superseded; legacy records are rejected and never weakened to a 100000 fallback.
