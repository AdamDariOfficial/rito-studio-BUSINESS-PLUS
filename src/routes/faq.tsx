import { createFileRoute, Link } from "@tanstack/react-router";
import { EditorialArrow } from "@/components/EditorialArrow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PageIntro } from "@/components/PageIntro";
import { SiteShell } from "@/components/SiteShell";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => buildHead(routeSeo.faq),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteShell>
      <PageIntro
        eyebrow="FAQ"
        title={
          <>
            Risposte <span className="italic text-accent">essenziali.</span>
          </>
        }
        intro="Indicazioni essenziali per scegliere, prepararti e gestire l’appuntamento con semplicità."
      />
      <section className="py-10 md:py-14" aria-label="Domande frequenti">
        <div className="container-editorial grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <FaqAccordion />
          </div>
          <aside className="md:col-span-3 md:col-start-10">
            <div className="border border-line bg-surface p-6 md:sticky md:top-[calc(var(--header-height)+2rem)]">
              <p className="font-display text-2xl text-ink">Non trovi la risposta?</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Consulta le informazioni pratiche oppure chiama direttamente lo studio.
              </p>
              <Link
                to="/contatti"
                className="editorial-link group mt-5 min-h-11 text-sm font-medium"
              >
                Vai ai contatti
                <EditorialArrow />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
