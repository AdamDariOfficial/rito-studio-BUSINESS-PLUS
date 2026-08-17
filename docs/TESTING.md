# RITO Studio — Testing and Verification

**Famiglia:** Beauty & Wellness
**Versione:** 1.9
**Stato:** matrice approvata; gli esiti dei pass sono registrati in `docs/STATUS.md`

## 1. Regola di evidenza

Non dichiarare superati typecheck, lint, test, build, browser check, accessibilità o deploy se non eseguiti.

Per ogni controllo registrare:

- comando o procedura;
- ambiente;
- data;
- risultato;
- errore;
- limite;
- artefatti prodotti.

## 2. Comandi

Eseguire soltanto gli script realmente presenti nel repository.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Adattare al package manager rilevato.

Se uno script non esiste:

```text
non disponibile
```

Non inventarlo.

## 3. Viewport obbligatori

- 360 px;
- 390 px;
- 430 px;
- 768 px;
- desktop rappresentativo;
- desktop ampio.

## 4. START — matrice funzionale

### Header

- logo;
- link anchor;
- CTA;
- sticky;
- drawer;
- `Escape`;
- focus return;
- body scroll lock.

### Hero

- nessun layout shift;
- testo leggibile;
- CTA raggiungibili;
- immagine con dimensioni dichiarate;
- nessun overflow.

### Trattamenti

- righe leggibili;
- eventuale espansione da tastiera;
- nessuna card tagliata;
- contenuti da configurazione.

### Gallery

- immagini responsive;
- alt;
- lazy loading;
- nessun salto di layout.

### CTA e contatti

- modalità demo non invia dati;
- placeholder chiaramente dimostrativi;
- link esterni non puntano a servizi reali non approvati;
- informazioni pratiche senza hover inutili.

### Legal e 404

- route dirette;
- refresh;
- link footer;
- pagina 404.

## 5. BUSINESS — matrice funzionale

### Routing

- tutte le route;
- direct URL;
- refresh;
- back;
- forward;
- route inesistente;
- query trattamento valida, non valida e fuori categoria;
- reset scroll immediato.

### Catalogo trattamenti

- filtri ripetuti per almeno 20 cambi, inclusi Back e Forward;
- categorie;
- righe interattive compatte;
- dati mancanti;
- prezzi opzionali;
- durata opzionale;
- dettaglio minimo senza sezioni vuote;
- dettaglio arricchito;
- dialog/sheet con Escape, focus trap/return e scroll interno;
- filtri su una sola riga a 360, 390 e 430 px, con scroll nativo e fade start/middle/end;
- posizione verticale invariata entro 2 px su open, close, Back e Forward;
- step precedente/successivo, ArrowLeft/ArrowRight e swipe di un solo trattamento;
- apertura iniziale push, navigazione interna e raccomandazioni con replace;
- raccomandazioni derivate dalla stessa categoria, escluso il corrente, massimo tre;
- apertura diretta tramite `categoria` e `trattamento`;
- `/trattamenti/:slug` risolve nella 404.

### Prenotazione telefonica

- tutte le CTA usano `site.contact.phoneHref`;
- desktop header, drawer mobile e fallback no-JS;
- hero, booking CTA, dettaglio trattamento, contatti e footer;
- label visibile e nome accessibile chiari;
- `/prenota` risolve nella 404.

### Moduli rimossi

- Team assente da home, navigazione, footer e route tree;
- `/team` risolve nella 404;
- nessun form o search parameter di prenotazione;
- nessuna richiesta di rete generata dalle CTA telefoniche.

### Gallery/lightbox

- click;
- tastiera;
- frecce;
- `Escape`;
- focus trap;
- focus return;
- `100dvh`;
- orientamento mobile.
- reveal individuale degli item e refresh sicuro dopo filtro;
- progresso drag proporzionale, soglia armata, reset sotto soglia e su cancel;
- gesto verticale senza progresso e rilascio armato di un solo step;
- rail home senza overflow verticale e con hint circolare 44 × 44 px;
- normale scroll rail senza redirect e gesto finale deliberato verso `/galleria`.

### FAQ

- tastiera;
- focus;
- aria;
- apertura/chiusura;
- reduced motion;
- nessun auto-scroll.
- reveal individuale con stagger massimo 240 ms, indipendente dall’accordion.

