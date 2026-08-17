# RITO Studio — Decision Log

**Famiglia:** Beauty & Wellness
**Versione:** 2.2
**Stato:** decisioni approvate e aggiornate al 16 agosto 2026

## BW-DEC-001 — Concept portfolio

**Decisione:** usare `RITO Studio` come concept dimostrativo Beauty & Wellness.

**Motivo:** il concetto di rituale funziona per hair, barber, beauty, nails e wellness senza dipendere da un'estetica rosa o medicale.

**Limite:** naming e dominio non verificati.

## BW-DEC-002 — Famiglia modulare

**Decisione:** condividere architettura, qualità tecnica e logica di conversione, non un'estetica identica per ogni cliente.

## BW-DEC-003 — START one-page

**Decisione:** START è un sito one-page con privacy, cookie e 404. Porta verso telefono, WhatsApp o provider esterno. Non include backend o booking nativo.

## BW-DEC-004 — BUSINESS multipagina

**Decisione:** BUSINESS deriva dallo START canonico e aggiunge catalogo, dettagli trattamento, studio, team, gallery, FAQ, contatti e prenotazione configurabile.

## BW-DEC-005 — Booking adapter

**Decisione:** supportare `external`, `whatsapp`, `request` e `demo`, senza accoppiare il prodotto a un solo provider.

## BW-DEC-006 — Nessun gestionale nella prima settimana

**Decisione:** clienti, agenda live, pagamenti, fidelity e admin restano fuori da START e BUSINESS v1.

**Motivo:** mantenere il deliverable realistico, verificabile e commercialmente chiaro.

## BW-DEC-007 — Identità RITO

**Decisione:** palette porcellana/inchiostro/borgogna, Newsreader + Manrope, composizione asimmetrica, fotografia tattile, card ridotte al minimo.

## BW-DEC-008 — Nessun cursore custom

**Decisione:** non introdurre cursori personalizzati nella baseline.

**Motivo:** evitare gimmick, regressioni e problemi di accessibilità.

## BW-DEC-009 — Nessun contenuto inventato

**Decisione:** vietare recensioni, metriche, certificazioni, risultati e attività reali inventate.

## BW-DEC-010 — Demo senza invio dati

**Decisione:** la demo portfolio non trasmette dati personali e dichiara chiaramente il proprio stato dimostrativo.

## BW-DEC-011 — Informazioni pratiche statiche

**Decisione:** orari, indirizzo e contatti non ricevono effetti hover decorativi. Restano semplici, leggibili e accessibili.

## BW-DEC-012 — START prima di BUSINESS

**Decisione:** BUSINESS può iniziare soltanto dopo detector, critique, QA e freeze dello START.

## BW-DEC-013 — Fonte canonica per pattern

**Decisione:** il commit START congelato diventa fonte visuale del concept; i pattern tecnici possono essere corretti prima dell'estrazione e registrati singolarmente.

## BW-DEC-014 — Attribuzione Tretnix

**Decisione:** ogni versione include nel footer:

> Progettato e sviluppato da Tretnix

collegato a `https://tretnix.com`.

## BW-DEC-015 — Gate pre-abbonamenti

**Decisione:** fino all'attivazione manuale degli abbonamenti e a un nuovo comando esplicito, la famiglia resta in preparazione offline. Non creare progetti Lovable, non consumare crediti e non modificare repository remoti.

## BW-DEC-016 — Modularità dei sottosettori verticali

**Decisione:** RITO Studio è un concept portfolio multi-service. Ogni cliente reale riceve soltanto categorie e moduli pertinenti. La famiglia tecnica non obbliga a offrire Hair, Skin, Nails e Wellness insieme.

## BW-DEC-017 — Asset prima del polish

**Decisione:** definire shot list, ratio, diritti e qualità degli asset prima di spendere iterazioni Lovable sul polish fotografico.

## BW-DEC-018 — Prezzo separato dalla specifica prodotto

**Decisione:** la famiglia definisce scope, deliverable, esclusioni e add-on, ma il prezzo viene stabilito dalla politica commerciale Tretnix e dal progetto reale.

## BW-DEC-019 — V1 conservata ma rifiutata visivamente

**Decisione:** conservare la prima implementazione Lovable al commit `47658ae52f0e7585dc887226e90014038e9c63ae` come prototipo tecnico recuperabile, ma non usarla come baseline visuale approvata.

**Motivo:** la direzione fotografica, la hero e il ritmo editoriale non raggiungevano il livello richiesto per RITO Studio START.

## BW-DEC-020 — Una sola generazione V2 indipendente

**Decisione:** autorizzare una seconda e ultima generazione Lovable dalla baseline pre-visuale ripristinata, senza riutilizzare la V1 come riferimento.

**Evidenza:** la V2 candidata è registrata al commit `32fa4d534582be6c08c1303c879d17b7f763a4fd`.

**Limite:** nessuna terza generazione Lovable è autorizzata senza una nuova decisione esplicita.

## BW-DEC-021 — V2 candidata, non baseline congelata

**Decisione:** trattare la V2 come candidata tecnica e di art direction, non come START approvato o congelato.

**Motivo:** la struttura è più coerente della V1, ma fotografia definitiva, copy reconciliation, Impeccable, QA browser e audit restano pendenti.

## BW-DEC-022 — Baseline tecnica prima di Impeccable

**Decisione:** prima dell'audit Impeccable stabilizzare line ending, lint, focus return, focusabilità del drawer chiuso e route tree generata tramite una modifica controllata separata.

**Limite:** questo intervento non autorizza redesign, sostituzione degli asset, deploy o modifiche BUSINESS.

## BW-DEC-023 — Redesign Impeccable consentito entro lo scope START

**Decisione:** dopo la stabilizzazione tecnica, Impeccable può proporre e applicare un redesign sostanziale della UI quando supportato da finding approvati.

**Vincoli da preservare:** scope START, route, copy canonico, palette porcellana/inchiostro/borgogna, accent `#6A3F4B`, Newsreader + Manrope, accessibilità, mobile-first, demo integrity, assenza di backend e attribuzione Tretnix.

**Metodo:** detector e critique iniziano in sola lettura; nessun finding viene applicato automaticamente.

## BW-DEC-024 — Candidato START pre-freeze approvato per la chiusura controllata

**Decisione:** il candidato presente su `fix/rito-start-pre-freeze-polish`, derivato da
`main@cfc3edd965b5fa3d59fe64a0c04259d75c5c4cb1`, è la baseline funzionale e visuale
approvata per il gate di staging dopo la riconciliazione documentale.

**Evidenza:** applicazione e validazione automatica `RitoStartPreFreezePolish v1.9.0`,
revisione completa del diff e browser QA finale confermato il 3 agosto 2026.

**Limite:** questa decisione non equivale a commit, merge, deploy, approvazione definitiva
o freeze. Tali gate restano separati.

## BW-DEC-025 — Prenotazione START tramite contatto telefonico diretto

**Decisione:** RITO Studio START usa CTA `tel:` dirette. Il precedente dialog dimostrativo
e la proprietà `site.booking.demoFeedback` sono rimossi.

**Limite:** è una configurazione del concept START e non riduce le modalità supportate
dalla famiglia per progetti successivi.

