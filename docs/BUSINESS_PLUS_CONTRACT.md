# RITO Studio BUSINESS → BUSINESS PLUS Contract

**Date:** 9 August 2026
**Status:** approved definitive inheritance contract

## Parent

```text
AdamDariOfficial/rito-studio-BUSINESS
b95a63c6127d2bc1dd396d74b2dd25f87b952226
```

## Child bootstrap

```text
AdamDariOfficial/rito-studio-BUSINESS-PLUS
eba1a2a91fd3a531b4a4667d038b631758d0a664
```

## Preserve

BUSINESS PLUS preserves the frozen BUSINESS:

- all current public BUSINESS routes;
- treatment catalogue/query detail;
- gallery/lightbox interactions;
- phone booking surfaces unless PLUS handoff overrides them intentionally;
- visual identity and typography;
- responsive, accessibility, route/history and reduced-motion behavior;
- SEO/demo-integrity boundaries;
- Tretnix attribution.

## Approved PLUS extension

The reusable baseline may add:

```text
/consulenza
/admin/login
/admin
/admin/hero
```

`/admin/login` is the branded native RITO authentication route in live mode. `/admin` remains only a Consultation Inbox. `/admin/hero` is the separate, bounded BUSINESS PLUS hero manager: at most five full-slide hero screens, required desktop image plus optional approved mobile art-direction image, copy/CTA, status, schedule and order. `/admin` and `/admin/hero` share one navigation shell, including Inbox/Hero navigation, site return and logout. It is not a generic CMS, gallery editor or appointment-management suite.

The portfolio/demo profile keeps its request state local and resettable, but exposes no
dedicated public tooling route. Demo maintenance utilities are not part of the client-facing
product surface.

## Consultation output

The guided consultation produces:

```text
main service
+ 0–2 curated complementary suggestions
+ optional manual catalogue additions, with max 6 selected services total
```

Suggestions are configuration-driven and may be removed by the visitor. The system does
not claim medical suitability or guaranteed results.

## Data boundary

### Demo

Local browser state only. No personal data transmission/persistence outside the current
browser.

### Live client

A shared Consultation Inbox requires the standardized minimal remote request store and
minimal admin authentication. The bounded hero manager may reuse the same per-client D1 and
native AdminAuth boundary, with its own versioned hero table and CSRF-protected mutations.

Any expansion beyond Consultation Inbox + bounded hero management into customer records,
appointment history, agenda, payments, roles, staff/resources, packages/fidelity, generic
content management or reporting crosses into CUSTOM.

## Regression rule

PLUS must not silently change existing BUSINESS behavior. Any touched inherited
component requires comparative regression checks.
