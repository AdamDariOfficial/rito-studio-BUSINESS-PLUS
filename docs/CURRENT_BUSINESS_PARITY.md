# RITO Studio BUSINESS PLUS — Current BUSINESS parity contract

**Status:** approved comprehensive reconciliation candidate
**Date:** 20 September 2026
**Historical PLUS product parent:** `AdamDariOfficial/rito-studio-BUSINESS@b95a63c6127d2bc1dd396d74b2dd25f87b952226`
**Current presentation parity reference:** `AdamDariOfficial/rito-studio-BUSINESS@3f0ff4d3ed8e675725d8d640c305ab61d47217d7`
**PLUS implementation baseline:** `AdamDariOfficial/rito-studio-BUSINESS-PLUS@94455455911b7fa97774393a8db0ad36953f039e`

## Objective

BUSINESS PLUS remains BUSINESS plus the approved guided consultation, Consultation Inbox and live
backend. The inherited public website must nevertheless use the same current RITO Studio visual
language and interaction quality as BUSINESS wherever the product capability does not require a
difference.

Uniformity means matching the current BUSINESS reference for inherited public surfaces in:

- layout density and vertical rhythm;
- spacing, grids and responsive breakpoints;
- typography, palette and image treatment;
- reveal timing and autonomous divider behavior;
- reduced-motion semantics;
- persistent-link and primary-action affordance;
- route-top/focus and browser-history behavior;
- gallery rail, gallery filters and treatment filters;
- Studio composition and route density;
- shared legal-footer structure;
- demo review presentation permitted by `TRX-DEC-040`.

## Intentional BUSINESS PLUS differences

The following remain intentionally different and are not parity defects:

- `/consulenza` is the primary guided conversion surface;
- public conversion CTAs may lead to `/consulenza` instead of opening the BUSINESS booking adapter;
- the footer omits the redundant booking entry, while phone/email remain in Contacts;
- treatment detail may seed `/consulenza` and retain the approved direct contact fallback;
- `/admin`, `/admin/login`, consultation state, native AdminAuth, D1, CSRF,
  rate limiting, realtime and live submission remain BUSINESS PLUS-only;
- the PLUS home intentionally diverges from the BUSINESS split hero with the approved
  full-slide manual e-commerce hero; each screen owns image/copy/CTA, while RITO identity remains;
- `/admin/hero` is a bounded PLUS-only hero manager (max 5 screens), not a generic CMS;
- consultation/admin motion approved by BW-DEC-054/BW-DEC-056 remains in addition to the shared
  BUSINESS motion system;
- consultation price totals require the PLUS-only `priceAmount`/`priceFrom` treatment metadata.

## Reconciliation matrix

The current candidate imports or reconciles the current BUSINESS implementation for all inherited
public surfaces that drifted after the historical PLUS parent was frozen:

| Area | Candidate rule |
|---|---|
| Route intro / legal pages | Current BUSINESS compact spacing and divider behavior |
| FAQ | Current BUSINESS density + autonomous opacity-only divider reveals |
| Treatment catalogue | Current BUSINESS row density and full-bleed mobile filter rail |
| Gallery | Current BUSINESS full-bleed filter rail and frozen home-gallery composition/gesture |
| Home hero | Current BUSINESS split RITO hero; PLUS consultation replaces booking as primary action |
| Home below fold | Current BUSINESS spacing, reveal, divider and link affordance |
| Reviews | Current BUSINESS demo fixture section; no review/rating structured-data claims |
| Studio | Current BUSINESS compact one-image + three-principle composition; PLUS consultation CTA |
| Contacts | Current BUSINESS density and contact adapter |
| Header | Current BUSINESS navigation/drawer/brand-home behavior; PLUS consultation CTA |
| Footer | Current BUSINESS link/legal/divider treatment; PLUS removes redundant booking entry |
| Motion CSS | Current BUSINESS shared motion layer + preserved PLUS consultation/admin motion |
| Route focus | Current BUSINESS PUSH-only top/focus behavior |
| Asset provenance | Explicit 7/7 RITO asset hashes/dimensions; upstream rights remain unverified |

## Explicit exclusions

This reconciliation does not authorize changes to:

- consultation schemas, recommendation rules, persistence or submission logic;
- admin workflows or operational data semantics;
- authentication, sessions, CSRF, rate limit, realtime or Durable Objects;
- migrations, D1 data, secrets, Wrangler configuration, DNS or deployment;
- dependencies or package versions;
- the historical `family-business-plus-v1.0` tag.

## Acceptance

Automated acceptance requires frozen install, typecheck, lint, native-auth test, security test,
production build, static/config validation, whitespace validation and Development OS validation.

Browser acceptance is one consolidated end-to-end pass after the entire reconciliation is applied.
It covers inherited public parity, PLUS consultation smoke, admin-login smoke, route/history/focus,
keyboard/focus behavior, 320/375/768/1024/1440 widths, 200% zoom, reduced motion, console errors and
horizontal overflow. Browser-only local harness evidence does not certify live backend, D1, auth,
CSRF, rate limit or realtime behavior.

A new freeze is a later explicit gate. The historical v1.0 tag never moves.
