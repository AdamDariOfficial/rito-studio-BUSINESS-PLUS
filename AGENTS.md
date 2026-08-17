<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to Lovable. Do not rewrite published Git history:
> no force-push, rebase, amend or squash of commits already synchronized.
>
> Commits pushed to a connected branch may sync back to Lovable. Keep every pushed
> branch working. Do not publish or deploy without explicit authorization.

<!-- LOVABLE:END -->

# AGENTS.md — RITO Studio BUSINESS PLUS

## Project identity

- Project: `RITO Studio BUSINESS PLUS`
- Family: Tretnix Beauty & Wellness `v1.1`
- Authorized plan: BUSINESS PLUS
- Concept status: fictional portfolio demo, not a real business
- Repository: `AdamDariOfficial/rito-studio-BUSINESS-PLUS`
- Frozen parent: `AdamDariOfficial/rito-studio-BUSINESS`
- Frozen BUSINESS baseline: `b95a63c6127d2bc1dd396d74b2dd25f87b952226`
- Verified PLUS remix/bootstrap base: `eba1a2a91fd3a531b4a4667d038b631758d0a664`
- Frozen START reference: `34c13cd78255b7ac009533790329cada74ae9d8a`

## Source hierarchy

When instructions conflict:

1. approved decisions;
2. shared Tretnix development standards;
3. project documentation in `docs/`;
4. approved current task specification;
5. behavior directly verified in code/deployment;
6. older conversations not yet formalized.

Read this file first. Before non-trivial work inspect relevant current files and record
the exact sources/versions used. Distinguish confirmed facts, assumptions, hypotheses and
missing evidence.

## Product boundary

BUSINESS PLUS is **BUSINESS + guided conversion + a minimal consultation inbox**.

It is deliberately not a salon ERP, CMS, CRM or broad admin suite.

### Public PLUS extension

The only new primary public route in the baseline is:

```text
/consulenza
```

The consultation is intentionally short:

```text
1. choose or inherit the main service
2. answer 2–4 quick service-specific questions
3. show the main service + at most 2 curated complementary suggestions
4. review contact/request details and submit
```

No separate `/percorsi` route is part of the baseline. The “percorso” is the concise
recommendation result produced inside `/consulenza`.

Recommendations are deterministic and configuration-driven, not medical advice and not
AI-generated claims.

### Minimal client admin

BUSINESS PLUS may include:

```text
/admin
```

only as a **Consultation Inbox**.

Allowed capabilities:

- list consultation requests;
- open request detail;
- status: `new`, `contacted`, `booked`, `archived`;
- short internal notes;
- basic date/status filtering;
- edit operational request data after direct client contact: contact details, preferred day/window and selected added services, up to 6 services total including the immutable main service;
- permanently delete a consultation request only through an explicit destructive confirmation.

The original consultation answers and original main service remain read-only evidence of what the visitor submitted. Editing operational request data must not silently rewrite those original answers.

Not allowed in the baseline admin:

- editing website copy, sections, services or gallery;
- CMS/page builder;
- staff management;
- customer CRM;
- calendar/agenda;
- payments;
- packages/fidelity/gift-card balances;
- analytics dashboards;
- roles/permissions beyond the minimal single-admin requirement.

## Storage profiles

A local-only browser store cannot make requests submitted by visitors appear in the
client’s admin on another device. Therefore the product has two explicit profiles.

### `portfolio-demo`

- consultation requests stored locally in the browser;
- no personal data leaves the browser;
- standardized demo tools may reset/snapshot local demo state;
- admin demonstrates the inbox locally only.

### `client-live`

- the Consultation Inbox requires a shared remote request store;
- the baseline backend scope is fixed and minimal: consultation requests + admin access;
- it must not grow into CRM/agenda/management features;
- migrations, secrets, auth and production enablement remain controlled release gates.

This distinction preserves honest demo behavior without pretending local storage is a
real multi-device client backend.

## Conversion and handoff

The consultation can finish with a configured handoff:

```text
inbox
tel
whatsapp
external
```

The baseline must centralize these adapters. Client-specific provider logic beyond the
approved adapter contract belongs to CUSTOM.

## Inheritance contract

Preserve the frozen BUSINESS identity and behavior unless a PLUS decision explicitly
changes it:

- RITO Studio / Beauty & Care Atelier positioning;
- `La bellezza, nel suo ritmo.`;
- porcelain / ink / burgundy palette and `#6A3F4B`;
- Newsreader + Manrope;
- current BUSINESS routes, treatment catalogue/query detail and gallery behavior;
- navigation, footer, CTA personality;
- route-top, direct URL, refresh, Back/Forward;
- mobile-first behavior and no unintended horizontal overflow;
- reduced motion, focus and keyboard accessibility;
- centralized typed content/config;
- demo integrity and Tretnix attribution.

Do not copy Hospitality visual identity.

## CUSTOM boundary

CUSTOM begins when the client needs any of:

- editable site CMS/content/gallery admin;
- full CRM/client profiles/history;
- native live agenda/resource availability;
- payments/deposits;
- package credits, gift-card balances or fidelity ledger;
- multi-role/multi-user administration;
- staff scheduling;
- multi-location;
- inventory/accounting;
- custom operational dashboards/reporting;
- bespoke integrations or business-specific workflows.

## Development constraints