## BW-DEC-026 — Integrità demo con presentazione pubblica client-like

**Decisione:** la home può presentarsi come un sito commerciale curato e non deve mostrare
un avviso demo prominente nel footer, purché restino contemporaneamente:

- email `.example` e numero telefonico non operativo;
- `noindex, follow`;
- nessun backend, form, account, pagamento o invio dati;
- nessun dato strutturato `LocalBusiness` o altra rappresentazione commerciale pubblica;
- disclosure esplicita nelle route Privacy e Cookie;
- obbligo di sostituzione e revisione prima dell'uso per un cliente reale.

**Chiarimento:** BW-DEC-010 resta valido per l'assenza di invio dati; cambia soltanto il
posizionamento della disclosure.

## BW-DEC-027 — Listino premium specifico del concept START

**Decisione:** RITO Studio START mostra un listino dimostrativo configurato con prezzi fissi
e prezzi “da”, inclusa una nota che richiede di concordare eventuali variazioni durante la
consulenza.

**Limite:** questi importi sono fixture editoriali del solo concept RITO Studio START. Non
sono prezzi di mercato verificati, non sono default della famiglia Beauty & Wellness e non
autorizzano listini inventati nei progetti cliente.

**Precedenza:** questa eccezione sostituisce, per il solo candidato START, il divieto di
mostrare prezzi fissi del template espresso in BW-DEC-018 e nella definizione prodotto.

## BW-DEC-028 — Mappa di area attivabile su scelta esplicita

**Decisione:** la sezione contatti può offrire una mappa Google della sola area generale
“Prato della Valle, Padova”, caricata esclusivamente dopo azione esplicita dell'utente, con
link esterno disponibile anche senza JavaScript.

**Vincoli:** nessun indirizzo commerciale esatto, nessun marker attribuito a RITO Studio,
nessuna richiesta Google prima dell'attivazione e nessuna affermazione che il concept sia
un'attività reale.

## BW-DEC-029 — Architettura one-page semplificata

**Decisione:** rimuovere `IntroStatement` e `MethodStrip`; integrare l'anchor `#metodo` e il
messaggio metodologico in `RitualFeature`.

**Ordine finale:** `StickyHeader`, `Hero`, `EditorialServiceList`, `RitualFeature`,
`StudioEditorial`, `GalleryRail`, `BookingCTA`, `PracticalInfo`, `Footer`.

**Motivo:** ridurre ridondanza e migliorare ritmo, densità e continuità editoriale senza
ridurre le informazioni essenziali.

## BW-DEC-030 — Indicatore animato della gallery mobile

**Decisione:** usare una sola pill con freccia animata al centro-destra della gallery mobile
come affordance di scroll orizzontale. La pill scompare a fine rail e ricompare tornando
indietro.

**Vincoli:** nessun autoplay, nessun controllo carousel, nessuna intercettazione degli input,
animazione disabilitata con `prefers-reduced-motion` e fallback comprensibile senza
JavaScript.

**Precedenza:** è un'eccezione stretta al divieto generale di loop decorativi; l'animazione
ha una funzione di orientamento e resta visibile soltanto mentre esiste contenuto ulteriore.

## BW-DEC-031 — Navigazione delle policy e skip link

**Decisione:** Privacy e Cookie riutilizzano la navbar START ma non mostrano skip link. La
home conserva invece lo skip link “Vai ai trattamenti” verso `#trattamenti`.

**Vincoli:** route dirette, refresh, Back/Forward, apertura in alto e focus visibile restano
obbligatori.

## BW-DEC-032 — Merge e QA di produzione qualificano il candidato finale START

**Decisione:** il merge commit
`fb0aee1773c6331d1c4dc8e4b702fabf7196a1d2`, creato dalla PR #5 a partire dal
candidato `003fa9ea9322e82cb2d79f78baf5bb29a798e6ae`, è la baseline applicativa
corrente da portare al gate finale di approvazione e freeze.

**Evidenza:** `main` e `origin/main` sono stati sincronizzati sul merge commit; il
production-origin QA automatico `RITO_START_PRODUCTION_ORIGIN_QA v1.0.3` ha
superato installazione frozen, lint, build client/SSR/Nitro, route, metadata,
robots, 404, favicon e disponibilità degli asset; l'utente ha inoltre confermato
la checklist browser sul dominio pubblico senza blocker o major.

**Limite:** il provider non espone in questa evidenza un'attestazione
crittografica dello SHA distribuito. L'allineamento è supportato da contenuti,
metadata, favicon, topologia dei chunk e comportamento pubblico. Questa
decisione non equivale ancora ad approvazione, freeze o tag.

## BW-DEC-033 — Identificazione non auto-referenziale del freeze finale

**Decisione:** il target definitivo del freeze sarà il merge commit della PR di
chiusura documentale, purché discenda da
`fb0aee1773c6331d1c4dc8e4b702fabf7196a1d2` e il diff resti limitato ai file
documentali approvati.

Un file versionato non può contenere lo SHA del commit che contiene quel
medesimo file. Lo SHA finale non deve quindi essere incorporato tramite un
ulteriore commit che sposterebbe `main` oltre il target scelto.

**Fonte autorevole:** dopo il merge, un tag annotato approvato deve puntare al
merge commit verificato. Il messaggio del tag e i metadata GitHub registrano
SHA, approvazione e freeze.

**Gate:** sincronizzare `main`, verificare lo SHA risultante, ottenere
approvazione e autorizzazione al freeze, scegliere il nome del tag, creare e
verificare il tag, quindi autorizzarne separatamente il push.

## BW-DEC-034 — Contratto START → BUSINESS preparato ma inattivo

**Decisione:** introdurre `docs/START_BUSINESS_CONTRACT.md` come contratto di
eredità preparatorio. Il documento diventa operativo soltanto dopo il merge
della chiusura documentale, l'approvazione e il freeze dello START, la creazione
e verifica del tag annotato e una nuova autorizzazione esplicita per BUSINESS.

**Limite:** la presenza del contratto non autorizza la creazione della
repository BUSINESS, l'implementazione multipagina, backend, database,
autenticazione, booking nativo, deploy o consumo di crediti.

## BW-DEC-035 — START approvato e congelato tramite SHA completo

**Data:** 3 agosto 2026

**Decisione:** RITO Studio START è approvato e congelato sulla baseline:

```text
439efff0f14315310b9149cde0283633696a0eb0
```

L'utente ha esplicitamente rinunciato al tag annotato per ridurre il lavoro operativo.
Lo SHA Git completo resta l'identificatore immutabile e autorevole.

**Conseguenza:** per RITO Studio questa decisione sostituisce il requisito del tag in
BW-DEC-033 e nella versione preparatoria del contratto START → BUSINESS.

## BW-DEC-036 — Avvio di RITO Studio BUSINESS autorizzato

**Data:** 3 agosto 2026

**Decisione:** autorizzare RITO Studio BUSINESS come evoluzione multipagina della
baseline START `439efff0f14315310b9149cde0283633696a0eb0`.

**Vincoli:** BUSINESS preserva identità, componenti, responsive, accessibilità, motion,
demo integrity e attribuzione Tretnix. BUSINESS PLUS resta escluso.

**Limite:** l'autorizzazione del prodotto non autorizza automaticamente prompt Lovable,
crediti, stage, commit, push, deploy, backend o infrastruttura.