## 6. Accessibilità

- landmark;
- un `h1` principale per pagina;
- gerarchia heading;
- alt;
- label form;
- error summary quando necessario;
- focus visibile;
- focus order;
- contrasto;
- touch target;
- dialog;
- drawer;
- lightbox;
- reduced motion;
- zoom 200%;
- navigazione solo tastiera.

Obiettivo pratico: WCAG 2.2 AA per i flussi rilevanti.

## 7. Responsive

Verificare:

- nessun overflow orizzontale;
- nessun contenuto tagliato;
- CTA non sovrapposte;
- immagini non deformate;
- footer;
- drawer;
- testi lunghi;
- prezzi lunghi;
- nomi professionisti lunghi;
- safe area;
- tastiera virtuale nel booking;
- mobile editorial order: testo prima dell'immagine, salvo eccezioni documentate.

## 8. Motion

- hero;
- reveal viewport;
- replay;
- reduced motion;
- route change;
- drawer;
- FAQ;
- lightbox;
- performance;
- observer cleanup;
- contenuto visibile senza JavaScript, quando applicabile.

## 9. SEO pubblico

- title;
- description;
- canonical;
- Open Graph;
- favicon;
- robots;
- sitemap;
- 404;
- status code;
- URL leggibili;
- structured data appropriati;
- nessun rating inventato;
- dati demo non confondibili con attività reale.

## 10. Performance

- immagini dimensionate;
- formati moderni;
- lazy load;
- hero ottimizzata;
- font e pesi limitati;
- layout shift;
- richieste duplicate;
- bundle;
- console;
- network;
- errori runtime.

## 11. Sicurezza e privacy

### START

- nessun form reale in demo;
- nessun segreto client;
- nessun dato reale;
- nessun analytics senza consenso.

### BUSINESS request mode

- validazione server;
- anti-spam;
- rate limiting;
- consenso;
- minimizzazione dati;
- retention documentata;
- accesso minimo;
- log senza dati sensibili;
- nessuna service role nel client.

## 12. QA comparativa START ↔ BUSINESS

Confrontare affiancati:

- palette;
- tipografia;
- navbar;
- footer;
- pulsanti;
- spacing;
- hero;
- trattamento immagini;
- service list;
- reveal;
- hover;
- drawer;
- CTA;
- mobile;
- attribuzione Tretnix.

Test finale:

```text
Nascondendo nome e logo, START e BUSINESS devono sembrare parte della stessa famiglia.
```

## 13. Report richiesto

```md
## Verification report

- Commit:
- Ambiente:
- Comandi disponibili:
- Typecheck:
- Lint:
- Test:
- Build:
- Browser:
- Responsive:
- Accessibility:
- Reduced motion:
- Direct URL:
- Refresh:
- Back/forward:
- Console:
- Network:
- Limiti:
- Test manuali rimanenti:
```

## Premium actions + logo navigation — evidenza dell'8 agosto 2026

Candidate verificato:

```text
5e0ba1acd51dfca0274768ed155224820e81b9d9
```

Merge verificato su GitHub:

```text
PR #5
main: 276fd8e2d985bc7ea37442546800d14236009705
```

Scope esatto:

```text
src/components/Footer.tsx
src/components/StickyHeader.tsx
src/styles.css
```

Gate automatici eseguiti nel clone canonico prima del commit e push:

```text
bun install --frozen-lockfile -> exit 0, no changes
bun run lint                 -> exit 0, 0 errors, 6 inherited warnings
bun run build                -> exit 0, client + SSR + Nitro
git diff --check             -> exit 0
```

Il validator e il publish gate hanno inoltre confermato scope esatto, nessun drift di
`package.json`/`bun.lock`, staged set esatto, remote SHA uguale al candidate e working
tree finale pulito.

Acceptance manuale confermata dall'utente prima della pubblicazione:

- tutte le CTA rettangolari nere condividono un'unica interazione premium;
- il fondo resta inchiostro durante hover/focus/active;
- azioni bianche, outlined e controlli circolari restano distinti;
- logo navbar/footer sulla home porta in cima;
- logo navbar/footer da una route diversa torna alla home in cima.

Il deploy e il runtime di produzione del merge `276fd8e...` non sono stati verificati
in questo pass.

