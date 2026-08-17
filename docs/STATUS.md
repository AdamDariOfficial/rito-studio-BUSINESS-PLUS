# RITO Studio BUSINESS PLUS — Status

**Updated:** 17 August 2026
**Project:** RITO Studio BUSINESS PLUS
**Family:** Tretnix Beauty & Wellness `v1.1`
**Repository:** `AdamDariOfficial/rito-studio-BUSINESS-PLUS`
**Working branch:** `feat/rito-business-plus-complete`
**Bootstrap HEAD:** `eba1a2a91fd3a531b4a4667d038b631758d0a664`
**Parent BUSINESS baseline:** `b95a63c6127d2bc1dd396d74b2dd25f87b952226`
**Canonical START baseline:** `34c13cd78255b7ac009533790329cada74ae9d8a`

## Approved baseline state

```text
START_APPROVED
START_FREEZE_CONFIRMED_BY_USER
START_TAG_WAIVED_BY_USER
BUSINESS_AUTHORIZED
LOVABLE_REMIX_CREATED
GITHUB_REPOSITORY_CONNECTED
LOCAL_BUSINESS_CLONE_VERIFIED
REMIX_DIFF_VERIFIED_TWO_PATHS_ONLY
IDENTITY_DOCS_CONTENT_REVIEW_PASSED
IDENTITY_DOCS_EXACT_11_PATH_SCOPE_APPROVED
IDENTITY_DOCS_EXACT_STAGING_VERIFIED
IDENTITY_DOCS_APPLICATION_SCOPE_UNCHANGED
MULTIPAGE_IMPLEMENTATION_AUTHORIZED_LOCAL
IMPLEMENTATION_WRITER_CURSOR_CODEX
IMPLEMENTATION_BRANCH_FEAT_RITO_BUSINESS_MULTIPAGE
LOVABLE_PASSIVE_ONLY
LOVABLE_AGENT_PROMPT_CREDITS_NOT_AUTHORIZED
BUSINESS_PLUS_NOT_AUTHORIZED
```

## Verified remix state

```text
BUSINESS base HEAD: 222c331db44b1775aa2f877634f3a0f3dfdfbe69
origin/main:        222c331db44b1775aa2f877634f3a0f3dfdfbe69
working branch:     docs/rito-business-identity-bootstrap
canonical START:    439efff0f14315310b9149cde0283633696a0eb0
remix ahead/behind: 2 / 0
```

The net remix difference from START is limited to:

```text
M bun.lock
M package.json
```

Lovable pinned `@lovable.dev/vite-tanstack-config` to `2.8.5` and updated the
corresponding lockfile entries. The identity/documentation work preserves that
remix-managed technical state.

## Sources used

- Tretnix Repository Index `v1.6`;
- Tretnix Master Context `v1.5`;
- Tretnix Development Standards `v1.7`;
- Controlled Change Package `v1.1`;
- Beauty & Wellness family `v1.1`;
- canonical START at `439efff0f14315310b9149cde0283633696a0eb0`;
- verified BUSINESS remix at `222c331db44b1775aa2f877634f3a0f3dfdfbe69`;
- user approvals and process exception recorded on 3 August 2026;
- `v1.1.2` apply/validation output and the first manual diff-review evidence;
- `v1.2.1` automated validation and UTF-8 second-review artifact;
- `v1.2.3` status-closure Apply/Validate output;
- exact staged-set verification report supplied on 4 August 2026;
- official Lovable GitHub integration and best-practices documentation retrieved on
  4 August 2026.

## Completed bootstrap evidence

The user executed `RITO_STUDIO_BUSINESS_IDENTITY_DOCS_BOOTSTRAP_CCP v1.1.2`.

```text
Apply: success
Validate: success
START source unchanged: yes
exact changed paths: 11
staged paths: 0
frozen install: passed
lint: passed
build: passed
git diff --check: passed
```

Browser QA was not run because the package changed documentation only. The build is a
regression check and does not prove browser behavior.

## First manual review findings

The first review confirmed the expected branch, base HEAD, zero staged paths and the
11-path status scope. It required correction before staging because:

- `git diff` did not include the two untracked BUSINESS files;
- root documentation contained task-transient status;
- the Lovable prompt lacked merge and synchronization preconditions;
- the external report was not a clean UTF-8 evidence artifact.

No implementation or dependency change was introduced by the bootstrap package.

## Second manual review findings

The UTF-8 `v1.2.1` report confirmed:

- exact BUSINESS branch and base HEAD;
- exact 11-path working-tree scope;
- zero staged paths;
- complete tracked patch and both complete untracked BUSINESS files;
- frozen install, lint, build and `git diff --check` exit `0`;
- canonical START unchanged.

Staging remained blocked because:

- the prompt simultaneously relied on Lovable as writer and prohibited commit/push
  semantics even though Lovable creates commits and synchronizes them to GitHub;
- approved BUSINESS requirements for social images, structured data, sitemap or route
  indexability inventory and consent-aware tracking were incomplete;
- Project Knowledge omitted `/journal/:slug` from the explicit route exclusions.

No application source, dependency or runtime-config change was introduced.

## Final v1.2.2 validation and review

The user applied and validated `v1.2.2` on 4 August 2026. Direct evidence records:

```text
START source unchanged: yes
BUSINESS base HEAD: 222c331db44b1775aa2f877634f3a0f3dfdfbe69
BUSINESS branch: docs/rito-business-identity-bootstrap
exact working paths: 11
corrected payload paths: 8
staged paths: 0
frozen install: passed
lint: passed
build: passed
git diff --check: passed
```

The final content review passed for product scope, Lovable branch/commit semantics,
route exclusions, SEO/social metadata, structured-data safeguards and consent-aware
tracking defaults. It confirmed no application source, dependency, lockfile or runtime
configuration change.

The remaining finding was that the status documents still described Apply, Validate
and review as pending. The user applied and validated `v1.2.3` as a four-path status
closure. It changed no product requirement, Project Knowledge, Lovable prompt or
application file.

## Exact staging verification

The user explicitly authorized the exact 11-path stage on 4 August 2026. A subsequent
read-only verification confirmed:

