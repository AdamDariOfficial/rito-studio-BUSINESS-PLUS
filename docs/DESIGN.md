# RITO Studio — Design Direction

**Famiglia:** Beauty & Wellness
**Versione:** 1.1
**Stato:** approvato

## 1. Direzione

RITO Studio deve risultare:

- arioso;
- tattile;
- elegante;
- contemporaneo;
- intimo senza essere romantico;
- premium senza ostentazione;
- inclusivo e non eccessivamente femminile;
- sensoriale senza ricorrere a cliché spa.

Parole guida:

```text
rituale
precisione
materia
cura
spazio
ritmo
presenza
```

## 2. Differenza rispetto a Forno Lume

Beauty non deve riutilizzare l'identità Hospitality.

| Hospitality | Beauty & Wellness |
|---|---|
| caldo e artigianale | tattile e minerale |
| conviviale | intimo e preciso |
| terracotta e oliva | porcellana, inchiostro e borgogna |
| ritmo narrativo caldo | ritmo arioso e controllato |
| immagini di prodotto e tavola | dettagli di mani, capelli, pelle e ambiente |
| Fraunces + Inter | Newsreader + Manrope |

## 3. Palette del concept

| Token | Valore | Uso |
|---|---:|---|
| `--color-canvas` | `#F6F4EF` | sfondo principale |
| `--color-surface` | `#E8E1D8` | sezioni secondarie |
| `--color-ink` | `#1B1A18` | testo principale |
| `--color-muted` | `#746E67` | testo secondario su canvas |
| `--color-muted-on-surface` | `#625C55` | testo secondario su surface; contrasto AA |
| `--color-accent` | `#6A3F4B` | CTA, dettagli selettivi |
| `--color-accent-strong` | `#4E2E33` | hover e contrasto |
| `--color-line` | `#CEC6BC` | bordi e separatori |
| `--color-white` | `#FFFEFB` | superfici e testo inverso |

### Regole

- Nessun gradient text.
- Nessun glow.
- Nessun viola SaaS.
- L'accento borgogna non deve dominare la pagina.
- Il contrasto deve essere verificato prima di congelare i token.
- Le fotografie mantengono toni naturali della pelle.

## 4. Tipografia

### Display

```text
Newsreader
weights: 400, 500
italic: 400, uso selettivo
```

Uso:

- hero;
- titoli editoriali;
- citazioni brevi;
- numeri o nomi di rituali.

### UI e testo

```text
Manrope
weights: 400, 500, 600
```

Uso:

- navigazione;
- body;
- pulsanti;
- form;
- label;
- dati pratici.

### Scala indicativa

```text
display-xl: clamp(3.25rem, 8vw, 7.75rem)
h1: clamp(3rem, 7vw, 6.5rem)
h2: clamp(2.25rem, 5vw, 4.75rem)
h3: clamp(1.5rem, 2.4vw, 2.25rem)
body-lg: clamp(1.05rem, 1.3vw, 1.25rem)
body: 1rem
small: 0.875rem
eyebrow: 0.6875rem
```

### Regole

- Niente testo minuscolo usato per sembrare “luxury”.
- Tracking ampio solo su eyebrow e label brevi.
- L'italic non diventa decorazione ripetitiva.
- Lunghezza ideale dei paragrafi: 45–68 caratteri per riga.

## 5. Griglia e spaziatura

```text
base unit: 4px
content max-width: 1320px
reading max-width: 720px
mobile gutter: 20px
tablet gutter: 32px
desktop gutter: 48px
section gap mobile: 80–96px
section gap desktop: 128–160px
```

La composizione usa spazio vuoto reale, non card vuote.

## 6. Raggi, bordi e superfici

- Radius principale: `2px` o `4px`.
- Immagini: prevalentemente spigoli netti.
- Pulsanti: rettangolari, non pill.
- Bordi: 1px, sottili e visibili.
- Ombre: quasi assenti.
- Nessun glassmorphism.
- Nessuna griglia di card identiche per ogni sezione.

## 7. Pulsanti e link

### Primary

- sfondo `ink`;
- testo `white`;
- altezza minima 48px;
- bordo 1px;
- padding orizzontale 24–28px;
- hover: sfondo `accent-strong`;
- focus ring visibile.

### Secondary

- sfondo trasparente;
- bordo `ink`;
- hover controllato;
- nessuna animazione che sposti il layout.

### Text link

- underline o linea animata;
- icona freccia solo quando chiarisce la destinazione;
- non usare frecce identiche ovunque.

## 8. Navbar

### START

- sticky;
- sfondo canvas;
- bordo inferiore sottile dopo lo scroll;
- logo a sinistra;
- link essenziali al centro/destra;
- CTA “Prenota” sempre identificabile;
- nessun hide-on-scroll nella prima versione;
- drawer mobile a schermo intero o pannello solido;
- nessun blur obbligatorio.

### BUSINESS

Preserva esattamente:

- wordmark;
- altezze;
- tipografia;
- stile CTA;
- drawer;
- focus;
- comportamento scroll.

Può aggiungere voci, ma non ridisegnare il componente.

## 9. Hero START

### Desktop

Composizione asimmetrica 55/45:

- colonna testuale ampia;
- eyebrow;
- headline su 2–3 righe;
- descrizione breve;
- due CTA;
- immagine verticale o quasi quadrata;
- microdato “Padova · su appuntamento”.

### Mobile

Ordine:

```text
eyebrow
headline
descrizione
CTA
immagine
microdato
```

L'hero è visual-first soltanto nell'uso dell'immagine, ma mantiene il messaggio prima dell'immagine per conversione e chiarezza.

### Vietato