## 14. BUSINESS PLUS post-QA refinement checks

### Admin workspace

- desktop list/detail remain inside the viewport and scroll independently;
- mobile shows list first, then a dedicated detail view with an explicit return action;
- changing status/note still works;
- contact/preferred date/window/complementary services can be edited;
- original consultation answers and main service remain read-only;
- phone opens `tel:` and email opens `mailto:`;
- phone/email copy controls work and announce success accessibly;
- delete requires destructive confirmation, removes the request, and returns mobile to the list;
- demo profile exposes only a small bottom `Strumenti` link; no prominent demo banner remains.

### Consultation

- forward/back step motion is directional and disabled by reduced motion;
- mobile back/primary actions share one row and the primary action has visual priority;
- every selected service shows its price label in step 3, review and confirmation;
- total is exact when all prices are fixed and prefixed with `da` when any selected service has a starting price;
- `informativa privacy` links to `/privacy`;
- confirmation contains no demo-mode disclosure.

### Shared selects

- every native single-select uses the shared arrow treatment;
- right arrow inset matches the standard left content inset;
- no select text overlaps the arrow at 360 px or 200% zoom.


## 15. BUSINESS PLUS second refinement checks

### Consultation confirmation

- successful submit forces viewport top and moves programmatic focus to the success heading without smooth route scrolling;
- restrained success mark appears without confetti/gamification and disappears as motion when `prefers-reduced-motion` is active;
- confirmation repeats saved name, phone, optional email, preferred contact channel, preferred date when present and preferred time window;
- main service, every added service and the indicative total match the saved request;
- privacy link opens `/privacy` in a new tab and does not replace the in-progress consultation tab.

### Extended path

- recommendations remain capped at 2;
- `Aggiungi altri servizi` opens the bounded catalogue picker;
- suggested services are not duplicated in the manual picker;
- visitor can reach up to 6 selected services total and cannot exceed the bound;
- removing/adding services updates review, price total, submitted request and admin detail consistently;
- admin edit supports the same total-service bound while keeping the original main service read-only.

### Admin micro-UX

- note textarea is absent from the normal detail layout; note preview/action opens an accessible dialog with counter and save;
- saved note is reflected immediately in the compact preview;
- phone/email copy actions have no visible boxed-button treatment, remain keyboard focusable and keep accessible labels/live success feedback.

## 16. BUSINESS PLUS third refinement checks

### Consultation dialog + flow

- `Personalizza il percorso` resta interamente dentro la viewport a 360/390/430/768/1440 e 200% zoom;
- header e footer del dialog restano visibili mentre l'elenco servizi scorre verticalmente;
- il focus trap Radix, `Escape`, backdrop e return focus restano funzionanti;
- avanti/indietro riporta la viewport all'inizio del flow e il pannello attivo riceve focus programmatico senza smooth route scroll;
- il success status mostra check + `Richiesta ricevuta` sulla stessa riga e mantiene reduced-motion completo.

### Footer

- `Chiama per prenotare` non compare più nella colonna Info;
- telefono ed email restano disponibili nella colonna Contatti;
- attribuzione Tretnix resta invariata.

### Admin responsive motion/layout

- mobile open/close richiesta è breve, non blocca input e torna correttamente alla lista;
- reduced motion rende apertura/chiusura immediate;
- desktop request switch usa solo una breve dissolvenza e non rompe gli scroll indipendenti;
- sotto `sm`, ogni risposta originale appare sotto la relativa domanda senza compressione orizzontale;
- sotto `sm`, `Aggiungi/Modifica` nota va su una riga separata e resta un touch target adeguato.

### Demo tools

- desktop `lg+` presenta Stato corrente e Import/Export JSON in due colonne;
- mobile/tablet resta a colonna singola;
- a 1440 px il layout normale non richiede scroll verticale soltanto per raggiungere il secondo pannello;
- snapshot/reset/export/import mantengono comportamento e messaggi invariati.

## 17. BUSINESS PLUS live architecture implementation gates

These checks are **future implementation requirements**. This architecture-only change
does not claim they have passed.

### Adapter spike

- current Lovable/Nitro target exposes a server-only D1 binding, or failure evidence justifies a separate adapter migration;
- Durable Object provisioning/binding is proven;
- Hibernation WebSocket upgrade is proven;
- local development provides equivalent D1/DO bindings;
- existing SSR error boundary, routes and BUSINESS regressions remain intact.