## BW-DEC-037 — Derivazione BUSINESS tramite remix Lovable

**Data:** 3 agosto 2026

**Decisione:** creare BUSINESS mediante remix del progetto Lovable START, collegare la
copia a una nuova repository GitHub e clonare quella repository in locale prima di
applicare modifiche controllate.

**Motivo:** il remix preserva il legame operativo Lovable e la cronologia START senza
creare manualmente una repository locale o remota scollegata dal progetto effettivo.

**Repository:** `AdamDariOfficial/rito-studio-BUSINESS`.

## BW-DEC-038 — Baseline remix verificata

**Data:** 3 agosto 2026

**Decisione:** usare come baseline operativa BUSINESS il commit:

```text
222c331db44b1775aa2f877634f3a0f3dfdfbe69
```

Il commit è due revisioni avanti rispetto allo START canonico e zero indietro. Il delta
complessivo è limitato a `package.json` e `bun.lock`, dove Lovable aggiorna e fissa
`@lovable.dev/vite-tanstack-config` a `2.8.5` con le corrispondenti dipendenze lockfile.

**Conseguenza:** questa variazione tecnica viene preservata. Non costituisce
implementazione multipagina né autorizza ulteriori dependency update.

## BW-DEC-039 — Bootstrap identità e documentazione prima dell'implementazione

**Data:** 3 agosto 2026

**Decisione:** prima di modificare l'applicazione, aggiornare esclusivamente:

- identità repository;
- stato e record di autorizzazione;
- contratto START → BUSINESS;
- decision log;
- Project Knowledge BUSINESS;
- prompt BUSINESS;
- manifest checksum.

Rimuovere i file Project Knowledge e prompt specifici di START dopo aver creato le
corrispondenti versioni BUSINESS.

**Esclusione:** nessuna route, componente, stile, asset, dipendenza, lockfile o file di
configurazione applicativa viene modificato in questa fase.

**Gate successivi:** validazione e review, staging, commit, push/PR e implementazione
multipagina restano autorizzazioni separate.

## BW-DEC-040 — Correzione post-review del bootstrap BUSINESS

**Data:** 3 agosto 2026

**Decisione:** registrare come completati Apply e Validate del package
`RITO_STUDIO_BUSINESS_IDENTITY_DOCS_BOOTSTRAP_CCP v1.1.2`, senza autorizzare lo
staging, e applicare una correzione documentale controllata prima del gate successivo.

La prima review manuale ha confermato baseline, branch, zero staged path e perimetro
generale, ma ha rilevato quattro problemi di evidenza e durabilità:

1. il report basato su `git diff` non includeva il contenuto dei due file BUSINESS
   untracked;
2. `AGENTS.md` e `README.md` contenevano stato transitorio della singola modifica;
3. il prompt Lovable non richiedeva merge documentale, sincronizzazione locale/remota e
   sincronizzazione Lovable prima dell'esecuzione;
4. il report esterno aveva encoding misto e non era adatto come evidenza finale.

**Correzione approvata:** usare il package `v1.2.0` su otto path documentali, mantenendo
l'intero working-tree limitato agli undici path già autorizzati. Il validator deve
produrre un report UTF-8 con patch tracked completa e contenuto integrale dei due file
untracked.

**Gate durevole per l'implementazione:** il prompt BUSINESS può essere eseguito soltanto
dopo merge della documentazione in `main`, sincronizzazione di `main` locale/remoto,
conferma della sincronizzazione Lovable, aggiornamento del Project Knowledge e nuova
autorizzazione esplicita per implementazione e crediti.

**Identità package:** `package.json.name` resta intenzionalmente
`tanstack_start_ts` in questa fase. `package.json` e `bun.lock` sono parte dello stato
tecnico gestito dal remix e una loro modifica richiede un task separato con motivazione
concreta.

**Esclusione:** la correzione non modifica codice applicativo, route, componenti, stili,
asset, dipendenze, lockfile o configurazione runtime e non autorizza staging, commit,
push, PR, merge, implementazione, pubblicazione o deploy.

## BW-DEC-041 — Workflow Lovable su branch e completamento SEO/tracking

**Data:** 4 agosto 2026

**Decisione:** la seconda review manuale del bootstrap BUSINESS non autorizza lo
staging e richiede il package correttivo `v1.2.2` sugli stessi otto path documentali.

**Workflow Lovable approvato:** dopo il merge della documentazione in `main`, la
sincronizzazione locale/remota e l'aggiornamento del Project Knowledge, Lovable deve
creare o selezionare `feat/rito-business-multipage` a partire dall'esatto `main`
unito. Una futura autorizzazione esplicita al pass di implementazione comprende i
commit automatici e la sincronizzazione GitHub prodotti da Lovable esclusivamente su
quel branch. Non comprende lavoro diretto su `main`, PR, merge, pubblicazione o deploy.

**SEO e misurazione BUSINESS:** la versione BUSINESS deve preparare:

- inventario SEO tipizzato per route;
- title, description, canonical, Open Graph e social image;
- indexability esplicita;
- capacità di sitemap attivabile soltanto per un lancio reale approvato;
- structured data appropriati e revisionati;
- tracking configurabile e subordinato al consenso.

Per il concept portfolio restano i default `noindex, follow`, sitemap disabilitata,
structured data commerciali disabilitati, tracking `enabled: false`, nessun provider e
nessuna richiesta, cookie o identificatore prima del consenso.

**Structured data consentiti:** soltanto dati accurati e non commerciali come
`WebSite`, `WebPage` o `BreadcrumbList` dopo review esplicita. Restano vietati dati
fittizi `LocalBusiness`, `Service`, `Offer`, indirizzi, orari commerciali, credenziali,
recensioni, rating e prenotazioni.

**Uniformità route escluse:** `/journal/:slug` è esclusa esplicitamente insieme a
`/journal`, `/gift-card`, `/account` e `/admin` dalla prima versione BUSINESS.

**Esclusione:** `v1.2.2` non modifica codice applicativo, route, componenti, stili,
asset, dipendenze, lockfile o configurazione runtime e non autorizza staging, commit
manuali, push manuale, PR, merge, implementazione, pubblicazione o deploy.

## BW-DEC-042 — Chiusura del bootstrap documentale BUSINESS

**Data:** 4 agosto 2026

**Decisione:** registrare come completati Apply e Validate del package `v1.2.2` e
considerare superata la review finale del contenuto identità/documentazione.

La review ha confermato:

- baseline START e BUSINESS corrette;
- esatto perimetro di undici path e zero staged path;
- frozen install, lint, build e `git diff --check` superati;
- workflow Lovable su branch dedicato coerente con i gate approvati;
- scope BUSINESS SEO, social image, structured data e tracking completo e sicuro per la
  demo;
- esclusioni route complete, incluso `/journal/:slug`;
- nessuna modifica applicativa, dipendenza o configurazione runtime.

**Chiusura autorizzata:** applicare `v1.2.3` esclusivamente a `CHECKSUMS.sha256`,
`docs/APPROVAL.md`, `docs/DECISIONS.md` e `docs/STATUS.md` per eliminare metadata
transitori e rendere il record durevole.