```text
branch: docs/rito-business-identity-bootstrap
HEAD: 222c331db44b1775aa2f877634f3a0f3dfdfbe69
origin/main: 222c331db44b1775aa2f877634f3a0f3dfdfbe69
exact staged paths and statuses: 11
unstaged paths: 0
untracked paths: 0
repository checksum manifest: passed
git diff --cached --check: passed
```

No commit, push, pull request, merge, Lovable execution, publication or deployment was
performed. A three-path status-only correction and controlled index reset were then
separately authorized so the repository does not encode transient index state. That
correction does not reopen the product or content review; it requires a fresh final
staged verification before commit because `CHECKSUMS.sha256`, `docs/APPROVAL.md` and
`docs/STATUS.md` change.

## Approved identity/documentation change set

Approved composition:

```text
M  AGENTS.md
M  CHECKSUMS.sha256
M  README.md
A  compiled/LOVABLE_BUSINESS_PROJECT_KNOWLEDGE.md
D  compiled/LOVABLE_START_PROJECT_KNOWLEDGE.md
M  docs/APPROVAL.md
M  docs/DECISIONS.md
M  docs/START_BUSINESS_CONTRACT.md
M  docs/STATUS.md
A  prompts/LOVABLE_BUSINESS_PROMPT.md
D  prompts/LOVABLE_START_PROMPT.md
```

Invariants:

- exactly seven modified documentation files, two BUSINESS additions and two START-only
  deletions;
- no source, route, component, style, asset, dependency, lockfile or runtime-config
  changes;
- parent HEAD remains `222c331db44b1775aa2f877634f3a0f3dfdfbe69` before the local
  documentation commit;
- the final staged set must match the composition above after any approved status-only
  correction;
- repository checksums and `git diff --cached --check` must pass before commit.

## Closure evidence

The identity/documentation content review and exact staged-scope review are complete.
Transient index state is deliberately kept out of the durable repository status. The
remaining operations are external Git release gates and do not change the approved
BUSINESS product scope.

## Current implementation authorization

The user authorized Cursor + Codex as the sole local writer for the complete BUSINESS
multipage pass on `feat/rito-business-multipage`, based on
`9b7ff807f945f679216671577963fd713badb507`.

Lovable remains passive for repository synchronization or optional preview only.
Project Knowledge is not required or updated, the Lovable Agent and prompt are not
authorized, and intentional Lovable credit use is prohibited. Concurrent writers are
forbidden.

The pass includes local documentation/source changes, validation, remediation and final
reporting. Stage, commit, push, pull request, merge, publication, deployment, domains and
infrastructure remain separate explicit gates.

## Targeted remediation after browser review

On 4 August 2026 the user authorized and Codex completed the local implementation of
`BW-DEC-044` from this exact preflight state:

```text
repository: AdamDariOfficial/rito-studio-BUSINESS
origin: https://github.com/AdamDariOfficial/rito-studio-BUSINESS.git
branch: feat/rito-business-multipage
HEAD: 49c7ced6118ecd8e719754f1f0ff5b3738031d47
origin/main: 9b7ff807f945f679216671577963fd713badb507
working tree and index: clean
remote feature branch: absent (live read-only verification)
concurrent writer evidence: none; no index lock or Git process
```

Implemented locally:

- compact four-category home treatment teaser;
- balanced lower spacing in the home Studio section;
- Team module and `/team` removed;
- booking form, booking adapter state and `/prenota` removed;
- all booking actions use the centralized telephone link;
- treatment records require only five base fields and support optional enrichment;
- treatment details use only meaningful optional editorial fields; catalogue metadata remains
  route-level;
- `/studio` philosophy/method content replaced by the high-contrast `Il modo RITO`
  editorial manifesto;
- public-facing internal language removed outside legal placeholders;
- route tree regenerated without Team or booking routes.

Validation evidence:

```text
bun install --frozen-lockfile: exit 0, no changes
bun run lint: exit 0, 0 errors, 6 existing Fast Refresh warnings
bun run build: exit 0
routeTree.gen.ts SHA-256 before/after final build: identical
Impeccable detector: 0 findings
browser QA: 390 px, 768 px and 1440 px completed
browser console errors: 0
horizontal overflow at tested widths: none
/team and /prenota: shared 404 confirmed
```

Browser evidence also confirmed the centralized `tel:+390490000000` target, mobile
drawer focus containment/return and scroll restoration, visible keyboard focus,
catalogue filtering, minimal and enriched detail records, direct URL, refresh,
Back/Forward and loaded reduced-motion safeguards.

No stage, commit, amend, push, pull request, merge, Lovable execution, publication or
deployment occurred. The local candidate status is
`TARGETED_REMEDIATION_READY_FOR_MANUAL_REVIEW`.

## Final UX, rhythm and interaction refinement

On 5 August 2026 the user authorized `BW-DEC-045` from this verified preflight:

```text
repository: AdamDariOfficial/rito-studio-BUSINESS
branch: feat/rito-business-multipage
HEAD: 49c7ced6118ecd8e719754f1f0ff5b3738031d47
origin/main: 9b7ff807f945f679216671577963fd713badb507
staged paths: 0
remote feature branch: absent
package.json and bun.lock drift: none
Git lock: none
```

The pass refines the existing local remediation without resetting or discarding it. It
adds the deliberate home spacing/color cadence, shared editorial arrow, query-driven
treatment dialog/sheet, compact rows, dynamic reveal observation, concise headings,
interaction feedback and step-based gallery gestures. `/trattamenti/:slug` is removed
from the active route inventory; `/team` and `/prenota` remain shared 404 routes.

Stage, amend, commit, push, pull request, merge, Lovable, publication and deployment
remain unauthorized.

Final implementation evidence:

