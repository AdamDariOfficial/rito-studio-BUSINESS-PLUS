# RITO Studio — Routes and Information Architecture

**Famiglia:** Beauty & Wellness
**Versione:** 1.1
**Stato:** approvato

## 1. Principi

- Mobile-first.
- Nuove route aperte dall'alto con reset immediato.
- Nessuno smooth scroll durante il cambio route.
- Back, forward, refresh e direct URL devono funzionare.
- Gli anchor interni possono usare scroll controllato.
- Le route devono essere semanticamente leggibili.
- La 404 è obbligatoria.
- Privacy e cookie restano route reali.
- Dati, menu e route metadata devono essere centralizzati.

## 2. START

## Route pubbliche

```text
/
/privacy
/cookie
/*
```

## Anchor nella home

```text
#trattamenti
#metodo
#studio
#contatti
```

## Home — ordine sezioni

```text
1. StickyHeader
2. Hero
3. IntroStatement
4. EditorialServiceList
5. RitualFeature
6. MethodStrip
7. StudioEditorial
8. GalleryRail
9. BookingCTA
10. PracticalInfo
11. Footer
```

## Regole START

- La CTA “Prenota” porta al canale configurato o a `#contatti`.
- Nessuna route di prenotazione nativa.
- Nessun form con trasmissione dati nella demo.
- Gallery senza lightbox obbligatoria nella prima build.
- Privacy e cookie possono contenere placeholder chiaramente segnalati come non definitivi.

## 3. BUSINESS

## Route pubbliche

```text
/
/trattamenti
/studio
/galleria
/faq
/contatti
/privacy
/cookie
/*
```

## Route opzionali future

```text
/journal
/journal/:slug
/gift-card
/account
/admin
```

Non implementare le route future nella prima versione BUSINESS.

## 4. Responsabilità delle route

### `/`

- posizionamento;
- teaser compatto delle quattro categorie di trattamento;
- metodo;
- gallery teaser;
- CTA;
- informazioni essenziali.

### `/trattamenti`

- elenco completo;
- filtri per categoria;
- ricerca opzionale soltanto se il catalogo è ampio;
- durata e prezzo base;
- righe compatte e interattive;
- dettaglio accessibile in dialog/sheet guidato dalla query.

### Query dettaglio trattamento

- modello URL: `/trattamenti?categoria=hair&trattamento=taglio-essenziale`;
- apertura, chiusura, Back, Forward e refresh conservano lo stato route-aware;
- la query `trattamento` valida apre il dialog/sheet nel catalogo;
- uno slug non valido lascia il catalogo utilizzabile e mostra un recupero inline;
- un trattamento fuori dal filtro attivo non apre il dialog;
- la precedente route `/trattamenti/:slug` non è attiva nel base BUSINESS;
- durata, quando disponibile;
- prezzo;
- contenuti editoriali opzionali, senza sezioni vuote;
- CTA telefonica;
- focus trap, Escape e ritorno al trigger esatto.

URL esempio:

```text
/trattamenti?categoria=skin&trattamento=rituale-viso
```

### `/studio`

- filosofia;
- ambiente;
- metodo;
- prodotti;
- igiene;
- accessibilità;
- gallery editoriale.

### `/galleria`

- gallery categorizzata;
- lightbox accessibile;
- keyboard navigation;
- focus return;
- immagini con dimensioni dichiarate.

### `/faq`

- domande complete;
- accordion accessibile;
- un solo pannello aperto per default oppure comportamento documentato;
- nessun auto-scroll invasivo.

### `/contatti`

- dati pratici;
- orari;
- canali;
- indicazioni;
- accessibilità;
- policy appuntamenti;
- CTA.

### `/privacy` e `/cookie`

- contenuti specifici del cliente da revisionare;
- nessuna dichiarazione di conformità legale automatica;
- metadata appropriati;
- accessibili dal footer.

### `404`

- messaggio coerente;
- link home;
- link trattamenti;
- nessun redirect automatico silenzioso.

## 5. Navigazione

### START desktop

```text
Trattamenti
Metodo
Studio
Contatti
Prenota
```

### BUSINESS desktop

```text
Home
Trattamenti
Studio
Galleria
FAQ
Contatti
Chiama per prenotare
```

`Home` è la prima voce della configurazione condivisa da navbar desktop, drawer mobile e
fallback senza JavaScript. Il suo stato attivo usa un confronto esatto con `/`; le altre
route non vengono marcate come Home.

### Mobile

- pulsante menu con label accessibile;
- drawer con focus management;
- `Escape` chiude;
- il focus ritorna al trigger;
- click su route chiude il drawer;
- body scroll lock senza layout shift;
- CTA telefonica presente ma non sovrapposta al contenuto.

## 6. Prenotazione base BUSINESS

- Nessuna route `/prenota` e nessun form.
- Header, drawer, hero, CTA editoriali, dialog trattamento, contatti e footer usano
  ancore reali con `href={site.contact.phoneHref}`.
- `/team` e `/prenota` risolvono naturalmente nella 404 condivisa.
- Team può essere rivalutato soltanto come modulo futuro opzionale.

## 7. Configurazione proposta

