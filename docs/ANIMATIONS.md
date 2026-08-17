# RITO Studio — Animation Language

**Famiglia:** Beauty & Wellness
**Versione:** 1.1
**Stato:** approvato

## 1. Obiettivo

Il movimento deve comunicare:

- precisione;
- calma;
- continuità;
- tattilità;
- controllo.

Non deve comunicare:

- spettacolarità;
- gamification;
- velocità SaaS;
- effetto “template AI”;
- lusso ottenuto con animazioni invasive.

## 2. Token

```css
--motion-duration-fast: 180ms;
--motion-duration-ui: 280ms;
--motion-duration-reveal: 620ms;
--motion-duration-hero: 820ms;

--motion-ease-ui: cubic-bezier(0.2, 0.8, 0.2, 1);
--motion-ease-reveal: cubic-bezier(0.22, 1, 0.36, 1);
```

Stagger:

```text
60–80ms
massimo totale consigliato: 240ms
```

## 3. Hero

Sequenza:

1. eyebrow fade-in;
2. headline reveal per blocchi o righe;
3. body e CTA;
4. immagine con scale minima `1.025 → 1`;
5. microdato.

Vincoli:

- nessun ritardo superiore a 250ms prima del contenuto principale;
- headline leggibile anche senza JavaScript;
- nessun flash invisibile;
- niente split in singole lettere;
- niente parallax nella prima versione;
- immagine non deve spostare il layout.

## 4. Reveal sotto la fold

Pattern principale:

```text
opacity: 0 → 1
translateY: 20px → 0
duration: 620ms
once: true
```

Attivazione:

- quando il contenuto entra realmente nel viewport;
- soglia indicativa 10–20%;
- root margin regolato senza far concludere l'animazione prima della visibilità.

Fallback:

- contenuto visibile senza observer;
- in reduced motion, nessuna traslazione.

## 5. Image reveal

Uso selettivo:

- hero;
- RitualFeature;
- una sezione studio;
- gallery teaser.

Pattern ammesso:

```text
clip-path lieve
oppure
opacity + scale minima
```

Non applicarlo a ogni immagine.

## 6. Hover

Solo per `pointer: fine`.

### Immagini cliccabili

```text
scale: 1 → 1.02
duration: 500–700ms
```

### Link

- linea che si estende;
- freccia che si sposta massimo 4px;
- nessun cambio improvviso di layout.

### Pulsanti

- transizione di sfondo e testo;
- nessun magnetismo;
- nessun cursore custom;
- nessuna rotazione decorativa.

### Informazioni pratiche

Nessun effetto hover decorativo. Solo stato standard di link e focus.

## 7. Navbar e drawer

### Navbar

- sticky stabile;
- bordo o cambio superficie dopo lo scroll;
- transizione 180–280ms;
- non nascondere durante lo scroll nella prima versione.

### Drawer mobile

- apertura 280–360ms;
- pannello solido;
- voci con stagger minimo;
- focus trap;
- `Escape`;
- body scroll lock;
- nessuna animazione che ritardi l'accesso ai link.

## 8. FAQ BUSINESS

- altezza animata in modo controllato;
- icona ruota massimo 90°;
- focus invariato;
- niente auto-scroll tra domande;
- nessuna sequenza automatica;
- reduced motion: apertura immediata.

## 9. Gallery e lightbox BUSINESS

- apertura con opacity e scale minima;
- nessun zoom aggressivo;
- swipe opzionale;
- tastiera obbligatoria;
- focus iniziale e ritorno;
- viewport mobile con `100dvh`;
- chiusura con `Escape`;
- nessun autoplay.

## 10. Route transition BUSINESS

Non necessaria nella prima implementazione.

Se introdotta dopo verifica:

- durata massima 160–220ms;
- non mostrare la pagina precedente durante il reset scroll;
- non bloccare input;
- non usare smooth scroll;
- direct URL e refresh invariati.

## 11. Reduced motion

Con `prefers-reduced-motion: reduce`:

- contenuto immediatamente visibile;
- niente translate significativo;
- niente scale;
- niente stagger;
- drawer e dialog possono mantenere una dissolvenza molto breve;
- nessuna funzionalità dipende dal motion.

## 12. Performance

