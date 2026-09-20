import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { BookingAction } from "@/components/BookingAction";
import { PageIntro } from "@/components/PageIntro";
import { PracticalInfo } from "@/components/sections/PracticalInfo";
import { SiteShell } from "@/components/SiteShell";
import { buildHead, routeSeo } from "@/lib/seo";
import { ctaLabels, site } from "@/lib/site-config";

export const Route = createFileRoute("/contatti")({
  head: () => buildHead(routeSeo.contacts),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <SiteShell>
      <PageIntro
        eyebrow="Contatti"
        title={
          <>
            Informazioni pratiche, <span className="italic text-accent">senza fretta.</span>
          </>
        }
        intro="Orari, telefono e indicazioni essenziali per organizzare la visita con semplicità."
      />
      <PracticalInfo />
      <section
        className="border-t border-line bg-surface py-10 md:py-14"
        aria-labelledby="contact-policies-heading"
      >
        <div className="container-editorial grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-3">
            <p className="eyebrow">Prima di arrivare</p>
            <h2
              id="contact-policies-heading"
              className="mt-4 font-display text-3xl text-ink md:text-4xl"
            >
              Accesso e appuntamenti.
            </h2>
          </div>
          <dl className="grid gap-5 md:col-span-9 md:grid-cols-3">
            <div className="border-t border-line pt-4">
              <dt className="font-medium text-ink">Indicazioni</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{site.contact.directions}</dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="font-medium text-ink">Accessibilità</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {site.contact.accessibility}
              </dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="font-medium text-ink">Policy appuntamenti</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {site.contact.appointmentPolicy}
              </dd>
            </div>
          </dl>
          <div className="md:col-span-9 md:col-start-4">
            <BookingAction
              kind="contact"
              ariaLabel="Contatti: email o telefono"
              className="action-primary inline-flex min-h-12 items-center gap-2 border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
            >
              <Mail aria-hidden size={16} strokeWidth={1.7} />
              {ctaLabels.contact}
            </BookingAction>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