### Persistence

- public submit writes D1 and survives browser/device restart;
- `submission_key` makes retried submit idempotent;
- server revalidates max-2 recommendations and max-6 selected services;
- stale admin `version` update is rejected rather than overwriting a newer edit;
- local/staging/production databases are isolated;
- staging/production Italian databases record EU jurisdiction.

### Realtime

- no timer/interval polling exists in admin production code;
- socket connects before snapshot reconciliation;
- events arriving during snapshot are queued/replayed without duplication;
- create/update/delete on one device appears on another connected admin without refresh;
- realtime payload contains no phone/email/name/answers;
- disconnect triggers backoff+jitter reconnect and one catch-up snapshot;
- sleep/network-change recovery converges to D1 state;
- reduced connectivity state is visible but not noisy.

### Auth/security

- `/admin/login` is the client-visible native RITO authentication route;
- Consultation Inbox reads reject missing/invalid native server sessions when called directly;
- state-changing admin operations additionally reject invalid/missing session-bound CSRF;
- realtime handshake requires exact same-origin plus the same native server session;
- staging/production use the `__Host-` Secure/HttpOnly/SameSite cookie contract;
- login rate limiting and non-enumerating credential messages are active;
- public submit remains public but rate limited and server validated;
- TanStack same-origin CSRF protection remains active;
- secrets never enter client bundles, logs or committed files;
- logs do not record PII bodies by default.

### Privacy/recovery

- persisted live requests include consent timestamp + privacy version;
- client retention period is documented before production;
- deterministic purge behavior is tested before accepting real data;
- D1 Time Travel recovery is exercised outside production;
- production restore/migration/deploy remain manual approval gates.

### Multi-device acceptance

At minimum test:

```text
phone visitor → submit
PC admin → receives request realtime
tablet admin → sees same state
PC changes status/note → tablet updates realtime
tablet edits request → PC updates realtime
PC deletes → tablet removes realtime
```

## 18. BUSINESS PLUS live adapter compatibility spike

Source: `docs/BUSINESS_PLUS_LIVE_ADAPTER_SPIKE.md` v1.0.

The spike is local-only and must never run `wrangler deploy` or use real consultation data.

Required gates:

- normal frozen install/build/typecheck/lint/scope validation remains green;
- generated `.output/server/wrangler.json` contains `SPIKE_DB`, `SPIKE_REALTIME`,
  `RealtimeAdapterSpikeHub` and `LIVE_ADAPTER_SPIKE` while preserving Nitro `main/assets`;
- built `.output/server/index.mjs` exports `RealtimeAdapterSpikeHub`;
- local Wrangler Worker binds only to loopback and uses package-local persistence;
- `/__tretnix/live-adapter-spike/health` confirms both bindings;
- D1 diagnostic creates/writes/reads its spike-only row;
- Hibernation WebSocket returns `ready`, receives `ping` and returns `pong`;
- `/`, `/consulenza` and `/admin` still return HTTP 200 SSR HTML in the same Worker;
- no Cloudflare login, provisioning, remote D1/DO resource or deploy occurs.

The original spike acceptance expected a final `PASS — PRESERVE` or
`FAIL — ROOT CAUSE REQUIRED`. The recorded local outcome was instead **inconclusive**:
the generated Wrangler merge/build gates passed and a bare Worker booted, while minimal
D1 and Durable Object diagnostics failed in the local `workerd` runtime independently of
Nitro. `BW-DEC-062` therefore supersedes local component runtime as the decisive adapter
gate; isolated remote staging is now authoritative. A local failure does not authorize a
tooling migration.

## 19. BUSINESS PLUS native AdminAuth + live backend consolidated checks

These checks apply to the candidate authorized by `BW-DEC-065`. Apply/Validate remain local
and do not authorize remote staging actions.

### Automated candidate validation

Require:

```text
frozen install
portfolio/demo production build
client-live production build
route tree includes /admin/login
TypeScript noEmit
ESLint 0 errors
native AdminAuth crypto/session test
D1 migrations 0001 + 0002 static/source checks
generated Durable Object binding/export checks
no active Cloudflare Access application auth code/vars
no obsolete REST/password live environment names
no interval polling in live admin
realtime event schema contains no PII
staging-config tool syntax/static checks
admin seed SQL generator test with test-only secret/password
git diff --check including untracked text
repository checksum verification
stage count = 0
```

