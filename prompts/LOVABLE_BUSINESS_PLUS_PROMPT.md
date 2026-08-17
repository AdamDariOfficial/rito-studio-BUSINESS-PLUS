# RITO Studio BUSINESS PLUS — Implementation Prompt

> **HISTORICAL / SUPERSEDED — DO NOT RUN.** The controlled implementation and staging
> acceptance are already complete; this prompt is retained only as a scope reference.

## Preconditions

- current repository is `AdamDariOfficial/rito-studio-BUSINESS-PLUS`;
- `main` contains the approved definitive PLUS bootstrap;
- working tree and index are clean;
- implementation branch base is recorded;
- one writer is selected;
- user explicitly authorizes application implementation;
- Lovable credits are used only if explicitly authorized.

## Objective

Implement the complete BUSINESS PLUS baseline as **one coherent pass**:

```text
/consulenza
/admin
/_demo/tools (demo profile only)
configuration-driven recommendations
minimal request storage profiles
handoff adapters
```

## Consultation

Maximum four steps:

1. choose/inherit main service;
2. 2–4 quick configured questions;
3. show main service + max 2 curated complementary suggestions; allow optional manual catalogue additions after recommendations, bounded to max 6 selected services total;
4. contact/review/submit.

Do not build a standalone `/percorsi` page.

## Admin

Only consultation requests:

```text
list
detail
new/contacted/booked/archived
short note
basic date/status filters
```

No content/gallery editor, CRM, calendar, payment or generic dashboard.

## Storage

Portfolio/demo: local-only, resettable, no personal-data transmission.

Client-live: fixed minimal shared request store + minimal admin access. Keep the domain
limited to consultation requests/admin state. Production enablement/migrations/secrets
remain separate gates.

## Preserve

Do not redesign frozen BUSINESS. Preserve all inherited routes, treatment dialog,
gallery/lightbox, navbar/footer, motion, route/history, responsive/accessibility and demo
integrity.

## Hard CUSTOM boundary

Do not add CMS, CRM, live agenda, payments, client history, package/fidelity ledgers,
roles, staff/resources, inventory, multi-location, bespoke dashboards/integrations.

## Verification

Use repository-defined checks and perform comparative BUSINESS regression plus browser
QA at 360/390/430/768/1440. Do not deploy without a separate gate.

## Supersession note — 9 August 2026

The coherent controlled implementation on `feat/rito-business-plus-complete` supersedes
this prompt as the current writer path. Keep this file only as a versioned scope
reference. Running it would duplicate an implementation already present in the
controlled candidate. The application, isolated staging deployment and required staging
acceptance are complete; the candidate is `READY FOR HUMAN FINAL REVIEW / FREEZE`, but the
freeze is not yet granted and production is not certified or authorized.

## Approved post-QA refinement — 10 August 2026

Preserve the refined BUSINESS PLUS baseline:

- admin master/detail: independent desktop scrolling, list/detail drill-in on mobile;
- operational edit is limited to contact, preferred day/window and added services up to max 6 selected services total; original main service and original consultation answers are read-only;
- delete requires explicit destructive confirmation and live server authorization;
- no fake client-side admin security in demo; live admin uses the existing server-side session contract;
- demo banners are not shown in admin or public confirmation; demo tools remain reachable through a small bottom admin link;
- phone/email are actionable and copyable;
- native select arrow spacing is consistent site-wide;
- consultation step motion is directional, subtle and reduced-motion safe;
- mobile Back/Next share one row with the primary action dominant;
- service price labels and indicative total remain visible through step 3, final review and confirmation;
- privacy consent links to `/privacy`.

- confirmation repeats the saved contact/time preferences, returns to top/focus and uses restrained success motion without confetti;
- the privacy link opens in a new tab;
- internal notes use a compact preview + dialog editor; copy controls are visually icon-only and keyboard accessible;

## Approved third post-QA interaction refinement — 10 August 2026

If this baseline is ever regenerated, preserve:

- viewport-bounded additional-service dialog with fixed header/footer and a scrollable service list;
- step-change viewport reset to the consultation flow start followed by active-panel focus;
- success check + `Richiesta ricevuta` on the same line with restrained reduced-motion-safe label animation;
- no `Chiama per prenotare` duplicate link in footer Info;
- short reduced-motion-safe admin drill-in transitions, stacked mobile original answers and note action below preview;
- `/_demo/tools` two-column desktop workspace, single-column below `lg`.

## Live architecture supersession — 11 August 2026

For live-backend work, this historical implementation prompt is subordinate to:

```text
docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md v1.5
docs/BUSINESS_PLUS_LIVE_STORE.md v2.3
docs/BUSINESS_PLUS_STAGING_RUNBOOK.md v2.0
docs/TESTING.md v1.9
BW-DEC-058 through BW-DEC-070
```

Do not reintroduce an external ad-hoc REST store, interval polling, frontend-only admin auth,
custom staging/production passwords or a global cross-client realtime singleton.

The current admin boundary is native D1-backed RITO AdminAuth using
`scrypt-n16384-r8-p5-hmac-sha256-pepper-v2` with work factor 655360. The earlier
`pbkdf2-sha256-hmac-pepper-v1` path and Cloudflare Access provider design are
historical/superseded; Access may exist only on a separate Tretnix technical surface.

Real isolated staging validated the current Lovable/Nitro adapter; preserve it absent new direct
adapter-specific evidence. Never place real D1 IDs, Access AUD values or secrets in
browser-visible `VITE_*` variables. No remote resource creation, migration or deploy is implied
by this historical prompt.