- preferire `transform` e `opacity`;
- evitare listener scroll non throttled;
- un solo observer condiviso quando appropriato;
- cleanup obbligatorio;
- niente animazioni su proprietà che causano layout continuo;
- lazy load per immagini sotto la fold;
- non caricare una libreria aggiuntiva se lo stack già copre il comportamento.

## 13. Anti-pattern

- smooth scroll al cambio route;
- reveal già terminato;
- animazioni su tutte le parole;
- cursor custom;
- parallax multipli;
- marquee continuo;
- infinite loop decorativi;
- floating badge;
- hover su elementi non interattivi;
- motion su orari e indirizzo;
- ritardi che nascondono contenuto;
- transizioni che ignorano reduced motion.

## 14. Acceptance criteria

- Il contenuto è leggibile senza animazioni.
- Gli elementi sotto la fold entrano quando raggiungono il viewport.
- Nessuna animazione riparte casualmente.
- Nessun elemento resta invisibile.
- Reduced motion è rispettato.
- Mobile non presenta jank evidente.
- START e BUSINESS usano gli stessi token e pattern percepiti.

## 15. Premium dark actions condivise — 8 agosto 2026

START e BUSINESS adottano lo stesso trattamento per le azioni rettangolari con fondo
inchiostro. Il controllo resta nero durante hover, focus e active; non usa il cambio
improvviso verso borgogna.

Pattern approvato:

```text
hover fine-pointer:
- passaggio di luce interno a contrasto molto basso;
- lift massimo: 1 px;
- ombra morbida e contenuta;
- durata principale dello sweep: 640 ms con motion-ease-reveal.

active:
- ritorno a quota base;
- micro-compressione massima: scale(0.995);
- ombra ridotta.

reduced motion:
- nessuna traslazione o compressione;
- nessuno sweep luminoso;
- funzionalità invariata.
```

Il pattern si applica soltanto a link e pulsanti rettangolari realmente neri. Restano
esclusi controlli circolari, azioni bianche e azioni outlined.

Questa regola prevale sul precedente esempio generico “transizione di sfondo e testo”
per le CTA nere. Nelle informazioni pratiche i dati statici restano privi di hover
decorativo; una vera CTA nera mantiene invece questo pattern condiviso.

## BUSINESS PLUS consultation step transition

The guided consultation may animate between its four existing steps only.

- forward: fade + translateX from `16px` to `0`;
- backward: fade + translateX from `-16px` to `0`;
- duration: `--motion-duration-ui`;
- easing: `--motion-ease-ui`;
- no additional step or carousel semantics are introduced;
- `prefers-reduced-motion: reduce` disables the translation/animation entirely.


## BUSINESS PLUS consultation success mark

The successful consultation state uses a restrained confirmation seal instead of confetti or celebratory particles.

- one accent outline square/circle-like mark consistent with the editorial system;
- check icon enters with a short scale/fade;
- one low-opacity outline ring expands once and fades;
- total motion stays under one second and does not loop;
- no particles, confetti, bounce cascade or sound;
- `prefers-reduced-motion: reduce` reduces the effect to the static success mark.

## BUSINESS PLUS third-refinement motion

### Success status group

- check e label `Richiesta ricevuta` sono allineati sulla stessa riga;
- il check mantiene il ring singolo già approvato;
- la label entra con fade + `translateX(-6px -> 0)` in circa 460 ms;
- nessun loop, bounce, particella o confetti;
- `prefers-reduced-motion` rende check/label sostanzialmente statici.

### Admin request drill-in

- mobile open: fade + `translateX(12px -> 0)`, circa 220 ms;
- mobile close: fade + `translateX(0 -> 12px)`, circa 180 ms;
- ritorno lista: fade + `translateX(-8px -> 0)`, circa 200 ms;
- cambio dettaglio desktop: sola dissolvenza breve, senza spostare il layout;
- nessuna transizione modifica history, dati o stato della richiesta;
- reduced motion rende i passaggi immediati.

### Consultation step viewport

Il cambio step mantiene la transizione direzionale esistente, ma riporta immediatamente la viewport all'inizio del flow prima di focalizzare il pannello corrente. Non introdurre smooth scrolling di route o ritardi di navigazione.