A build does not prove remote Cloudflare behavior. Staging/browser/security results need
direct evidence.

### Native AdminAuth

Automated/static checks must prove:

```text
PBKDF2-HMAC-SHA-256 work factor = 600000
unique random salt changes equal-password hashes
wrong password rejected
wrong pepper rejected
session tokens are independently random
D1 representation uses token hash, not raw token
CSRF token validates only for its bound session token
__Host-rito_admin_session + HttpOnly + Secure + SameSite=Strict + Path=/
no Domain cookie attribute
```

Staging must additionally prove generic wrong-credential errors, login throttling, successful
login, session revocation on logout, disabled/expired/revoked rejection and no plaintext
password/pepper in D1/logs/browser storage.

### Public submit security and durable success

- only `POST /api/consultations` is accepted;
- JSON content type and 64 KiB bound are enforced;
- cross-site browser metadata/origin is rejected;
- Zod/catalogue semantics run server-side;
- stable UUID `submissionKey` is required;
- existing `submissionKey` resolves before another submit-rate token is consumed;
- internal D1/config/realtime exceptions never appear in public responses;
- logs do not include submission/contact payloads;
- rate key does not contain raw phone number;
- **after a successful D1 commit, realtime publish failure does not return a false public/admin failure**;
- reconnect/catch-up restores canonical D1 state after missed notification.

### Persistence/concurrency

- migration 0001 keeps `consultation_requests` and unique `submission_key`;
- migration 0002 creates `admin_users` and `admin_sessions`;
- `email_normalized` and `token_hash` are unique;
- update/edit/delete includes `expectedVersion`;
- stale version cannot overwrite/delete newer data;
- catalogue slugs are revalidated server-side.

### CSRF and server authorization

- admin reads without native session fail;
- admin mutations without native session fail;
- mutation with invalid/missing session-bound CSRF token fails;
- TanStack same-origin CSRF middleware remains configured in `src/start.ts`;
- client auth state never substitutes server authorization.

### Realtime

- Worker authorizes exact same-origin WebSocket upgrade with native session before DO fetch;
- `ConsultationRealtimeHub` uses `ctx.acceptWebSocket`;
- session validity metadata is attached and stale sockets close before later sends;
- event schema is exactly type/requestId/version/timestamp and carries no PII;
- connect happens before D1 snapshot reconciliation;
- events during snapshot are buffered/replayed;
- disconnect uses backoff+jitter and one catch-up snapshot;
- no `setInterval`/periodic fetch loop exists in live admin;
- D1 remains source of truth.

### Staging config

Generated staging config must:

```text
preserve Nitro main/assets
preserve ConsultationRealtimeHub binding/export
workers_dev=false
preview_urls=false
route public staging host
route admin staging host
bind only dedicated staging D1
set LIVE_BACKEND_ENV=staging
set privacy version
bind CONSULTATION_SUBMIT_RATE_LIMITER
bind ADMIN_LOGIN_RATE_LIMITER with a distinct namespace id
contain no ACCESS_TEAM_DOMAIN or ACCESS_AUD
contain no committed auth secrets
```

### Real staging E2E