```text
home rhythm: canvas hero → warm compact treatment teaser → canvas editorial → warm
Studio teaser → canvas gallery → warm FAQ → ink booking anchor → canvas practical info
treatment filters: 20 consecutive changes, 0 hidden rows at every step
query detail: valid direct URL, refresh, Back, Forward, Escape and exact focus return passed
invalid treatment query: inline recovery with usable filtered catalogue
gallery: ArrowRight, buttons, drag threshold, one-step swipe, vertical-drag tolerance,
Escape and exact focus return passed
responsive matrix: 390 px, 768 px and 1440 px; 0 overflow, 0 broken images,
one h1 per principal route, 0 enabled controls with incorrect pointer cursor
browser console warnings/errors: 0
visual evidence: retained outside the repository in the final UX review bundle
```

Automated final validation is recorded in the final pass report. No dependency or
lockfile change was introduced, the active route tree contains no treatment slug route,
and the local candidate status is `FINAL_UX_REFINEMENT_READY_FOR_MANUAL_REVIEW`.

## Navigation, sliders and treatment interaction technical pass

On 6 August 2026 the user authorized and Codex implemented `BW-DEC-046` on the
preserved local remediation at committed HEAD
`49c7ced6118ecd8e719754f1f0ff5b3738031d47`.

Implemented locally:

- Home is first in the centralized navigation with exact `/` active matching;
- treatment filters use one native horizontal row, real edge-state fades and local
  active-item visibility without vertical page scrolling;
- treatment rows retain transparent backgrounds and arrow-led feedback;
- treatment dialog query changes use `resetScroll: false`, one initial history entry,
  internal replace navigation, bounded controls, keyboard, swipe and derived recommendations;
- gallery and FAQ items reveal individually with capped stagger and filtered gallery
  refresh through the centralized reveal controller;
- gallery lightbox and home rail share a 44 × 44 px progress indicator with armed state;
- home rail hides vertical overflow and opens `/galleria` only after a deliberate
  additional end-of-rail gesture.

Direct DOM/runtime evidence without screenshots confirmed:

```text
navigation: Home first; exact active state; no collision at 1024, 1280 or 1440 px
mobile home: 360, 390 and 430 px; overflow-x auto, overflow-y hidden, page overflow 0
rail hint: 44 × 44 px, circular
filters: one row at 360, 390 and 430 px; real start/end state; 20 changes stable
dialog scroll delta: 0 px on open, Back and Forward
dialog history: two internal steps replaced; one Back closed the dialog
dialog input: compact buttons, ArrowLeft and swipe moved one treatment
recommendations: same-category derived list, current excluded, count 3
gallery drag: below threshold unchanged; vertical unchanged; armed release moved one step
home rail: ordinary end scroll and below-threshold drag stayed on `/`; armed drag opened `/galleria`
FAQ: individual reveal, capped 240 ms stagger, accordion animation preserved
console warnings/errors: 0
broken images: 0
horizontal page overflow: 0 at tested widths
```

Repository-defined automated validation passed after the source changes:

```text
bun install --frozen-lockfile: exit 0, no changes
bun run lint: exit 0, 0 errors, 6 pre-existing Fast Refresh warnings
bun run build: exit 0
```

No screenshot, binary or browser-QA artifact was created. No stage, commit, amend, push,
pull request, merge, Lovable execution, publication or deployment occurred. Final manifest,
diff and Git-state evidence is recorded by the final technical report for this pass.

## Aggiornamento premium actions + logo navigation — 8 agosto 2026

> Questa sezione è il riferimento corrente per questo pass e integra le sezioni
> storiche precedenti.

```text
SSR_RUNTIME_REMEDIATION_WORKING_CONFIRMED_BY_USER_BEFORE_THIS_PASS
PREMIUM_DARK_ACTIONS_IMPLEMENTED
LOGO_TOP_NAVIGATION_IMPLEMENTED
AUTOMATED_VALIDATION_PASSED
MANUAL_BUSINESS_REVIEW_APPROVED
FEATURE_COMMIT_5E0BA1A
PR_5_MERGED
CURRENT_MAIN_276FD8E
POST_MERGE_DEPLOY_NOT_REVERIFIED
```

Baseline e merge:

```text
pre-pass main:
f89198b0783a07e89c392862f9b560fb86db98bb

feature branch:
feat/rito-business-premium-actions-logo-nav

candidate:
5e0ba1acd51dfca0274768ed155224820e81b9d9

pull request:
#5 — feat(rito-business): refine actions and brand navigation

current main:
276fd8e2d985bc7ea37442546800d14236009705
```

La PR #5 è stata unita l'8 agosto 2026 alle `13:00:36Z`. Il diff è limitato a
`src/components/Footer.tsx`, `src/components/StickyHeader.tsx` e `src/styles.css`.

Evidenza automatica sul candidate:

```text
bun install --frozen-lockfile -> exit 0, no changes
bun run lint                 -> exit 0, 0 errors, 6 inherited Fast Refresh warnings
bun run build                -> exit 0, client + SSR + Nitro cloudflare-module
git diff --check             -> exit 0
changed paths                -> 3 exact
dependency drift             -> none
```

Prima della pubblicazione l'utente ha approvato manualmente la resa BUSINESS delle due
modifiche. Il sito BUSINESS era tornato funzionante dopo la remediation SSR precedente,
ma non è registrata una nuova verifica di produzione successiva al merge `276fd8e...`.
Non va quindi dichiarato che questo specifico merge sia già distribuito o verificato in
produzione.

## BUSINESS PLUS complete implementation candidate state — 9 August 2026

```text
START_FROZEN_34C13CD
BUSINESS_FROZEN_B95A63C
BUSINESS_PLUS_AUTHORIZED
BUSINESS_PLUS_REPO_CONNECTED
BUSINESS_PLUS_REMIX_VERIFIED
BUSINESS_PLUS_LOCAL_CLONE_VERIFIED
PLUS_MAIN_EBA1A2A
DEFINITIVE_SCOPE_APPROVED
CONSULTATION_MAX_FOUR_STEPS
NO_STANDALONE_PERCORSI
MINI_ADMIN_CONSULTATION_INBOX_ONLY
DEMO_LOCAL_PROFILE_APPROVED
LIVE_INBOX_REQUIRES_MINIMAL_SHARED_STORE
CUSTOM_BOUNDARY_REAFFIRMED
COMPLETE_IMPLEMENTATION_BRANCH_FEAT_RITO_BUSINESS_PLUS_COMPLETE
AUTOMATED_VALIDATION_PENDING
BROWSER_QA_PENDING
LIVE_BACKEND_ENABLEMENT_NOT_PERFORMED
PUBLICATION_NOT_PERFORMED
```