**Conseguenza:** dopo la validazione automatica di `v1.2.3`, il candidato completo di
undici path può entrare nel gate di staging, che richiede comunque una nuova
autorizzazione esplicita.

**Esclusione:** questa decisione non autorizza stage, commit, push, PR, merge, prompt
Lovable, consumo crediti, implementazione, pubblicazione o deploy.

## BW-DEC-043 — Implementazione BUSINESS locale con Cursor + Codex

**Data:** 4 agosto 2026

**Decisione:** sostituire, per il pass corrente, il gate di implementazione specifico
per Lovable con un unico pass locale completo eseguito da Cursor + Codex come solo
writer sul working tree BUSINESS canonico.

```text
branch: feat/rito-business-multipage
base: 9b7ff807f945f679216671577963fd713badb507
Lovable: sincronizzazione passiva del repository / preview opzionale
Project Knowledge Lovable: non richiesto e non aggiornato
Lovable Agent e prompt: non autorizzati
crediti Lovable intenzionali: non autorizzati
writer concorrenti: vietati
```

**Perimetro autorizzato:** modifiche locali a documentazione e sorgenti, implementazione
multipagina BUSINESS, validazione, remediation e report finale sul branch dedicato.

**Gate separati:** staging, commit, push, pull request, merge, pubblicazione, deploy,
domini e infrastruttura non sono autorizzati da questa decisione.

## BW-DEC-044 — Semplificazione base BUSINESS dopo browser review

**Data:** 4 agosto 2026

**Decisione:** semplificare il prodotto BUSINESS base sulla base della review browser
approvata dall’utente:

- rimuovere Team dalla home e dall’intero prodotto attivo;
- rimuovere `/team` dall’inventario route;
- rimuovere `/prenota`, il form e l’architettura booking adapter;
- collegare ogni CTA di prenotazione al numero telefonico centralizzato tramite `tel:`;
- preservare il catalogo e la route dettaglio trattamento riusabile;
- limitare i campi trattamento obbligatori a nome, slug, categoria, prezzo e descrizione
  breve, rendendo opzionale l’arricchimento;
- sostituire il catalogo completo in home con un teaser compatto delle quattro categorie;
- trasformare il blocco filosofia/metodo di `/studio` in un manifesto editoriale ad alta
  rilevanza visiva.

**Conseguenza:** `/team` e `/prenota` usano la 404 condivisa; Team resta soltanto un
possibile modulo futuro opzionale. L’adattamento base richiede principalmente la modifica
della configurazione sito e del catalogo trattamenti.

**Gate:** sono autorizzate esclusivamente modifiche locali, validazione e report finale
nel pass corrente. Stage, commit, amend, push, pull request, merge, uso di Lovable,
pubblicazione e deploy non sono autorizzati.

## BW-DEC-045 — Refinement finale UX, ritmo colore e interazioni trattamento

**Data:** 5 agosto 2026

**Decisione:** completare un unico pass locale di refinement sul candidato successivo a
`BW-DEC-044`, preservando identità START, palette, tipografia, dati centralizzati e
prenotazione telefonica.

Il pass stabilisce che:

- la CTA `Scopri tutti i trattamenti` chiude la griglia categorie ed è centrata nella
  relativa colonna;
- il ritmo home usa una scala `compact` / `standard` / `featured` e una sequenza
  intenzionale canvas, surface caldo e ancora ink, senza nuovi colori o gradienti;
- hero, categorie e link editoriali condividono la stessa freccia lineare, allineamento
  e movimento hover/focus;
- il dettaglio trattamento usa la query di `/trattamenti` e un dialog/sheet Radix
  accessibile; `/trattamenti/:slug` esce dall’inventario route attivo;
- le righe trattamento mobile restano editoriali ma compatte, con nome, durata quando
  disponibile, prezzo e freccia;
- la sparizione dopo cambi filtro era causata dal controller reveal, che osservava solo
  il mount iniziale e un frame successivo; un `MutationObserver` collega i nodi dinamici
  allo stesso `IntersectionObserver`, mentre le righe del catalogo dinamico non
  riavviano un reveal d’ingresso a ogni filtro;
- i titoli di sezione privilegiano 2–6 parole e spostano la nuance nel testo di supporto,
  salvo hero, legali e nomi trattamento;
- link, pulsanti, filtri, righe e controlli custom condividono pointer feedback, focus
  visibile e micro-interazioni basate sui token motion esistenti;
- la lightbox gallery resta step-based, senza autoplay o scroll libero, e aggiunge
  frecce tastiera, pulsanti, contatore, soglia drag e swipe di un solo step;
- `prefers-reduced-motion` rimuove trasformazioni e transizioni non essenziali senza
  nascondere contenuti.

**Gate:** il pass autorizza soltanto modifiche locali, validazione, browser QA e bundle
di evidenze. Non autorizza stage, amend, commit, push, pull request, merge, Lovable,
pubblicazione o deploy.

## BW-DEC-046 — Navigation, horizontal affordances and slider interaction refinement

**Data:** 6 agosto 2026

**Decisione:** completare un pass tecnico locale che preserva l’identità START e rifinisce
navigazione, overflow orizzontali, dialog trattamento e gesture gallery:

- `Home` è la prima destinazione della navigazione centralizzata e risulta attiva soltanto
  su `/`;
- il rail gallery home mantiene lo scroll orizzontale nativo, nasconde l’overflow verticale
  e usa un hint circolare da almeno 44 × 44 px;
- i filtri trattamento restano su una sola riga scrollabile e mostrano fade laterali derivati
  da `scrollLeft`, `scrollWidth` e `clientWidth` tramite `ResizeObserver`;
- le righe trattamento mantengono fondo trasparente e affidano il feedback alla freccia
  editoriale, al titolo e al focus visibile;
- il dialog query-driven conserva la posizione pagina, mantiene un solo ingresso history e
  consente step, tastiera, swipe e raccomandazioni derivate dalla categoria, con navigazioni
  interne `replace`;
- gallery e FAQ applicano reveal individuali con stagger massimo di 240 ms e aggiornamento
  sicuro dei contenuti filtrati;
- la lightbox espone una progressione drag con stato armato prima del singolo step;
- un gesto orizzontale aggiuntivo, iniziato al vero bordo finale del rail home, apre
  `/galleria` soltanto al rilascio oltre soglia; il link esplicito resta disponibile.

**Vincoli:** nessuna dipendenza, route slug trattamento, autoplay, scroll gallery libero,
campo manuale `relatedServices`, screenshot o artefatto QA viene introdotto. Il pass non
autorizza stage, commit, amend, push, pull request, merge, Lovable, pubblicazione o deploy.

## Decisione condivisa — Premium dark actions e navigazione del logo — 8 agosto 2026

**Decisione:** RITO Studio START e BUSINESS condividono due contratti UX.

1. Le azioni rettangolari con fondo inchiostro mantengono il fondo nero e usano un unico
   feedback premium: sweep luminoso molto discreto, lift massimo di 1 px, ombra contenuta
   e micro-compressione in active. L'hover è riservato ai dispositivi `pointer: fine`;
   `prefers-reduced-motion` elimina movimento e sweep.