Follow `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v1.2 and require direct evidence for:

```text
RITO /admin/login visible without Access interception
phone /consulenza success
exactly one D1 row
already-open PC admin realtime create
tablet convergence
admin update/edit/delete cross-device convergence
logout + session revocation
unauthorized server-function rejection
invalid CSRF rejection
cross-origin/unauthorized WebSocket rejection
forced reconnect + one-shot D1 catch-up
stale optimistic write rejection
no PII in WebSocket events
no periodic polling
```

Staging uses test data only. Production remains a separate privacy/security/deploy gate.

### Native session revocation regression

- login and open the realtime socket;
- revoke/logout or disable that admin session/user;
- without reconnecting the old socket, trigger a later non-PII consultation event;
- the already-open WebSocket is denied on the next event and closes with the auth expiry/revocation code;
- the event payload is not delivered to the revoked socket.


### Cloudflare binding propagation regression

The live candidate must not depend on a custom `AsyncLocalStorage` bridge to make Workers
bindings visible inside TanStack Start server functions. Static/source validation requires:

```text
cloudflare-env.server.ts imports env from cloudflare:workers
no runWithConsultationCloudflareEnv/requestEnv AsyncLocalStorage bridge
server.ts does not wrap TanStack handler.fetch in that bridge
login unexpected failures emit only safe stage/error metadata, never email/password/hash/secret
```

Staging regression:

1. wrong password reaches the explicit generic invalid-credential result;
2. correct password creates exactly one active server session and updates `last_login_at`;
3. no unexpected AdminAuth log is emitted for either normal credential outcome;
4. if an unexpected failure occurs, Worker logs identify the error class/message without PII or secrets.

Build regression for the current Lovable/Nitro adapter:

```text
vite.config.ts externalizes cloudflare:workers through vite.build.rolldownOptions.external
demo production build succeeds
live production build succeeds
generated .output/server/wrangler.json still contains Nitro main/assets
no @cloudflare/vite-plugin dependency is introduced by this targeted correction
```

A successful externalized build does not by itself prove runtime binding access; the native
login staging regression above remains mandatory.

## 20. Native AdminAuth password-verification remediation

The focused local harness must use fixed non-secret inputs and an independent `node:crypto`
oracle (`pbkdf2Sync`, `createHmac`, `createHash`) to prove:

```text
correct exact password -> match
wrong password -> mismatch
malformed base64url -> invalid_record
decoded salt not 16 bytes -> invalid_record
decoded HMAC tag not 32 bytes -> invalid_record
crypto/import failure -> crypto_error
leading/trailing password whitespace preserved
same trimmed core without whitespace -> mismatch
server-function login schema preserves password exactly
session token SHA-256 matches Node oracle
session-bound CSRF HMAC matches Node oracle
pepper fingerprint is exactly 16 lowercase SHA-256 hex characters
```

Static/source checks must also keep the generic public credential result, D1 integer mapping
without speculative coercion, safe staging log fields and the provisioning generator's opaque
`RITO_ADMIN_PASSWORD` read. Staging remains required to prove a real session row and
`last_login_at`; local PASS must not be reported as staging resolution.

## 21. Native AdminAuth WebCrypto runtime compatibility

The focused harness must additionally prove, with fixed non-secret inputs:

```text
PBKDF2 import uses { name: "PBKDF2" }
PBKDF2 derive uses explicit PBKDF2 + SHA-256 objects, 600000 iterations and BufferSource salt
HMAC import uses explicit HMAC + SHA-256 objects and only ["sign"] usage
password candidate tag is computed with HMAC sign
password expected/candidate tags are validated at 32 bytes before timingSafeEqual
CSRF expected tag is computed with HMAC sign
CSRF expected/candidate tags are validated at 32 bytes before timingSafeEqual
crypto.subtle.verify is absent from both HMAC verification boundaries
correct password, wrong password and CSRF cases exercise timingSafeEqual at runtime
```

The Node harness may provide a test-only adapter from Cloudflare's non-standard
`crypto.subtle.timingSafeEqual` extension to Node `crypto.timingSafeEqual`; production source must
call the Cloudflare API directly. Preserve `match`, `mismatch`, `invalid_record`, `crypto_error`
and the external boolean CSRF behavior. A local PASS still requires a new staging deploy and a
real valid-credential login before the runtime incident can be closed.

## 22. Native AdminAuth PBKDF2 workerd compatibility

This section supersedes only the WebCrypto PBKDF2 import/derive requirements in section 21;
all HMAC sign/timing-safe requirements remain active.

The focused harness and build gate must additionally prove:

```text
ADMIN_PASSWORD_ITERATIONS remains exactly 600000
PBKDF2 uses node:crypto pbkdf2Sync with exact password bytes, salt, 32 bytes and sha256
fixed password/salt/pepper output remains byte-compatible with the existing record oracle
correct password -> match; wrong password -> mismatch
leading/trailing password whitespace remains opaque and significant
malformed records retain invalid_record; unexpected derivation failures retain crypto_error
password and CSRF HMAC comparisons retain sign + 32-byte timingSafeEqual
crypto.subtle.verify remains absent from both HMAC verification boundaries
crypto.subtle.deriveBits PBKDF2 is absent from Native AdminAuth source and generated Worker
source and generated staging Wrangler configs contain nodejs_compat
generated Worker resolves the node:crypto import and retains the 600000 work factor
package dependencies remain unchanged; node:crypto is a runtime built-in
```

Run both portfolio/demo and client-live production builds through the existing Lovable/Nitro
adapter. Require stable `src/routeTree.gen.ts`, Nitro `main/assets`, the
`ConsultationRealtimeHub` binding/export, staging-config generation and a Wrangler 4.114.0
`--dry-run`. A local workerd probe may confirm that `pbkdf2Sync` accepts 600000 iterations and
returns 32 bytes, but only a new staging deploy plus a real login can close the remote incident.

## 23. Native AdminAuth scrypt v2 runtime compatibility

This section supersedes the password-KDF requirements in sections 20–22. Their session, CSRF,
HMAC sign/timing-safe, non-enumeration and safe-diagnostics requirements remain active.

The focused harness must prove with fixed non-secret inputs and an independent Node
`scryptSync` + `createHmac` oracle:

```text
scheme = scrypt-n16384-r8-p5-hmac-sha256-pepper-v2
N = 16384 / r = 8 / p = 5 / maxmem = 33554432
total work factor = 655360 <= workerd limit 1048576
salt = 16 random bytes; derived key = 32 bytes; HMAC tag = 32 bytes / 43-char base64url
generator and verifier are byte-compatible
correct password -> match; wrong password -> mismatch
leading/trailing whitespace remains exact and significant
malformed base64url, wrong salt/tag lengths and wrong work factor -> invalid_record
PBKDF2 v1/600000 -> invalid_record, never PBKDF2 100000 fallback
unexpected crypto failure -> crypto_error
dummy missing-user work uses the exact scrypt v2 scheme/work factor
session hash, CSRF sign/length/timingSafeEqual and pepper fingerprint remain unchanged
generator output contains no plaintext password or pepper and revokes prior sessions
diagnostic event contains only approved non-PII fields with workFactor naming
no WebCrypto or node:crypto PBKDF2 remains in runtime auth or generated Worker
no npm crypto/KDF dependency is added
```

Runtime compatibility requires more than a host Node script. Create a temporary Worker and
Wrangler config with explicit `nodejs_compat`, launch it through local `wrangler dev`/workerd,
make a real HTTP request, and require a JSON result proving exact N/r/p/maxmem, 32-byte output and
no `NotSupportedError`. Remove the temporary probe directory and stop the Worker afterward.

The consolidated gate also requires frozen install, typecheck, focused test, lint, demo/live
builds, stable route tree, generated Nitro main/assets and Durable Object binding/export,
staging-config generation, source/generated `nodejs_compat`, Wrangler dry-run, checksum manifest,
`git diff --check`, untracked-text whitespace validation and zero staged paths. None of these
local results authorize or certify staging. Staging closure requires the single fail-closed
reprovision/deploy in `docs/BUSINESS_PLUS_STAGING_RUNBOOK.md` v1.8 and exactly one real tailed
login; production remains unauthorized.

## 24. Windows PowerShell 5.1 staging reprovision compatibility

Before the remote gate, parse and execute the procedure with Windows PowerShell 5.1 Desktop. The
local mode must pass without invoking Wrangler:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\admin\reprovision-staging-admin.ps1 `
  -LocalValidation
