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
/_demo/tools   (demo/development profile only)
```

`/admin/login` is the branded native RITO authentication route in live mode. `/admin` is only a Consultation Inbox. It may edit narrowly bounded operational request fields and delete a request with explicit confirmation, but it must not become a CRM or appointment-management suite.

`/_demo/tools` is never a client CMS. It exists only to reset/snapshot the local demo
state used during portfolio presentation and testing.

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
minimal admin authentication. This is an explicitly bounded BUSINESS PLUS module.

Any expansion into customer records, appointment history, agenda, payments, roles,
staff/resources, packages/fidelity or reporting crosses into CUSTOM.

## Regression rule

PLUS must not silently change existing BUSINESS behavior. Any touched inherited
component requires comparative regression checks.