The controlled complete implementation changes the approved documentation and
application together so the product is not developed as a fragmented chain of
micro-features.

After the local validator succeeds, update this evidence only through a later
documentation/publication gate; do not infer browser, staging or production success from
the automated build alone.

## BUSINESS PLUS post-QA refinement candidate — 10 August 2026

Evidence entering this refinement:

```text
CCP_v1.0.4_APPLY_PASS
CCP_v1.0.4_VALIDATE_PASS
USER_CONFIRMED_BROWSER_QA_PASS_PRE_REFINEMENT
BLOCKER_0
MAJOR_0
MINOR_STATUS_DUPLICATE_IDENTIFIED
```

The authorized refinement changes admin UX/operations and consultation UX, so the prior browser QA is evidence for the pre-refinement baseline only. After applying this refinement, automated validation and the affected browser QA matrix must be rerun before commit/push/publication. Live store/security staging remains a separate gate.


## BUSINESS PLUS second post-QA refinement candidate — 10 August 2026

Evidence entering this pass:

```text
POST_QA_REFINEMENT_CCP_v1.0.0_APPLY_PASS
POST_QA_REFINEMENT_CCP_v1.0.0_VALIDATE_PASS
FROZEN_INSTALL_PASS
PRODUCTION_BUILD_PASS
GENERATED_ROUTE_TREE_PASS
TYPECHECK_PASS
LINT_PASS_0_ERRORS_6_INHERITED_WARNINGS
SCOPE_CHECKSUMS_REGRESSION_PASS
STAGED_0
USER_CONFIRMED_AFFECTED_AREA_RESULT_BEFORE_SECOND_REFINEMENT
```

The second refinement changes confirmation content/motion, admin note/copy micro-UX and the selected-service bound. Therefore browser QA for these affected areas must be repeated after validation. No stage, commit, push, PR, merge, deploy or live-store enablement is implied by this candidate state.

## BUSINESS PLUS third post-QA refinement candidate — 10 August 2026

Evidence entering this pass:

```text
POST_QA_REFINEMENT_CCP_v1.0.1_APPLY_PASS
POST_QA_REFINEMENT_CCP_v1.0.1_VALIDATE_PASS
FROZEN_INSTALL_PASS
PRODUCTION_BUILD_PASS
GENERATED_ROUTE_TREE_PASS
TYPECHECK_PASS
LINT_PASS_0_ERRORS_6_INHERITED_WARNINGS
SCOPE_CHECKSUMS_REGRESSION_PASS
STAGED_0
```

Authorized affected areas: consultation service-picker scroll, success status alignment, step viewport reset, footer redundant booking link removal, admin request motion/mobile wrapping and desktop demo-tools two-column layout.

This candidate still requires affected-area browser QA after automated validation. No stage, commit, push, PR, merge, deploy, migration or live-store enablement is authorized by this state.

## BUSINESS PLUS live architecture specification candidate — 11 August 2026

The user has authorized the real shared-backend architecture and explicitly requires
realtime WebSocket synchronization rather than interval polling.

Candidate architecture source of truth:

```text
docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md v1.0
BW-DEC-058
BW-DEC-059
BW-DEC-060
```

Current gate state:

```text
architecture direction:        APPROVED
architecture CCP:              CANDIDATE
application implementation:    NOT PERFORMED BY THIS CHANGE
build-adapter compatibility:    NOT YET PROVEN
Cloudflare resources:          NOT CREATED
D1 migration:                  NOT CREATED / NOT APPLIED
Access policy:                 NOT CREATED
realtime backend:              NOT IMPLEMENTED
staging:                       NOT PERFORMED
production:                    NOT PERFORMED
```

This change is documentation-only. The implementation gate must begin with a minimal
D1/Durable-Object/Hibernation-WebSocket compatibility spike against the current
Lovable/Nitro build path before any tooling migration is proposed.

## BUSINESS PLUS live adapter compatibility spike candidate — 11 August 2026

Evidence entering this gate:

```text
LIVE_ARCHITECTURE_SPEC_CCP_v1.0.0_APPLY_PASS
LIVE_ARCHITECTURE_SPEC_CCP_v1.0.0_VALIDATE_PASS
FROZEN_INSTALL_PASS
PRODUCTION_BUILD_PASS
GENERATED_ROUTE_TREE_PASS
TYPECHECK_PASS
LINT_PASS_0_ERRORS_6_INHERITED_WARNINGS
SCOPE_CHECKSUMS_REGRESSION_PASS
STAGED_0
CLOUDFLARE_RESOURCES_NOT_CREATED
```

Current spike state:

```text
current Lovable/Nitro adapter:   UNDER TEST
D1 local binding:                NOT YET RUNTIME-PROVEN
Durable Object local binding:    NOT YET RUNTIME-PROVEN
Hibernation WebSocket:           NOT YET RUNTIME-PROVEN
generated Wrangler merge:        TO BE VERIFIED BY BUILD
Cloudflare remote resources:     NOT AUTHORIZED
adapter migration:               NOT AUTHORIZED
```

`docs/BUSINESS_PLUS_LIVE_ADAPTER_SPIKE.md` v1.0 defines the exact local-only acceptance
criteria. A successful static build alone is insufficient; the explicit Wrangler local
runtime probe must pass before the adapter is approved.

## BUSINESS PLUS native AdminAuth + live E2E consolidated candidate — 11 August 2026

Repository snapshot verified for this gate:

```text
repository: AdamDariOfficial/rito-studio-BUSINESS-PLUS
branch: feat/rito-business-plus-complete
HEAD: eba1a2a91fd3a531b4a4667d038b631758d0a664
staged: 0
working tree: accumulated BUSINESS PLUS/live candidate, intentionally uncommitted
git diff --check at intake: PASS
```

Operator-reported staging evidence entering this gate:

```text
D1 EU rito-studio-business-plus-staging: CREATED
migration 0001/schema: previously PASS
Worker staging: DEPLOYED
ConsultationRealtimeHub binding: PRESENT
public host: rito-studio-business-plus-staging.tretnix.com
admin host: admin.rito-studio-business-plus-staging.tretnix.com
legacy Access policy/log: allowed / Access granted
RITO legacy Access boundary: FAILED (Accesso non autorizzato)
public /consulenza: FAILED with generic send error
submit -> D1 -> realtime -> admin E2E: NOT CERTIFIED
production: NOT AUTHORIZED
```

The remote items above are operator evidence and require direct revalidation after this
consolidated staging deploy.

Current candidate architecture/code:

```text
public submit:                 POST /api/consultations
persistence:                   D1 prepared-statement repository
migrations:                    0001 consultation_requests + 0002 native_admin_auth
idempotency:                   submission_key UNIQUE
durable success:               D1 commit; realtime publish best-effort after commit
admin identity:                native RITO AdminAuth / D1 user+session
password storage:              PBKDF2-SHA256 600k + unique salt + HMAC pepper secret
session:                       random opaque token; only SHA-256 hash in D1
cookie:                        __Host-, HttpOnly, Secure, SameSite=Strict, Path=/
CSRF:                          TanStack same-origin + session-bound HMAC on mutations
login abuse:                   IP + account rate limiting, dummy password work
admin authorization:           every read/mutation server-side
realtime handshake:            exact same-origin + native session
realtime socket auth:          idle/absolute validity + D1 revocation/status before delivery
realtime:                      Durable Object Hibernation WebSocket
periodic polling:              NONE
staging config:                public + admin host, D1, two rate limiters, no Access vars
custom live build adapter:     UNCHANGED Lovable/Nitro
```

Cloudflare Access is superseded as the client-visible/application authentication boundary by
`BW-DEC-065`. Optional Tretnix technical Access protection may exist only separately.

Still pending direct evidence:

```text
local consolidated demo/live build after package application
staging migration 0002
Worker auth secrets
staging admin seed
new staging deploy
RITO native login browser QA
phone submit -> D1 -> PC/tablet realtime
reconnect/concurrency/logout/rate-limit/CSRF/security QA
production: NOT AUTHORIZED
```

`docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v1.1 defines the manual staging gate. Apply/Validate
never authorize or perform remote migration/deploy or Git write actions.


## Native AdminAuth staging runtime correction — 12 August 2026

Direct operator evidence after the v1.0.1 consolidated gate:

```text
local Apply:                         PASS
local Validate:                      PASS
demo build:                          PASS
live build:                          PASS
D1 UUID:                             31659140-3e05-41bb-be23-1d85ab669cb2
migration 0002_native_admin_auth:    APPLIED
remaining D1 migrations:             NONE
admin_users/admin_sessions schema:   VERIFIED
admin@gmail.com active row:           VERIFIED
password scheme:                     pbkdf2-sha256-hmac-pepper-v1 / 600000
ADMIN_AUTH_PEPPER:                   PRESENT
ADMIN_AUTH_CSRF_SECRET:              PRESENT
Access application on admin host:    REMOVED
/admin/login direct native UX:        PASS
Worker version before correction:    a5af6e82-e309-449f-b783-d90ac2cef00b
correct-password native login:       FAIL — generic temporary-unavailable fallback
wrong-password native login:         FAIL — same generic fallback
last_login_at after attempts:         NULL
admin_sessions after attempts:        0
Worker tail outcome:                  ok / HTTP 200 / no exception/log / ~1 ms CPU
production:                           NOT AUTHORIZED
```

Confirmed interpretation: the client-facing Access double-auth issue is closed. The native
login runtime failure occurs before D1 session creation and before the normal invalid-credential
result. `BW-DEC-066` defines the targeted correction: canonical `cloudflare:workers` binding
access for TanStack server functions, preserving D1, Durable Objects, rate limiting, password
hashing, server sessions and CSRF.

Pending after the corrective CCP:

```text
Apply/Validate on canonical Windows working tree
staging deploy of corrected Worker
wrong-password generic rejection
correct-password login + D1 session + last_login_at
logout/revocation/CSRF/WebSocket authorization
phone /consulenza -> D1 -> realtime admin -> reconnect
production: NOT AUTHORIZED
```

### AdminAuth binding build integration follow-up — 12 August 2026

Direct Windows validation evidence for `ADMIN_AUTH_BINDING_BOUNDARY_CCP v1.0.2`:

```text
frozen install:                     PASS
typecheck:                          PASS
lint:                               PASS — 0 errors / 6 inherited warnings
native AdminAuth test:              PASS
demo build:                         FAIL — unresolved cloudflare:workers
live build:                         FAIL — unresolved cloudflare:workers
staging config shape:               NOT GENERATED because build failed
static security/schema shape:       PASS
repository checksums:               PASS
git diff/untracked whitespace:      PASS
staged paths:                       0
final working tree scope:           PASS
remote deploy from v1.0.2:          NOT PERFORMED
production:                         NOT AUTHORIZED
```

The failure is a build-integration issue, not evidence against the runtime binding decision:
Vite 8/Rolldown reports that `cloudflare:workers` must be externalized when the current
Lovable/Nitro adapter builds without `@cloudflare/vite-plugin`. The targeted follow-up adds
only that externalization contract plus documentation/checksum updates. No D1 migration,
admin reprovisioning, secret rotation or remote deploy is part of Apply/Validate.

Pending gate:

```text
Apply/Validate targeted build integration
demo build PASS
live build PASS
real staging config regenerated with D1 UUID 31659140-3e05-41bb-be23-1d85ab669cb2
one explicit corrective Worker deploy
wrong-password rejection
correct-password login + D1 session + last_login_at
logout/revocation/CSRF/WebSocket authorization
phone /consulenza -> D1 -> realtime admin -> reconnect
production: NOT AUTHORIZED
```

## Native AdminAuth password-verification remediation candidate — 13 August 2026

Confirmed repository intake:

```text
origin:  https://github.com/AdamDariOfficial/rito-studio-BUSINESS-PLUS.git
branch:  feat/rito-business-plus-complete
HEAD:    eba1a2a91fd3a531b4a4667d038b631758d0a664
staged:  0
working tree: accumulated BUSINESS PLUS candidate preserved
```

Confirmed source defects corrected locally:

```text
password verifier exception collapse: false -> typed outcome
provisioning password trim: removed for RITO_ADMIN_PASSWORD only
password transport: exact opaque string from UI through schema/server/login/verifier
staging diagnostics: safe structured rito.admin_auth.verification event
pepper evidence: SHA-256 first 16 lowercase hex characters only
D1 password_iterations mapping: direct SQLite integer, no coercion added
```

Local evidence:

```text
frozen install:                  PASS — no changes
typecheck:                       PASS
lint:                            PASS — 0 errors / 6 inherited warnings
native AdminAuth focused test:   PASS
independent Node crypto oracle:  PASS
password whitespace regression: PASS
session hash + CSRF regression:  PASS
demo production build:          PASS
live production build:          PASS
route tree stability:            PASS
generated Worker/DO shape:       PASS
staging config preparation:      PASS — local generated artifact only
Wrangler 4.114.0 dry run:        PASS — no deploy
repository checksum manifest:    PASS — 21 entries
git diff/untracked whitespace:   PASS — 43 untracked paths checked
staged paths:                    0
production:                      NOT AUTHORIZED
```

This is a local remediation candidate, not proof that the staging incident is resolved. The next
and only remote gate is `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v1.4: deploy once, tail the safe
verification event, make one valid credential attempt, classify the boundary, then follow the
conditional `match`/`mismatch`/`invalid_record`/`crypto_error` branch. Staging remains pending until
a real login updates `last_login_at` and creates a native D1 session. No deployment, D1 write,
migration, credential rotation or production action was performed by this local pass.

