# RITO Studio — Content System

**Famiglia:** Beauty & Wellness
**Versione:** 1.1
**Stato:** approvato

## 1. Voce del brand

### Caratteristiche

- calma;
- precisa;
- concreta;
- sensoriale;
- accogliente;
- contemporanea;
- mai enfatica.

### Scrive così

- frasi brevi;
- verbi concreti;
- benefici realistici;
- dettagli sul processo;
- indicazioni chiare;
- tono personale ma professionale.

### Non scrive così

- “trasformazione totale”;
- “risultati garantiti”;
- “la miglior versione di te”;
- “esperienza unica e indimenticabile”;
- “lusso senza compromessi”;
- “coccole a 360 gradi”;
- claim medicali o terapeutici non validati.

## 2. Dati demo

Tutti i dati seguenti sono dimostrativi.

```yaml
brand: RITO Studio
descriptor: Beauty & Care Atelier
tagline: La bellezza, nel suo ritmo.
city: Padova
locationLabel: Padova · su appuntamento
email: ciao@ritostudio.example
phone: +39 049 000 0000
bookingMode: demo
hours:
  martedì-venerdì: 09:00–19:00
  sabato: 09:00–17:00
  domenica-lunedì: chiuso
```

La demo non deve inviare dati personali né fingere un'attività reale.

## 3. CTA principali

- Prenota il tuo rituale
- Scopri i trattamenti
- Trova il trattamento giusto
- Conosci lo studio
- Parla con noi
- Richiedi un appuntamento
- Vedi disponibilità sul portale esterno

Usare una sola CTA primaria per viewport.

## 4. START — copy completo

## Navbar

```text
RITO
Trattamenti
Metodo
Studio
Contatti
Prenota
```

## Hero

**Eyebrow**

```text
Beauty & Care Atelier · Padova
```

**Headline**

```text
La bellezza,
nel suo ritmo.
```

**Body**

```text
Un atelier contemporaneo dedicato a capelli, pelle e benessere.
Trattamenti su misura, gesti precisi e il tempo necessario per ascoltarti.
```

**CTA primaria**

```text
Prenota il tuo rituale
```

**CTA secondaria**

```text
Scopri i trattamenti
```

**Microcopy**

```text
Padova · Solo su appuntamento
```

## Introduzione

**Eyebrow**

```text
Il nostro modo
```

**Titolo**

```text
La cura comincia dall'ascolto.
```

**Testo**

```text
Ogni appuntamento parte da ciò che cerchi, dal tempo che hai e da come vuoi sentirti.
Costruiamo il trattamento insieme, con attenzione alla persona e senza gesti automatici.
```

## Trattamenti

**Eyebrow**

```text
Trattamenti
```

**Titolo**

```text
Rituali essenziali, pensati per te.
```

**Introduzione**

```text
Una selezione di servizi per capelli, viso, mani e benessere.
Durata e percorso vengono definiti durante la consulenza.
```

### Categoria 1

**Hair Rituals**

```text
Taglio essenziale
Colore su misura
Trattamento texture
Piega e styling
```

### Categoria 2

**Skin & Brow**

```text
Rituale viso
Brow design
Lash lift
Trattamento illuminante
```

### Categoria 3

**Hands & Nails**

```text
Manicure essenziale
Semipermanente
Nail care
Rituale mani
```

### Categoria 4

**Wellness**

```text
Massaggio distensivo
Rituale schiena
Trattamento relax
Percorso corpo
```

**Nota**

```text
Servizi e prezzi presenti nel concept sono dimostrativi e vanno configurati per il cliente reale.
```

## Ritual Feature

**Eyebrow**

```text
RITO 01
```

**Titolo**

```text
Prima viene l’ascolto.
```

**Testo**

```text
Prima osserviamo, ascoltiamo e definiamo insieme il risultato.
Poi scegliamo tecnica, prodotti e tempi con un approccio misurato e trasparente.
```

**Link**

```text
Scopri il metodo
```

## Metodo

**Eyebrow**

```text
Tre principi
```

### Ascolto

