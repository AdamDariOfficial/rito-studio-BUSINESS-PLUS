# RITO Studio BUSINESS PLUS — Definitive Implementation Specification

**Version:** 1.0
**Implementation model:** one coherent pass after bootstrap merge

## 1. Objective

Extend frozen BUSINESS with a short guided consultation and a minimal Consultation Inbox
while preserving template reuse.

The implementation should maximize configuration-driven adaptation and minimize
client-specific source changes.

## 2. Public consultation

Route:

```text
/consulenza
```

Entry modes:

```text
direct:
  /consulenza
  → first step selects main service

from treatment:
  /consulenza?servizio=<treatment-slug>
  → service preselected
```

Only non-personal identifiers may appear in the URL.

### Maximum flow

```text
STEP 1 — servizio
STEP 2 — 2–4 domande rapide
STEP 3 — il tuo percorso
STEP 4 — contatto + review + submit
```

Do not add more steps unless a later approved decision changes the product.

### Controls

Prefer:

- chips;
- radio groups;
- compact selects;
- toggles/check choices where semantically correct.

Free text should be exceptional and short.

### Recommendation result

Always:

```text
recommendation layer:
1 main service
0–2 curated complementary suggestions

selection layer:
1 main service
0–5 additional catalogue services
max 6 selected services total
```

Visitors may remove complementary suggestions and may add other catalogue services from a bounded picker after the recommendation layer. Curated recommendations remain capped at two and remain distinguishable from manually added services.

Do not offer an unlimited configurator, shopping-cart semantics or automatic appointment composition.

## 3. Configuration model

The implementation should centralize at least:

```ts
ConsultationServiceConfig;
ConsultationQuestion;
ConsultationAnswerOption;
RecommendationRule;
ConsultationHandoffConfig;
```

A recommendation rule references existing treatment slugs and stable option values.

Example concept:

```ts
{
  service: "rituale-viso",
  when: { goal: "relax" },
  suggest: ["massaggio-viso"]
}
```

No AI dependency is required.

## 4. Submission/handoff

Supported baseline handoffs:

```text
inbox
tel
whatsapp
external
```

The flow must keep provider configuration out of UI components.

`external` is a configured booking/provider URL.

## 5. Consultation Inbox

Route:

```text
/admin
```

No public-navigation link.

Allowed screens:

```text
request list
request detail
status filter
date filter
short internal note
operational edit
destructive delete confirmation
```

Admin layout is responsive master-detail:

- desktop keeps list and detail inside the viewport with independent scrolling;
- mobile uses list -> detail drill-in instead of stacking both panels;
- original consultation answers and original main service stay read-only;
- editable operational fields are contact details, preferred day/window and added services, with max 6 selected services total including the immutable main service;
- deletion is permanent and always requires an explicit confirmation.

Allowed states:

```text
new
contacted
booked
archived
```

Keep the interaction intentionally small. No calendar, customer profile, content editor
or dashboard widgets.

## 6. Storage profiles

### Portfolio/demo

Use a small local repository/store appropriate for text-only request fixtures. The demo
must be resettable and must not transmit personal data.

### Client-live

The approved target architecture is defined by
`docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md` v1.5.

The shared inbox uses D1 as canonical persistence, Durable Objects + Hibernation
WebSockets for realtime synchronization and native D1-backed RITO `AdminAuth` as the
implemented application identity provider. Cloudflare Access is not the current client/admin
authentication boundary; its earlier provider role is a superseded design, and any optional
Tretnix-only Access perimeter must remain on a separate technical surface. Periodic polling is
not part of the approved live baseline.

Required persisted domain remains narrowly limited to consultation requests and their
admin state/note. Do not silently add CRM entities. Cloudflare-specific APIs remain
behind repository/auth/realtime/rate-limit adapters.

The implemented staging baseline uses direct D1 persistence, native D1-backed RITO AdminAuth
with `scrypt-n16384-r8-p5-hmac-sha256-pepper-v2`, and a Durable Object Hibernation WebSocket.
The earlier `pbkdf2-sha256-hmac-pepper-v1` path is historical/superseded and is rejected as a
legacy record rather than weakened. Isolated staging provisioning, migrations, deployment and
required acceptance are complete; production remains a separate unauthorized gate. Real staging
validated the current Lovable/Nitro adapter, so preserve it absent new adapter-specific evidence.
The candidate is `READY FOR HUMAN FINAL REVIEW / FREEZE`; that freeze is not yet granted, and
production is not certified or authorized.


### Live transport/security contract