## Native AdminAuth WebCrypto runtime compatibility remediation — 14 August 2026

Direct staging runtime evidence supplied after the previous remediation deploy:

```text
Worker version:                    f4ec4a05-e579-4704-a817-4dea622fa578
valid staging credential:          reached password diagnostic boundary
userFound / userActive:            true / true
schemeSupported:                   true
iterationsRuntimeType:             number
iterationsSupported:               true
encoded salt/hash lengths:         22 / 43
verificationOutcome:               crypto_error
cryptoErrorName:                   NotSupportedError
```

Confirmed boundary: D1 lookup, account status and all password-record shape checks pass; the
remaining incompatibility is inside the password WebCrypto path. The exact primitive was not
phase-instrumented by that deployment. The local remediation closes the relevant runtime path by
using explicit PBKDF2/HMAC algorithm objects, HMAC `sign` with sign-only keys, fixed 32-byte tag
validation and `crypto.subtle.timingSafeEqual` instead of `crypto.subtle.verify`. CSRF HMAC
verification uses the same sign-and-compare pattern while retaining its boolean contract.

Local consolidated evidence:

```text
frozen install:                       PASS — no changes
typecheck:                            PASS
lint:                                 PASS — 0 errors / 6 inherited warnings
native AdminAuth focused test:        PASS
independent Node PBKDF2/HMAC oracle:   PASS
match/mismatch/whitespace/record:      PASS
session token/CSRF/fingerprint:        PASS
timingSafeEqual regression:            PASS — both HMAC verification boundaries exercised
crypto.subtle.verify regression:       PASS — absent from both HMAC verification boundaries
demo production build:                 PASS
live production build:                 PASS
route tree stability:                  PASS
generated Worker/DO shape:              PASS
staging config preparation:             PASS — local generated artifact only
Wrangler 4.114.0 dry run:               PASS — no deploy
repository checksum manifest:           PASS — 21 entries
git diff/untracked whitespace:          PASS — 43 untracked paths checked
staged paths:                           0
new staging deploy:                     PENDING
production:                             NOT AUTHORIZED
```

No D1 schema/record/write, migration, password, pepper, CSRF secret, credential provisioning,
session/cookie protocol, rate limiting, WebSocket, Durable Object, public submit, Git staging or
remote Git/deploy operation was changed or performed.

## Native AdminAuth PBKDF2 workerd compatibility remediation — 16 August 2026

The subsequent staging Worker `3e52fb80-895b-43a3-8ff5-1b226961eab2` still returned
`crypto_error / NotSupportedError` for the valid staging credential after every pre-crypto
record check passed (`userFound`, `userActive`, scheme, numeric/approved iterations and encoded
salt/hash lengths 22/43). The confirmed boundary is workerd WebCrypto PBKDF2: its 100000-iteration
limit rejects the approved 600000 work factor before the HMAC comparison.

The local compatibility candidate changes only PBKDF2 execution from
`crypto.subtle.importKey`/`deriveBits` to `node:crypto` `pbkdf2Sync`. The exact password bytes,
`pbkdf2-sha256-hmac-pepper-v1`, SHA-256, 600000 iterations, 16-byte salt, 32-byte derived value
and HMAC-SHA-256 pepper tag remain unchanged. Password and CSRF HMAC verification retain
sign-only keys plus equal-length `crypto.subtle.timingSafeEqual` comparison.

Local consolidated evidence:

```text
frozen install:                         PASS — no changes
typecheck / focused test / lint:        PASS — lint 0 errors / 6 inherited warnings
fixed PBKDF2/HMAC oracle + record KAT:  PASS — byte-compatible at 600000
match/mismatch/whitespace/malformed:    PASS
session token/CSRF/fingerprint:         PASS
timingSafeEqual / no subtle.verify:     PASS
no WebCrypto PBKDF2 deriveBits:         PASS — source and generated Worker
local workerd node:crypto probe:        PASS — 600000 iterations / 32-byte output
demo build / live build:                PASS
route tree stability:                   PASS
generated Worker/DO/nodejs_compat:      PASS
staging config generation:              PASS — local artifact only
Wrangler 4.114.0 dry run:               PASS — no deploy
new staging deploy/real login:          PENDING
production:                             NOT AUTHORIZED
```

No dependency, Vite/Nitro adapter, D1 schema/record/write, password, pepper, credential,
session/cookie, CSRF protocol, rate limit, WebSocket, Durable Object, public submit, Git staging
or remote operation was changed. Runtime closure still requires the single staging redeploy and
one real valid-credential verification from the runbook.