```text
Una consulenza breve e concreta per capire esigenze, abitudini e aspettative.
```

### Precisione

```text
Tecniche, prodotti e tempi scelti in base al servizio, non a un protocollo indistinto.
```

### Continuità

```text
Indicazioni semplici per mantenere il risultato e pianificare il prossimo appuntamento.
```

## Studio

**Eyebrow**

```text
Lo spazio
```

**Titolo**

```text
Uno spazio per il gesto.
```

**Testo**

```text
Luce morbida, materiali naturali e postazioni essenziali.
Lo studio lascia spazio alla relazione, al lavoro e al tempo personale.
```

## CTA finale

**Titolo**

```text
Il tuo tempo di cura.
```

**Testo**

```text
Raccontaci cosa stai cercando. Ti aiutiamo a scegliere il trattamento e il momento più adatto.
```

**CTA**

```text
Richiedi un appuntamento
```

## Informazioni pratiche

```text
Padova
Martedì–venerdì · 09:00–19:00
Sabato · 09:00–17:00
Domenica e lunedì · chiuso
+39 049 000 0000
ciao@ritostudio.example
```

In questa sezione non applicare effetti hover decorativi.

## Footer

```text
RITO Studio
Beauty & Care Atelier
Concept dimostrativo Tretnix — nessun servizio reale.
Privacy
Cookie
Instagram
Progettato e sviluppato da Tretnix
```

L'attribuzione collega a `https://tretnix.com`.

## 5. BUSINESS — architettura dei contenuti

## Home

- hero;
- introduzione;
- servizi principali;
- rituale in evidenza;
- metodo;
- team teaser;
- gallery teaser;
- FAQ teaser;
- booking CTA;
- practical info.

## Trattamenti

**Hero**

```text
La cura, su misura.
```

**Intro**

```text
Esplora i rituali per area, durata ed esigenza.
Ogni scheda chiarisce cosa aspettarsi e come prepararsi.
```

Categorie:

- Hair Rituals
- Skin & Brow
- Hands & Nails
- Wellness

## Dettaglio trattamento

Campi obbligatori:

```yaml
name:
slug:
category:
priceLabel:
shortDescription:
```

Arricchimento opzionale:

```yaml
duration:
fullDescription:
idealFor:
includes:
beforeAppointment:
afterAppointment:
notes:
```

Esempio titolo:

```text
Rituale viso essenziale
```

Esempio introduzione:

```text
Un trattamento personalizzato che combina detersione, manualità e prodotti selezionati in base alle esigenze della pelle.
```

Non inserire promesse cliniche o risultati garantiti.

## Studio

**Headline**

```text
Uno spazio per te.
```

Contenuti:

- filosofia;
- materiali;
- igiene e cura;
- prodotti;
- accessibilità del luogo;
- immagini ambiente;
- CTA prenotazione.

## Team

**Headline**

```text
Persone, competenze, attenzione.
```

Ogni profilo contiene:

- nome;
- ruolo;
- specializzazioni;
- bio breve;
- approccio;
- immagine;
- servizi prenotabili;
- link prenotazione filtrato, se supportato.

## Galleria

Categorie:

- Studio
- Hair
- Skin
- Hands
- Rituals

Nessun “prima e dopo” senza consenso e contesto.

## Prenota

**Headline**

```text
Troviamo insieme il momento giusto.
```

### Modalità request

Step:

1. trattamento o esigenza;
2. professionista opzionale;
3. preferenza di giorno e fascia;
4. contatti;
5. consenso privacy;
6. riepilogo;
7. conferma di ricezione, non conferma automatica dell'appuntamento.

Microcopy:

```text
La richiesta non blocca ancora un appuntamento.
Lo studio ti ricontatterà per confermare giorno e orario.
```

### Modalità external

```text
La prenotazione prosegue sul portale ufficiale dello studio.
```

### Modalità WhatsApp

```text
Apri WhatsApp con un messaggio già compilato. Potrai modificarlo prima dell'invio.
```

### Demo mode

```text
Questa è una demo Tretnix. Nessun dato è stato inviato.
```

## FAQ