2. Il logo in navbar e footer, quando l'utente è già sulla home, porta alla cima usando
   l'helper di scroll esistente; da una route diversa naviga a `/` con reset in cima.
   Lo stato history esistente viene preservato e Back/Forward non vengono bypassati.

**Esclusioni:** controlli circolari, azioni bianche/outlined, route, copy, dipendenze,
gallery, catalogo trattamenti e architettura one-page START non vengono modificati.

**Evidenza START:** candidate
`3cfb186c77c21218308cc3cd54e75248fafcd93a`, PR #8, merge
`125b20f2cd758e0e43e4408e4ea96b04c9eb7874`.

**Evidenza BUSINESS:** candidate
`5e0ba1acd51dfca0274768ed155224820e81b9d9`, PR #5, merge
`276fd8e2d985bc7ea37442546800d14236009705`.

**Limite:** questa decisione non prova un nuovo deploy di produzione e non sposta
automaticamente alcun freeze precedentemente dichiarato.

## BW-DEC-047 — Freeze finale START e BUSINESS

**Data:** 9 agosto 2026

**Decisione:** considerare congelati i prodotti RITO inferiori sulle baseline:

```text
START main:    34c13cd78255b7ac009533790329cada74ae9d8a
BUSINESS main: b95a63c6127d2bc1dd396d74b2dd25f87b952226
```

Lo sviluppo PLUS avviene esclusivamente nel repository BUSINESS PLUS.

## BW-DEC-048 — BUSINESS PLUS autorizzato dalla baseline BUSINESS congelata

**Data:** 9 agosto 2026

**Decisione:** autorizzare `RITO Studio BUSINESS PLUS` come derivazione separata di
BUSINESS `b95a63c6127d2bc1dd396d74b2dd25f87b952226`.

Repository/bootstrap verificato:

```text
AdamDariOfficial/rito-studio-BUSINESS-PLUS
eba1a2a91fd3a531b4a4667d038b631758d0a664
```

Il net remix delta rispetto al BUSINESS è limitato a `package.json` e `bun.lock`.

## BW-DEC-049 — PLUS come conversion layer riutilizzabile, non gestionale

**Data:** 9 agosto 2026

**Decisione:** BUSINESS PLUS aggiunge al BUSINESS congelato una consulenza guidata
semplice e una mini inbox delle richieste. Non include un CMS, CRM, agenda o gestionale.

La route pubblica nuova della baseline è `/consulenza`. Non esiste una route baseline
`/percorsi`: il percorso nasce come risultato sintetico della consulenza.

## BW-DEC-050 — Consulenza breve e recommendation rules configurabili

**Data:** 9 agosto 2026

**Decisione:** `/consulenza` usa massimo quattro step:

```text
servizio
2–4 domande rapide
servizio principale + massimo 2 complementari
contatto/review/submit
```

Le recommendation rules sono deterministiche, configurabili e basate su slug/opzioni
stabili. Nessuna dipendenza AI e nessun claim medicale.

## BW-DEC-051 — Mini admin limitata alle consulenze

**Data:** 9 agosto 2026

**Decisione:** BUSINESS PLUS può consegnare `/admin` esclusivamente come Consultation
Inbox con:

```text
lista
dettaglio
new / contacted / booked / archived
nota interna breve
filtri data/stato
```

Sono esclusi editor contenuti/immagini, CRM, calendario, pagamenti, dashboard generale,
staff e configurazioni profonde. Queste estensioni appartengono a CUSTOM.

## BW-DEC-052 — Demo locale distinta dalla inbox reale multi-device

**Data:** 9 agosto 2026

**Decisione:** il portfolio può usare memoria locale resettable e `/_demo/tools` per
snapshot/reset/export/import.

La memoria locale non può essere presentata come inbox reale del cliente, perché le
richieste inviate da altri dispositivi non sarebbero condivise. Una Consultation Inbox
live richiede un request store condiviso standardizzato e accesso admin minimo.

Il backend live resta strettamente limitato alle richieste di consulenza; ogni espansione
operativa sostanziale ricade in CUSTOM.

## BW-DEC-053 — Consultation Inbox operativa ma ancora limitata

**Data:** 10 agosto 2026

**Decisione:** estendere `BW-DEC-051` senza trasformare BUSINESS PLUS in CRM o agenda. `/admin` può ora:

```text
modificare contatto, canale, giorno/fascia preferita
modificare massimo due servizi complementari
eliminare definitivamente una richiesta con conferma esplicita
```

Il servizio principale e le risposte originali della consulenza restano immutabili e leggibili come evidenza della richiesta iniziale. Lo stato `archived` resta l'alternativa non distruttiva alla cancellazione.

In `client-live`, edit e delete sono autorizzati lato server dalla stessa sessione admin minima già definita; la demo locale non deve simulare sicurezza con password client-side.

## BW-DEC-054 — Refinement UX post-QA di admin e consulenza

**Data:** 10 agosto 2026

**Decisione:** adottare:

- admin master-detail con scroll indipendenti desktop e drill-in mobile;
- rimozione dei banner demo prominenti da `/admin` e dalla conferma `/consulenza`, mantenendo disclosure nelle route legali e `noindex, follow` secondo `BW-DEC-026`;
- piccolo link `Strumenti` in fondo all'admin solo nel profilo demo;
- telefono/email cliccabili e copiabili;
- select nativi con freccia e inset coerenti su tutto il sito;
- transizione direzionale tra gli step della consulenza, disattivata con reduced motion;
- azioni Indietro/Avanti sulla stessa riga mobile, con priorità visiva all'azione primaria;
- prezzi dei singoli servizi e totale indicativo durante percorso, review e conferma;
- link diretto a `/privacy` nel consenso.


## BW-DEC-055 — Percorso esteso ma ancora guidato

**Data:** 10 agosto 2026

**Decisione:** mantenere il recommendation layer deterministico a massimo due suggerimenti complementari, ma consentire al visitatore di aggiungere altri servizi esistenti dal catalogo dopo i suggerimenti. La richiesta resta limitata a massimo 6 servizi selezionati totali, incluso il servizio principale.

Il servizio principale resta immutabile dopo la consulenza; `/admin` può aggiornare i servizi aggiunti entro lo stesso limite. Il picker non è un carrello, non compone automaticamente un appuntamento, non introduce disponibilità live e non autorizza agenda/pagamenti/CRM.

Questa decisione aggiorna il limite di selezione di `BW-DEC-050` e `BW-DEC-053` senza modificare il limite di massimo due **raccomandazioni**.

## BW-DEC-056 — Conferma consulenza e micro-UX admin

**Data:** 10 agosto 2026

**Decisione:** il secondo refinement post-QA adotta:

- conferma richiesta con riepilogo dei dati effettivamente salvati: nome, telefono, email se presente, canale, giorno e fascia preferiti;
- ritorno immediato della viewport in cima e focus programmatico sul titolo di successo;
- microanimazione di successo editoriale con check + singolo ring discreto, senza coriandoli, particelle o gamification e con reduced-motion completo;
- copy privacy aperta in nuova scheda per non interrompere la consulenza in corso;
- domanda Hair `pace` riscritta come preferenza di completezza del percorso;
- nota interna admin ridotta a preview compatta con editor in dialog;
- copy telefono/email visivamente icon-only, pur mantenendo un elemento `button` semantico e accessibile.