## Native AdminAuth scrypt v2 local closure candidate — 16 August 2026

The latest staging Worker `cef1e128-2564-4372-b212-58a4e64600be` still returned
`crypto_error / NotSupportedError` after replacing WebCrypto PBKDF2 with `node:crypto`
`pbkdf2Sync(..., 600000, 32, "sha256")`. All lookup/record checks remained valid:
`userFound`, `userActive`, exact v1 scheme and numeric work factor, plus encoded salt/hash lengths
22/43. Current workerd source confirms that the Node `CryptoImpl::getPbkdf()` implementation also
calls `checkPbkdfLimits()` and inherits the default 100000-iteration ceiling. PBKDF2 v1 at the
approved 600000 strength is therefore incompatible with the target runtime and is replaced before
freeze; no 100000-iteration fallback is accepted.

The local candidate now uses only
`scrypt-n16384-r8-p5-hmac-sha256-pepper-v2`: N=16384, r=8, p=5, 32 MiB `maxmem`, CSPRNG
16-byte salt, 32-byte derived key and post-HMAC-SHA-256 pepper tag. `password_iterations` remains
the legacy D1 column but stores total work factor 655360; the domain exposes
`passwordWorkFactor`. Exact scheme + 655360 are mandatory, while N/r/p are fixed by the versioned
scheme. Existing PBKDF2 rows are `invalid_record` and are never reinterpreted.

Local consolidated evidence:

```text
frozen install:                         PASS — Bun 1.3.14, no changes
typecheck / focused test:               PASS
lint:                                   PASS — 0 errors / 6 inherited warnings
independent Node scrypt/HMAC oracle:    PASS — fixed KAT, exact N/r/p/maxmem
match/mismatch/whitespace/malformed:    PASS
legacy PBKDF2 / wrong work factor:      PASS — invalid_record
session token/CSRF/fingerprint:         PASS
safe diagnostics + dummy scrypt v2:    PASS
password/pepper plaintext leakage:     PASS — absent from SQL/log contract
no runtime/generated PBKDF2:            PASS
demo build / live build:                PASS
route tree stability:                   PASS — SHA-256 1c18057e0a18b4920db095c50ac6fb2015bcd73ed7bc40caa96712b20a897510
generated Worker/DO/nodejs_compat:      PASS
staging config generation:             PASS — local dummy resource IDs only
Wrangler 4.114.0 dry run:               PASS — no deploy
real local workerd HTTP scrypt probe:   PASS — 16384/8/5, 33554432, cost 655360, output 32
temporary probe cleanup:                PASS
staging reprovision script parse:       PASS — not executed
repository checksum manifest:           PASS — 21 entries
git diff/untracked whitespace:          PASS — 44 untracked paths checked
staged paths:                           0
staging reprovision/deploy/login:        PENDING
production:                             NOT AUTHORIZED
```

The existing D1 constraint `password_iterations >= 100000` accepts 655360, so no migration is
needed. `tools/admin/reprovision-staging-admin.ps1` prepares the only next remote gate: prompt for
a new exact password, create one new CSPRNG pepper, generate the matching v2 row, revoke old admin
sessions, verify D1 read-only, deploy the same pepper with the candidate, retain resume material
on partial failure, and then open exactly one tailed real-login gate. This local pass performed no
D1 read/write, migration, password/pepper/secret rotation, credential reprovision, deploy, login,
Git staging/commit/push/PR/merge or production action.

## Windows PowerShell 5.1 reprovision compatibility closure — 16 August 2026

The first real invocation of `tools/admin/reprovision-staging-admin.ps1` under Windows PowerShell
5.1 stopped before credential material creation because .NET Framework does not expose
`RandomNumberGenerator.Fill`. The consolidated audit also found other .NET Core-only calls in the
same script: `SHA256.HashData`, `Convert.ToHexString`, `ProcessStartInfo.ArgumentList` and the
two-argument `String.Contains`. No evidence indicated a D1 write, secret rotation or deploy.

The procedure is now hardened as one PS5.1-compatible, fail-closed unit:

```text
CSPRNG:                              RandomNumberGenerator.Create/GetBytes + finally Dispose
hash/hex:                            SHA256.Create/ComputeHash + BitConverter
child process:                       PS5.1 ProcessStartInfo Arguments/EnvironmentVariables
password semantics:                 exact opaque value; same demo password allowed; no trim/log
Git preflight:                       repo/origin/branch/HEAD exact; staged paths = 0
target preflight:                    exact Worker/D1 UUID/hosts/privacy/rate namespaces
SQL boundary:                        exact allowlisted upsert + session revocation; anti-leak
material encoding:                   UTF-8 without BOM
resume states:                       prepared -> d1_updated -> d1_verified -> deployed
resume integrity:                    exact targets + SHA-256 hashes + pepper fingerprint
partial write handling:              read-only classification recognizes the exact material row
production target:                   rejected by immutable target and argument allowlists
```

Direct local evidence on Windows PowerShell 5.1 Desktop `5.1.26100.9168`:

```text
PS5.1 parser:                         PASS
local preparation/compatibility mode: PASS
CSPRNG length/difference/disposal:    PASS — runtime path + structural finally check
generator + exact whitespace:         PASS
password/pepper/SQL anti-leak:        PASS
UTF-8 no-BOM material:                PASS
manifest/resume integrity:            PASS
staging allowlist:                     PASS
production target rejection:          PASS
frozen install:                        PASS — Bun 1.3.14, no changes
typecheck / focused test:              PASS
lint:                                  PASS — 0 errors / 6 inherited warnings
demo build / live build:               PASS
route tree stability:                  PASS — SHA-256 1c18057e0a18b4920db095c50ac6fb2015bcd73ed7bc40caa96712b20a897510
generated Worker/DO/nodejs_compat:      PASS
Wrangler 4.114.0 dry run:              PASS — no upload
remote D1/secret/deploy:               NOT EXECUTED
```