- hero centrata generica;
- testo sopra foto illeggibile;
- sfondo con gradienti astratti;
- badge e pill decorative;
- tre CTA equivalenti;
- mockup di app;
- autoplay video nella prima versione.

## 10. Trattamento fotografico

### Soggetti

- dettagli di mani;
- capelli e texture;
- pelle reale;
- strumenti;
- prodotti in uso;
- tessuti;
- superfici;
- interni;
- gesti professionali;
- ritratti ambientati.

### Estetica

- luce naturale o diffusa;
- contrasto morbido;
- grana molto leggera;
- toni minerali;
- composizioni vicine e materiche;
- profondità reale;
- pelle non plastificata.

### Da evitare

- mani anatomicamente errate;
- pelle levigata in modo innaturale;
- foglie decorative ripetute;
- pietre spa generiche;
- candele e asciugamani come unico linguaggio;
- modelle stock sorridenti in camera;
- floating product;
- prima/dopo aggressivi;
- immagini troppo simili tra loro.

### Shot list minima

1. hero verticale con gesto professionale;
2. macro capelli o pelle;
3. mani e strumenti;
4. ambiente ampio;
5. dettaglio materia;
6. ritratto del professionista;
7. servizio in corso;
8. immagine orizzontale per CTA finale.

## 11. Componenti distintivi

- `EditorialServiceList`: righe tipografiche, separatori e dettagli espandibili.
- `RitualFeature`: immagine + testo editoriale.
- `MethodStrip`: tre principi senza card.
- `GalleryRail`: sequenza fotografica controllata.
- `PracticalInfo`: orari, città e contatti senza effetti hover superflui.
- `BookingCTA`: blocco scuro ad alto contrasto.
- `TretnixAttribution`: firma discreta nel footer.

## 12. Iconografia

- icone lineari semplici;
- stroke coerente;
- massimo valore informativo;
- nessun set di icone ripetuto per decorare ogni titolo;
- evitare sparkle, magic wand, cuori e foglie salvo significato reale.

## 13. Adattatori visivi per clienti reali

Il sistema RITO è il concept dimostrativo. Un cliente reale può ricevere:

- palette adattata;
- font adattati;
- fotografia adattata;
- densità e tono adattati;
- componenti editoriali selezionati.

Una volta approvato lo START del cliente, il BUSINESS deve ereditarne esattamente il linguaggio.

## 14. Anti-pattern

- rosa stereotipato come default;
- luxury ottenuto con font illeggibili;
- layout SaaS con pricing cards;
- card con icona, titolo e testo ripetute;
- statistiche inventate;
- recensioni finte;
- sezioni tutte centrate;
- troppi testi in maiuscolo;
- cursore custom;
- parallax pesante;
- caroselli automatici;
- animazioni su informazioni pratiche;
- CTA persistente che copre contenuto mobile;
- immagini con testo incorporato;
- copy generico come “ritrova la tua versione migliore”.

## 15. Criteri visuali di accettazione

- Il sito resta riconoscibile senza logo come Beauty & Wellness premium.
- Non sembra una variante di Forno Lume.
- Non sembra una landing SaaS.
- Le sezioni alternano densità e composizione.
- La fotografia è protagonista ma non compromette la leggibilità.
- L'accento è controllato.
- I servizi non sono presentati come una griglia uniforme di card.
- Mobile 360 px non presenta tagli o overflow.
- Il focus è visibile e coerente.

<!-- RITO_PLUS_FULL_PARITY_2026_09_20 -->
## BUSINESS PLUS — parità visuale corrente con BUSINESS

**Data:** 20 settembre 2026

BUSINESS PLUS non introduce una seconda identità visuale del piano BUSINESS. Sulle superfici condivise deve mantenere la stessa composizione, densità, spacing, divider, affordance e motion del BUSINESS corrente.

Contratto corrente:

- hero home PLUS: divergenza intenzionale autorizzata rispetto allo split BUSINESS. Usa una hero full-slide di tipo e-commerce: ogni schermata combina fotografia RITO full-bleed, overlay editoriale, eyebrow, headline, body e CTA propri; l'intera schermata scorre orizzontalmente. Nessun autoplay. La fascia metadata `RITO Studio · Padova / 01/03` non viene mostrata: gli indicatori del carousel sono la sola affordance di posizione. Ogni schermata richiede un asset desktop e può definire un asset mobile verticale dedicato dalla stessa libreria approvata; in assenza di asset mobile usa il desktop. Il riferimento Forno Lume è funzionale, non visuale: palette, font, fotografia, densità e tono restano Beauty & Wellness;
- admin PLUS: `/admin` e `/admin/hero` usano un solo header di navigazione condiviso; cambia soltanto lo stato attivo Inbox/Hero, mentre azioni operative come logout o creazione restano nel workspace della pagina;
- ritmo verticale compatto sulle route condivise (intro, catalogo, FAQ, galleria, contatti, Studio e sezioni home);
- `RitualFeature` include gli stessi tre principi `Ascolto`, `Precisione`, `Continuità`;
- `/studio` usa la stessa struttura compatta: intro con una sola immagine, `Dentro RITO` con `Ambiente / Materiali / Cura`, fascia utility finale;
- home gallery identica al BUSINESS per ordine, dimensioni, rail, fade, hint e gesto end-of-rail;
- filtri orizzontali di `/trattamenti` e `/galleria` usano la stessa geometria full-bleed mobile e gli stessi inset;
- divider editoriali autonomi non cambiano box model, odd/even, padding, gap o flow;
- footer, header, link persistenti, legal strip e coppia Privacy/Cookie usano lo stesso sistema.

Sono differenze intenzionali soltanto le capacità PLUS: consulenza guidata, Consultation Inbox, admin/live backend e la sostituzione delle CTA di booking primarie con la CTA di consulenza dove il prodotto lo richiede.