Il refinement non modifica autenticazione, storage profile, route inventory o confini CUSTOM.

## BW-DEC-057 — Third post-QA interaction refinement

**Data:** 10 agosto 2026

**Decisione:** applicare un refinement UX mirato senza ampliare il perimetro BUSINESS PLUS:

- `Personalizza il percorso` mantiene header e footer del dialog fissi e rende scrollabile solo l'elenco servizi interno, con altezza vincolata alla viewport;
- nella conferma il check e `Richiesta ricevuta` formano un unico status orizzontale; anche la label può entrare con una microanimazione breve e non celebrativa;
- ogni cambio step della consulenza riporta la viewport all'inizio del flow e poi trasferisce il focus al pannello attivo senza smooth route scrolling;
- il footer pubblico rimuove la voce ridondante `Chiama per prenotare`; telefono ed email restano nei Contatti;
- `/admin` usa una breve transizione di ingresso/uscita nel drill-in mobile e una dissolvenza breve quando cambia il dettaglio desktop; `prefers-reduced-motion` rende il passaggio immediato;
- su mobile `Risposte originali` impila domanda e risposta; la CTA nota interna passa sotto il testo invece di comprimere la riga;
- `/_demo/tools` usa due colonne su desktop per Stato corrente e Import/Export JSON, mantenendo una colonna su mobile.

**Vincoli:** nessuna nuova dipendenza, route, backend, schema dati o funzione CRM. Le modifiche restano responsive, keyboard-safe e reduced-motion-safe. Stage, commit, push, PR, merge, deploy e live-store enablement restano gate separati.

## BW-DEC-058 — Live architecture BUSINESS PLUS riutilizzabile

**Data:** 11 agosto 2026

**Decisione:** il profilo reale BUSINESS PLUS usa come baseline tecnica:

```text
TanStack Start
Cloudflare Workers
Cloudflare D1
Durable Objects + Hibernation WebSockets
Cloudflare Access dietro un AdminAuth adapter
Zod
Workers Rate Limiting
Wrangler migrations
```

Il modello di riuso Tretnix predefinito è single-tenant per cliente: deployment, D1 e
coordinazione realtime isolati per cliente ma alimentati dallo stesso codice prodotto e
dalla stessa configurazione tipizzata. D1 è source of truth; il Durable Object coordina
soltanto realtime e connessioni.

Le API Cloudflare devono restare dietro repository/port/adapters, così un futuro passaggio
a PostgreSQL o altro provider non obbliga a riscrivere il dominio BUSINESS PLUS.

Nessun ORM è autorizzato nella v1 senza un motivo concreto.

## BW-DEC-059 — Consultation Inbox realtime senza polling

**Data:** 11 agosto 2026

**Decisione:** `/admin` non usa polling periodico. Mantiene una connessione WebSocket
autenticata e hibernatable verso un Durable Object per client/workspace.

Il protocollo client è:

```text
connect socket
→ ready
→ snapshot D1
→ replay eventi accodati durante lo snapshot
→ realtime
```

Dopo una disconnessione usa backoff + jitter, riconnessione e **un solo** catch-up
snapshot. Non esiste fallback a fetch ogni N secondi.

Gli eventi realtime non contengono PII; trasportano soltanto tipo evento, request id,
versione e timestamp. Le mutation persistono prima in D1 e solo dopo pubblicano la
notifica. La durabilità appartiene a D1, non al WebSocket.

## BW-DEC-060 — Gate infrastrutturale prima dell'implementazione live

**Data:** 11 agosto 2026

**Decisione:** il repository corrente usa `@lovable.dev/vite-tanstack-config` + Nitro
`cloudflare-module`, mentre la documentazione TanStack corrente indica
`@cloudflare/vite-plugin` + Wrangler per il percorso Cloudflare ufficiale.

Prima di modificare tooling o dominio è obbligatorio uno spike controllato che provi D1,
Durable Objects, WebSocket Hibernation e sviluppo locale con l'adapter attuale. Se
l'adapter corrente è sufficiente, va preservato. Se non lo è, l'eventuale migrazione al
plugin Cloudflare ufficiale è una modifica infrastrutturale separata, motivata e
validata; non è autorizzata per preferenza stilistica.

Creazione risorse, migrations, staging e production restano gate espliciti separati.

## BW-DEC-061 — Local adapter compatibility spike protocol

**Data:** 11 agosto 2026

**Decisione:** dopo la validazione della Live Architecture v1.0, il primo gate tecnico è
un compatibility spike locale sul build path esistente
`@lovable.dev/vite-tanstack-config 2.9.1` + Nitro `cloudflare-module`.

Lo spike deve provare insieme D1 read/write, Durable Object reachability, Hibernation
WebSocket e regressione SSR usando il Worker Nitro realmente buildato. Nitro deve inoltre
mergiare una configurazione Wrangler sorgente e includere l'export Durable Object tramite
`exports.cloudflare.ts`.

Il test usa soltanto risorse locali simulate, binding con prefisso `SPIKE_`, una D1 id
placeholder e Wrangler pinned; non può eseguire deploy, login Cloudflare, provisioning
remoto o migration reale.

Se lo spike passa, l'adapter corrente va preservato per il successivo gate di
implementazione live. Se fallisce per causa confermata dell'adapter, la migrazione al
Cloudflare Vite plugin diventa eleggibile ma richiede comunque una decisione e un CCP
infrastrutturale separati.

## BW-DEC-062 — Remote staging supersedes inconclusive local component runtime

**Data:** 11 agosto 2026

**Decisione:** il compatibility spike ha confermato build/merge/export del target
Lovable/Nitro, mentre il diagnostic Windows ha mostrato `Bare Worker PASS` ma failure
locali anche per D1 e Durable Objects minimali indipendenti da RITO/Nitro.

Questo risultato non dimostra un difetto dell'adapter e non autorizza una migrazione di
build tooling. Il gate di compatibilità determinante diventa un deployment **staging**
isolato su Cloudflare reale. Il local Wrangler component runtime resta utile ma non
bloccante finché il failure non è dimostrato specifico dell'applicazione.

## BW-DEC-063 — Live backend direct-D1 + Access-authenticated admin boundary

> **Superseded in auth scope by BW-DEC-065.** D1/direct persistence and public-submit portions remain historical architecture evidence.


**Data:** 11 agosto 2026

**Decisione:** il live backend BUSINESS PLUS sostituisce definitivamente il precedente
placeholder REST-store/password-session con:

```text
Worker → D1 binding diretto
Worker → Durable Object realtime
Cloudflare Access → AdminAuth server adapter
```

Il submit pubblico usa `POST /api/consultations`, fuori dalla protezione Access, con JSON
only, Origin/Fetch-Metadata checks, Zod/semantic validation, idempotency D1 e Workers Rate
Limiting. Tutte le server functions correnti sono admin-only e il loro transport
`/_serverFn/*`, `/admin*` e il WebSocket `/__tretnix/consultation-realtime` devono essere
protetti dalla stessa Access application/AUD.

Il Worker verifica comunque firma RS256, issuer, audience e validità temporale del JWT
Access. Non è autorizzata una password admin custom per staging/production.

## BW-DEC-064 — Staging-isolated live backend and remote gate discipline