1. **Come scelgo il trattamento giusto?**
   Raccontaci l'esigenza principale. Ti aiuteremo a scegliere durante la consulenza iniziale.

2. **Quanto prima devo arrivare?**
   Cinque minuti sono sufficienti, salvo indicazioni diverse ricevute dallo studio.

3. **Posso modificare o annullare l'appuntamento?**
   Sì, usando il canale indicato nella conferma e rispettando la policy configurata dal cliente.

4. **I prezzi sono definitivi?**
   I prezzi “da” indicano una base. Eventuali variazioni devono essere chiarite prima del trattamento.

5. **Come devo prepararmi?**
   Ogni scheda trattamento contiene le indicazioni essenziali. In caso di dubbi, contatta lo studio.

6. **Posso regalare un trattamento?**
   Disponibile soltanto quando gift card o voucher sono attivati dal cliente.

## Contatti

- città e indirizzo;
- orari;
- telefono;
- email;
- indicazioni;
- accessibilità;
- parcheggio o trasporto pubblico;
- policy appuntamenti;
- link social;
- CTA prenotazione.

## 6. Regole sui contenuti demo

- Usare `.example` per email e dominio.
- Non usare indirizzi reali.
- Non integrare mappe verso luoghi reali.
- Non presentare recensioni sintetiche come autentiche; le fixture demo seguono `TRX-DEC-040`.
- Non mostrare contatori clienti.
- Non mostrare certificazioni non possedute.
- Segnalare nel footer che il concept è dimostrativo.
- Nessun form deve trasmettere dati in demo mode.

## 7. Override START approvati per la baseline pre-freeze — 3 agosto 2026

Questa sezione descrive il candidato RITO Studio START approvato dopo il polish pre-freeze.
Per il solo START sostituisce gli esempi incompatibili presenti nelle sezioni 2, 3, 4 e 6.
Le regole di famiglia continuano a valere per i progetti cliente, salvo decisioni specifiche.

### Configurazione pubblica corrente

```yaml
brand: RITO Studio
descriptor: Beauty & Care Atelier
tagline: La bellezza, nel suo ritmo.
city: Padova centro
area: Zona Prato della Valle
locationLabel: Padova centro · zona Prato della Valle
email: info@ritostudio.example
phone: +39 049 000 0000
bookingMode: contact
robots: noindex, follow
mapMode: on-demand general-area embed
```

L'indirizzo esatto non viene dichiarato. La mappa rappresenta soltanto un'area pubblica
generale e non un'attività RITO Studio reale.

### CTA correnti

```text
Chiama per prenotare
Scopri i trattamenti
Prenota
Chiama per un appuntamento
```

Le CTA di prenotazione aprono il canale telefonico configurato. Non esiste un dialog, un
form o una conferma di invio dati.

### Ordine finale della home

```text
1. StickyHeader
2. Hero
3. EditorialServiceList
4. RitualFeature con anchor #metodo
5. StudioEditorial
6. GalleryRail
7. BookingCTA
8. PracticalInfo
9. Footer
```

`IntroStatement` e `MethodStrip` non appartengono alla baseline finale.

### Listino trattamenti del concept

```yaml
Hair Rituals:
  - Taglio essenziale: €45
  - Colore su misura: da €80
  - Trattamento texture: da €65
  - Piega e styling: da €35
Skin & Brow:
  - Rituale viso: €70
  - Brow design: €25
  - Lash lift: €55
  - Trattamento illuminante: €80
Hands & Nails:
  - Manicure essenziale: €30
  - Semipermanente: €40
  - Nail care: €35
  - Rituale mani: €45
Wellness:
  - Massaggio distensivo: €70
  - Rituale schiena: €55
  - Trattamento relax: €85
  - Percorso corpo: da €95
```

Nota pubblica:

```text
I prezzi indicati si intendono a partire da dove specificato. Eventuali variazioni vengono concordate durante la consulenza.
```

Gli importi sono fixture premium specifiche del concept portfolio e non costituiscono un
listino standard Tretnix o una stima di mercato.

### Contatti e mappa

