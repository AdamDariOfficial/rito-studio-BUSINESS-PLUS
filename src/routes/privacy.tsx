import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/PolicyLayout";
import { getConsultationProfile } from "@/features/consultation/config";
import { buildHead, routeSeo } from "@/lib/seo";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/privacy")({
  head: () => buildHead(routeSeo.privacy),
  component: PrivacyPage,
});

function PrivacyPage() {
  const live = getConsultationProfile() === "live";
  const retentionDays = site.legal.retentionDays;

  return (
    <PolicyLayout
      title="Privacy"
      intro="Come vengono gestite le informazioni durante la navigazione e, quando attiva, la consulenza online."
    >
      <section>
        <h2>Configurazione del sito</h2>
        {live ? (
          <p>
            Nella configurazione live, la consulenza invia all&apos;infrastruttura del sito i dati
            necessari a gestire la richiesta e a renderla disponibile nell&apos;area riservata dello
            studio. L&apos;accesso amministrativo utilizza autenticazione applicativa e sessioni
            server-side.
          </p>
        ) : (
          <p>
            Questa versione dimostrativa conserva le richieste di consulenza soltanto nel browser
            utilizzato per la prova. I dati inseriti nella consulenza non vengono inviati a un
            database applicativo remoto e l&apos;area admin dimostrativa usa esclusivamente stato
            locale.
          </p>
        )}
      </section>

      {live ? (
        <>
          <section>
            <h2>Dati e finalità</h2>
            <p>
              La richiesta può includere nome, telefono, email facoltativa, preferenze di contatto,
              giorno o fascia desiderata, trattamenti selezionati e risposte fornite nel percorso
              guidato. I dati sono utilizzati esclusivamente per ricevere, valutare e gestire la
              richiesta di contatto inviata dall&apos;utente.
            </p>
            <p>
              Base giuridica dichiarata per questa configurazione:{" "}
              <strong>{site.legal.lawfulBasis || "non configurata"}</strong>.
            </p>
          </section>

          <section>
            <h2>Conservazione</h2>
            <p>
              {retentionDays > 0
                ? "Le richieste sono soggette a una politica di conservazione di " +
                  retentionDays +
                  " giorni, salvo obblighi di legge o necessità documentate che richiedano un periodo diverso."
                : "Il periodo di conservazione non è ancora configurato. Questa configurazione non deve essere usata per raccogliere dati reali finché il relativo gate non è completato."}
            </p>
          </section>

          <section>
            <h2>Destinatari e titolare</h2>
            <p>
              Destinatari o categorie di destinatari dichiarati:{" "}
              <strong>{site.legal.recipients || "non configurati"}</strong>.
            </p>
            <p>
              Titolare del trattamento:{" "}
              <strong>{site.legal.controllerName || "non configurato"}</strong>. Contatto per
              richieste privacy e diritti:{" "}
              <strong>{site.legal.controllerContact || "non configurato"}</strong>.
            </p>
          </section>
        </>
      ) : (
        <section>
          <h2>Versione dimostrativa</h2>
          <p>
            RITO Studio è un concept portfolio. Usa dati fittizi durante le prove. Prima di una
            pubblicazione client-live devono essere configurati titolare del trattamento, base
            giuridica, destinatari, tempi di conservazione, procedura di cancellazione e modalità
            per esercitare i diritti previsti dalla normativa applicabile.
          </p>
        </section>
      )}

      <section>
        <h2>Contatti esterni</h2>
        <p>
          I collegamenti a telefono ed email aprono applicazioni o servizi esterni scelti
          dall&apos;utente. Le informazioni eventualmente comunicate dopo l&apos;uscita dal sito
          sono trattate dai rispettivi provider e, in un progetto reale, dal titolare indicato nella
          versione definitiva dell&apos;informativa.
        </p>
      </section>

      <section>
        <h2>Dati tecnici di navigazione</h2>
        <p>
          L&apos;hosting e le risorse necessarie al caricamento della pagina possono ricevere dati
          tecnici ordinari, come indirizzo IP, tipo di browser, data e ora della richiesta e
          informazioni utili alla sicurezza e alla distribuzione dei contenuti.
        </p>
      </section>

      <section>
        <h2>Google Fonts</h2>
        <p>
          Il sito richiede i caratteri tipografici a Google Fonts. Durante questa richiesta Google
          può ricevere dati tecnici della connessione, inclusi indirizzo IP e informazioni del
          browser necessarie a fornire la risorsa.
        </p>
      </section>

      <section>
        <h2>Mappa Google su richiesta</h2>
        <p>
          La pagina Contatti mostra inizialmente un pannello locale, senza iframe e senza richiesta
          alla mappa di Google. Il contenuto interattivo viene creato soltanto quando l&apos;utente
          seleziona “Attiva la mappa interattiva”. Da quel momento il browser comunica con Google,
          che può ricevere indirizzo IP, informazioni sul dispositivo e altri dati tecnici secondo
          le proprie condizioni e informative.
        </p>
        <p>
          La mappa può essere disattivata nuovamente dalla pagina. Il collegamento esterno a Google
          Maps apre invece direttamente il servizio in una nuova scheda.
        </p>
      </section>

      <section>
        <h2>Aggiornamento dell&apos;informativa</h2>
        <p>Ultimo aggiornamento dichiarato: {site.legal.lastUpdated}.</p>
      </section>
    </PolicyLayout>
  );
}