```text
POST /api/consultations                 public same-origin submit
/_serverFn/*                            native RITO login/session + admin RPC transport
/__tretnix/consultation-realtime        native-session authenticated WebSocket
/admin/login                            branded native RITO login
/admin                                  authenticated Consultation Inbox
```

The public submit is JSON-only, server validated, idempotent and rate limited. Login/session
server functions are intentionally unauthenticated only where required to establish/end the
session; every Consultation Inbox read validates the native server-side session and every
state-changing admin handler additionally validates the session-bound CSRF token.

Staging configuration is generated only after explicit provisioning and disables
`workers.dev`/Preview URLs in favor of a dedicated Cloudflare custom hostname.

## 7. Demo tools

Route/profile:

```text
/_demo/tools
```

Enabled only in the portfolio/demo profile.

Functions:

```text
save snapshot
restore snapshot
reset to seed
export state
import state
```

It operates only on demo-local state and is not a client-facing CMS.

## 8. Privacy and integrity

- portfolio demo sends no personal data;
- real submission requires an approved live storage/handoff profile;
- explicit consent where required;
- no sensitive/medical profiling;
- no recommendation claim implying diagnosis;
- no invented scarcity, outcomes, reviews or guarantees;
- public demo remains `noindex, follow`.

## 9. UX acceptance criteria

### 360 / 390 / 430 px

- no horizontal overflow;
- each consultation step understandable without zoom;
- primary action visible and unambiguous;
- tap targets adequate;
- recommendation result not card-heavy;
- admin list/detail usable on mobile through a list/detail drill-in;
- desktop admin does not require whole-page scrolling to inspect a request;
- email and phone are actionable and individually copyable; copy controls are visually icon-only while remaining semantic keyboard-focusable buttons;
- internal notes use a compact preview/action and an accessible dialog editor instead of a permanently expanded textarea;
- destructive deletion cannot occur without an explicit confirmation.

### Route/history

- new route opens at top;
- direct `/consulenza` works;
- preselected service URL works;
- invalid service recovers safely;
- refresh works;
- Back/Forward are predictable;
- personal answers never leak into URL.

### Accessibility

- semantic groups/labels;
- keyboard complete;
- visible focus;
- error summary + inline relation;
- announcement of step/errors where useful;
- reduced-motion complete;
- consultation step changes use subtle directional motion that becomes immediate under reduced motion;
- selected service prices remain visible through recommendation, manual additions, review and confirmation;
- success confirmation returns the viewport to the top, focuses the success heading, shows a restrained success mark, and repeats submitted contact/day/window details;
- the consent privacy link opens `/privacy` in a new tab so the in-progress consultation remains open.

## 10. Reuse acceptance criteria

A normal new BUSINESS PLUS client should primarily require changes to:

```text
site config
treatment catalogue
consultation questions
recommendation rules
handoff configuration
copy/assets
```

If the job requires significant new schema/business logic, it must be classified as
CUSTOM rather than expanding the baseline.

## 11. Exclusions

Not in BUSINESS PLUS baseline:

```text
CMS/content/gallery editor
full CRM
native live agenda
payments/deposits
client account/history
package credit ledger
gift-card balance ledger
fidelity ledger
multi-role admin
staff scheduling
resources/rooms
inventory
accounting
multi-location
bespoke reporting
bespoke integrations
```

## 12. Verification

Automated:

```text
frozen install
typecheck if repository script exists
lint
build
route tree stability
scope/diff checks
```

Browser:

```text
360 / 390 / 430 / 768 / 1440
direct URL / refresh / Back / Forward
keyboard/focus
reduced motion
demo no-network/no-persistence check
admin request status/note flow
comparative BUSINESS regression
```

## 13. Third post-QA interaction contract

The approved candidate additionally requires:

- the manual additional-service picker uses a viewport-bounded dialog with fixed header/footer and an independently scrollable options region;
- changing any of the four consultation steps returns the browser viewport to the flow start, then focuses the active consultation panel without smooth route scrolling;
- success confirmation groups the restrained check mark and `Richiesta ricevuta` label on one line;
- the inherited public footer omits the redundant `Chiama per prenotare` Info entry while retaining phone/email contacts;
- mobile admin request drill-in animates open/close briefly; desktop request changes use only a short fade; all motion respects reduced motion;
- mobile original-answer rows stack label/value and the note action is placed below the preview instead of sharing a compressed row;
- demo tools becomes a two-column workspace at desktop widths and remains single-column below `lg`.

These refinements do not modify consultation storage, selected-service bounds, admin authorization, routes or CUSTOM boundaries.