The generated local staging config was refreshed with the approved D1 UUID
`31659140-3e05-41bb-be23-1d85ab669cb2`, privacy version `2026-08-11-test`, namespaces 1001/1002
and the two approved custom hostnames; this is a local ignored artifact and performed no remote
operation. Native AdminAuth staging login, browser/security and complete E2E remain pending. The
only next remote command is recorded in `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v1.8 and requires
explicit authorization.

## Prepared-state ReadD1 native boundary correction — 16 August 2026

The first authorized reprovision reached and retained `prepared`, with pepper fingerprint
`2252b876c3f16c6c`, then stopped fail-closed on `Wrangler ReadD1 failed with exit code 1`.
Operator evidence from the same repository/machine subsequently confirmed `wrangler@4.114.0
whoami` and a manual remote D1 `--command` query both exit 0. The exact staging database remains:

```text
email_normalized:     admin@gmail.com
status:               active
password_scheme:      pbkdf2-sha256-hmac-pepper-v1
password_iterations:  600000
last_login_at:         null
```

Therefore no reprovision D1 write, session revocation, secret rotation or deploy occurred. The
existing prepared material was preserved and its manifest phase, exact staging targets, three
recorded file hashes, strict SQL contract and expected fingerprint all pass local validation.

Wrangler 4.114.0 source and the successful manual oracle confirm the exact cause: the script sent
its read-only SELECT with remote `--file`, which selects Wrangler's bulk-import boundary rather
than the row-returning query boundary. The corrected ReadD1 path sends the same allowlisted SQL as
one `--command` argument. D1 write remains file-based with `--yes`; deploy remains
`--secrets-file` based.

The common PS5.1 native wrapper now uses the call operator plus an argument array, an explicit
repository working directory, captured stdout/stderr and immediate `$LASTEXITCODE`. A controlled
`.cmd` child proves spaces, SQL quotes, a path containing spaces/ampersand, separate streams and
zero/non-zero exit codes without exposing the synthetic sensitive argument. A local `npx.cmd`
version probe passes through the same wrapper. Remote resume remains pending explicit approval;
no remote command was executed by this correction pass.

## Staging E2E closure pass — 16 August 2026

The controlled reprovision/deploy and real native login supplied before this pass are retained
as confirmed evidence. This pass independently resolved the active remote deployment and
exercised the current candidate without changing application code:

```text
deployment id:                    cb314f0e-c1a6-4645-9263-60d815c12f60
Worker version:                   ac4324b7-b5ce-40e8-af55-dfad1c1a8a35 at 100%
created:                          2026-08-16T12:39:01.878Z
compatibility:                    2026-07-29 + nodejs_compat
D1:                               31659140-3e05-41bb-be23-1d85ab669cb2 / EEUR primary
native session refresh/direct tab PASS
Back/Forward navigation:          PASS
wrong password/unknown account:   same generic rejection
login rate limit:                 temporary limit observed, then expired to generic rejection
logout/revocation:                PASS; D1 unrevoked 0 / revoked 1
revoked session reuse:            rejected to /admin/login
WebSocket valid/no-session/origin: valid Live; 403 without session; 403 wrong origin
reconnect/catch-up:               PASS
public submit -> D1:              PASS
idempotent replay:                same id and one canonical row
admin status/note/edit/delete:     PASS with D1 persistence and cross-tab realtime
concurrent stale write:           rejected and resynchronized
application source change:        NONE
production:                       NOT TOUCHED
```

The retained synthetic request is `a692d31a-d4dd-43cf-ac58-8b5220caedcb`, created at
`2026-08-16T13:09:12.377Z`; after controlled admin operations it is version 5 / `booked`.
Original answers and main service remained unchanged. The dedicated delete request was removed
and D1 reported zero rows for its id.

Residual evidence remains explicit: runtime cookie attribute inspection, valid-session negative
CSRF variants, rejection of an already-open revoked WebSocket on a later publish, a new valid
login after logout, working mobile/tablet viewport emulation, reduced-motion runtime emulation
and a physical phone + PC/tablet matrix are `PENDING`/`MANUAL`. The candidate is therefore not
yet classified as production ready; final freeze readiness remains subject to those human gates.

## Final CSRF freeze gate — 17 August 2026

This record supersedes the residual-gate paragraph above. A fresh native session was created
after logout/relogin and used without exposing any password, cookie value, session token, CSRF
token or server secret.

```text
reversible control mutation:                    PASS — accepted and restored
missing CSRF / valid auth and Origin:           REJECTED — schema validation; no mutation
plausible invalid CSRF / valid auth and Origin: REJECTED — unauthorized admin request; no mutation
valid auth and CSRF / wrong Origin:             REJECTED — HTTP 403 middleware; no mutation
revoked session / previous CSRF and Origin:     REJECTED — unauthorized admin access; no mutation
post-probe request baseline:                    new / version 3
runtime cookie attributes:                      CONFIRMED PASS
revoked already-open WebSocket later publish:  CONFIRMED PASS
new valid login after logout:                   CONFIRMED PASS
responsive QA at 390 px and 768 px:             CONFIRMED PASS
prefers-reduced-motion runtime:                  CONFIRMED PASS
physical phone + PC/tablet E2E:                 CONFIRMED PASS
public submit limiter saturation:               CONFIRMED PASS
```

The application-level rejection cases used serialized server-function envelopes and therefore
returned `HTTP 200`; wrong Origin failed earlier at the same-origin middleware with `HTTP 403`.
Direct inspection after each probe confirmed that no negative case changed the controlled D1
request. The accepted control was explicitly restored to its original operational status.

One non-sensitive read-only D1 query recorded the final authentication baseline:

```text
admin status:       active
password scheme:    scrypt-n16384-r8-p5-hmac-sha256-pepper-v2
work factor:        655360
last_login_at:      2026-08-17T10:51:11.907Z
active sessions:    3
revoked sessions:   1
```

No mandatory staging acceptance item remains open in `docs/TESTING.md` or
`docs/BUSINESS_PLUS_STAGING_RUNBOOK.md`. Verdict: `READY FOR HUMAN FINAL REVIEW / FREEZE`.
Production deployment, production data, production privacy approval and production readiness
remain separate, unauthorized gates.