```

Require direct or structural evidence for:

```text
PS5.1 parser accepts the full script
CSPRNG uses RandomNumberGenerator.Create/GetBytes and disposes in finally
two successive random outputs have the requested length and differ
SHA-256/hex, ProcessStartInfo and string comparison use .NET Framework-compatible APIs
no ConvertFrom-Json -AsHashtable, ternary, ??, &&/||, ForEach-Object -Parallel,
  $IsWindows, $PSStyle or other PS7-only construct remains
no case-insensitive Git/git helper name and no custom $Args/$args binding
password reaches the generator exactly, including leading/trailing whitespace
password and pepper are absent from output and generated SQL
generated SQL matches the exact two-statement admin upsert/session-revocation allowlist
SQL, secret, verification and manifest files are UTF-8 without BOM
resume phases and all material hashes/targets are recognized exactly
repo/origin/branch/HEAD/staged-path preflight passes
staging Worker/D1 UUID/hosts/privacy/rate namespaces are exact
a production target is rejected
local validation removes its synthetic material
no D1 read/write, secret rotation or deploy occurs
```

The native-command gate must additionally use the same wrapper as production Wrangler calls and
prove with a controlled `.cmd` child:

```text
argument with spaces remains one argument
SQL containing spaces and single quotes remains one exact argument
path containing spaces and an ampersand remains one exact argument
stdout and stderr are captured separately under PS5.1
exit code 0 and a chosen non-zero exit code are preserved
failure diagnostics include operation/exit code but no synthetic sensitive argument
npx.cmd itself executes through the wrapper with a local, non-remote version probe
ReadD1 uses --command, not remote --file ingestion
D1 write alone uses the allowlisted SQL file and --yes
deploy alone uses --secrets-file and never a raw secret argument
```

When a real resume directory is supplied to local validation, its existing manifest phase,
allowlisted targets, file hashes, SQL contract and expected pepper fingerprint must pass without
writing or deleting any file in that directory.

The operational command remains a separate explicit remote authorization. A local compatibility
PASS is not staging authentication, browser, security or E2E evidence.

## 25. Staging E2E closure evidence — 16 August 2026

Executed against active Worker version `ac4324b7-b5ce-40e8-af55-dfad1c1a8a35`:

```text
authenticated admin refresh/direct/new tab:               PASS
Back/Forward admin navigation:                             PASS
wrong password vs unknown account public response:        PASS — identical generic message
login limiter:                                             PASS — temporary message reached and expired
logout -> D1 revoked session -> protected route rejected: PASS
same-origin authenticated WebSocket:                      PASS
no-session same-origin WebSocket:                         PASS — 403
wrong-origin WebSocket:                                   PASS — 403
reload/reconnect/one-shot D1 catch-up:                     PASS
new /consulenza submit:                                   PASS
semantic invalid submit:                                  PASS — HTTP 400
exact D1 row/privacy version:                             PASS
same submission key replay:                              PASS — same id, no duplicate row
cross-tab realtime create/update/delete:                  PASS
status + note + operational edit persistence:             PASS
explicit destructive delete + D1 absence:                 PASS
stale two-admin mutation:                                 PASS — loser resynchronized
desktop horizontal overflow:                             PASS on observed 1920 px viewport
console warnings/errors on submitted consultation:        PASS — none observed
```

Final runtime closure completed on 17 August 2026 with a fresh native session after
logout/relogin. No cookie, session token, CSRF token, password or secret was printed or stored.

```text
reversible control mutation:                                  PASS — accepted, then restored
missing CSRF + valid session/origin:                          PASS — rejected; D1 request unchanged
plausible invalid CSRF + valid session/origin:                PASS — rejected; D1 request unchanged
valid session/CSRF + wrong Origin:                            PASS — rejected 403; D1 request unchanged
revoked session + previous CSRF/origin context:               PASS — rejected; D1 request unchanged
runtime cookie attributes without exposing raw cookie:        CONFIRMED PASS
already-open WebSocket after revocation and later publish:     CONFIRMED PASS
new valid login after logout:                                 CONFIRMED PASS
390 px / 768 px responsive browser QA:                        CONFIRMED PASS
prefers-reduced-motion runtime emulation:                      CONFIRMED PASS
separate physical phone + PC/tablet E2E matrix:                CONFIRMED PASS
public submit limiter saturation:                             CONFIRMED PASS
```

The negative CSRF variants returned the application envelope where applicable (`HTTP 200` with
the mutation rejected); the same-origin middleware rejected the wrong-origin request directly
with `HTTP 403`. The controlled request ended in its original operational status `new` at version
3; every negative probe left that baseline unchanged.

Non-sensitive D1 baseline captured through one read-only dashboard query:

```text
admin status:       active
password scheme:    scrypt-n16384-r8-p5-hmac-sha256-pepper-v2
work factor:        655360
last_login_at:      2026-08-17T10:51:11.907Z
active sessions:    3
revoked sessions:   1
```

All mandatory staging acceptance items in this testing matrix and the staging runbook are now
recorded as passed. The candidate is `READY FOR HUMAN FINAL REVIEW / FREEZE`; this is not
production authorization or production-readiness certification.