```text
Padova centro
Zona Prato della Valle
Una zona centrale e facilmente raggiungibile. L'indirizzo esatto viene confermato al momento della prenotazione.
+39 049 000 0000
info@ritostudio.example
```

L'iframe Google viene creato solo dopo “Attiva la mappa interattiva”. Il link “Apri su
Google Maps” apre il servizio esterno; senza JavaScript resta disponibile il fallback
esterno.

### Footer e disclosure

Il footer usa una presentazione client-like, copyright e attribuzione Tretnix. Non contiene
un banner demo prominente. La natura dimostrativa, i dati non operativi e la necessità di
revisione per un cliente reale sono dichiarati nelle route Privacy e Cookie.

Restano obbligatori:

- email `.example`;
- numero non operativo;
- `noindex, follow`;
- nessun backend o invio dati;
- nessun dato strutturato commerciale;
- nessuna recensione sintetica presentata come autentica e nessuna metrica, certificazione o attività reale inventata; le fixture demo seguono `TRX-DEC-040`.

### Gallery mobile

La gallery usa un controllo visivo lineare centro-destra come indicatore di scorrimento.
Il controllo scompare quando il rail raggiunge il fondo, ricompare tornando indietro, resta
statica con reduced motion e non intercetta touch, mouse o tastiera.

### Policy

Privacy e Cookie usano la navbar condivisa e non mostrano skip link. La home conserva
“Vai ai trattamenti” come primo collegamento da tastiera.

## 8. Override BUSINESS base dopo browser review — 4 agosto 2026

Questa sezione sostituisce per il BUSINESS base le precedenti ipotesi su Team, route di
prenotazione, booking adapter e dettaglio trattamento obbligatoriamente esteso.

### Home

- Il catalogo completo resta soltanto su `/trattamenti`.
- La home presenta quattro destinazioni editoriali compatte: Hair Rituals, Skin & Brow,
  Hands & Nails e Wellness.
- Ogni categoria apre `/trattamenti?categoria=<id>`.
- Team non compare nella home.

### Prenotazione

```text
Chiama per prenotare
Chiama lo studio
```

Ogni azione usa un’ancora reale verso il `phoneHref` centralizzato. Non esistono form,
adattatori, feedback locali, invio dati o route `/prenota` nel prodotto base.

### Catalogo trattamento

Campi obbligatori:

```yaml
name:
slug:
category:
priceLabel:
shortDescription:
```

Arricchimento opzionale:

```yaml
duration:
fullDescription:
idealFor:
includes:
beforeAppointment:
afterAppointment:
notes:
```

Il dialog mostra soltanto sezioni con contenuto significativo. Il catalogo usa metadata
SEO route-level e non richiede campi SEO o relazioni tra trattamenti inutilizzati.
L’adattamento base richiede quindi di modificare `site-config.ts` e `treatments.ts`;
l’arricchimento dettagliato può essere riservato ai soli servizi che ne hanno bisogno.

### Team

Team non è un modulo attivo o richiesto nel BUSINESS base. Un’eventuale reintroduzione
richiede una decisione futura separata.

<!-- RITO_PLUS_FULL_PARITY_2026_09_20 -->
## BUSINESS PLUS — recensioni demo e copy di conversione

**Data:** 20 settembre 2026

Per la portfolio demo corrente, `TRX-DEC-040` sostituisce il precedente divieto assoluto di recensioni sintetiche: sono ammesse esclusivamente fixture typed in modalità `demo`, con wording neutro, iniziali non riconducibili a persone reali, nessuna attribuzione a piattaforme, nessun falso URL e nessun review/rating structured data commerciale. Un progetto cliente reale deve sostituirle con recensioni autentiche verificate o disabilitare la sezione.

Sulle superfici condivise il copy editoriale resta quello del BUSINESS. Dove il BUSINESS usa una CTA primaria di prenotazione, BUSINESS PLUS usa l'intento `Inizia la consulenza` senza alterare gerarchia, spacing o trattamento visuale del componente. Le azioni di contatto generale mantengono email + telefono; la consulenza resta una richiesta e non conferma automaticamente un appuntamento.