> **Superseded in Access-specific staging scope by BW-DEC-065.** Isolation and manual remote-gate discipline remain active.


**Data:** 11 agosto 2026

**Decisione:** il candidate live può includere migration SQL, repository D1, realtime DO,
JWT verifier, rate limiter e tool di preparazione config, ma il source `wrangler.jsonc`
resta volutamente non provisioned e non deployabile come ambiente reale.

Lo staging richiede:

```text
custom hostname dedicato
workers.dev = false
preview_urls = false
D1 staging separato creato con jurisdiction=eu
Access application staging separata
audience Access staging
rate-limit namespace dedicato
config generato .output/server/wrangler.staging.json
```

Create remoto, migration `--remote`, deploy e qualsiasi produzione restano azioni manuali
separate. Staging usa soltanto dati test finché retention/purge/privacy/security non sono
approvati e provati.

## BW-DEC-065 — Native RITO AdminAuth e successo determinato da D1

**Data:** 11 agosto 2026

**Decisione:** sostituire il ruolo di Cloudflare Access come autenticazione visibile e
identità applicativa dell'admin BUSINESS PLUS con una `AdminAuth` nativa RITO, mantenendo
D1 + Durable Objects come architettura dati/realtime approvata.

Questa decisione **sostituisce le sole parti auth/perimeter** di `BW-DEC-058`,
`BW-DEC-063` e `BW-DEC-064`; le decisioni restano storiche per D1, Durable Objects,
single-tenant isolation, no polling, staging discipline e adapter boundary.

Il boundary live diventa:

```text
/admin/login branded RITO
-> admin_users in D1
-> PBKDF2-HMAC-SHA-256, salt univoco, pepper Worker secret
-> session token CSPRNG opaco
-> soltanto hash del token in admin_sessions D1
-> __Host- HttpOnly Secure SameSite cookie
-> server-side authorization su ogni read/mutation admin
-> session-bound CSRF su mutation
-> same-origin + session authorization sul WebSocket handshake
```

`admin@gmail.com` resta la credenziale demo/applicativa RITO e non identifica Cloudflare,
Tretnix o altra infrastruttura. La password live/staging non è hardcoded né committata.

Il login applica rate limiting prima del password work, dummy work per utenti assenti e
messaggi credenziali non enumerabili. Logout revoca la sessione server-side. Le socket mantengono una scadenza effettiva derivata
da absolute + idle session validity; prima di consegnare ogni evento il Durable Object
ricontrolla inoltre in D1 session id, revoca e stato dell'utente. Una socket già aperta non
può quindi ricevere un evento successivo dopo logout/revoca/disabilitazione.

Cloudflare Access può essere mantenuto soltanto su una superficie tecnica Tretnix separata
che non intercetta l'esperienza RITO `/admin/login` e non fornisce l'identità applicativa.

Nello stesso gate viene formalizzata la semantica di durabilità già implicita in
`BW-DEC-058`/`BW-DEC-059`: **D1 determina il successo dell'operazione**. Una failure del
publish realtime dopo un commit D1 riuscito è registrata senza PII e recuperata tramite
reconnect/catch-up; non può trasformare submit o mutation già persistiti in un falso errore
per visitatore/admin.

Il gate consolidato comprende native auth, migration D1 auth, login/logout/session/CSRF,
WebSocket authorization, correzione della failure semantics del submit, staging deploy e
E2E reale. Apply/Validate non possono eseguire migration/deploy o Git write actions; tali
passaggi restano manuali ed espliciti. Produzione resta non autorizzata.


## BW-DEC-066 — Cloudflare bindings native nel boundary TanStack serverFn

**Data:** 12 agosto 2026

**Decisione:** le server functions e i repository live BUSINESS PLUS leggono binding D1,
Rate Limit, Durable Object e secret tramite `env` da `cloudflare:workers`, che e il pattern
Cloudflare documentato per TanStack Start. Il custom bridge basato su `AsyncLocalStorage` non
e piu una dipendenza applicativa.

**Evidenza che ha aperto la correzione:** sullo staging nativo, dopo migration, provisioning
admin e deploy, sia password corretta sia password errata producevano il fallback
`Accesso temporaneamente non disponibile`. Il tail mostrava la POST serverFn con Worker
`outcome=ok`, HTTP 200, circa 1 ms CPU, nessuna exception/log; D1 conservava
`last_login_at = NULL` e zero `admin_sessions`. Questo colloca il failure prima della creazione
sessione e prima del normale `AdminLoginRejectedError`.

**Classificazione:** il sintomo e il punto di arresto sono confermati. L'assenza dello stack
originale impedisce di attribuire matematicamente l'eccezione al solo `AsyncLocalStorage`; la
correzione elimina comunque un bridge non canonico esattamente dal primo boundary che richiede
i binding (`ADMIN_LOGIN_RATE_LIMITER`) e aggiunge logging sicuro per ogni failure inatteso.

**Vincoli:** nessun bypass del rate limit, nessun indebolimento di sessione/CSRF, nessun cambio
D1/DO, nessuna produzione e nessun secret nel sorgente o nei log.

**Integrazione build:** il gate Windows del CCP v1.0.2 ha confermato che il target
Lovable/Nitro corrente non risolve autonomamente il virtual runtime module
`cloudflare:workers` durante il build Vite 8/Rolldown. Finche non viene autorizzata una
migrazione al Cloudflare Vite plugin, `vite.config.ts` deve quindi mantenere
`cloudflare:workers` come external tramite `vite.build.rolldownOptions.external`. Questo e
un adattamento di bundling mirato, non una nuova dipendenza, non cambia il runtime API e
non autorizza una migrazione di tooling.

## BW-DEC-067 — Verifica password strutturata e diagnostica staging sicura

**Data:** 13 agosto 2026

**Decisione:** il boundary Native AdminAuth distingue internamente `match`, `mismatch`,
`invalid_record` e `crypto_error` tramite un'unica implementazione WebCrypto. Scheme, work
factor v1, base64url canonico, salt decodificato da 16 byte e tag HMAC decodificato da 32 byte
sono validati prima della comparazione.

Tutti gli esiti non-match restano non enumerabili verso il browser e conservano il lavoro dummy
per account assenti o record non supportati/malformati. Soltanto staging/development emette
`rito.admin_auth.verification` con metadata di forma/tipo, outcome e classe crypto generica.

Per confrontare il materiale di provisioning con il secret runtime è ammesso soltanto il
fingerprint operativo `SHA-256(secret)` troncato ai primi 16 caratteri hex lowercase. Il
fingerprint non viene persistito, non è una credenziale e non autorizza rotazioni automatiche.
La password resta una stringa opaca esatta in UI, schema, server function, login, verifica e
generator. Questa decisione non autorizza deploy, D1 write, migration, secret rotation o
produzione.

## BW-DEC-068 — Compatibilità WebCrypto Native AdminAuth

**Data:** 14 agosto 2026

**Evidenza:** il Worker staging `f4ec4a05-e579-4704-a817-4dea622fa578`, con la credenziale
staging valida, ha restituito `crypto_error / NotSupportedError` dopo aver confermato lookup D1,
utente attivo, scheme, tipo/valore delle iterazioni e forma base64url di salt/hash. Il deploy non
ha phase-instrumentato la singola primitive WebCrypto, quindi l'evidenza delimita il boundary
crypto senza attribuire oltre i dati disponibili.