- Mobile-first.
- No unintended horizontal overflow.
- New routes open at the top without smooth route reset.
- Preserve direct URL, refresh, Back and Forward.
- Personal form answers must never be encoded in URLs.
- Prefer choice controls over free text; keep the consultation short.
- Recommendation output remains 1 main service + max 2 curated complementary suggestions.
- The visitor may manually add catalogue services after recommendations, but the request remains bounded to max 6 selected services total; this is not a cart or booking configurator.
- Respect `prefers-reduced-motion`.
- Preserve visible focus, semantic structure and adequate touch targets.
- Do not add dependencies or abstractions without a concrete reason.
- Do not change unrelated BUSINESS copy/styling/behavior.

## Writer coordination

The coherent BUSINESS PLUS application pass, isolated staging deployment and required staging
acceptance are complete. The candidate is `READY FOR HUMAN FINAL REVIEW / FREEZE`; the human
freeze is not yet granted, and production is not certified or authorized.

The current gate is documentation reconciliation followed by a separate read-only Final Human
Freeze Audit. Do not reopen implementation, staging E2E or architecture without a new approved
task and direct evidence.

One application writer at a time. Lovable, Cursor and Codex must not edit overlapping
scope concurrently.

Stage, commit, push, PR, merge, deployment and production backend enablement remain
separate explicit gates.

## Tretnix attribution

Public client work retains:

> Progettato e sviluppato da Tretnix

linked to `https://tretnix.com`.

## Current post-QA interaction refinement

The current authorized candidate also preserves:

- scrollable internal list in the bounded additional-service dialog;
- step changes reset to the top of the consultation flow before focusing the active panel;
- inline success check + label with restrained reduced-motion-safe motion;
- footer Info without the redundant booking-call link;
- brief admin request drill-in motion, stacked mobile original answers and note action below preview;
- two-column desktop demo tools.

These are refinements only. Do not use them as justification to add routes, dependencies, CRM/agenda behavior or unrelated redesign.

## Live architecture baseline — 11 August 2026

For live-backend work, treat `docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md` v1.5,
`docs/BUSINESS_PLUS_LIVE_STORE.md` v2.3 and `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v2.0
as authoritative together with `BW-DEC-058` through `BW-DEC-070`. `BW-DEC-065` supersedes
the Access-specific authentication portions of the earlier live decisions; `BW-DEC-070`
supersedes their PBKDF2 password-KDF details with the implemented scrypt v2 scheme.

Rules:

- D1 is canonical persistence; Durable Objects are coordination/realtime only.
- A realtime publish failure after successful D1 persistence must never become a false client failure.
- No periodic polling in the Consultation Inbox.
- Use Hibernation WebSockets with reconnect + one-shot catch-up.
- Realtime events contain no PII.
- Public live submit is `POST /api/consultations`, not an admin server function.
- Every admin server function and realtime handshake verifies `AdminAuth` server-side.
- The client-visible admin boundary is native RITO AdminAuth backed by D1 users/sessions.
- The current password scheme is `scrypt-n16384-r8-p5-hmac-sha256-pepper-v2` with work factor
  655360; `pbkdf2-sha256-hmac-pepper-v1` is historical/superseded and is rejected as legacy.
- Cloudflare Access must not intercept `/admin/login` or provide application identity; optional
  Tretnix-only Access protection belongs on a separate technical surface.
- Admin mutations require the valid server-side session plus session-bound CSRF.
- Login uses non-enumerating errors and rate limiting before password verification.
- Default reuse is isolated single-tenant deployment per client.
- Keep Cloudflare-specific code behind repository/auth/realtime/rate-limit adapters.
- No ORM in v1 without concrete evidence of need.
- Local, staging and production must never share a writable D1 database.
- Italian staging/production D1 databases use EU jurisdiction from creation.
- Source `wrangler.jsonc` is unprovisioned and must not be deployed directly.
- `workers.dev` and Preview URLs are disabled in the prepared staging config; use a dedicated
  Cloudflare custom hostname.
- Staging uses test data only until retention/purge/privacy/security gates are approved.
- Never create/apply production migrations or deploy from a Controlled Change Package.
- Preserve the current Lovable/Nitro adapter unless remote staging proves an adapter-specific
  incompatibility; local `workerd` component failures alone do not authorize migration.
- `portfolio-demo` remains local-only and does not send PII.
- Live backend work does not authorize CRM, agenda, payments, staff/resources, inventory or
  other CUSTOM scope.

## Current live backend gate — staging acceptance closed

The historical local adapter spike is evidence, not the current execution gate. Its generated
Wrangler merge passed, while local D1/DO runtime remained inconclusive even in minimal cases.

The current isolated staging baseline has completed:

```text
D1 migrations and canonical persistence
native D1 AdminAuth scrypt v2 reprovision/deploy
/admin/login, session, logout/revocation and CSRF gates
public submit, idempotency and rate-limit characterization
Durable Object realtime, reconnect and one-shot D1 catch-up
admin mutation/concurrency and cross-device acceptance
responsive, reduced-motion and physical multi-device acceptance
```

Current candidate status is `READY FOR HUMAN FINAL REVIEW / FREEZE`. The next task is the
separate read-only freeze audit; it must not rerun staging or grant production authority.
Do not run `wrangler login`, create or mutate remote resources, apply migrations or deploy
without a new explicit gate. Production remains not certified and not authorized.