```ts
interface SiteConfig {
  brand: {
    name: string;
    descriptor: string;
    tagline: string;
  };
  contact: {
    city: string;
    address?: string;
    email: string;
    phone: string;
    phoneHref: `tel:${string}`;
  };
  hours: OpeningHours[];
  social: SocialLink[];
  seo: {
    siteUrl: string;
    defaultTitle: string;
    defaultDescription: string;
    locale: "it_IT";
  };
}
```

`phone` e `phoneHref` sono l'unica configurazione di prenotazione attiva nel BUSINESS
base. Eventuali adapter esterni, WhatsApp, request flow o form appartengono a estensioni
future separate e non fanno parte di questa implementazione.

I valori devono essere validati e non duplicati nei componenti.

## 8. Scroll e history

### Cambio route

```text
navigate
→ mount nuova route
→ reset immediato all'inizio
→ focus sul contenuto principale quando appropriato
```

Non usare `behavior: "smooth"`.

### Anchor nella stessa pagina

- compensare l'header;
- aggiornare focus quando necessario;
- non usare offset fragili duplicati;
- rispettare reduced motion.

### Back e forward

Non forzare sempre `scrollTo(0, 0)` durante navigazione history se questo distrugge un ripristino previsto. Il comportamento va testato e documentato.

### Query interne al catalogo

- filtri categoria e apertura/chiusura del dettaglio usano `resetScroll: false` localmente;
- l’apertura iniziale del dettaglio crea una voce history;
- step, swipe e raccomandazioni sostituiscono soltanto `trattamento` con `replace: true`;
- Back chiude il dialog senza attraversare ogni trattamento consultato e Forward lo riapre;
- la chiusura e il focus return usano `preventScroll`, senza disabilitare il reset globale
  delle nuove route.

### Affordance orizzontali

- i filtri trattamento sono una sola riga con scroll nativo e fade sinistro/destro basati
  sulla posizione reale;
- il rail gallery home nasconde l’overflow verticale e conserva quello orizzontale;
- al bordo finale, un nuovo gesto deliberato oltre soglia può navigare a `/galleria`;
- il normale raggiungimento del bordo non naviga e il link `Apri la galleria` resta
  l’alternativa esplicita.

## 9. Metadata

Ogni route BUSINESS deve definire:

- title;
- description;
- canonical;
- Open Graph;
- image social;
- indexability;
- structured data quando appropriato.

Non aggiungere `aggregateRating` senza recensioni reali e verificabili.

## 10. Acceptance criteria routing

- Nessuna route produce pagina bianca.
- Direct URL e refresh funzionano.
- La 404 intercetta slug inesistenti.
- Le anchor START raggiungono la sezione corretta.
- Il drawer mobile si chiude e ripristina il focus.
- La route nuova appare dall'alto senza smooth scroll.
- La navigazione non provoca flash di contenuto nascosto.
- Nessun link placeholder porta a un dominio reale non approvato.

## 11. BUSINESS PLUS — route definitive

BUSINESS PLUS preserva tutte le route BUSINESS e aggiunge:

```text
/consulenza
/admin
/admin/login
```

Solo nel profilo portfolio/demo:

```text
/_demo/tools
```

### `/consulenza`

Massimo quattro step:

```text
1. servizio
2. 2–4 domande rapide
3. percorso sintetico: principale + max 2 complementari suggeriti + eventuali aggiunte manuali, max 6 servizi selezionati totali
4. contatto + review + submit
```

Da un trattamento può essere aperta con:

```text
/consulenza?servizio=<slug>
```

È ammesso nell'URL solo lo slug non personale del servizio. Le risposte personali non
vengono serializzate nella URL.

Uno slug invalido recupera alla selezione servizio senza rompere la route.

### `/admin/login`

Non compare nella navigazione pubblica. Nel profilo live è la pagina branded RITO che
autentica l'admin con la native `AdminAuth`. Nel profilo demo espone soltanto la credenziale
demo `admin@gmail.com` e apre i dati locali senza simulare una password server-side.

### `/admin`

Non compare nella navigazione pubblica.

È esclusivamente la Consultation Inbox:

```text
lista richieste
dettaglio
stato
nota
filtri base
edit operativo limitato
delete con conferma
```

Il profilo live richiede accesso admin minimo e request store condiviso. L'edit operativo può modificare contatto, giorno/fascia preferita e i servizi aggiunti fino a 6 servizi selezionati totali; servizio principale e risposte originali restano immutabili. La cancellazione è definitiva e richiede conferma esplicita.

Nel profilo `client-live`, il sito usa inoltre boundary HTTP interni/non navigazionali:

```text
POST /api/consultations
/_serverFn/*
/__tretnix/consultation-realtime
```

`/api/consultations` è il submit pubblico same-origin. `/_serverFn/*` contiene le
operazioni admin correnti; ogni operazione valida la sessione native RITO server-side e le
mutation richiedono anche il token CSRF legato alla sessione. Il path
realtime accetta solo WebSocket admin autenticati. Questi endpoint non ampliano la route
pubblica/editoriale del prodotto.

### `/_demo/tools`

Solo profilo portfolio/demo:

```text
snapshot
restore
reset seed
export
import
```

Opera esclusivamente sulla memoria locale demo.

### Nessuna `/percorsi`

La baseline non aggiunge `/percorsi`. Il percorso consigliato è parte del risultato di
`/consulenza`.

### CUSTOM-only routes/features

Una vera area cliente, CMS, agenda, pagamenti, CRM o admin estesa richiedono un nuovo
scope CUSTOM.