**Decisione:** mantenere invariato `pbkdf2-sha256-hmac-pepper-v1` e rendere espliciti tutti gli
`AlgorithmIdentifier` PBKDF2/HMAC interessati. La verifica password calcola il candidate tag con
HMAC `sign`, importa la pepper key solo con usage `sign`, valida entrambi i tag a 32 byte e usa
`crypto.subtle.timingSafeEqual`; non usa più `crypto.subtle.verify`. La verifica CSRF adotta lo
stesso sign-and-compare e conserva il risultato booleano esterno.

**Invarianti:** PBKDF2-HMAC-SHA-256, 600000 iterazioni, salt 16 byte, derived value 32 byte e
post-hash HMAC-SHA-256 pepper tag restano identici. Restano invariati D1, record credenziali,
password e whitespace semantics, pepper, session token/cookie, contesto/protocollo CSRF, rate
limit, non-enumeration, WebSocket auth, Durable Object, public submit e provider architecture.
Gli outcome restano `match`, `mismatch`, `invalid_record`, `crypto_error` con diagnostica
strutturata non esposta al client.

**Gate:** il focused harness deve mantenere l'oracolo Node indipendente e provare entrambe le
comparazioni timing-safe e l'assenza di `subtle.verify` nei due boundary. La remediation è locale:
un solo nuovo staging deploy resta pendente. Nessuna rotazione, D1 write, migration, operazione
Git remota o produzione è autorizzata.

## BW-DEC-069 — PBKDF2 Native AdminAuth tramite node:crypto

**Data:** 16 agosto 2026

**Evidenza:** il successivo Worker staging `3e52fb80-895b-43a3-8ff5-1b226961eab2` ha ancora
restituito `crypto_error / NotSupportedError` con la credenziale valida dopo il PASS di lookup D1,
stato utente, scheme, tipo/valore delle iterazioni e forma encoded 22/43 di salt/hash. La causa
confermata è il limite workerd WebCrypto PBKDF2 a 100000 iterazioni, inferiore alle 600000 previste
dal record RITO.

**Decisione:** spostare esclusivamente la derivazione PBKDF2 del Native AdminAuth da WebCrypto a
`node:crypto` `pbkdf2Sync`, abilitato tramite `nodejs_compat` nel source Wrangler config e
preservato dal generatore staging. L'adapter Lovable/Nitro corrente resta invariato; non viene
introdotta alcuna dipendenza. Questa decisione sostituisce esclusivamente il path PBKDF2
WebCrypto di `BW-DEC-068`; le decisioni HMAC sign/timing-safe della stessa restano attive.

**Invarianti:** restano identici `pbkdf2-sha256-hmac-pepper-v1`, password bytes opachi,
PBKDF2-HMAC-SHA-256, 600000 iterazioni, salt 16 byte, derived value 32 byte e post-hash
HMAC-SHA-256 con la pepper esistente. Restano sign-only HMAC keys, tag a 32 byte e
`crypto.subtle.timingSafeEqual` per password e CSRF. Gli outcome restano `match`, `mismatch`,
`invalid_record`, `crypto_error`; nessun dettaglio diagnostico aggiuntivo è esposto al client.

**Gate:** source, focused harness e Worker generato non devono contenere il precedente WebCrypto
PBKDF2 `deriveBits`; il KAT deve restare byte-compatible a 600000. Build demo/live, config staging
con `nodejs_compat`, probe locale workerd e Wrangler 4.114.0 dry-run devono passare. La chiusura
runtime richiede ancora un solo staging redeploy e un login reale. Non sono autorizzati D1 write,
migration, password/pepper/secret rotation, credential reprovision, deploy automatico, Git write
remoto o produzione.

## BW-DEC-070 — Native AdminAuth scrypt v2 compatibile con workerd

**Data:** 16 agosto 2026

**Evidenza definitiva:** il Worker staging `cef1e128-2564-4372-b212-58a4e64600be`, dopo la
sostituzione di WebCrypto PBKDF2 con `node:crypto` `pbkdf2Sync(..., 600000, 32, "sha256")`, ha
restituito ancora `crypto_error / NotSupportedError` con utente trovato/attivo, scheme e work
factor supportati e campi encoded 22/43. Il source corrente workerd conferma che anche
`CryptoImpl::getPbkdf()` del path Node chiama `checkPbkdfLimits()`; il default
`DEFAULT_MAX_PBKDF2_ITERATIONS` resta 100000. PBKDF2-HMAC-SHA-256 a 600000 non è quindi
implementabile nativamente nel runtime target e non viene indebolito a 100000.

**Decisione:** `BW-DEC-070` sostituisce il KDF e lo scheme password di `BW-DEC-065` e
`BW-DEC-067`–`BW-DEC-069` prima del freeze. Il nuovo scheme esclusivo di creazione/verifica è
`scrypt-n16384-r8-p5-hmac-sha256-pepper-v2`, con N=16384, r=8, p=5, `maxmem` 32 MiB, salt
CSPRNG 16 byte e derived key 32 byte. Il derived value riceve il post-hash HMAC-SHA-256 con
`ADMIN_AUTH_PEPPER`; il tag persistito resta base64url canonico da 32 byte. Il costo totale
N*r*p è 655360, sotto il limite workerd 2^20, e usa la variante da circa 16 MiB coerente con il
limite isolate di 128 MiB.

**Compatibilità D1:** nessuna migration puramente nominale. Il campo SQL legacy
`password_iterations INTEGER NOT NULL CHECK(password_iterations >= 100000)` conserva 655360
come work factor significativo; scheme e valore devono corrispondere esattamente. N/r/p/maxmem
sono fissati e versionati dallo scheme, non controllati liberamente dal database. Nel dominio il
concetto è `passwordWorkFactor`; il nome `password_iterations` resta confinato al boundary SQL.
Un record `pbkdf2-sha256-hmac-pepper-v1` è legacy/incompatibile e produce `invalid_record`; non
viene reinterpretato con PBKDF2 100000.

**Invarianti:** password esatta e opaca senza trim/normalizzazione/case conversion, pepper,
salt, HMAC sign + tag 32 byte + `timingSafeEqual`, outcome strutturati, dummy work equivalente,
non-enumeration, session hashing, cookie, CSRF, rate limiting, autorizzazione D1/WebSocket e
protocollo realtime restano invariati. `nodejs_compat` resta obbligatorio; nessuna dipendenza,
WASM, Argon2 o bcrypt viene introdotta.

**Gate:** il local gate deve includere un vero HTTP request a un Worker locale Wrangler/workerd
che esegue `scryptSync` con gli esatti N/r/p/maxmem e restituisce 32 byte, oltre a test/oracolo,
build demo/live, shape Worker/DO, config staging, dry-run, checksum e Git hygiene. Il remote gate
successivo è un unico reprovision staging fail-closed che sostituisce password esposta e pepper,
aggiorna solo il record admin/revoca le sue sessioni, verifica read-only, deploya candidate + stesso
pepper e conserva materiale di resume se D1 riesce ma deploy fallisce. Reprovision, D1 write,
secret change, deploy, login reale e ogni produzione non sono autorizzati nel pass locale.
